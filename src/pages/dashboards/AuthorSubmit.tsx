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
  const [isTranslating, setIsTranslating] = useState(false);

  const [publicationType, setPublicationType] = useState('international');
  const [submittedPkg, setSubmittedPkg] = useState<any>(null);

  const getPackageDetails = (type: string) => {
    switch (type) {
      case 'sinta_6':
        return { price: 'Rp 3.000.000', label: 'Paket Publikasi Jurnal SINTA 6 (All In)', name: 'SINTA 6' };
      case 'sinta_5':
        return { price: 'Rp 3.200.000', label: 'Paket Publikasi Jurnal SINTA 5 (All In)', name: 'SINTA 5' };
      case 'sinta_4':
        return { price: 'Rp 4.000.000', label: 'Paket Publikasi Jurnal SINTA 4 (All In)', name: 'SINTA 4' };
      case 'sinta_3':
        return { price: 'Rp 7.000.000', label: 'Paket Publikasi Jurnal SINTA 3 (All In)', name: 'SINTA 3' };
      case 'sinta_2':
        return { price: 'Rp 13.000.000', label: 'Paket Publikasi Jurnal SINTA 2 (All In)', name: 'SINTA 2' };
      case 'sinta_1':
        return { price: 'Rp 18.000.000', label: 'Paket Publikasi Jurnal SINTA 1 (All In)', name: 'SINTA 1' };
      default:
        return { price: 'Rp 2.500.000', label: 'Paket Publikasi Jurnal Internasional (All In)', name: 'Jurnal Internasional' };
    }
  };
  
  const [titlePageFile, setTitlePageFile] = useState<File | null>(null);
  const [anonymousFile, setAnonymousFile] = useState<File | null>(null);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    journal_id: '',
    title: '',
    abstract: '',
    abstract_en: '',
    keywords: '',
    cover_letter: '',
    bibliography: '',
    funding_source: '',
    conflict_of_interest: '',
  });

  const [authors, setAuthors] = useState<AuthorData[]>([
    { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '' }
  ]);

  // Auto Translate function using public Google Translate API
  const handleAutoTranslate = async () => {
    if (!formData.abstract || formData.abstract.trim().length < 10) {
      alert("Silakan isi Abstrak (Bahasa Indonesia) terlebih dahulu dengan lengkap.");
      return;
    }
    
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(formData.abstract)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach((item: any) => {
          if (item[0]) translatedText += item[0];
        });
      }
      
      if (translatedText) {
        setFormData(prev => ({ ...prev, abstract_en: translatedText }));
      } else {
        throw new Error("Empty translation result");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Gagal menerjemahkan secara otomatis. Silakan coba lagi nanti atau isi secara manual.");
    } finally {
      setIsTranslating(false);
    }
  };

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
      if (!titlePageFile) throw new Error("Silakan unggah Title Page (Halaman Judul).");
      if (!anonymousFile) throw new Error("Silakan unggah Anonymous Manuscript (Naskah Tanpa Nama).");
      
      // Validasi penulis
      if (authors.some(a => !a.full_name || !a.email || !a.affiliation)) {
        throw new Error("Semua penulis wajib memiliki Nama, Email, dan Afiliasi yang terisi.");
      }

      // Validasi Daftar Pustaka
      if (!formData.bibliography || formData.bibliography.trim().length < 50) {
        throw new Error("Daftar Pustaka wajib diisi dengan format yang benar (minimal 50 karakter).");
      }

      // Validasi Abstrak Dwibahasa
      if (!formData.abstract || formData.abstract.trim().length < 50) {
        throw new Error("Abstrak (Bahasa Indonesia) wajib diisi dengan benar.");
      }
      if (!formData.abstract_en || formData.abstract_en.trim().length < 50) {
        throw new Error("Abstract (English) wajib diisi dengan benar.");
      }

      // 1. Upload Manuscript Files
      const tpExt = titlePageFile.name.split('.').pop();
      const tpFileName = `titlepage_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${tpExt}`;
      const { error: tpUploadError } = await supabase.storage.from('manuscripts').upload(tpFileName, titlePageFile);
      if (tpUploadError) throw new Error(`Gagal mengunggah Title Page: ${tpUploadError.message}`);
      const titlePageUrl = supabase.storage.from('manuscripts').getPublicUrl(tpFileName).data.publicUrl;

      const anonExt = anonymousFile.name.split('.').pop();
      const anonFileName = `anonymous_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${anonExt}`;
      const { error: anonUploadError } = await supabase.storage.from('manuscripts').upload(anonFileName, anonymousFile);
      if (anonUploadError) throw new Error(`Gagal mengunggah Naskah Anonim: ${anonUploadError.message}`);
      const anonymousUrl = supabase.storage.from('manuscripts').getPublicUrl(anonFileName).data.publicUrl;

      // 2. Upload Supporting File (Optional)
      let supportingUrl = '';
      if (supportingFile) {
        const suppExt = supportingFile.name.split('.').pop();
        const suppFileName = `supp_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${suppExt}`;
        const { error: suppError } = await supabase.storage.from('manuscripts').upload(suppFileName, supportingFile);
        if (suppError) throw new Error(`Gagal mengunggah data pendukung: ${suppError.message}`);
        supportingUrl = supabase.storage.from('manuscripts').getPublicUrl(suppFileName).data.publicUrl;
      }

      const pkgDetails = getPackageDetails(publicationType);
      const isSinta = publicationType !== 'international';
      const finalTitle = isSinta ? `[${pkgDetails.name}] ${formData.title}` : formData.title;

      // 3. Create Article
      const { data: currentArticle, error: articleError } = await supabase
        .from('articles')
        .insert([{
          journal_id: formData.journal_id,
          submitter_id: user.id,
          title: finalTitle,
          abstract: formData.abstract,
          abstract_en: formData.abstract_en,
          keywords: formData.keywords,
          cover_letter: formData.cover_letter,
          bibliography: formData.bibliography,
          funding_source: formData.funding_source,
          conflict_of_interest: formData.conflict_of_interest ? true : false,
          supporting_data_file: supportingUrl || null,
          status: 'submitted',
          title_page_file: titlePageUrl,
          anonymous_manuscript_file: anonymousUrl,
          manuscript_file: titlePageUrl // fallback/legacy
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

      // Kirim Notifikasi WhatsApp ke Author
      const { data: userData } = await supabase.from('users').select('phone, full_name').eq('id', user.id).single();
      const userPhone = userData?.phone || user.user_metadata?.phone;
      const userName = userData?.full_name || user.user_metadata?.full_name || 'Penulis';
      
      if (userPhone) {
        const waMessage = isSinta 
          ? `Terima kasih telah melakukan submit artikel melalui Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP).

Detail Pengajuan:

Judul Artikel:
${formData.title}

Target Publikasi:
${pkgDetails.name}

Biaya Pendampingan Publikasi:
${pkgDetails.price}

Fasilitas yang diperoleh:

✓ Review awal naskah
✓ Penyuntingan dan penyempurnaan artikel
✓ Penyesuaian template jurnal tujuan
✓ Pendampingan submit artikel
✓ Pendampingan revisi reviewer
✓ Monitoring proses publikasi hingga terbit
✓ Depositori Zenodo
✓ Integrasi OpenAIRE
✓ Integrasi ORCID Author
✓ Terindeks Google Scholar
✓ Pendampingan metadata publikasi

Khusus paket publikasi SINTA, RJRAKP akan melakukan pendampingan dan pengelolaan publikasi hingga artikel diterbitkan pada jurnal yang saat ini terindeks SINTA sesuai kategori yang dipilih oleh penulis.

Catatan:
Proses publikasi dilaksanakan sesuai kebijakan editor, reviewer, dan ketentuan jurnal tujuan.

Silakan melakukan pembayaran sebesar *${pkgDetails.price}* ke rekening yang telah ditentukan untuk memulai proses pendampingan publikasi:
*Bank BRI 1341 0100 0081 562*
a.n *Muhibbuddin*

RJRAKP
Rumah Jurnal Riset, Analisis dan Keadilan Publik
Jl. H.M. Joni No. 11, Medan
https://rjrakp.com`
          : `Terima kasih telah melakukan submit artikel melalui Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP).

Detail Pengajuan:

Judul Artikel:
${formData.title}

Target Publikasi:
Jurnal Internasional

Biaya Publikasi & Review:
Rp 2.500.000

Fasilitas yang diperoleh:
✓ Penerbitan di Rumah Jurnal Internasional
✓ Terindeks Google Scholar & Zenodo
✓ Terhubung ke ORCID
✓ Terindeks di OpenAIRE
✓ Penerbitan sertifikat dan nomor DOI

Silakan melakukan pembayaran sebesar *Rp 2.500.000* ke rekening yang telah ditentukan untuk memulai proses publikasi:
*Bank BRI 1341 0100 0081 562*
a.n *Muhibbuddin*

RJRAKP
Rumah Jurnal Riset, Analisis dan Keadilan Publik
Jl. H.M. Joni No. 11, Medan
https://rjrakp.com`;

        supabase.functions.invoke('send-wa', {
          body: {
            target: userPhone,
            message: waMessage
          }
        }).catch(err => console.error("Gagal mengirim WA:", err));
      }

      // Sukses
      setSubmittedPkg(pkgDetails);
      localStorage.removeItem('manuscript_draft');
      setSuccess(true);
      setTitlePageFile(null);
      setAnonymousFile(null);
      setSupportingFile(null);
      setFormData({ journal_id: journals[0]?.id || '', title: '', abstract: '', abstract_en: '', bibliography: '', funding_source: '', conflict_of_interest: false, keywords: '', cover_letter: '' });
      setAuthors([{ id: Math.random().toString(), full_name: user.user_metadata?.full_name || '', email: user.email || '', affiliation: '', country: '', orcid: '' }]);
      setPublicationType('international');
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

            <div className="bg-white border border-brand-200 rounded-xl p-6 text-left mb-8 shadow-sm">
              <h4 className="text-brand-800 font-bold mb-2">Pemberitahuan Biaya Publikasi & Review</h4>
              <p className="text-brand-700 text-sm mb-4 leading-relaxed font-medium">
                {submittedPkg?.name !== 'Jurnal Internasional' ? (
                  <>
                    Setiap jurnal yang disubmit dengan target SINTA, selain menerima notifikasi ini, penulis juga diminta untuk segera mentransfer <strong>Biaya Review & Publikasi All-In</strong>. Biaya ini mencakup penerbitan di RJRAKP dengan target <strong>{submittedPkg?.name}</strong>, termasuk indeksasi di <strong>Google Scholar</strong>, <strong>Zenodo</strong>, penautan otomatis ke profil <strong>ORCID</strong>, indeksasi di <strong>OpenAIRE</strong>, serta penyematan nomor referensi <strong>DOI</strong> dan terbitnya sertifikat. Khusus untuk <strong>Web of Science</strong> (tulisan tertentu) & <strong>SSRN Elsevier</strong>.
                  </>
                ) : (
                  <>
                    Setiap jurnal yang disubmit, selain menerima notifikasi ini, penulis juga diminta untuk segera mentransfer <strong>Biaya Review & Publikasi</strong>. Biaya ini sudah mencakup keseluruhan proses penerbitan di <strong>Rumah Jurnal Internasional</strong>, termasuk indeksasi di <strong>Google Scholar</strong> dan <strong>Zenodo</strong>, penautan otomatis ke profil <strong>ORCID</strong>, indeksasi di <strong>OpenAIRE</strong>, serta penyematan nomor referensi <strong>DOI</strong> yang valid dan terbitnya sertifikat.
                  </>
                )}
              </p>
              <div className="text-xs text-brand-600 mb-4 bg-brand-50/50 p-2.5 rounded border border-brand-100/50 leading-relaxed font-semibold">
                <strong>Catatan:</strong> Proses publikasi dilaksanakan sesuai kebijakan editor, reviewer, dan ketentuan jurnal tujuan.
              </div>
              <div className="bg-brand-50 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 justify-between border border-brand-100">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1">Rekening Tujuan Pembayaran</span>
                  <span className="block text-2xl font-black text-brand-900 tracking-wider">1341 0100 0081 562</span>
                  <span className="block text-sm font-bold text-brand-700 mt-1">Bank BRI a.n. Muhibbuddin</span>
                </div>
                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-brand-200/50 pt-3 md:pt-0 md:pl-6">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1">Jumlah Transfer</span>
                  <span className="block text-2xl font-black text-brand-900 tracking-wider">{submittedPkg?.price || 'Rp 2.500.000'}</span>
                </div>
              </div>
            </div>

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
                  <label className="block text-sm font-bold text-academic-900 mb-2">Pilih Tipe/Paket Publikasi <span className="text-red-500">*</span></label>
                  <select 
                    value={publicationType} 
                    onChange={e => setPublicationType(e.target.value)} 
                    className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 bg-academic-50"
                  >
                    <option value="international">Publikasi Jurnal Internasional (Biaya Publish: Rp 2.500.000)</option>
                    <option value="sinta_6">Publikasi Jurnal SINTA 6 (Biaya Publish: Rp 3.000.000)</option>
                    <option value="sinta_5">Publikasi Jurnal SINTA 5 (Biaya Publish: Rp 3.200.000)</option>
                    <option value="sinta_4">Publikasi Jurnal SINTA 4 (Biaya Publish: Rp 4.000.000)</option>
                    <option value="sinta_3">Publikasi Jurnal SINTA 3 (Biaya Publish: Rp 7.000.000)</option>
                    <option value="sinta_2">Publikasi Jurnal SINTA 2 (Biaya Publish: Rp 13.000.000)</option>
                    <option value="sinta_1">Publikasi Jurnal SINTA 1 (Biaya Publish: Rp 18.000.000)</option>
                  </select>
                  <p className="text-xs text-academic-500 mt-1.5 leading-relaxed">
                    Khusus untuk submitter yang meminta diterbitkan ikut SINTA, biaya tersebut sudah <strong>All In</strong> mencakup biaya terbit di RJRAKP (terindeks Google Scholar, terbit Zenodo, terindeks di OpenAIRE, dan terdaftar di ORCID). Khusus untuk Web of Science (tulisan tertentu) & SSRN Elsevier.
                  </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-academic-900 mb-2">Abstrak (Bahasa Indonesia) <span className="text-red-500">*</span></label>
                    <textarea 
                      name="abstract" 
                      required 
                      value={formData.abstract} 
                      onChange={handleChange} 
                      rows={6} 
                      className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" 
                      placeholder="Tuliskan abstrak berbahasa Indonesia di sini..."
                    ></textarea>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-academic-900">Abstract (English) <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        onClick={handleAutoTranslate}
                        disabled={isTranslating || !formData.abstract}
                        className="text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 px-2 py-1 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isTranslating ? 'Menerjemahkan...' : '✨ Auto Translate'}
                      </button>
                    </div>
                    <textarea 
                      name="abstract_en" 
                      required 
                      value={formData.abstract_en} 
                      onChange={handleChange} 
                      rows={6} 
                      className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" 
                      placeholder="Write your English abstract here..."
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Kata Kunci (Keywords) <span className="text-red-500">*</span></label>
                  <input type="text" name="keywords" required value={formData.keywords} onChange={handleChange} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="Contoh: pendidikan, evaluasi, kebijakan (pisahkan dengan koma)" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-2">Daftar Pustaka (References) <span className="text-red-500">*</span></label>
                  <p className="text-xs text-academic-500 mb-2">Wajib diisi. Copy-paste seluruh daftar pustaka dari naskah Anda ke dalam kotak ini.</p>
                  <textarea name="bibliography" required value={formData.bibliography} onChange={handleChange} rows={10} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="1. Penulis A. (2020). Judul Buku..."></textarea>
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
                  <label className="block text-sm font-bold text-academic-900 mb-2">Sponsor / Sumber Pendanaan (Opsional)</label>
                  <p className="text-xs text-academic-500 mb-2">Misal: Penelitian ini didanai oleh LPDP, Kemenristekdikti, atau pihak lainnya.</p>
                  <input type="text" name="funding_source" value={formData.funding_source} onChange={handleChange} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="Ketik nama sponsor atau lembaga pendanaan jika ada..." />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-academic-900 mb-2">Cover Letter (Opsional)</label>
                  <p className="text-xs text-academic-500 mb-2">Pesan singkat kepada Editor mengenai mengapa artikel ini penting dan cocok diterbitkan di jurnal ini.</p>
                  <textarea name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={4} className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500" placeholder="Tuliskan cover letter di sini..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Title Page */}
                  <div className="bg-academic-50 border border-academic-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <h3 className="text-sm font-bold text-academic-900 flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-brand-600" /> Title Page (Halaman Judul) <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-academic-500 mb-4">Berisi Judul, Nama Penulis, Afiliasi, Email, Abstrak, dan Acknowledgement.</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-academic-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-brand-50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <Upload className={`w-5 h-5 mb-1.5 ${titlePageFile ? 'text-brand-600' : 'text-academic-400'}`} />
                        {titlePageFile ? (
                          <p className="text-sm text-brand-700 font-bold line-clamp-1">{titlePageFile.name}</p>
                        ) : (
                          <p className="text-sm text-academic-600 font-semibold">Pilih File Title Page</p>
                        )}
                      </div>
                      <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => e.target.files && setTitlePageFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>

                  {/* Anonymous Manuscript */}
                  <div className="bg-academic-50 border border-academic-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <h3 className="text-sm font-bold text-academic-900 flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-brand-600" /> Anonymous Manuscript <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-academic-500 mb-4">Naskah lengkap <strong>TANPA</strong> nama penulis dan afiliasi (Untuk Blind Review).</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-academic-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-brand-50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <Upload className={`w-5 h-5 mb-1.5 ${anonymousFile ? 'text-brand-600' : 'text-academic-400'}`} />
                        {anonymousFile ? (
                          <p className="text-sm text-brand-700 font-bold line-clamp-1">{anonymousFile.name}</p>
                        ) : (
                          <p className="text-sm text-academic-600 font-semibold">Pilih Naskah Anonim</p>
                        )}
                      </div>
                      <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => e.target.files && setAnonymousFile(e.target.files[0])} className="hidden" />
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
                      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png" onChange={(e) => e.target.files && setSupportingFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: KETENTUAN JURNAL & ETIKA */}
              <div className="p-6 md:p-8 space-y-4 border-t border-academic-100 bg-amber-50/30">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      id="conflict_of_interest" 
                      checked={formData.conflict_of_interest === 'true'}
                      onChange={(e) => setFormData({...formData, conflict_of_interest: e.target.checked ? 'true' : ''})}
                      className="w-5 h-5 rounded border-academic-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="conflict_of_interest" className="text-sm font-bold text-academic-900 cursor-pointer">
                      Pernyataan Konflik Kepentingan (Conflict of Interest) <span className="text-academic-500 font-normal">(Opsional)</span>
                    </label>
                    <p className="text-sm text-academic-700 mt-1">
                      Centang kotak ini jika Anda menyatakan bahwa <strong>ada konflik kepentingan</strong> potensial dalam penelitian ini. Jika dibiarkan kosong, Anda menyatakan bahwa penelitian ini bebas dari konflik kepentingan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-academic-200">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      id="agreement" 
                      required
                      className="w-5 h-5 rounded border-academic-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="agreement" className="text-sm font-bold text-academic-900 cursor-pointer">
                      Pernyataan Kesesuaian Naskah Jurnal <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-academic-700 mt-1">
                      Saya menyatakan bahwa naskah jurnal yang dikirimkan ini <strong>telah dilengkapi dengan Daftar Pustaka</strong> yang sesuai dengan standar penulisan akademik, dan Naskah Anonim benar-benar tidak mengandung identitas penulis.
                    </p>
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
