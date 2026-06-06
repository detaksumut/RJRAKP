import { useEffect, useState } from 'react';
import { FileText, Eye, Download, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LatestArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          id,
          publication_date,
          doi,
          pdf_url,
          view_count,
          download_count,
          articles (
            title,
            slug,
            abstract,
            article_authors ( full_name ),
            journals ( name )
          )
        `)
        .order('publication_date', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-academic-50 border-t border-academic-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start mb-12">
          <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Penemuan & Riset</h2>
          <p className="text-2xl font-bold text-academic-900 sm:text-3xl border-l-4 border-brand-600 pl-3 uppercase tracking-wider italic font-serif">
            Artikel Terbaru
          </p>
        </div>

        {loading ? (
          <div className="text-center text-academic-500 py-10">Memuat artikel terbaru...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-academic-500 py-10 border border-academic-200 rounded-xl bg-white">Belum ada data artikel yang dipublikasikan.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((pub: any) => {
              const article = pub.articles;
              const title = article?.title || 'Judul Tidak Tersedia';
              const journal = article?.journals?.name || 'Jurnal Tidak Diketahui';
              const authors = article?.article_authors?.map((a: any) => a.full_name).join(', ') || 'Penulis Tidak Diketahui';
              const date = pub.publication_date ? new Date(pub.publication_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-';
              
              return (
              <div key={pub.id} className="bg-white rounded-xl border border-academic-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden">
                <div className="bg-academic-50 px-4 py-2 border-b border-academic-200 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest">{journal}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h5 className="text-[15px] font-bold text-academic-800 leading-snug mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    <Link to={article?.slug ? `/article/${article.slug}` : '#'}>{title}</Link>
                  </h5>
                  <p className="text-[11px] text-academic-500 italic mb-3">Oleh: {authors}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-academic-500 uppercase tracking-widest font-semibold mt-auto pt-4 border-t border-academic-100">
                    <div className="flex items-center gap-1.5 text-brand-700">
                      <Calendar className="w-3.5 h-3.5" /> {date}
                    </div>
                    {pub.doi && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span>DOI: {pub.doi}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-academic-50 border-t border-academic-100 mt-auto flex justify-between items-center shrink-0">
                  <div className="flex gap-4 text-xs font-semibold text-academic-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 shrink-0" /> {pub.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4 shrink-0" /> {pub.download_count || 0}
                    </span>
                  </div>
                  {pub.pdf_url && (
                    <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-700 flex items-center gap-1 hover:text-brand-800 transition-colors uppercase tracking-wider">
                      PDF <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
        
        <div className="mt-10 flex justify-center">
          <Link to="/publikasi" className="px-6 py-2.5 bg-brand-700 text-white font-bold rounded shadow-sm hover:bg-brand-800 transition-colors text-sm uppercase tracking-widest shrink-0 flex items-center gap-2">
            Eksplorasi Semua Artikel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
