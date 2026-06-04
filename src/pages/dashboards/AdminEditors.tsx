import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, UserX, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminEditors() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          editor_profiles (*)
        `)
        .eq('role', 'editor')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(u => {
        let profile = {};
        if (u.editor_profiles && u.editor_profiles.length > 0) {
          profile = u.editor_profiles[0];
        }

        return {
          ...u,
          ...profile
        };
      });

      setUsers(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      let actionLabel = status === 'APPROVED' ? 'Approve editor' : 'Reject editor';
      
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: actionLabel,
        entity_type: 'users',
        entity_id: id
      });

      fetchUsers();
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({...selectedUser, status});
      }
    } catch (err) {
      console.error(err);
      console.error('Gagal merubah status user');
    }
  };

  const getFilteredUsers = () => {
    return users.filter(u => u.status === 'PENDING');
  };

  if (selectedUser) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-sm font-bold text-academic-600 hover:text-brand-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          
          <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50">
              <h2 className="font-bold text-lg text-academic-900">Verifikasi Editor</h2>
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md ${
                selectedUser.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                selectedUser.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                selectedUser.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                'bg-slate-100 text-slate-800'
              }`}>{selectedUser.status}</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Nama Lengkap</h3>
                  <p className="text-academic-900">{selectedUser.full_name}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Kontak</h3>
                  <p className="text-academic-900">{selectedUser.email}<br/>{selectedUser.phone}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Institusi / Fakultas</h3>
                  <p className="text-academic-900">{selectedUser.affiliation}<br/>{selectedUser.faculty || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Pendidikan Terakhir</h3>
                  <p className="text-academic-900">{selectedUser.education_level}</p>
                </div>
              </div>
              
              <div className="border-t border-academic-100 pt-6 mb-6">
                <h3 className="text-sm font-bold text-academic-900 mb-4">Informasi Kepakaran & Pengalaman</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Bidang Keahlian</h4>
                    <p className="text-academic-900 font-medium">{selectedUser.expertise_area || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Pengalaman Editorial</h4>
                    <p className="text-academic-900 bg-academic-50 p-3 rounded-lg text-sm">{selectedUser.editorial_experience || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">ID Terintegrasi</h4>
                    <p className="text-sm">
                      <span className="font-bold text-academic-700">ORCID:</span> {selectedUser.orcid_id ? <a href={selectedUser.orcid_id} className="text-brand-600 hover:underline">{selectedUser.orcid_id}</a> : '-'} <br/>
                      <span className="font-bold text-academic-700">Scholar:</span> {selectedUser.google_scholar ? <a href={selectedUser.google_scholar} className="text-brand-600 hover:underline">Link</a> : '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Dokumen CV</h4>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                      {selectedUser.cv_url || 'Tidak melampirkan CV'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-academic-100 pt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => updateUserStatus(selectedUser.id, 'APPROVED')} 
                  disabled={selectedUser.status === 'APPROVED'}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" /> Approve
                </button>
                <button 
                  onClick={() => updateUserStatus(selectedUser.id, 'REJECTED')} 
                  disabled={selectedUser.status === 'REJECTED'}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Verifikasi Editor</h1>
          <p className="text-academic-500">Daftar calon Editor yang menunggu verifikasi dari Administrator.</p>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-academic-50 border-b border-academic-200 text-xs uppercase tracking-wider text-academic-500 font-bold">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Institusi</th>
                <th className="p-4">Pengalaman Editorial</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-academic-500">Memuat data...</td></tr>
              ) : getFilteredUsers().length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-academic-500 font-medium">Tidak ada editor yang menunggu verifikasi.</td></tr>
              ) : getFilteredUsers().map(u => (
                <tr key={u.id} className="hover:bg-academic-50 transition-colors">
                  <td className="p-4">
                     <span className="font-bold text-academic-900 block">{u.full_name}</span>
                     <span className="text-xs text-academic-500">{u.email}</span>
                  </td>
                  <td className="p-4 text-sm text-academic-800">
                     {u.affiliation}
                  </td>
                  <td className="p-4 text-sm text-academic-800 truncate max-w-xs">
                     {u.editorial_experience || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedUser(u)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-academic-100 hover:bg-academic-200 text-academic-800 rounded-md transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Verifikasi
                    </button>
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
