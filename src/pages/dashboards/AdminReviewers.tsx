import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, UserX, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminReviewers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          reviewer_profiles (*)
        `)
        .eq('role', 'reviewer')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(u => {
        let profile = {};
        if (u.reviewer_profiles && u.reviewer_profiles.length > 0) {
          profile = u.reviewer_profiles[0];
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
      
      let actionLabel = status === 'APPROVED' ? 'Approve reviewer' : 'Reject reviewer';
      
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

  const updateReviewerType = async (userId: string, profileId: string | undefined, newType: string) => {
    try {
      if (!profileId) return;
      const { error } = await supabase
        .from('reviewer_profiles')
        .update({ reviewer_type: newType })
        .eq('id', profileId);
        
      if (error) throw error;
      
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({...selectedUser, reviewer_type: newType});
      }
    } catch (err) {
      console.error(err);
      alert('Gagal merubah level reviewer.');
    }
  };

  const updateReviewerClass = async (userId: string, profileId: string | undefined, newClass: string) => {
    try {
      if (!profileId) return;
      const { error } = await supabase
        .from('reviewer_profiles')
        .update({ reviewer_class: newClass })
        .eq('id', profileId);
        
      if (error) throw error;
      
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({...selectedUser, reviewer_class: newClass});
      }
    } catch (err) {
      console.error(err);
      alert('Gagal merubah kelas reviewer.');
    }
  };

  const updateBackupStatus = async (userId: string, profileId: string | undefined, isActive: boolean) => {
    try {
      if (!profileId) return;
      const { error } = await supabase
        .from('reviewer_profiles')
        .update({ is_backup_active: isActive })
        .eq('id', profileId);
        
      if (error) throw error;
      
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({...selectedUser, is_backup_active: isActive});
      }
    } catch (err) {
      console.error(err);
      alert('Gagal merubah status aktif asisten.');
    }
  };

  const getFilteredUsers = () => {
    return users.filter(u => u.status === activeTab);
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
              <h2 className="font-bold text-lg text-academic-900">
                {selectedUser.status === 'PENDING' ? 'Verifikasi Reviewer' : 'Detail Reviewer Aktif'}
              </h2>
              <div className="flex gap-2 items-center">
                {selectedUser.reviewer_type === 'PRIMARY' && (
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    ⭐ Reviewer Utama
                  </span>
                )}
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md ${
                  selectedUser.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  selectedUser.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  selectedUser.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                  'bg-slate-100 text-slate-800'
                }`}>{selectedUser.status}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Nama Lengkap</h3>
                  <p className="text-academic-900">{selectedUser.full_name} {selectedUser.academic_title}</p>
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
                  <h3 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Program Studi / Pendidikan</h3>
                  <p className="text-academic-900">{selectedUser.education_level}</p>
                </div>
              </div>
              
              <div className="border-t border-academic-100 pt-6 mb-6">
                <h3 className="text-sm font-bold text-academic-900 mb-4">Informasi Kepakaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Bidang Keahlian</h4>
                    <p className="text-academic-900 font-medium">{selectedUser.expertise_area || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">ID Terintegrasi</h4>
                    <p className="text-sm">
                      <span className="font-bold text-academic-700">ORCID:</span> {selectedUser.orcid_id ? <a href={selectedUser.orcid_id} className="text-brand-600 hover:underline">{selectedUser.orcid_id}</a> : '-'} <br/>
                      <span className="font-bold text-academic-700">Scholar:</span> {(() => {
                        const val = selectedUser.google_scholar;
                        if (!val) return '-';
                        const url = val.startsWith('http') ? val : `https://scholar.google.com/citations?user=${val}`;
                        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Link</a>;
                      })()}
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

              <div className="border-t border-academic-100 pt-6 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-3">
                  {selectedUser.status === 'PENDING' && (
                    <>
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
                    </>
                  )}
                </div>

                {selectedUser.status === 'APPROVED' && selectedUser.id !== undefined && (
                  <div className="w-full">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg w-full mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-academic-900">Level Hak Akses Reviewer</p>
                        <p className="text-[10px] text-academic-500">Tentukan apakah dia Reviewer Spesialis/Utama atau Cadangan.</p>
                      </div>
                      <select
                        value={selectedUser.reviewer_type || 'CO_REVIEWER'}
                        onChange={(e) => updateReviewerType(selectedUser.id, selectedUser.reviewer_profiles?.[0]?.id || selectedUser.id, e.target.value)}
                        className="border border-academic-300 rounded px-3 py-1.5 text-xs font-bold"
                      >
                        <option value="CO_REVIEWER">Co-Reviewer (Cadangan)</option>
                        <option value="PRIMARY">Reviewer Utama (Spesialis)</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg w-full mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-academic-900">Kelas Reviewer</p>
                        <p className="text-[10px] text-academic-500">Tentukan apakah reviewer adalah anggota Editorial Board (Internal) atau Mitra Bestari Luar (Eksternal).</p>
                      </div>
                      <select
                        value={selectedUser.reviewer_class || 'EXTERNAL'}
                        onChange={(e) => updateReviewerClass(selectedUser.id, selectedUser.reviewer_profiles?.[0]?.id || selectedUser.id, e.target.value)}
                        className="border border-academic-300 rounded px-3 py-1.5 text-xs font-bold"
                      >
                        <option value="EXTERNAL">Eksternal (Mitra Bestari Luar)</option>
                        <option value="ON_BOARD">Internal (On Board / Editorial Board)</option>
                      </select>
                    </div>

                    {(!selectedUser.reviewer_type || selectedUser.reviewer_type === 'CO_REVIEWER') && (
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg w-full mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-rose-900">Status Operasional Co-Reviewer</p>
                          <p className="text-[10px] text-rose-700">Aktifkan kapan saja jika Reviewer Utama berhalangan atau kewalahan.</p>
                        </div>
                        <button
                          onClick={() => updateBackupStatus(selectedUser.id, selectedUser.reviewer_profiles?.[0]?.id || selectedUser.id, !selectedUser.is_backup_active)}
                          className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors ${
                            selectedUser.is_backup_active 
                              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {selectedUser.is_backup_active ? 'ON (AKTIF)' : 'OFF (MATI)'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Reviewer</h1>
            <p className="text-academic-500">Verifikasi pendaftaran dan atur level Reviewer (Utama / Co-Reviewer).</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'PENDING' ? 'bg-white text-academic-900 shadow-sm' : 'text-academic-500 hover:text-academic-700'}`}
            >
              Menunggu Verifikasi
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'APPROVED' ? 'bg-white text-academic-900 shadow-sm' : 'text-academic-500 hover:text-academic-700'}`}
            >
              Daftar Reviewer Aktif
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-academic-50 border-b border-academic-200 text-xs uppercase tracking-wider text-academic-500 font-bold">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Institusi</th>
                <th className="p-4">Bidang Keahlian</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-academic-500">Memuat data...</td></tr>
              ) : getFilteredUsers().length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-academic-500 font-medium">Tidak ada reviewer yang menunggu verifikasi.</td></tr>
              ) : getFilteredUsers().map(u => (
                <tr key={u.id} className="hover:bg-academic-50 transition-colors">
                  <td className="p-4">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-academic-900 block">{u.full_name}</span>
                       <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                         u.reviewer_class === 'ON_BOARD' 
                           ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                           : 'bg-slate-100 text-slate-700 border border-slate-200'
                       }`}>
                         {u.reviewer_class === 'ON_BOARD' ? 'Internal (On Board)' : 'Eksternal'}
                       </span>
                     </div>
                     <span className="text-xs text-academic-500">{u.email}</span>
                  </td>
                  <td className="p-4 text-sm text-academic-800">
                     {u.affiliation}
                  </td>
                  <td className="p-4 text-sm text-academic-800">
                     {u.expertise_area || '-'}
                  </td>
                  <td className="p-4 text-center">
                    {activeTab === 'PENDING' ? (
                      <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        {u.status}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${u.reviewer_type === 'PRIMARY' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {u.reviewer_type === 'PRIMARY' ? '⭐ UTAMA' : 'CO-REVIEWER'}
                        </span>
                        {(!u.reviewer_type || u.reviewer_type === 'CO_REVIEWER') && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${u.is_backup_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {u.is_backup_active ? 'AKTIF' : 'MATI'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedUser(u)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-academic-100 hover:bg-academic-200 text-academic-800 rounded-md transition-colors">
                      <Eye className="w-3.5 h-3.5" /> {activeTab === 'PENDING' ? 'Verifikasi' : 'Kelola'}
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
