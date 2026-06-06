import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateCrossrefXML } from '../../lib/crossref';
import { 
  FileText, Trash2, Eye, ArrowLeft, Download, 
  Search, Filter, Calendar, User, ExternalLink, 
  AlertCircle, RefreshCw, CheckCircle, Clock, X, Plus 
} from 'lucide-react';

export default function AdminArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Detail view state
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [uploadingManuscript, setUploadingManuscript] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState('');

  const handleUploadManuscriptFromAdmin = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedArticle || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingManuscript(true);
    setError('');
    setSuccess('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('manuscripts')
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl || '';

      // Update in articles table
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ manuscript_file: publicUrl })
        .eq('id', selectedArticle.id);

      if (updateErr) throw updateErr;

      // Update in publications table if it is already published
      if (selectedArticle.status === 'published') {
        await supabase
          .from('publications')
          .update({ pdf_url: publicUrl })
          .eq('article_id', selectedArticle.id);
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Uploaded manuscript for article ID ${selectedArticle.id}`,
        entity_type: 'articles',
        entity_id: selectedArticle.id
      });

      setSuccess('Manuskrip berhasil diunggah.');
      
      // Update local state
      await fetchArticles();
      
      // Update selected article reference
      setSelectedArticle(prev => prev ? { ...prev, manuscript_file: publicUrl } : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengunggah manuskrip.');
    } finally {
      setUploadingManuscript(false);
    }
  };

  const handleUploadProductionFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'copyedited_file' | 'layout_file') => {
    if (!selectedArticle || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setError('');
    setSuccess('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('manuscripts')
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl || '';

      const { error: updateErr } = await supabase
        .from('articles')
        .update({ [field]: publicUrl })
        .eq('id', selectedArticle.id);

      if (updateErr) throw updateErr;

      setSuccess(`File ${field === 'copyedited_file' ? 'Copyediting' : 'Layout'} berhasil diunggah.`);
      await fetchArticles();
      setSelectedArticle(prev => prev ? { ...prev, [field]: publicUrl } : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal mengunggah file ${field}.`);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch journals for filter
      const { data: journalData } = await supabase
        .from('journals')
        .select('id, name')
        .order('name');
      setJournals(journalData || []);

      // 2. Fetch all articles
      await fetchArticles();
      
      // 3. Fetch all issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('id, volume, issue_number, year, title');
      setIssuesList(issuesData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data awal.');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    const { data, error: artError } = await supabase
      .from('articles')
      .select(`
        *,
        journals (id, name, slug),
        issues (id, volume, issue_number, year),
        users!submitter_id (id, full_name, email, institution),
        article_authors (*),
        review_assignments (
          id,
          status,
          assigned_date,
          due_date,
          users!reviewer_id (id, full_name, email),
          reviews (*)
        )
      `)
      .order('submission_date', { ascending: false });

    if (artError) throw artError;
    setArticles(data || []);
  };

  const handleUpdateStatus = async (articleId: string) => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      // 1. If setting status to 'published', check and create publication row
      if (newStatus === 'published') {
        const { data: pubData, error: pubFindErr } = await supabase
          .from('publications')
          .select('id')
          .eq('article_id', articleId)
          .maybeSingle();

        if (pubFindErr) throw pubFindErr;

        if (!pubData) {
          // Get journal slug for DOI generation
          const { data: artDetails, error: artDetailsErr } = await supabase
            .from('articles')
            .select('manuscript_file, journals(slug)')
            .eq('id', articleId)
            .single();

          if (artDetailsErr) throw artDetailsErr;

          const journalsData = artDetails.journals;
          const journalSlug = (Array.isArray(journalsData) ? journalsData[0]?.slug : (journalsData as any)?.slug) || 'journal';
          const generatedDoi = `10.47822/rjrakp.${journalSlug}.v1i1.${articleId.substring(0, 8)}`;

          const { error: pubInsertErr } = await supabase
            .from('publications')
            .insert({
              article_id: articleId,
              volume_number: 'Vol. 1',
              issue_number: 'No. 1',
              publication_date: new Date().toISOString(),
              doi: generatedDoi,
              pdf_url: artDetails.manuscript_file || '',
              doi_status: 'registered'
            });

          if (pubInsertErr) throw pubInsertErr;
        }
      }

      // 2. Update Article Status
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ status: newStatus, issue_id: selectedIssueId || null })
        .eq('id', articleId);

      if (updateErr) throw updateErr;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Force updated status of article ID ${articleId} to ${newStatus}`,
        entity_type: 'articles',
        entity_id: articleId
      });

      setSuccess('Status artikel berhasil diperbarui.');
      
      // Update local state
      await fetchArticles();
      
      // Update selected article reference
      const updated = articles.find(a => a.id === articleId);
      if (updated) {
        setSelectedArticle({ ...selectedArticle, status: newStatus, issue_id: selectedIssueId || null });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memperbarui status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus artikel ini secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmDelete) return;

    setError('');
    setSuccess('');
    try {
      const { error: deleteErr } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (deleteErr) throw deleteErr;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Deleted article ID ${articleId}`,
        entity_type: 'articles',
        entity_id: articleId
      });

      setSuccess('Artikel berhasil dihapus.');
      setSelectedArticle(null);
      await fetchArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghapus artikel.');
    }
  };

  const handleDownloadCrossref = () => {
    if (!selectedArticle) return;
    const xml = generateCrossrefXML(selectedArticle);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crossref_${selectedArticle.id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered articles selector
  const getFilteredArticles = () => {
    return articles.filter(art => {
      // 1. Search Query
      const matchSearch = 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (art.users?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.article_authors.some((author: any) => author.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Journal Filter
      const matchJournal = selectedJournal === 'all' || art.journal_id === selectedJournal;

      // 3. Status Filter
      const matchStatus = selectedStatus === 'all' || art.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchJournal && matchStatus;
    });
  };

  const statusColors = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    revised: 'bg-purple-50 text-purple-700 border-purple-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    copyediting: 'bg-purple-50 text-purple-700 border-purple-200',
    layouting: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusLabels = {
    submitted: 'Baru Masuk',
    in_review: 'Proses Review',
    under_review: 'Sedang Direview',
    revised: 'Telah Direvisi',
    accepted: 'Diterima',
    copyediting: 'Copyediting',
    layouting: 'Layouting',
    published: 'Terbit',
    rejected: 'Ditolak'
  };

  const currentFiltered = getFilteredArticles();

  if (selectedArticle) {
    const isPdf = (selectedArticle.manuscript_file || '').toLowerCase().endsWith('.pdf') || (selectedArticle.manuscript_file || '').includes('/pdf/') || (selectedArticle.manuscript_file || '').includes('dummy.pdf');
    const isWord = (selectedArticle.manuscript_file || '').toLowerCase().endsWith('.docx') || (selectedArticle.manuscript_file || '').toLowerCase().endsWith('.doc');
    let embedUrl = '';
    if (isPdf) {
      embedUrl = selectedArticle.manuscript_file;
    } else if (isWord) {
      embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedArticle.manuscript_file)}`;
    }

    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <button 
            onClick={() => { setSelectedArticle(null); setError(''); setSuccess(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-academic-600 hover:text-brand-700 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Artikel
          </button>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-semibold">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content Column - Article details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Core Details Card */}
              <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm space-y-4">
                <span className="inline-block text-[10px] font-bold tracking-wider text-brand-800 bg-brand-50 px-2.5 py-1 rounded border border-brand-100 uppercase">
                  {selectedArticle.journals?.name || 'Jurnal Tidak Diketahui'}
                </span>
                
                <h2 className="text-2xl font-serif font-bold text-academic-900 leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-academic-500 pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ditransfer: {new Date(selectedArticle.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Submitter: {selectedArticle.users?.full_name}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-brand-500" /> {selectedArticle.view_count || 0} Dilihat</span>
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-brand-500" /> {selectedArticle.download_count || 0} Diunduh</span>
                </div>

                <div className="border-t border-academic-100 pt-4">
                  <h4 className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-1.5">Abstrak</h4>
                  <p className="text-sm text-academic-700 leading-relaxed text-justify">
                    {selectedArticle.abstract || 'Tidak ada abstrak.'}
                  </p>
                </div>

                {selectedArticle.keywords && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Kata Kunci</h4>
                    <p className="text-xs text-academic-700 font-semibold">{selectedArticle.keywords}</p>
                  </div>
                )}
              </div>

              {/* Manuscript Files Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Anonymous Manuscript (For Reviewers) */}
                <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col h-full">
                  <h3 className="font-serif font-bold text-lg text-academic-900 mb-2 border-b border-academic-100 pb-2">Naskah Tanpa Nama</h3>
                  <p className="text-[10px] text-academic-500 mb-4 leading-tight">Gunakan naskah ini untuk dikirim ke Reviewer (Double-blind peer review).</p>
                  
                  {selectedArticle.anonymous_manuscript_file ? (
                    <div className="flex flex-col gap-2 mt-auto">
                      <a 
                        href={selectedArticle.anonymous_manuscript_file}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="flex justify-center items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-lg transition-colors w-full"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Pratinjau
                      </a>
                    </div>
                  ) : selectedArticle.manuscript_file ? (
                    <div className="flex flex-col gap-2 mt-auto">
                      <p className="text-[10px] text-rose-600 font-bold mb-1">⚠️ Naskah versi lama (mungkin berisi nama penulis).</p>
                      <a 
                        href={selectedArticle.manuscript_file}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="flex justify-center items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-2 rounded-lg transition-colors w-full"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Naskah Lama
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center mt-auto">
                      <p className="text-xs text-academic-500">Tidak ada file tersedia.</p>
                    </div>
                  )}
                </div>

                {/* Title Page (With Names) */}
                <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col h-full">
                  <h3 className="font-serif font-bold text-lg text-academic-900 mb-2 border-b border-academic-100 pb-2">Halaman Judul (Beridentitas)</h3>
                  <p className="text-[10px] text-academic-500 mb-4 leading-tight">Naskah lengkap beserta identitas dan afiliasi penulis. Jangan dikirim ke Reviewer.</p>
                  
                  {selectedArticle.title_page_file ? (
                    <div className="flex flex-col gap-2 mt-auto">
                      <a 
                        href={selectedArticle.title_page_file}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="flex justify-center items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors w-full"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Title Page
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center mt-auto">
                      <p className="text-xs text-academic-500">Tidak ada file title page.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Production Files Card (Copyediting & Layouting) */}
              {['accepted', 'copyediting', 'layouting', 'published'].includes(selectedArticle.status.toLowerCase()) && (
                <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-lg text-academic-900 border-b border-academic-100 pb-2">File Produksi (Copyediting & Layouting)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Copyedited File */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-2">File Copyediting</h4>
                      {selectedArticle.copyedited_file ? (
                        <div className="space-y-2">
                          <p className="text-xs text-purple-600">File sudah diunggah.</p>
                          <a href={selectedArticle.copyedited_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition-colors">
                            <Download className="w-3 h-3" /> Unduh
                          </a>
                        </div>
                      ) : (
                        <div className="text-xs text-purple-600 italic mb-2">Belum ada file.</div>
                      )}
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-700 border border-purple-300 text-xs font-bold rounded cursor-pointer hover:bg-purple-100 transition-colors">
                          <Plus className="w-3 h-3" /> Unggah/Timpa File Copyediting
                          <input type="file" accept=".doc,.docx,.pdf" className="hidden" onChange={(e) => handleUploadProductionFile(e, 'copyedited_file')} />
                        </label>
                      </div>
                    </div>

                    {/* Layout File */}
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-2">File Layout (Galley PDF)</h4>
                      {selectedArticle.layout_file ? (
                        <div className="space-y-2">
                          <p className="text-xs text-indigo-600">File sudah diunggah.</p>
                          <a href={selectedArticle.layout_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors">
                            <Download className="w-3 h-3" /> Unduh
                          </a>
                        </div>
                      ) : (
                        <div className="text-xs text-indigo-600 italic mb-2">Belum ada file.</div>
                      )}
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-300 text-xs font-bold rounded cursor-pointer hover:bg-indigo-100 transition-colors">
                          <Plus className="w-3 h-3" /> Unggah/Timpa File Layout
                          <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadProductionFile(e, 'layout_file')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Authors List Card */}
              <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-academic-100 bg-academic-50/50">
                  <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Daftar Penulis (Authors)</h3>
                </div>
                <div className="divide-y divide-academic-100">
                  {selectedArticle.article_authors?.length === 0 ? (
                    <div className="p-6 text-center text-academic-500 text-xs">Belum ada penulis terdaftar.</div>
                  ) : (
                    selectedArticle.article_authors?.map((author: any) => (
                      <div key={author.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-academic-900 flex items-center gap-1.5">
                            {author.full_name}
                            {author.is_corresponding && (
                              <span className="px-1.5 py-0.2 bg-brand-100 text-brand-800 text-[8px] font-black uppercase tracking-wider rounded">Penulis Korespondensi</span>
                            )}
                          </div>
                          <div className="text-xs text-academic-500 mt-0.5">{author.affiliation || '-'} &bull; {author.email || '-'}</div>
                        </div>
                        <span className="text-xs font-bold text-academic-400">Order: {author.author_order}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Action/Meta Column */}
            <div className="space-y-6">
              
              {/* Status and Action Panel */}
              <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-academic-900 border-b border-academic-100 pb-2">Status & Tindakan Admin</h3>
                
                <div>
                  <label className="block text-xs font-black text-academic-500 uppercase tracking-widest mb-1.5">Status Saat Ini</label>
                  <span className={`inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider border ${
                    statusColors[selectedArticle.status.toLowerCase()] || 'bg-slate-50 text-slate-700'
                  }`}>
                    {statusLabels[selectedArticle.status.toLowerCase()] || selectedArticle.status}
                  </span>
                </div>

                {/* Direct Status Override */}
                <div className="space-y-2 pt-2 border-t border-academic-100">
                  <label className="block text-xs font-black text-academic-500 uppercase tracking-widest">Ubah Status Paksa (Override)</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="flex-1 border border-academic-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    >
                      <option value="">-- Pilih Status --</option>
                      <option value="submitted">Baru Masuk (Submitted)</option>
                      <option value="in_review">Proses Review (In Review)</option>
                      <option value="accepted">Diterima (Accepted)</option>
                      <option value="copyediting">Copyediting (Revisi Bahasa)</option>
                      <option value="layouting">Layouting (Desain PDF)</option>
                      <option value="published">Diterbitkan (Published)</option>
                      <option value="rejected">Ditolak (Rejected)</option>
                    </select>
                  </div>
                  
                  {['accepted', 'copyediting', 'layouting', 'published'].includes(newStatus) && (
                    <div className="mt-3">
                      <label className="block text-xs font-black text-academic-500 uppercase tracking-widest mb-1">Terbitan (Issue)</label>
                      <select
                        value={selectedIssueId}
                        onChange={e => setSelectedIssueId(e.target.value)}
                        className="w-full border border-academic-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                      >
                        <option value="">-- Belum Ditentukan --</option>
                        {issuesList.map(iss => (
                          <option key={iss.id} value={iss.id}>
                            Vol {iss.volume} No {iss.issue_number} ({iss.year}) {iss.title ? `- ${iss.title}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedArticle.id)}
                      disabled={updatingStatus || !newStatus}
                      className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors w-full"
                    >
                      Simpan Status & Terbitan
                    </button>
                  </div>
                </div>

                {/* Crossref Export button */}
                {selectedArticle.status === 'published' && (
                  <div className="pt-4 border-t border-academic-100">
                    <button
                      onClick={handleDownloadCrossref}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold text-xs rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" /> Unduh XML Crossref (DOI)
                    </button>
                  </div>
                )}

                {/* Delete button */}
                <div className="pt-4 border-t border-academic-100">
                  <button
                    onClick={() => handleDeleteArticle(selectedArticle.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Artikel Permanen
                  </button>
                </div>
              </div>

              {/* Reviewer Assignments details */}
              <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-academic-900 border-b border-academic-100 pb-2">Penugasan Reviewer</h3>
                
                <div className="space-y-4">
                  {selectedArticle.review_assignments?.length === 0 ? (
                    <p className="text-xs text-academic-500 text-center py-4">Belum ada reviewer yang ditugaskan.</p>
                  ) : (
                    selectedArticle.review_assignments?.map((assign: any) => (
                      <div key={assign.id} className="p-3 bg-academic-50/50 rounded-lg border border-academic-200 space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="text-xs font-bold text-academic-900">{assign.users?.full_name}</p>
                            <p className="text-[10px] text-academic-500">{assign.users?.email}</p>
                          </div>
                          {(() => {
                            const isCompleted = assign.status === 'completed' || (assign.reviews && assign.reviews.length > 0);
                            return (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {isCompleted ? 'Selesai' : 'Pending'}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-[10px] text-academic-500 flex flex-wrap gap-x-3">
                          <span>Batas: {assign.due_date ? new Date(assign.due_date).toLocaleDateString('id-ID') : '-'}</span>
                        </div>

                        {/* Review contents if any */}
                        {assign.reviews && assign.reviews.length > 0 && (
                          <div className="pt-2 mt-2 border-t border-dashed border-academic-200 space-y-1.5">
                            <p className="text-[9px] font-black text-brand-800 uppercase tracking-widest">
                              Rekomendasi: <span className="font-bold">{assign.reviews[0].recommendation}</span>
                            </p>
                            <div className="bg-white p-2 rounded border border-academic-100 text-[10px] text-academic-600 italic">
                              <strong>Komentar Penulis:</strong><br/>
                              "{assign.reviews[0].comments_for_author}"
                            </div>
                            <div className="bg-white p-2 rounded border border-academic-100 text-[10px] text-academic-600 italic">
                              <strong>Komentar Editor:</strong><br/>
                              "{assign.reviews[0].comments_for_editor}"
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Artikel Keseluruhan</h1>
          <p className="text-academic-500">Pantau, perbarui status, dan kelola seluruh manuskrip penulis dari satu dashboard.</p>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6">
            {success}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-academic-200 shadow-sm space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-academic-400" />
              </span>
              <input 
                type="text" 
                placeholder="Cari judul, penulis, instansi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-academic-300 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            {/* Journal Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-3.5 w-3.5 text-academic-400" />
              </span>
              <select
                value={selectedJournal}
                onChange={e => setSelectedJournal(e.target.value)}
                className="w-full border border-academic-300 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">Semua Jurnal</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-3.5 w-3.5 text-academic-400" />
              </span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full border border-academic-300 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="submitted">Baru Masuk (Submitted)</option>
                <option value="in_review">Proses Review (In Review)</option>
                <option value="accepted">Diterima (Accepted)</option>
                <option value="published">Diterbitkan (Published)</option>
                <option value="rejected">Ditolak (Rejected)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-academic-500 font-medium">Memuat data artikel...</div>
            ) : currentFiltered.length === 0 ? (
              <div className="text-center py-12 text-academic-500 font-medium bg-academic-50/30">
                <FileText className="w-8 h-8 mx-auto text-academic-300 mb-2" />
                Belum ada data artikel masuk untuk kriteria pencarian ini.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-academic-200 text-left border-collapse">
                <thead className="bg-academic-50/50">
                  <tr className="text-xs uppercase tracking-wider text-academic-500 font-bold">
                    <th scope="col" className="px-6 py-4">Judul Artikel</th>
                    <th scope="col" className="px-6 py-4">Jurnal Tujuan</th>
                    <th scope="col" className="px-6 py-4">Submitter</th>
                    <th scope="col" className="px-6 py-4">Tanggal</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                    <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-200 bg-white text-xs">
                  {currentFiltered.map((art) => {
                    const currentStatus = (art.status || 'submitted').toLowerCase();
                    const statusClass = statusColors[currentStatus] || 'bg-slate-50 text-slate-700';
                    const statusLabel = statusLabels[currentStatus] || currentStatus;
                    const formattedDate = new Date(art.submission_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={art.id} className="hover:bg-academic-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-serif font-bold text-academic-900 text-sm line-clamp-2 max-w-xs md:max-w-sm">
                            {art.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block text-[9px] font-bold text-brand-800 bg-brand-50 border border-brand-100 rounded px-2 py-0.5 uppercase tracking-wide">
                            {art.journals?.name || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-academic-800">{art.users?.full_name}</div>
                          <div className="text-[10px] text-academic-400">{art.users?.institution || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-academic-500">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-1.5">
                          <button
                            onClick={() => { setSelectedArticle(art); setNewStatus(art.status); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail & Kelola
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
