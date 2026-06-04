import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, BookOpen, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);

  useEffect(() => {
    supabase.from('users').select('role').then(({ data }) => {
      if (data) setUsers(data);
    });
    supabase.from('articles').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setArticlesCount(count || 0);
    });
  }, []);

  const authorsCount = users.filter(u => u.role === 'author').length;
  const reviewersCount = users.filter(u => u.role === 'reviewer').length;
  const editorsCount = users.filter(u => u.role === 'editor').length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Administrator</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Penulis</h3>
               <Users className="w-5 h-5 text-brand-600" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{authorsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Reviewer</h3>
               <Shield className="w-5 h-5 text-emerald-600" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{reviewersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Editor</h3>
               <BookOpen className="w-5 h-5 text-amber-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{editorsCount}</p>
          </div>
           <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Total Artikel</h3>
               <Clock className="w-5 h-5 text-indigo-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{articlesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Aktivitas Sistem Terkini</h3>
          </div>
          <div className="p-12 text-center text-academic-500 text-sm">
             Belum ada data.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
