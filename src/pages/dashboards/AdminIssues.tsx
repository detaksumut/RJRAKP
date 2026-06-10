import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { BookOpen, Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function AdminIssues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    journal_id: '',
    volume: '',
    issue_number: '',
    year: new Date().getFullYear().toString(),
    title: '',
    description: '',
    status: 'draft',
    cover_image_url: ''
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Journals
      const { data: journalsData } = await supabase
        .from('journals')
        .select('id, name');
      if (journalsData) setJournals(journalsData);

      // Fetch Issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('*, journals(name)')
        .order('year', { ascending: false })
        .order('volume', { ascending: false })
        .order('issue_number', { ascending: false });
      
      if (issuesData) setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let uploadedUrl = formData.cover_image_url;
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `issues_cover_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('manuscripts').upload(fileName, coverFile);
        if (uploadError) throw new Error(`Gagal mengunggah cover: ${uploadError.message}`);
        uploadedUrl = supabase.storage.from('manuscripts').getPublicUrl(fileName).data.publicUrl;
      }

      const issueData = {
        journal_id: formData.journal_id,
        volume: parseInt(formData.volume),
        issue_number: parseInt(formData.issue_number),
        year: parseInt(formData.year),
        title: formData.title,
        description: formData.description,
        status: formData.status,
        cover_image_url: uploadedUrl,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingId) {
        await supabase.from('issues').update(issueData).eq('id', editingId);
      } else {
        await supabase.from('issues').insert([issueData]);
      }
      
      setShowForm(false);
      setEditingId(null);
      setCoverFile(null);
      setFormData({
        journal_id: '',
        volume: '',
        issue_number: '',
        year: new Date().getFullYear().toString(),
        title: '',
        description: '',
        status: 'draft',
        cover_image_url: ''
      });
      fetchData();
    } catch (error: any) {
      console.error('Error saving issue:', error);
      alert('Gagal menyimpan terbitan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (issue: any) => {
    setFormData({
      journal_id: issue.journal_id,
      volume: issue.volume.toString(),
      issue_number: issue.issue_number.toString(),
      year: issue.year.toString(),
      title: issue.title || '',
      description: issue.description || '',
      status: issue.status,
      cover_image_url: issue.cover_image_url || ''
    });
    setCoverFile(null);
    setEditingId(issue.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus terbitan ini? Artikel di dalamnya akan kehilangan referensi ke terbitan ini.')) {
      try {
        await supabase.from('issues').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const toggleStatus = async (issue: any) => {
    try {
      const newStatus = issue.status === 'published' ? 'draft' : 'published';
      const publishedAt = newStatus === 'published' ? new Date().toISOString() : null;
      await supabase.from('issues').update({ status: newStatus, published_at: publishedAt }).eq('id', issue.id);

      if (newStatus === 'published') {
        // Bulk publish logic: Update all accepted articles in this issue
        const { data: articlesToPublish } = await supabase.from('articles')
          .select('id, manuscript_file, journals(slug)')
          .eq('issue_id', issue.id)
          .in('status', ['accepted']);
          
        if (articlesToPublish && articlesToPublish.length > 0) {
          const articleIds = articlesToPublish.map(a => a.id);
          // Update status to 'published'
          await supabase.from('articles').update({ status: 'published' }).in('id', articleIds);
          
          // Generate Honorariums for the Issue Staff (Direktur, SDM, dll)
          await supabase.rpc('generate_issue_honorariums', { p_issue_id: issue.id });
          
          // Create publications if not exist
          const { data: existingPubs } = await supabase.from('publications').select('article_id').in('article_id', articleIds);
          const existingIds = existingPubs?.map(p => p.article_id) || [];
          
          const newPubs = articlesToPublish
            .filter(a => !existingIds.includes(a.id))
            .map(a => {
              const journalSlug = (Array.isArray(a.journals) ? a.journals[0]?.slug : (a.journals as any)?.slug) || 'journal';
              const generatedDoi = `10.47822/rjrakp.${journalSlug}.v${issue.volume}i${issue.issue_number}.${a.id.substring(0, 8)}`;
              
              return {
                article_id: a.id,
                volume_number: `Vol. ${issue.volume}`,
                issue_number: `No. ${issue.issue_number}`,
                publication_date: publishedAt,
                doi: generatedDoi,
                pdf_url: a.manuscript_file || '',
                doi_status: 'registered'
              };
            });
            
          if (newPubs.length > 0) {
             await supabase.from('publications').insert(newPubs);
          }
          
          alert(`Berhasil mempublikasikan ${articlesToPublish.length} artikel di Issue ini!`);
        }
      }

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Terbitan (Issues)</h1>
            <p className="text-academic-500 text-sm">Kelola edisi volume dan nomor terbitan jurnal.</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
              setFormData({ journal_id: journals[0]?.id || '', volume: '', issue_number: '', year: new Date().getFullYear().toString(), title: '', description: '', status: 'draft' });
            }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            {showForm ? <><BookOpen className="w-4 h-4" /> Batal</> : <><Plus className="w-4 h-4" /> Buat Terbitan Baru</>}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold text-academic-900 mb-4">{editingId ? 'Edit Terbitan' : 'Terbitan Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Jurnal *</label>
                  <select name="journal_id" required value={formData.journal_id} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500">
                    <option value="">-- Pilih Jurnal --</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Volume *</label>
                    <input type="number" name="volume" required value={formData.volume} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. 1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Nomor *</label>
                    <input type="number" name="issue_number" required value={formData.issue_number} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. 2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Tahun *</label>
                    <input type="number" name="year" required value={formData.year} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Judul Edisi (Opsional)</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500" placeholder="e.g. Special Issue on Technology" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500">
                    <option value="draft">Draft (Belum Publik)</option>
                    <option value="published">Published (Publik)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Keterangan / Deskripsi</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-academic-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500" rows={3}></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Cover Image (Opsional)</label>
                {formData.cover_image_url && !coverFile && (
                  <div className="mb-2">
                    <img src={formData.cover_image_url} alt="Cover" className="h-32 object-contain rounded border border-academic-200" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full border border-academic-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500" 
                />
                <p className="text-[10px] text-academic-500 mt-1">Pilih gambar untuk mengganti atau menambahkan cover edisi jurnal.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-academic-600 hover:bg-academic-100 rounded-lg text-sm font-bold transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Terbitan'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-academic-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-academic-50 border-b border-academic-200 text-xs uppercase font-bold text-academic-600 tracking-wider">
                <tr>
                  <th className="p-4">Terbitan</th>
                  <th className="p-4">Jurnal</th>
                  <th className="p-4">Tahun</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-academic-100">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-academic-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {issue.cover_image_url ? (
                          <img src={issue.cover_image_url} alt="Cover" className="w-10 h-14 object-cover rounded shadow-sm border border-academic-200" />
                        ) : (
                          <div className="w-10 h-14 bg-academic-100 flex items-center justify-center rounded shadow-sm border border-academic-200 text-academic-400">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-academic-900">Vol {issue.volume}, No {issue.issue_number}</div>
                          {issue.title && <div className="text-xs text-academic-500 mt-0.5">{issue.title}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-brand-700">{issue.journals?.name || '-'}</td>
                    <td className="p-4 font-medium text-academic-700">{issue.year}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(issue)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                          issue.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {issue.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {issue.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(issue)} className="p-1.5 text-academic-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(issue.id)} className="p-1.5 text-academic-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-academic-500 italic">Belum ada data terbitan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
