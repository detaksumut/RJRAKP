import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Save, Lock } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [rates, setRates] = useState<any[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [globalStaff, setGlobalStaff] = useState<any[]>([]);

  useEffect(() => {
    fetchRates();
    fetchUsersAndStaff();
  }, []);

  const fetchUsersAndStaff = async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('id, full_name, role').order('full_name');
      if (usersData) setUsers(usersData);

      const { data: staffData } = await supabase
        .from('staff_assignments')
        .select('*')
        .is('issue_id', null)
        .is('article_id', null);
      if (staffData) setGlobalStaff(staffData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignGlobalStaff = async (roleKey: string, userId: string) => {
    try {
      if (!userId) {
        // Delete assignment
        await supabase
          .from('staff_assignments')
          .delete()
          .eq('role_key', roleKey)
          .is('issue_id', null)
          .is('article_id', null);
      } else {
        // Upsert assignment (check if exists first)
        const existing = globalStaff.find(s => s.role_key === roleKey);
        if (existing) {
          await supabase
            .from('staff_assignments')
            .update({ user_id: userId })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('staff_assignments')
            .insert({ user_id: userId, role_key: roleKey });
        }
      }
      fetchUsersAndStaff();
      setSuccessMsg('Penugasan staf berhasil disimpan.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan penugasan staf');
    }
  };

  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      const { data, error } = await supabase.from('honorarium_rates').select('*').order('id', { ascending: true });
      if (error) throw error;
      setRates(data || []);
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally {
      setRatesLoading(false);
    }
  };

  const handleUpdateRate = async (id: string, newAmount: number) => {
    try {
      const { error } = await supabase.from('honorarium_rates').update({ amount: newAmount }).eq('id', id);
      if (error) throw error;
      setSuccessMsg('Tarif berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah tarif');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      
      setSuccessMsg('Password berhasil diperbarui.');
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-6">Pengaturan Akun</h1>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex items-center gap-2 bg-academic-50">
            <Lock className="w-5 h-5 text-academic-600" />
            <h2 className="font-bold text-lg text-academic-900">Ubah Password</h2>
          </div>
          
          <div className="p-6">
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium">
                {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-academic-900 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Masukkan password baru"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-academic-900 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex items-center gap-2 bg-academic-50">
            <h2 className="font-bold text-lg text-academic-900">Pengaturan Standar Honorarium</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratesLoading ? (
                <p className="text-academic-500">Memuat tarif...</p>
              ) : (
                rates.map((rate) => (
                  <div key={rate.id} className="p-4 border border-academic-200 rounded-lg bg-academic-50 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-academic-900 text-sm">{rate.role_name}</p>
                      <p className="text-xs text-academic-500 mb-3">{rate.role_key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-academic-500 font-bold">Rp</span>
                      <input
                        type="number"
                        defaultValue={rate.amount}
                        className="flex-1 px-3 py-1.5 border border-academic-300 rounded focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                        onBlur={(e) => {
                          if (Number(e.target.value) !== rate.amount) {
                            handleUpdateRate(rate.id, Number(e.target.value));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-academic-500 mt-4 italic">Tarif akan langsung disimpan saat Anda selesai mengetik angka.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex items-center gap-2 bg-academic-50">
            <h2 className="font-bold text-lg text-academic-900">Penugasan Staf Tetap (Global)</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-academic-600 mb-6">
              Pilih pengguna yang menjabat posisi tetap di jurnal ini (seperti Direktur, SDM, dll). Mereka akan otomatis menerima honor setiap kali ada **Edisi Baru** yang diterbitkan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratesLoading ? (
                <p className="text-academic-500">Memuat peran...</p>
              ) : (
                rates.filter(r => !r.role_key.includes('reviewer') && r.role_key !== 'editor').map((rate) => {
                  const assignedUser = globalStaff.find(s => s.role_key === rate.role_key)?.user_id || '';
                  return (
                    <div key={rate.role_key} className="p-4 border border-academic-200 rounded-lg bg-academic-50 flex flex-col justify-between">
                      <div className="mb-3">
                        <p className="font-bold text-academic-900 text-sm">{rate.role_name}</p>
                      </div>
                      <select
                        value={assignedUser}
                        onChange={(e) => handleAssignGlobalStaff(rate.role_key, e.target.value)}
                        className="w-full px-3 py-2 border border-academic-300 rounded focus:ring-2 focus:ring-brand-500 text-sm"
                      >
                        <option value="">-- Belum Ditugaskan --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
