import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, FileSignature, Filter, CheckCircle, Clock, DollarSign, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function EditorDashboard() {
  const { user } = useAuth();
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [journals, setJournals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalActive: 0, pendingReview: 0, totalReviewers: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'honorarium'>('overview');
  const [honorariums, setHonorariums] = useState<any[]>([]);
  const [loadingHonorariums, setLoadingHonorariums] = useState(false);
  const [editorStats, setEditorStats] = useState({ totalDecisions: 0, totalAccepted: 0, totalRevisions: 0, totalRejected: 0 });

  useEffect(() => {
    fetchData();
  }, [selectedJournal]);

  useEffect(() => {
    if (activeTab === 'honorarium' && user?.id) {
      fetchHonorariums();
      fetchEditorStats();
    }
  }, [activeTab, user?.id]);

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

  const fetchHonorariums = async () => {
    if (!user?.id) return;
    setLoadingHonorariums(true);
    try {
      const { data, error } = await supabase
        .from('honorarium_payments')
        .select(`
          id,
          amount,
          description,
          status,
          payment_date,
          role_key,
          honorarium_rates (role_name),
          articles (title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHonorariums(data || []);
    } catch (err) {
      console.error('Error fetching honorariums:', err);
    } finally {
      setLoadingHonorariums(false);
    }
  };

  const fetchEditorStats = async () => {
    if (!user?.id) return;
    try {
      // Count editorial decisions from article_editorial_history
      const { data: historyData } = await supabase
        .from('article_editorial_history')
        .select('activity_type')
        .or('activity_type.eq.accepted,activity_type.eq.rejected,activity_type.eq.revision_required,activity_type.eq.decision_made');

      if (historyData) {
        const accepted = historyData.filter(h => h.activity_type === 'accepted').length;
        const rejected = historyData.filter(h => h.activity_type === 'rejected').length;
        const revisions = historyData.filter(h => h.activity_type === 'revision_required').length;
        setEditorStats({
          totalDecisions: historyData.length,
          totalAccepted: accepted,
          totalRevisions: revisions,
          totalRejected: rejected
        });
      }
    } catch (err) {
      console.error(err);
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

  const totalHonorariumPaid = honorariums.filter(h => h.status === 'PAID').reduce((sum, h) => sum + Number(h.amount), 0);
  const totalHonorariumPending = honorariums.filter(h => h.status === 'PENDING').reduce((sum, h) => sum + Number(h.amount), 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Editor</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        {/* Tab Navigation */}
        <div className="flex border-b border-academic-200 bg-white p-2 rounded-xl border mb-6 gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-brand-50 text-brand-800 shadow-sm'
                : 'text-academic-500 hover:text-academic-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('honorarium')}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'honorarium'
                ? 'bg-brand-50 text-brand-800 shadow-sm'
                : 'text-academic-500 hover:text-academic-800'
            }`}
          >
            Honorarium Saya
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
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
          </>
        ) : (
          /* Honorarium Tab */
          <div className="space-y-6">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-academic-200 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-academic-500 text-[10px] font-bold uppercase tracking-widest">Total Keputusan</h3>
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                </div>
                <p className="text-2xl font-bold font-serif text-academic-900">{editorStats.totalDecisions}</p>
                <p className="text-[10px] text-academic-400 mt-1">Log editorial</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Diterima</h3>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold font-serif text-emerald-800">{editorStats.totalAccepted}</p>
                <p className="text-[10px] text-emerald-500 mt-1">Naskah accepted</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-amber-600 text-[10px] font-bold uppercase tracking-widest">Revisi</h3>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold font-serif text-amber-800">{editorStats.totalRevisions}</p>
                <p className="text-[10px] text-amber-500 mt-1">Dikembalikan revisi</p>
              </div>
              <div className="bg-white border border-academic-200 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-academic-500 text-[10px] font-bold uppercase tracking-widest">Ditolak</h3>
                  <Award className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl font-bold font-serif text-rose-600">{editorStats.totalRejected}</p>
                <p className="text-[10px] text-academic-400 mt-1">Naskah rejected</p>
              </div>
            </div>

            {/* Honorarium Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-academic-200 p-5 rounded-xl shadow-sm">
                <div className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Total Entri Honorarium</div>
                <div className="text-2xl font-bold font-serif text-academic-800">
                  {loadingHonorariums ? '-' : honorariums.length}
                </div>
                <div className="text-[10px] text-academic-400 mt-1">Tagihan terdaftar</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Honorarium Terbayar</div>
                <div className="text-2xl font-bold font-serif text-emerald-800">
                  Rp {totalHonorariumPaid.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-emerald-500 mt-1">Status: PAID</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Menunggu Pembayaran</div>
                <div className="text-2xl font-bold font-serif text-amber-800">
                  Rp {totalHonorariumPending.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-amber-500 mt-1">Status: PENDING</div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
              <div className="flex gap-2 items-start">
                <DollarSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Informasi Sistem Honorarium Editor</p>
                  <p>Honorarium akan dibangkitkan secara otomatis oleh sistem setiap kali Anda menyelesaikan keputusan editorial pada artikel yang diproses. Pencairan dilakukan oleh tim Finance sesuai jadwal pembayaran berkala RJRAKP. Pastikan data rekening bank Anda sudah diisi di halaman <strong>Profil</strong>.</p>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-academic-100 bg-slate-50/50">
                <h3 className="font-bold text-academic-900 text-xs uppercase tracking-wider">Riwayat Pembayaran Honorarium</h3>
              </div>
              {loadingHonorariums ? (
                <div className="p-8 text-center text-academic-500 text-sm">Memuat data...</div>
              ) : honorariums.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="w-10 h-10 mx-auto text-academic-300 mb-3" />
                  <p className="text-sm font-medium text-academic-500">Belum ada catatan honorarium terdaftar.</p>
                  <p className="text-xs text-academic-400 mt-1">Honorarium akan muncul setelah Anda menyelesaikan keputusan editorial.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-academic-200 text-[10px] font-bold text-academic-500 uppercase">
                        <th className="px-4 py-3">Keterangan</th>
                        <th className="px-4 py-3">Peran</th>
                        <th className="px-4 py-3 text-right">Jumlah</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3">Tanggal Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-academic-100 text-xs text-academic-800">
                      {honorariums.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium line-clamp-2 max-w-[200px]" title={h.articles?.title || h.description}>
                            {h.articles?.title || h.description || 'Honorarium Editorial'}
                          </td>
                          <td className="px-4 py-3 text-brand-700 font-medium">
                            {h.honorarium_rates?.role_name || h.role_key || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-academic-900">
                            Rp {Number(h.amount).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              h.status === 'PAID' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {h.status === 'PAID' ? 'Lunas' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[10px] font-medium text-academic-500">
                            {h.payment_date ? new Date(h.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
