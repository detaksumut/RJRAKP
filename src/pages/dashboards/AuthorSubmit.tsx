import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Send, Upload, FileText, Plus, Trash2, ChevronUp, ChevronDown, UserPlus } from 'lucide-react';

interface AuthorData {
  id: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid: string;
}

export default function AuthorSubmit() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    journal_id: '',
    title: '',
    abstract: '',
    keywords: '',
    cover_letter: '',
  });

  const [authors, setAuthors] = useState<AuthorData[]>([
    { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '' }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('manuscript_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (parsed.authors && parsed.authors.length > 0) setAuthors(parsed.authors);
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    } else if (user) {
      // Auto-fill first author with current user info if no draft
      setAuthors([
        { 
          id: Math.random().toString(), 
          full_name: user.user_metadata?.full_name || '', 
          email: user.email || '', 
          affiliation: '', 
          country: '', 
          orcid: '' 
        }
      ]);
    }
  }, [user]);

  // Save to localStorage when formData or authors change
  useEffect(() => {
    if (formData.title || formData.abstract || formData.keywords || authors[0].full_name) {
      localStorage.setItem('manuscript_draft', JSON.stringify({ formData, authors }));
    }
  }, [formData, authors]);

  useEffect(() => {
    async function fetchJournals() {
      const { data } = await supabase.from('journals').select('id, name');
      if (data) {
        setJournals(data);
        setFormData(prev => {
          if (!prev.journal_id && data.length > 0) {
            return { ...prev, journal_id: data[0].id };
          }
          return prev;
        });
      }
    }
    fetchJournals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthorChange = (index: number, field: keyof AuthorData, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = [...authors];
      newAuthors.splice(index, 1);
      setAuthors(newAuthors);
    }
  };

  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newAuthors = [...authors];
      const temp = newAuthors[index];
      newAuthors[index] = newAuthors[index - 1];
      newAuthors[index - 1] = temp;
      setAuthors(newAuthors);
    } else if (direction === 'down' && index < authors.length - 1) {
      const newAuthors = [...authors];
      const temp = newAuthors[index];
      newAuthors[index] = newAuthors[index + 1];
      newAuthors[index + 1] = temp;
      setAuthors(newAuthors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user) throw new Error("Anda harus login.");
      if (!selectedFile) throw new Error("Silakan unggah berkas naskah utama (PDF/Word).");
      
      // Validasi penulis
      if (authors.some(a => !a.full_name || !a.email || !a.affiliation)) {
        throw new Error("Semua penulis wajib memiliki Nama, Email, dan Afiliasi yang terisi.");
      }

      // 1. Upload Manuscript File
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `manuscript_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('manuscripts').upload(fileName, selectedFile);
      if (uploadError) throw new Error(`Gagal mengunggah naskah utama: ${uploadError.message}`);
      const manuscriptUrl = supabase.storage.from('manuscripts').getPublicUrl(fileName).data.publicUrl;

      // 2. Upload Supporting File (Optional)
      let supportingUrl = '';
      if (supportingFile) {
        const suppExt = supportingFile.name.split('.').pop();
        const suppFileName = `supp_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${suppExt}`;
        const { error: suppError } = await supabase.storage.from('manuscripts').upload(suppFileName, supportingFile);
        if (suppError) throw new Error(`Gagal mengunggah data pendukung: ${suppError.message}`);
        supportingUrl = supabase.storage.from('manuscripts').getPublicUrl(suppFileName).data.publicUrl;
      }

      // 3. Create Article
      const { data: currentArticle, error: articleError } = await supabase
        .from('articles')
        .insert([{
          journal_id: formData.journal_id,
          submitter_id: user.id,
          title: formData.title,
          abstract: formData.abstract,
          keywords: formData.keywords,
          cover_letter: formData.cover_letter,
          supporting_data_file: supportingUrl || null,
          status: 'submitted',
          manuscript_file: manuscriptUrl
        }])
        .select()
        .single();
        
      if (articleError) throw articleError;

      // 4. Insert all authors
      const authorsToInsert = authors.map((author, index) => ({
        article_id: currentArticle.id,
        full_name: author.full_name,
        email: author.email,
        affiliation: author.affiliation,
        country: author.country || null,
        orcid: author.orcid || null,
        is_corresponding: index === 0, // Penulis pertama dianggap Corresponding
        author_order: index + 1
      }));

      const { error: authorError } = await supabase.from('article_authors').insert(authorsToInsert);
      if (authorError) throw authorError;

      // Sukses
      localStorage.removeItem('manuscript_draft');
      setSuccess(true);
      setSelectedFile(null);
      setSupportingFile(null);
      setFormData({ journal_id: journals[0]?.id || '', title: '', abstract: '', keywords: '', cover_letter: '' });
      setAuthors([{ id: Math.random().toString(), full_name: user.user_metadata?.full_name || '', email: user.email || '', affiliation: '', country: '', orcid: '' }]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal mensubmit artikel.';
      setError(errorMessage);
      window.alert('Terjadi Kesalahan: ' + errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Submit Artikel Baru</h1>
          <p className="text-academic-500">Silakan lengkapi formulir metadata di bawah ini. Anda dapat menambahkan lebih dari satu penulis.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center mb-8 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submit Berhasil!</h3>
            <p className="text-emerald-700 mb-6">Manuskrip dan data metadata penulis telah berhasil dikirimkan ke tim editorial. Anda dapat memantau status artikel di Dashboard.</p>
            <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm">
              Submit Artikel Lainnya
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-academic-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-academic-100">
              
              {/* SECTION 1: METADATA ARTIKEL */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-bold text-academic-900">Metadata Artikel</h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Pilih Jurnal Tujuan <span className="text-red-500">*</span></label>
                  <select name="journal_id" required value={formData.journal_id} onChange={handleChange} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 bg-academic-50">
                    <option value="" disabled>-- Pilih Jurnal --</option>
                    {journals.map(j => (<option key={j.id} value={j.id}>{j.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Judul Artikel <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    required
                    autoComplete="off"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500"
                    placeholder="Masukkan judul artikel Anda..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Abstrak <span className="text-red-500">*</span></label>
                  <textarea name="abstract" required value={formData.abstract} onChange={handleChange} rows={6} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 line-clamp" placeholder="Tuliskan abstrak artikel..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Kata Kunci (Keywords) <span className="text-red-500">*</span></label>
                  <input type="text" name="keywords" required value={formData.keywords} onChange={handleChange} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="Contoh: pendidikan, evaluasi, kebijakan (pisahkan dengan koma)" />
                </div>
              </div>

              {/* SECTION 2: PENULIS */}
              <div className="p-6 md:p-8 bg-academic-50/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">2</div>
                    <h2 className="text-xl font-bold text-academic-900">Daftar Penulis</h2>
                  </div>
                  <button type="button" onClick={addAuthor} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-academic-300 rounded-lg text-sm font-bold text-academic-700 hover:bg-academic-50 shadow-sm transition-colors">
                    <UserPlus className="w-4 h-4" /> Tambah Penulis
                  </button>
                </div>
                <p className="text-sm text-academic-500 mb-6">Penulis pada urutan pertama (Urutan 1) akan dianggap sebagai <strong>Corresponding Author (Penulis Korespondensi)</strong>.</p>

                <div className="space-y-6">
                  {authors.map((author, index) => (
                    <div key={author.id} className="bg-white border border-academic-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="bg-academic-50 px-5 py-3 border-b border-academic-200 flex justify-between items-center">
                        <span className="font-bold text-academic-900 text-sm">Penulis ke-{index + 1} {index === 0 && <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs">Corresponding</span>}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveAuthor(index, 'up')} disabled={index === 0} className="p-1 text-academic-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-academic-400" title="Geser ke atas"><ChevronUp className="w-5 h-5" /></button>
                          <button type="button" onClick={() => moveAuthor(index, 'down')} disabled={index === authors.length - 1} className="p-1 text-academic-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-academic-400" title="Geser ke bawah"><ChevronDown className="w-5 h-5" /></button>
                          <button type="button" onClick={() => removeAuthor(index)} disabled={authors.length === 1} className="p-1.5 ml-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Hapus penulis"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-academic-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                          <input type="text" required autoComplete="off" value={author.full_name} onChange={(e) => handleAuthorChange(index, 'full_name', e.target.value)} className="w-full border border-academic-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Beserta gelar jika ada" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-academic-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                          <input type="email" required value={author.email} onChange={(e) => handleAuthorChange(index, 'email', e.target.value)} className="w-full border border-academic-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="email@institusi.ac.id" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-academic-700 mb-1.5">Afiliasi / Institusi <span className="text-red-500">*</span></label>
                          <input type="text" required value={author.affiliation} onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)} className="w-full border border-academic-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Nama Universitas / Lembaga" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-academic-700 mb-1.5">Negara (Opsional)</label>
                          <input type="text" value={author.country} onChange={(e) => handleAuthorChange(index, 'country', e.target.value)} className="w-full border border-academic-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Contoh: Indonesia" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-academic-700 mb-1.5">ORCID iD (Opsional)</label>
                          <input type="url" value={author.orcid} onChange={(e) => handleAuthorChange(index, 'orcid', e.target.value)} className="w-full border border-academic-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="https://orcid.org/0000-0000-0000-0000" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: FILE & LAMPIRAN */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">3</div>
                  <h2 className="text-xl font-bold text-academic-900">Dokumen & Lampiran</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Cover Letter (Opsional)</label>
                  <p className="text-xs text-academic-500 mb-2">Pesan singkat kepada Editor mengenai mengapa artikel ini penting dan cocok diterbitkan di jurnal ini.</p>
                  <textarea name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={4} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="Tuliskan cover letter di sini..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Utama */}
                  <div className="bg-academic-50 border border-academic-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <h3 className="text-sm font-bold text-academic-900 flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-brand-600" /> Naskah Utama <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-academic-500 mb-4">Format DOC, DOCX, atau PDF. Maksimal 10MB.</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-academic-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-brand-50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <Upload className={`w-5 h-5 mb-1.5 ${selectedFile ? 'text-brand-600' : 'text-academic-400'}`} />
                        {selectedFile ? (
                          <p className="text-sm text-brand-700 font-bold line-clamp-1">{selectedFile.name}</p>
                        ) : (
                          <p className="text-sm text-academic-600 font-semibold">Pilih File Naskah</p>
                        )}
                      </div>
                      <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>

                  {/* Pendukung */}
                  <div className="bg-academic-50 border border-academic-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <h3 className="text-sm font-bold text-academic-900 flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-academic-500" /> Data Pendukung (Opsional)
                    </h3>
                    <p className="text-xs text-academic-500 mb-4">Misal: Dataset Excel, Lampiran Gambar/Kode tambahan.</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-academic-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-brand-50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <Upload className={`w-5 h-5 mb-1.5 ${supportingFile ? 'text-brand-600' : 'text-academic-400'}`} />
                        {supportingFile ? (
                          <p className="text-sm text-brand-700 font-bold line-clamp-1">{supportingFile.name}</p>
                        ) : (
                          <p className="text-sm text-academic-600 font-semibold">Pilih File Pendukung</p>
                        )}
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" onChange={(e) => e.target.files && setSupportingFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="p-6 md:p-8 bg-academic-50 border-t border-academic-200 flex flex-col gap-4 items-end">
                {error && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" disabled={loading || !formData.journal_id} className="px-8 py-3 rounded-xl bg-brand-700 text-white font-bold hover:bg-brand-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                    {loading ? 'Mengunggah Data...' : <><Send className="w-5 h-5" /> Submit Artikel</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
