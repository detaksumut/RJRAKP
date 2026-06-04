import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          users!activity_logs_user_id_fkey(full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Activity Logs</h1>
          <p className="text-academic-500">Catatan aktivitas pengguna dan administratif sistem RJRAKP.</p>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-academic-50 border-b border-academic-200 text-xs uppercase tracking-wider text-academic-500 font-bold">
                <th className="p-4">Waktu</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Aksi / Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-academic-500">Memuat log aktivitas...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={3} className="p-12 text-center text-academic-500 font-medium">Belum ada aktivitas terekam.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-academic-50 transition-colors">
                  <td className="p-4 text-xs font-mono text-academic-600 whitespace-nowrap">
                     {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">
                     <span className="font-bold text-academic-900 block">{log.users?.full_name || 'System / Unknown'}</span>
                     <span className="text-xs text-academic-500">{log.users?.email || '-'} ({log.users?.role || '-'})</span>
                  </td>
                  <td className="p-4 text-sm font-bold text-academic-800">
                     {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
