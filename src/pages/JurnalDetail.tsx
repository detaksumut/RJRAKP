import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, BookOpen, Send, Users, FileText, 
  Settings, ChevronRight, Download, Info, BarChart2
} from 'lucide-react';

export default function JurnalDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [editorialTeam, setEditorialTeam] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: journalData } = await supabase
          .from('journals')
          .select('*, journal_scopes(name)')
          .eq('slug', slug)
          .single();
        
        if (journalData) {
          setJournal(journalData);
          
            const { data: articlesData } = await supabase
              .from('publications')
              .select(`
                id,
                pdf_url,
                articles!inner (
                  title,
                  slug,
                  abstract,
                  article_authors ( full_name )
                )
              `)
              .eq('articles.journal_id', journalData.id)
              .limit(10);
              
            if (articlesData) {
              setArticles(articlesData.filter((a: any) => a.articles));
            }

            const { data: editorsData } = await supabase
              .from('journal_editorial_team')
              .select('*')
              .eq('journal_id', journalData.id)
              .order('sort_order', { ascending: true })
              .order('created_at', { ascending: false });
              
            if (editorsData) {
              setEditorialTeam(editorsData);
            }
          }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-academic-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-academic-600 mb-8">Memuat data jurnal...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen flex flex-col bg-academic-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-academic-800 mb-4">Jurnal Tidak Ditemukan</h1>
          <p className="text-academic-600 mb-8">Maaf, jurnal yang Anda cari tidak tersedia.</p>
          <Link to="/jurnal" className="btn-primary flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Jurnal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getJournalImage = (slug: string) => {
    switch (slug) {
      case 'audit-kebijakan-publik':
        return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
      case 'hukum-dan-keadilan':
        return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
      case 'pendidikan-dan-pembelajaran':
        return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';
      case 'teknik-dan-teknologi':
        return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
      case 'agama-dan-peradaban-islam':
        return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';
    }
  };

  const scopes = journal.journal_scopes?.map((s: any) => s.name).join(', ') || journal.metadata?.focus || '-';
  const image = getJournalImage(journal.slug);
  const color = journal.metadata?.color || 'bg-slate-50';

  return (
    <div className="min-h-screen flex flex-col bg-academic-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link to="/jurnal" className="inline-flex items-center text-sm font-bold text-brand-700 hover:text-brand-800 mb-6 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Jurnal
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-academic-200 overflow-hidden shadow-sm mb-8">
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
            <div className={`absolute inset-0 opacity-20 ${color}`} />
            <img 
              src={image} 
              alt={journal.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-academic-900/90 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 shadow-sm">
                {journal.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-white/80 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> E-ISSN: {journal.e_issn || '-'}</span>
                <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> P-ISSN: {journal.p_issn || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <h2 className="text-xl font-bold font-serif text-academic-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-700" />
                Deskripsi Jurnal
              </h2>
              <p className="text-academic-700 mb-8 leading-relaxed">
                {journal.description}
              </p>
              
              <h2 className="text-xl font-bold font-serif text-academic-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-700" />
                Focus & Scope
              </h2>
              <div className="bg-academic-50 p-5 rounded-xl border border-academic-100 mb-8">
                {journal.journal_scopes && journal.journal_scopes.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-academic-700 font-medium">
                    {journal.journal_scopes.map((scope: any, idx: number) => (
                      <li key={idx}>{scope.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-academic-700 leading-relaxed font-medium">
                    {scopes}
                  </p>
                )}
              </div>

              <h2 className="text-xl font-bold font-serif text-academic-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-700" />
                Peer Review Process & Ethics
              </h2>
              <div className="prose prose-academic text-academic-700 max-w-none mb-8">
                <p>Seluruh naskah yang dikirimkan ke <strong>{journal.name}</strong> akan melalui proses review sejawat (peer-review) secara <em>double-blind</em>. Hal ini memastikan obyektivitas dan kualitas ilmiah publikasi. Jurnal ini menjunjung tinggi standar etika publikasi dengan merujuk pada panduan Committee on Publication Ethics (COPE).</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link to="/etika-publikasi" className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                    Baca Etika Publikasi <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link to="/proses-peer-review" className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                    Baca Proses Peer Review <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                <h3 className="font-bold text-brand-900 mb-4 text-lg">Mulai Publikasi</h3>
                <Link to="/register" className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-brand-700 text-white hover:bg-brand-800 font-bold text-sm rounded-lg shadow-sm transition-colors mb-3">
                  <Send className="w-4 h-4" />
                  Submit Artikel
                </Link>
                <Link to="/pedoman" className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-white text-brand-700 hover:bg-academic-50 font-bold text-sm rounded-lg border border-brand-200 transition-colors">
                  <Download className="w-4 h-4" />
                  Pedoman Penulisan
                </Link>
              </div>

              <div className="bg-white rounded-xl p-6 border border-academic-200 shadow-sm">
                <h3 className="font-bold text-academic-900 flex items-center gap-2 mb-4 border-b border-academic-100 pb-3">
                  <BarChart2 className="w-5 h-5 text-brand-600" />
                  Journal Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-academic-600">Scopus H-index</span>
                    <span className="text-sm font-bold text-academic-900">{journal.metadata?.scopus_h_index || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-academic-600">Google Scholar H-index</span>
                    <span className="text-sm font-bold text-academic-900">{journal.metadata?.gs_h_index || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-academic-600">SINTA Score</span>
                    <span className="text-sm font-bold text-brand-600">{journal.metadata?.sinta_score || 'Not Yet Rated'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-academic-200 shadow-sm">
                <h3 className="font-bold text-academic-900 flex items-center gap-2 mb-4 border-b border-academic-100 pb-3">
                  <Users className="w-5 h-5 text-academic-500" />
                  Tim Editorial
                </h3>
                
                {editorialTeam.length === 0 ? (
                  <div className="text-academic-500 text-sm italic">
                    Belum ada data tim editorial.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editorialTeam.map(editor => (
                      <div key={editor.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-academic-200 shrink-0 bg-academic-100 flex items-center justify-center">
                          {editor.image_url ? (
                            <img src={editor.image_url} alt={editor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-academic-400 text-lg">{editor.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-academic-900 text-sm truncate">{editor.name}</h4>
                          <p className="text-xs font-semibold text-brand-700 truncate">{editor.role}</p>
                          {editor.affiliation && (
                            <p className="text-xs text-academic-500 truncate">{editor.affiliation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Issue Section */}
        <div className="bg-white rounded-2xl border border-academic-200 overflow-hidden shadow-sm p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-academic-100">
            <div>
              <h2 className="text-2xl font-bold font-serif text-academic-900">Volume dan Edisi Terkini</h2>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-academic-800 uppercase tracking-widest text-sm mb-4">Daftar Artikel</h3>
            
            {articles.length === 0 ? (
              <div className="text-academic-500 text-center py-8">Belum ada data artikel.</div>
            ) : (
              articles.map((pub: any) => {
                const article = pub.articles;
                const authors = article?.article_authors?.map((a: any) => a.full_name).join(', ') || 'Penulis Tidak Diketahui';
                
                return (
                <div key={pub.id} className="py-5 border-b border-academic-100 last:border-0 hover:bg-academic-50/50 transition-colors -mx-6 px-6 sm:-mx-8 sm:px-8">
                  <h4 className="text-lg font-bold text-brand-800 mb-2 leading-snug">
                    <Link to={article?.slug ? `/article/${article.slug}` : '#'} className="hover:underline">
                      {article?.title}
                    </Link>
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-academic-600">
                    <span className="font-medium text-academic-800">{authors}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    {pub.pdf_url && (
                      <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-wider text-white bg-academic-800 hover:bg-academic-900 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
