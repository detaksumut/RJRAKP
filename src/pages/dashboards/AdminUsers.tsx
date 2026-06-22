import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, UserX, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Tab = 'penulis' | 'reviewer_pending' | 'reviewer_aktif' | 'editor_pending' | 'editor_aktif' | 'mitra_royalti';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('reviewer_pending');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          reviewer_profiles (*),
          editor_profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten data for easier consumption in the existing UI
      const formattedData = data.map(u => {
        let profile = {};
        if (u.role === 'reviewer' && u.reviewer_profiles) {
          profile = Array.isArray(u.reviewer_profiles)
            ? (u.reviewer_profiles[0] || {})
            : u.reviewer_profiles;
        } else if (u.role === 'editor' && u.editor_profiles) {
          profile = Array.isArray(u.editor_profiles)
            ? (u.editor_profiles[0] || {})
            : u.editor_profiles;
        }

        const { id: profileId, ...restProfile } = profile as any;

        return {
          ...u,
          ...restProfile,
          profile_id: profileId
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
    // try removing confirm to avoid iframe blocking
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      let actionLabel = 'User status updated';
      if (status === 'APPROVED') {
        actionLabel = selectedUser.role === 'reviewer' ? 'Approve reviewer' : 'Approve editor';
      } else if (status === 'REJECTED') {
        actionLabel = selectedUser.role === 'reviewer' ? 'Reject reviewer' : 'Reject editor';
      } else if (status === 'SUSPENDED') {
        actionLabel = 'Suspend user';
      }

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
    } catch (err: any) {
      console.error("Full error:", err);
      console.error('Gagal merubah status user: ' + (err.message || JSON.stringify(err)) + '\nDetails: ' + (err.details || '') + '\nHint: ' + (err.hint || ''));
    }
  };

  const getFilteredUsers = () => {
    return users.filter(u => {
      switch(activeTab) {
        case 'penulis': return u.role === 'author';
        case 'reviewer_pending': return u.role === 'reviewer' && u.status === 'PENDING';
        case 'reviewer_aktif': return u.role === 'reviewer' && u.status === 'APPROVED';
        case 'editor_pending': return u.role === 'editor' && u.status === 'PENDING';
        case 'editor_aktif': return u.role === 'editor' && u.status === 'APPROVED';
        case 'mitra_royalti': return u.partner_type === 'lembaga' || u.partner_type === 'personal';
        default: return false;
      }
    });
  };

  const tabs = [
    { id: 'reviewer_pending', label: 'Reviewer Pending' },
    { id: 'editor_pending', label: 'Editor Pending' },
    { id: 'reviewer_aktif', label: 'Reviewer Aktif' },
    { id: 'editor_aktif', label: 'Editor Aktif' },
    { id: 'penulis', label: 'Penulis' },
    { id: 'mitra_royalti', label: 'Mitra Royalti' }
  ];

  if (selectedUser) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-sm font-bold text-academic-600 hover:text-brand-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Pengguna
          </button>
          
          <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50">
              <h2 className="font-bold text-lg text-academic-900">Verifikasi Profil {selectedUser.role.toUpperCase()}</h2>
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
                  <p className="text-academic-900">{selectedUser.study_program} ({selectedUser.education_level})</p>
                </div>
              </div>
              
              <div className="border-t border-academic-100 pt-6 mb-6">
                <h3 className="text-sm font-bold text-academic-900 mb-4">Informasi Kepakaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Bidang Keahlian</h4>
                    <p className="text-academic-900 font-medium">{selectedUser.expertise_area || '-'}</p>
                  </div>
                  {selectedUser.role === 'editor' && (
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Pengalaman Editorial</h4>
                      <p className="text-academic-900 bg-academic-50 p-3 rounded-lg text-sm">{selectedUser.editorial_experience || '-'}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">ID Terintegrasi</h4>
                    <p className="text-sm">
                      <span className="font-bold text-academic-700">ORCID:</span> {selectedUser.orcid_id ? <a href={selectedUser.orcid_id} className="text-brand-600 hover:underline">{selectedUser.orcid_id}</a> : '-'} <br/>
                      <span className="font-bold text-academic-700">Scholar:</span> {(() => {
                        const val = selectedUser.google_scholar || selectedUser.google_scholar_id;
                        if (!val) return '-';
                        const url = val.startsWith('http') ? val : `https://scholar.google.com/citations?user=${val}`;
                        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Link</a>;
                      })()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Publikasi Terkini</h4>
                    <p className="text-sm">
                      {selectedUser.publications ? <a href={selectedUser.publications} className="text-brand-600 hover:underline">{selectedUser.publications}</a> : '-'}
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

              <div className="border-t border-academic-100 pt-6 mb-6">
                <h3 className="text-sm font-bold text-academic-900 mb-4">Pengaturan Kemitraan Referal & Royalti</h3>
                <div className="flex gap-4 items-end max-w-sm">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Tipe Kemitraan</label>
                    <select
                      value={selectedUser.partner_type || ''}
                      onChange={async (e) => {
                        const val = e.target.value || null;
                        try {
                          const { error } = await supabase
                            .from('users')
                            .update({ partner_type: val })
                            .eq('id', selectedUser.id);
                          if (error) throw error;
                          setSelectedUser({ ...selectedUser, partner_type: val });
                          fetchUsers();
                          alert('Tipe kemitraan berhasil diperbarui.');
                        } catch (err: any) {
                          alert('Gagal memperbarui tipe kemitraan: ' + err.message);
                        }
                      }}
                      className="w-full border border-academic-300 rounded-md px-3 py-2 text-sm focus:ring-brand-500 bg-white cursor-pointer"
                    >
                      <option value="">Bukan Mitra Referal</option>
                      <option value="lembaga">Lembaga Perujuk (Institution)</option>
                      <option value="personal">Perujuk Perorangan (Personal)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-academic-100 pt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => updateUserStatus(selectedUser.id, 'APPROVED')} 
                  disabled={selectedUser.status === 'APPROVED'}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" /> Approve Akun
                </button>
                <button 
                  onClick={() => updateUserStatus(selectedUser.id, 'REJECTED')} 
                  disabled={selectedUser.status === 'REJECTED'}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" /> Reject
                </button>
                <button 
                  onClick={() => updateUserStatus(selectedUser.id, 'SUSPENDED')} 
                  disabled={selectedUser.status === 'SUSPENDED'}
                  className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" /> Suspend
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
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Pengguna</h1>
          <p className="text-academic-500">Kelola dan verifikasi akun penulis, reviewer, dan editor.</p>
        </div>

        <div className="flex border-b border-academic-200 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-academic-500 hover:text-academic-900'}`}
            >
              {tab.label}
              {tab.id.includes('pending') && users.filter(u => u.role === tab.id.split('_')[0] && u.status === 'PENDING').length > 0 && (
                <span className="ml-2 bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-xs">
                  {users.filter(u => u.role === tab.id.split('_')[0] && u.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-academic-50 border-b border-academic-200 text-xs uppercase tracking-wider text-academic-500 font-bold">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Institusi</th>
                <th className="p-4">
                  {activeTab === 'mitra_royalti' 
                    ? 'Tipe Kemitraan' 
                    : (activeTab.includes('penulis') ? 'Pendidikan' : 'Keahlian')}
                </th>
                {activeTab === 'penulis' && <th className="p-4">Mitra Royalti</th>}
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr><td colSpan={activeTab === 'penulis' ? 6 : 5} className="p-8 text-center text-academic-500">Memuat data pengguna...</td></tr>
              ) : getFilteredUsers().length === 0 ? (
                <tr><td colSpan={activeTab === 'penulis' ? 6 : 5} className="p-12 text-center text-academic-500 font-medium">Tidak ada pengguna pada kategori ini.</td></tr>
              ) : getFilteredUsers().map(u => (
                <tr key={u.id} className="hover:bg-academic-50 transition-colors">
                  <td className="p-4">
                     <span className="font-bold text-academic-900 block">{u.full_name}</span>
                     <span className="text-xs text-academic-500">{u.email}</span>
                  </td>
                  <td className="p-4 text-sm text-academic-800">
                     {u.affiliation}
                  </td>
                  <td className="p-4 text-sm text-academic-800">
                     {activeTab === 'mitra_royalti'
                       ? (u.partner_type === 'lembaga' ? 'Lembaga Perujuk' : 'Perujuk Perorangan')
                       : (activeTab.includes('penulis') ? u.education_level : (u.expertise_area || '-'))}
                  </td>
                  {activeTab === 'penulis' && (
                    <td className="p-4 text-sm text-academic-800">
                      {u.referred_by ? (
                        <div>
                          <span className="font-bold text-academic-900 block">
                            {users.find(partner => partner.id === u.referred_by)?.full_name || 'Mitra'}
                          </span>
                          <span className="text-xs text-academic-500 capitalize">
                            ({users.find(partner => partner.id === u.referred_by)?.partner_type || 'Personal'})
                          </span>
                        </div>
                      ) : u.referred_by_custom ? (
                        <div>
                          <span className="font-bold text-academic-900 block text-amber-700">
                            {u.referred_by_custom}
                          </span>
                          <span className="text-xs text-amber-600 font-semibold block mt-0.5">
                            (Belum Terdaftar)
                          </span>
                        </div>
                      ) : (
                        <span className="text-academic-400 italic">Tanpa Rujukan</span>
                      )}
                    </td>
                  )}
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                      u.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      u.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      u.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedUser(u)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-academic-100 hover:bg-academic-200 text-academic-800 rounded-md transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Detail
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
