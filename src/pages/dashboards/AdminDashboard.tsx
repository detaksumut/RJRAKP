import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, BookOpen, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [honorariumStats, setHonorariumStats] = useState({ 
    totalPending: 0, 
    totalPaid: 0, 
    pendingCount: 0,
    paidCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, articlesRes, honorariumRes, activityRes] = await Promise.all([
        supabase.from('users').select('role'),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('honorarium_payments').select('amount, status'),
        supabase
          .from('article_editorial_history')
          .select('description, activity_type, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      setArticlesCount(articlesRes.count || 0);
      
      if (honorariumRes.data) {
        const pending = honorariumRes.data.filter(h => h.status === 'PENDING');
        const paid = honorariumRes.data.filter(h => h.status === 'PAID');
        setHonorariumStats({
          totalPending: pending.reduce((s, h) => s + Number(h.amount), 0),
          totalPaid: paid.reduce((s, h) => s + Number(h.amount), 0),
          pendingCount: pending.length,
          paidCount: paid.length
        });
      }

      if (activityRes.data) setRecentActivity(activityRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const authorsCount = users.filter(u => u.role === 'author').length;
  const reviewersCount = users.filter(u => u.role === 'reviewer').length;
  const editorsCount = users.filter(u => u.role === 'editor').length;

  const getActivityIcon = (type: string) => {
    if (type === 'accepted') return '✅';
    if (type === 'rejected') return '❌';
    if (type === 'revision_required') return '🔄';
    if (type === 'review_completed') return '📋';
    if (type === 'reviewer_assigned') return '👤';
    return '📌';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Administrator</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        {/* User & Article Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Penulis</h3>
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : authorsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Reviewer</h3>
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : reviewersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Editor</h3>
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : editorsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Artikel</h3>
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : articlesCount}</p>
          </div>
        </div>

        {/* Honorarium Summary Widget */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 bg-gradient-to-r from-brand-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-700" />
              <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Ringkasan Honorarium Staf</h3>
            </div>
            <Link to="/dashboard/admin/finance" className="text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors flex items-center gap-1">
              Kelola Semua &rarr;
            </Link>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Pembayaran</span>
              </div>
              <p className="text-xl font-black text-amber-700 font-mono">
                Rp {loading ? '-' : honorariumStats.totalPending.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-amber-500 mt-1">{honorariumStats.pendingCount} tagihan belum terbayar</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Terbayar</span>
              </div>
              <p className="text-xl font-black text-emerald-700 font-mono">
                Rp {loading ? '-' : honorariumStats.totalPaid.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">{honorariumStats.paidCount} tagihan lunas</p>
            </div>
            <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Aksi Diperlukan</span>
              </div>
              {honorariumStats.pendingCount > 0 ? (
                <>
                  <p className="text-sm text-blue-800 font-medium">
                    Ada <strong>{honorariumStats.pendingCount} tagihan honorarium</strong> yang menunggu pencairan dana kepada staf editorial.
                  </p>
                  <Link
                    to="/dashboard/admin/finance"
                    className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Proses Pembayaran Sekarang
                  </Link>
                </>
              ) : (
                <p className="text-sm text-blue-700">Semua honorarium sudah dibayarkan. Tidak ada tagihan pending.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Editorial Activity */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Aktivitas Editorial Terkini</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-academic-500 text-sm">Memuat data...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-12 text-center text-academic-500 text-sm">
              Belum ada aktivitas editorial tercatat.
            </div>
          ) : (
            <div className="divide-y divide-academic-100">
              {recentActivity.map((act, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-3">
                  <span className="text-lg shrink-0">{getActivityIcon(act.activity_type)}</span>
                  <div>
                    <p className="text-sm text-academic-800 leading-snug">{act.description}</p>
                    <p className="text-[10px] text-academic-400 mt-0.5">
                      {new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
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
