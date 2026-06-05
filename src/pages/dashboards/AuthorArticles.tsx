import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';

export default function AuthorArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
       fetchArticles();
    }
  }, [user?.id]);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('articles')
        .select('*, journals(name)')
        .eq('submitter_id', user?.id)
        .order('submission_date', { ascending: false });
        
      if (data) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Artikel Saya</h1>
            <p className="text-academic-500">Daftar artikel yang pernah Anda submit.</p>
          </div>
          <Link to="/dashboard/author/submit" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
            Tulis Artikel
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          {loading ? (
             <div className="p-8 text-center text-academic-500">Memuat artikel...</div>
          ) : articles.length === 0 ? (
             <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
                <p className="text-academic-600 font-medium mb-4">Anda belum pernah mensubmit artikel.</p>
                <Link to="/dashboard/author/submit" className="text-brand-600 font-bold hover:underline">
                  Submit artikel pertama Anda sekarang
                </Link>
             </div>
          ) : (
             <div className="divide-y divide-academic-100">
                {articles.map(article => (
                  <div key={article.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-academic-50 transition-colors">
                     <div className="flex-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-brand-600 bg-brand-50 px-2 py-1 rounded inline-block mb-2 border border-brand-100">
                          {article.journals?.name || 'Jurnal'}
                        </span>
                        <h3 className="font-bold text-academic-900 text-lg mb-1 leading-snug">{article.title}</h3>
                        <p className="text-xs text-academic-500">
                          Disubmit pada: {new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                           <span className="text-xs font-bold uppercase tracking-wider text-academic-600">Status</span>
                           <div className="text-sm font-bold capitalize text-amber-600">{article.status}</div>
                        </div>
                        <Link to={`/dashboard/author/articles/${article.id}`} className="p-2 text-academic-400 hover:bg-academic-200 hover:text-academic-700 rounded-lg transition-colors tooltip" aria-label="Lihat Detail">
                           <Eye className="w-5 h-5" />
                        </Link>
                     </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
