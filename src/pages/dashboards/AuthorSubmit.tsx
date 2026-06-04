import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Send, Upload, FileText } from 'lucide-react';

export default function AuthorSubmit() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    journal_id: '',
    title: '',
    abstract: '',
    keywords: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('manuscript_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Save to localStorage when formData changes
  useEffect(() => {
    // Only save if there's actually some content
    if (formData.title || formData.abstract || formData.keywords) {
      localStorage.setItem('manuscript_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    async function fetchJournals() {
      const { data } = await supabase.from('journals').select('id, name');
      if (data) {
        setJournals(data);
        // Only set default journal if we haven't loaded one from draft
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user) throw new Error("Anda harus login.");
      if (!selectedFile) throw new Error("Silakan pilih berkas naskah manuskrip terlebih dahulu.");

      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, selectedFile);
        
      if (uploadError) {
        throw new Error(`Gagal mengunggah file manuskrip: ${uploadError.message}. Pastikan bucket 'manuscripts' telah dibuat di dashboard Supabase Storage dan diatur sebagai Public.`);
      }
      
      const { data: urlData } = supabase.storage
        .from('manuscripts')
        .getPublicUrl(fileName);
        
      const manuscriptUrl = urlData?.publicUrl || '';

      // 2. Create Article
      const { data: currentArticle, error: articleError } = await supabase
        .from('articles')
        .insert([{
          journal_id: formData.journal_id,
          submitter_id: user.id,
          title: formData.title,
          abstract: formData.abstract,
          keywords: formData.keywords,
          status: 'submitted',
          manuscript_file: manuscriptUrl
        }])
        .select()
        .single();
        
      if (articleError) throw articleError;

      // 3. Add current user as first author
      const { error: authorError } = await supabase
        .from('article_authors')
        .insert([{
          article_id: currentArticle.id,
          full_name: user?.user_metadata?.full_name || 'Penulis',
          email: user.email,
          is_corresponding: true,
          author_order: 1
        }]);

      if (authorError) throw authorError;

      // Clear draft on successful submission
      localStorage.removeItem('manuscript_draft');
      setSuccess(true);
      setSelectedFile(null);
      setFormData({ ...formData, title: '', abstract: '', keywords: '' });
    } catch (err: any) {
      setError(err.message || 'Gagal mensubmit artikel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Submit Artikel Baru</h1>
          <p className="text-academic-500">Silakan isi form di bawah ini untuk mengirimkan manuskrip Anda.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submit Berhasil!</h3>
            <p className="text-emerald-700 mb-6">Manuskrip Anda telah berhasil dikirimkan ke tim editorial. Anda dapat memantau status artikel di Dashboard.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Submit Artikel Lainnya
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-academic-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">
                    Pilih Jurnal Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="journal_id"
                    required
                    value={formData.journal_id}
                    onChange={handleChange}
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50"
                  >
                    <option value="" disabled>-- Pilih Jurnal --</option>
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">
                    Judul Artikel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Masukkan judul artikel Anda..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">
                    Abstrak <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="abstract"
                    required
                    value={formData.abstract}
                    onChange={handleChange}
                    rows={6}
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 line-clamp"
                    placeholder="Tuliskan abstrak artikel (panjang disarankan: 150-250 kata)..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">
                    Kata Kunci (Keywords) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    required
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Contoh: pendidikan, evaluasi, kebijakan (pisahkan dengan koma)"
                  />
                </div>

                <div className="pt-4 border-t border-academic-100">
                  <div className="bg-academic-50 border border-academic-100 rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-bold text-academic-900 flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-academic-500" /> Upload Dokumen
                    </h3>
                    <p className="text-xs text-academic-500 mb-4">
                      Untuk saat ini, silakan kirimkan naskah lengkap (Word/PDF) melalui email ke redaksi atau unggah melalui form ini. (Fitur upload akan otomatis menyimpan metadata Anda).
                    </p>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-academic-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-academic-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <Upload className={`w-6 h-6 mb-2 ${selectedFile ? 'text-brand-600 animate-pulse' : 'text-academic-400'}`} />
                          {selectedFile ? (
                            <>
                              <p className="mb-1 text-sm text-brand-700 font-bold">File Terpilih: {selectedFile.name}</p>
                              <p className="text-xs text-academic-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Klik kembali untuk mengganti</p>
                            </>
                          ) : (
                            <>
                              <p className="mb-1 text-sm text-academic-600 font-semibold">Klik untuk memilih file manuskrip *</p>
                              <p className="text-xs text-academic-400">DOC, DOCX, atau PDF (Maks. 10MB)</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          required 
                          accept=".pdf,.doc,.docx" 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-academic-100">
                  <button type="button" className="px-5 py-2.5 rounded-lg border border-academic-300 text-academic-700 font-bold hover:bg-academic-50 transition-colors">
                    Simpan Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.journal_id}
                    className="px-6 py-2.5 rounded-lg bg-brand-700 text-white font-bold hover:bg-brand-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Memproses...' : (
                      <>Submit Artikel <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
