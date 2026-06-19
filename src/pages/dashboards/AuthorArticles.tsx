import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FileText, Eye, Search, Filter, Download, BookOpen, ChevronRight, HelpCircle, DollarSign } from 'lucide-react';

export default function AuthorArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'archive'>('queue');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
       fetchArticles();
    }
  }, [user?.id]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          journals ( name ),
          article_authors ( full_name, author_order )
        `)
        .eq('submitter_id', user?.id)
        .order('submission_date', { ascending: false });
        
      if (error) throw error;
      if (data) setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter articles by active tab
  const getFilteredArticles = () => {
    return articles.filter(art => {
      const status = (art.status || '').toLowerCase();
      const isArchive = status === 'published' || status === 'rejected';
      const matchesTab = activeTab === 'archive' ? isArchive : !isArchive;
      
      const authorNames = art.article_authors
        ? art.article_authors.map((a: any) => a.full_name).join(' ').toLowerCase()
        : '';
      const matchesSearch = 
        art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        authorNames.includes(searchTerm.toLowerCase()) ||
        String(art.id).includes(searchTerm);

      return matchesTab && matchesSearch;
    });
  };

  const activeArticles = articles.filter(art => {
    const status = (art.status || '').toLowerCase();
    return status !== 'published' && status !== 'rejected';
  });

  const archiveArticles = articles.filter(art => {
    const status = (art.status || '').toLowerCase();
    return status === 'published' || status === 'rejected';
  });

  const filteredList = getFilteredArticles();

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    revised: 'bg-purple-50 text-purple-700 border-purple-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const statusLabels: Record<string, string> = {
    submitted: 'Baru Masuk',
    in_review: 'Dalam Review',
    under_review: 'Sedang Direview',
    revised: 'Perlu Revisi',
    accepted: 'Diterima',
    published: 'Terbit',
    rejected: 'Ditolak'
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Main Grid Layout: List on Left, Sidebar Widgets on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Submissions Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Submisi</h1>
              <p className="text-academic-500 text-sm">Kelola dan pantau proses evaluasi berkas naskah artikel Anda.</p>
            </div>

            {/* Benefit & Monetization Info Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0">
                <DollarSign className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-emerald-950 font-bold mb-1 flex items-center gap-1.5">
                  ✨ Karya Anda Sangat Berharga: Benefit & Royalti Penulis
                </h4>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Semua naskah jurnal yang diterbitkan di sistem <strong>RJRAKP</strong> akan menghasilkan keuntungan finansial bagi penulisnya. Setiap ada pembaca yang mengunduh naskah Anda, <strong>pembaca tersebut wajib membayar biaya unduh yang akan ditransfer secara langsung oleh pembaca ke nomor rekening bank Anda</strong>. Pastikan data rekening Anda sudah diisi dengan benar pada menu <Link to="/dashboard/profile" className="font-bold underline text-emerald-800 hover:text-emerald-950">Profil & Rekening</Link> agar pembaca dapat melakukan transfer langsung.
                </p>
              </div>
            </div>

            {/* OJS Style Tabs */}
            <div className="border-b border-academic-200 flex gap-2">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'queue'
                    ? 'border-brand-600 text-brand-700 bg-white/50 rounded-t-lg'
                    : 'border-transparent text-academic-500 hover:text-academic-800'
                }`}
              >
                Antrean Aktif
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'queue' ? 'bg-brand-100 text-brand-700' : 'bg-academic-100 text-academic-600'}`}>
                  {activeArticles.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'archive'
                    ? 'border-brand-600 text-brand-700 bg-white/50 rounded-t-lg'
                    : 'border-transparent text-academic-500 hover:text-academic-800'
                }`}
              >
                Arsip
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'archive' ? 'bg-brand-100 text-brand-700' : 'bg-academic-100 text-academic-600'}`}>
                  {archiveArticles.length}
                </span>
              </button>
            </div>

            {/* Payment Info Notification (Only for Active tab) */}
            {activeTab === 'queue' && activeArticles.length > 0 && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start shadow-sm">
                <div className="bg-brand-100 p-2.5 rounded-xl text-brand-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-brand-900 font-bold mb-1.5">Informasi Biaya Review & Publikasi</h4>
                  <p className="text-sm text-brand-700 leading-relaxed mb-3">
                    Bagi artikel yang berstatus <strong>Baru Masuk (Submitted)</strong> atau sedang dalam proses, Penulis diminta untuk melakukan transfer <strong>Biaya Review & Publikasi</strong>. Biaya ini sudah mencakup keseluruhan proses penerbitan di <strong>Rumah Jurnal Internasional</strong>, termasuk indeksasi di <strong>Google Scholar</strong> dan <strong>Zenodo</strong>, penautan otomatis ke profil <strong>ORCID</strong>, indeksasi di <strong>OpenAIRE</strong>, serta penyematan nomor referensi <strong>DOI</strong> yang valid dan terbitnya sertifikat.
                  </p>
                  <div className="inline-flex flex-wrap items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-brand-200 shadow-sm">
                     <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">Rekening Tujuan:</span>
                     <span className="font-black text-brand-900 text-lg tracking-wider">BRI 1341 0100 0081 562</span>
                     <span className="text-sm text-brand-700 font-bold md:border-l border-brand-200 md:pl-3">a.n. Muhibbuddin</span>
                  </div>
                </div>
              </div>
            )}

            {/* List and Filters Header */}
            <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-academic-50/50 border-b border-academic-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <h3 className="font-bold text-academic-800 text-sm uppercase tracking-wider">
                  {activeTab === 'queue' ? 'Submisi Saya yang Aktif' : 'Arsip Submisi Saya'}
                </h3>
                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-academic-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari naskah..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full border border-academic-300 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submission Rows */}
              {loading ? (
                <div className="p-12 text-center text-academic-500">
                  <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mb-2"></span>
                  <p className="text-sm">Memuat daftar naskah...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="p-12 text-center bg-academic-50/20">
                  <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
                  <p className="text-academic-600 font-medium mb-4">Tidak ada naskah yang ditemukan.</p>
                  {activeTab === 'queue' && (
                    <Link to="/dashboard/author/submit" className="text-brand-600 font-bold hover:underline text-sm">
                      Mulai submit artikel pertama Anda sekarang
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-academic-100">
                  {filteredList.map((article, idx) => {
                    // Short ID computation
                    const shortId = article.id ? String(article.id).substring(0, 4).toUpperCase() : (1000 + idx);

                    // Dynamic authors join
                    const authorsList = article.article_authors && article.article_authors.length > 0
                      ? [...article.article_authors]
                          .sort((a: any, b: any) => a.author_order - b.author_order)
                          .map((a: any) => a.full_name)
                          .join(', ')
                      : user?.full_name || 'Penulis';

                    const currentStatus = (article.status || 'submitted').toLowerCase();
                    const statusClass = statusColors[currentStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
                    const statusLabel = statusLabels[currentStatus] || currentStatus;

                    return (
                      <div 
                        key={article.id} 
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-academic-50/50 transition-colors border-l-4 border-transparent hover:border-brand-500"
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-academic-500 bg-academic-100 px-2 py-0.5 rounded">
                              {shortId}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                              {article.journals?.name || 'Jurnal'}
                            </span>
                            <span className="text-xs text-academic-400">
                              Dikirim: {new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-academic-900 text-base leading-snug hover:text-brand-700">
                            <Link to={`/dashboard/author/articles/${article.id}`}>
                              {article.title}
                            </Link>
                          </h3>
                          
                          <p className="text-xs text-academic-600 font-medium">
                            {authorsList}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusClass}`}>
                            {statusLabel}
                          </span>
                          <Link 
                            to={`/dashboard/author/articles/${article.id}`} 
                            className="inline-flex items-center justify-center p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-academic-200 shadow-sm"
                            title="Buka Detail Submisi"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Widgets Sidebar */}
          <div className="space-y-6 lg:mt-14">
            {/* New Submission Action Card */}
            <Link
              to="/dashboard/author/submit"
              className="block w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-center rounded-xl shadow-md transition-all hover:shadow-lg text-sm"
            >
              New Submission
            </Link>

            {/* Panduan Penulis Card */}
            <div className="bg-white rounded-xl border border-academic-200 p-5 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-academic-900 border-b border-academic-100 pb-2">
                Panduan Penulis
              </h4>
              <p className="text-xs text-academic-500 leading-relaxed">
                Lihat petunjuk lengkap untuk penulis sebelum mempersiapkan dan mengirimkan naskah Anda agar sesuai dengan kriteria editorial.
              </p>
              <Link
                to="/panduan-penulis"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors pt-1"
              >
                Lihat Panduan Penulis <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Template Naskah Card */}
            <div className="bg-white rounded-xl border border-academic-200 p-5 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-academic-900 border-b border-academic-100 pb-2">
                Template Naskah
              </h4>
              <p className="text-xs text-academic-500 leading-relaxed">
                Unduh template naskah resmi Microsoft Word yang digunakan oleh jurnal ini untuk memformat struktur penulisan artikel Anda.
              </p>
              <a
                href="/template-naskah.docx"
                download="Template_Naskah_RJRAKP.docx"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-bold text-xs rounded-lg transition-colors w-full justify-center"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template Naskah
              </a>
            </div>

            {/* Kebijakan Jurnal Card */}
            <div className="bg-white rounded-xl border border-academic-200 p-5 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-academic-900 border-b border-academic-100 pb-2">
                Kebijakan Jurnal
              </h4>
              <p className="text-xs text-academic-500 leading-relaxed">
                Lihat kebijakan resmi jurnal terkait dengan etika publikasi ilmiah, proses penelaahan sejawat, kebijakan penarikan naskah, dan anti-plagiarisme.
              </p>
              <Link
                to="/etika-publikasi"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors pt-1"
              >
                Lihat Kebijakan Etika <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
