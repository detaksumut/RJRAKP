import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function AuthorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
       fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [profileRes, articlesRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user?.id).single(),
        supabase.from('articles').select('*, journals(name)').eq('submitter_id', user?.id).order('submission_date', { ascending: false })
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (articlesRes.data) setArticles(articlesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalArticles = articles.length;
  const pendingArticles = articles.filter(a => a.status === 'submitted' || a.status === 'in_review').length;
  const acceptedArticles = articles.filter(a => a.status === 'accepted').length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Penulis</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Artikel</h3>
               <FileText className="w-5 h-5 text-brand-600" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : totalArticles}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Menunggu</h3>
               <Clock className="w-5 h-5 text-amber-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : pendingArticles}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Diterima</h3>
               <CheckCircle className="w-5 h-5 text-emerald-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : acceptedArticles}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Artikel Terbaru Saya</h3>
            <Link to="/dashboard/author/articles" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-academic-100">
            {loading ? (
              <div className="p-6 text-center text-academic-500 text-sm">Memuat data...</div>
            ) : articles.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-academic-500 text-sm mb-4">Belum ada data artikel yang di-submit.</p>
                <Link to="/dashboard/author/submit" className="inline-flex bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                  Submit Artikel Baru
                </Link>
              </div>
            ) : (
              articles.slice(0, 3).map((article) => (
                <div key={article.id} className="p-4 hover:bg-academic-50 transition-colors">
                  <h4 className="font-bold text-academic-900">{article.title}</h4>
                  <div className="text-xs text-academic-500 mt-1 flex gap-3">
                     <span>{article.journals?.name || 'Jurnal Tidak Diketahui'}</span>
                     <span>•</span>
                     <span className="uppercase text-brand-600 font-bold">{article.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50">
              <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Profil Akademik</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Nama Lengkap</dt>
                  <dd className="text-academic-900 font-medium">{profile.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Institusi/Afiliasi</dt>
                  <dd className="text-academic-900 font-medium">{profile.affiliation}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Program Studi</dt>
                  <dd className="text-academic-900 font-medium">{profile.study_program}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Jenjang Pendidikan</dt>
                  <dd className="text-academic-900 font-medium">{profile.education_level}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Email Terdaftar</dt>
                  <dd className="text-academic-900 font-medium">{profile.email}</dd>
                </div>
                
                {(profile.orcid_id || profile.scopus_id || profile.wos_id || profile.sinta_id || profile.google_scholar_id) && (
                  <div className="col-span-1 sm:col-span-2 mt-2 pt-4 border-t border-academic-100">
                    <dt className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-3">Identitas Peneliti Global</dt>
                    <div className="flex flex-wrap gap-4">
                      {profile.orcid_id && (
                        <a href={`https://orcid.org/${profile.orcid_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#A6CE39]/10 text-[#8eb82b] px-3 py-1.5 rounded-full text-sm font-bold hover:bg-[#A6CE39]/20 transition-colors">
                          <img src="/ORCID.png" alt="ORCID" className="h-4" onError={(e) => { e.currentTarget.src = 'https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'; }} />
                          {profile.orcid_id}
                        </a>
                      )}
                      {profile.scopus_id && (
                        <a href={`https://www.scopus.com/authid/detail.uri?authorId=${profile.scopus_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-orange-200 transition-colors">
                          <span className="font-serif">Scopus</span>
                          {profile.scopus_id}
                        </a>
                      )}
                      {profile.wos_id && (
                        <a href={`https://www.webofscience.com/wos/author/record/${profile.wos_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-purple-200 transition-colors">
                          <span className="font-serif">WoS</span>
                          {profile.wos_id}
                        </a>
                      )}
                      {profile.sinta_id && (
                        <a href={`https://sinta.kemdikbud.go.id/authors/profile/${profile.sinta_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-200 transition-colors">
                          <span className="font-sans font-black tracking-tight">SINTA</span>
                          {profile.sinta_id}
                        </a>
                      )}
                      {profile.google_scholar_id && (
                        <a href={`https://scholar.google.com/citations?user=${profile.google_scholar_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-emerald-200 transition-colors">
                          <span className="font-sans font-bold">Google Scholar</span>
                          {profile.google_scholar_id}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
