import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, FileSignature, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function EditorDashboard() {
  const { user } = useAuth();
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [journals, setJournals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalActive: 0, pendingReview: 0, totalReviewers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedJournal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: journalsData } = await supabase.from('journals').select('*').order('name');
      if (journalsData) setJournals(journalsData);

      let articlesQuery = supabase.from('articles').select('status', { count: 'exact' });
      if (selectedJournal !== 'all') {
        articlesQuery = articlesQuery.eq('journal_id', selectedJournal);
      }

      const { data: articlesData } = await articlesQuery;
      
      const { count: reviewersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'reviewer');

      if (articlesData) {
        setStats({
          totalActive: articlesData.length,
          pendingReview: articlesData.filter(a => a.status === 'submitted' || a.status === 'in_review').length,
          totalReviewers: reviewersCount || 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (user?.status === 'PENDING') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-20 text-center bg-white p-10 rounded-xl border border-amber-200 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-academic-900 mb-4">Permohonan Editor sedang menunggu verifikasi Admin</h2>
          <p className="text-academic-600">Terima kasih telah mendaftar. Akun dan rekam jejak editorial Anda sedang dalam proses peninjauan oleh Administrator. Silakan cek kembali secara berkala.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Editor</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        <div className="bg-white p-4 rounded-xl border border-academic-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-academic-700 font-bold text-sm">
            <Filter className="w-4 h-4" /> Filter Jurnal:
          </div>
          <select 
            value={selectedJournal} 
            onChange={e => setSelectedJournal(e.target.value)}
            className="flex-1 border border-academic-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 cursor-pointer font-medium"
          >
            <option value="all">Semua Jurnal</option>
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Artikel Masuk</h3>
               <BookOpen className="w-5 h-5 text-brand-600" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : stats.totalActive}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Menunggu Review</h3>
               <FileSignature className="w-5 h-5 text-amber-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : stats.pendingReview}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Reviewer</h3>
               <Users className="w-5 h-5 text-emerald-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : stats.totalReviewers}</p>
          </div>
        </div>

        {/* Shortcut Cards */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-4">Akses Cepat Fitur Editor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/editor/decisions"
              className="group p-5 bg-white border border-academic-200 hover:border-brand-500 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <FileSignature className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-academic-900 group-hover:text-brand-700 transition-colors">
                  Pemeriksaan Hasil Reviewer
                </h3>
                <p className="text-xs text-academic-500 mt-1.5 leading-relaxed">
                  Tinjau komentar, rekomendasi keputusan, dan catatan rahasia dari reviewer untuk membuat keputusan final naskah.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-700 mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                Mulai Periksa &rarr;
              </span>
            </Link>

            <Link
              to="/dashboard/editor/publications"
              className="group p-5 bg-white border border-academic-200 hover:border-brand-500 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-academic-900 group-hover:text-brand-700 transition-colors">
                  Generate Cover & Publikasi
                </h3>
                <p className="text-xs text-academic-500 mt-1.5 leading-relaxed">
                  Susun edisi/issue baru berkala, terbitkan artikel berstatus Accepted, dan cetak cover A4 bergradasi dinamis.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-700 mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                Buka Publikasi &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider flex items-center gap-2">
              Draft & Keputusan {selectedJournal !== 'all' && <span className="px-2 py-1 bg-brand-100 text-brand-800 text-[10px] rounded uppercase">Terfilter</span>}
            </h3>
          </div>
          <div className="p-12 text-center text-academic-500 text-sm">
             Belum ada data.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
