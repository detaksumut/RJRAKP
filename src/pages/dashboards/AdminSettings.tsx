import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Save, Lock, Shield, BookOpen, Award, TrendingUp, X } from 'lucide-react';

const ROLE_ORDER = [
  'direktur',
  'administrator',
  'sdm',
  'finance_operator',
  'editor_in_chief',
  'editor',
  'cover_editor',
  'layout_editor',
  'reviewer_with_id',
  'reviewer_no_id',
  'royalty_referrer_lembaga',
  'royalty_referrer_personal'
];

const CATEGORIES = [
  {
    title: 'Manajemen & Administrasi',
    roles: ['direktur', 'administrator', 'sdm', 'finance_operator'],
    icon: <Shield className="w-4 h-4 text-amber-600" />
  },
  {
    title: 'Tim Editorial',
    roles: ['editor_in_chief', 'editor', 'cover_editor', 'layout_editor'],
    icon: <BookOpen className="w-4 h-4 text-indigo-600" />
  },
  {
    title: 'Reviewer / Mitra Bestari',
    roles: ['reviewer_with_id', 'reviewer_no_id'],
    icon: <Award className="w-4 h-4 text-emerald-600" />
  },
  {
    title: 'Program Kemitraan (Referal / Royalti)',
    roles: ['royalty_referrer_lembaga', 'royalty_referrer_personal'],
    icon: <TrendingUp className="w-4 h-4 text-rose-600" />
  }
];

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

  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    email: '',
    full_name: '',
    partner_type: 'lembaga',
    npwp: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: ''
  });
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchUsersAndStaff();
  }, []);

  const fetchUsersAndStaff = async () => {
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email, role, partner_type, npwp, bank_name, bank_account_number, bank_account_holder')
        .order('full_name');
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

  const handleAddPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.email || !partnerForm.full_name || !partnerForm.partner_type) {
      alert('Mohon isi nama, email, dan tipe kemitraan.');
      return;
    }
    setPartnerSubmitting(true);
    try {
      const { error } = await supabase.rpc('admin_create_partner', {
        p_email: partnerForm.email.trim(),
        p_full_name: partnerForm.full_name,
        p_partner_type: partnerForm.partner_type,
        p_npwp: partnerForm.npwp || null,
        p_bank_name: partnerForm.bank_name || null,
        p_bank_account_number: partnerForm.bank_account_number || null,
        p_bank_account_holder: partnerForm.bank_account_holder || null
      });

      if (error) throw error;

      alert('Mitra Royalti berhasil ditambahkan!');
      setShowAddPartnerModal(false);
      setPartnerForm({
        email: '',
        full_name: '',
        partner_type: 'lembaga',
        npwp: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: ''
      });
      fetchUsersAndStaff();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan mitra: ' + err.message);
    } finally {
      setPartnerSubmitting(false);
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
      const { data, error } = await supabase.from('honorarium_rates').select('*');
      if (error) throw error;
      
      const sorted = (data || []).sort((a, b) => {
        const indexA = ROLE_ORDER.indexOf(a.role_key);
        const indexB = ROLE_ORDER.indexOf(b.role_key);
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        return valA - valB;
      });
      setRates(sorted);
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
          <div className="p-6 space-y-6">
            {ratesLoading ? (
              <p className="text-academic-500">Memuat tarif...</p>
            ) : (
              CATEGORIES.map((category) => {
                const categoryRates = rates.filter((r) => category.roles.includes(r.role_key));
                if (categoryRates.length === 0) return null;
                return (
                  <div key={category.title} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-academic-100">
                      {category.icon}
                      <h3 className="font-bold text-xs text-academic-700 uppercase tracking-wider">
                        {category.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryRates.map((rate) => (
                        <div key={rate.id} className="p-4 border border-academic-200 rounded-lg bg-academic-50 flex flex-col justify-between hover:border-academic-300 transition-colors">
                          <div>
                            <p className="font-bold text-academic-900 text-sm">{rate.role_name}</p>
                            <p className="text-xs text-academic-500 mb-3">{rate.role_key}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-academic-500 font-bold">Rp</span>
                            <input
                              type="number"
                              defaultValue={rate.amount}
                              className="flex-1 px-3 py-1.5 border border-academic-300 rounded focus:ring-2 focus:ring-brand-500 text-sm font-bold bg-white"
                              onBlur={(e) => {
                                if (Number(e.target.value) !== rate.amount) {
                                  handleUpdateRate(rate.id, Number(e.target.value));
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
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
                rates?.filter(r => !r.role_key?.includes('reviewer') && r.role_key !== 'editor' && !r.role_key?.startsWith('royalty')).map((rate) => {
                  const assignedUser = globalStaff?.find(s => s.role_key === rate.role_key)?.user_id || '';
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
                        {users?.map(u => (
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

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-lg text-academic-900 font-serif">Daftar Mitra Penerima Royalti</h2>
            </div>
            <button 
              onClick={() => setShowAddPartnerModal(true)} 
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Tambah Mitra Baru
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-academic-600 mb-6">
              Berikut adalah daftar seluruh Mitra Lembaga dan Perujuk Perorangan yang terdaftar untuk menerima royalti. Anda dapat mengelola tipe kemitraan mereka di halaman Manajemen Pengguna.
            </p>
            {users.filter(u => u.partner_type === 'lembaga' || u.partner_type === 'personal').length === 0 ? (
              <p className="text-academic-500 text-sm italic">Belum ada Mitra Royalti yang terdaftar.</p>
            ) : (
              <div className="overflow-x-auto border border-academic-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-academic-200 text-[10px] font-bold text-academic-500 uppercase">
                      <th className="px-4 py-3">Nama Mitra</th>
                      <th className="px-4 py-3 text-center">Tipe Kemitraan</th>
                      <th className="px-4 py-3 text-center">NPWP</th>
                      <th className="px-4 py-3">Informasi Rekening Bank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-academic-100 text-academic-800">
                    {users.filter(u => u.partner_type === 'lembaga' || u.partner_type === 'personal').map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-academic-900 block">{p.full_name}</span>
                          <span className="text-xs text-academic-500">{p.email}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.partner_type === 'lembaga' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            {p.partner_type === 'lembaga' ? 'Lembaga' : 'Personal'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{p.npwp || '-'}</td>
                        <td className="px-4 py-3 text-xs">
                          {p.bank_name ? (
                            <div>
                              <span className="font-semibold">{p.bank_name}</span> - {p.bank_account_number} <br/>
                              <span className="text-academic-500">a.n {p.bank_account_holder}</span>
                            </div>
                          ) : (
                            <span className="text-rose-500 italic">Belum melengkapi info bank</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-academic-100 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Tambah Mitra Royalti Baru</h3>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-academic-400 hover:text-rose-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPartnerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                  Nama Mitra / Lembaga <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.full_name}
                  onChange={e => setPartnerForm({...partnerForm, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm"
                  placeholder="Contoh: LPPM Universitas X atau Nama Orang"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                    Email Kontak <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={partnerForm.email}
                    onChange={e => setPartnerForm({...partnerForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm"
                    placeholder="mitra@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                    Tipe Kemitraan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={partnerForm.partner_type}
                    onChange={e => setPartnerForm({...partnerForm, partner_type: e.target.value})}
                    className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm bg-white cursor-pointer"
                  >
                    <option value="lembaga">Lembaga Perujuk (Lembaga)</option>
                    <option value="personal">Perujuk Perorangan (Personal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                  Nomor NPWP
                </label>
                <input
                  type="text"
                  value={partnerForm.npwp}
                  onChange={e => setPartnerForm({...partnerForm, npwp: e.target.value})}
                  className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm font-mono"
                  placeholder="00.000.000.0-000.000"
                />
              </div>

              <div className="border-t border-academic-100 pt-4">
                <h4 className="text-xs font-bold text-academic-900 uppercase tracking-wider mb-3">Informasi Rekening Bank</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                      Nama Bank
                    </label>
                    <input
                      type="text"
                      value={partnerForm.bank_name}
                      onChange={e => setPartnerForm({...partnerForm, bank_name: e.target.value})}
                      className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm"
                      placeholder="Contoh: BNI, Mandiri, BRI"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={partnerForm.bank_account_number}
                      onChange={e => setPartnerForm({...partnerForm, bank_account_number: e.target.value})}
                      className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm font-mono"
                      placeholder="Masukkan no. rekening"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                      Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={partnerForm.bank_account_holder}
                      onChange={e => setPartnerForm({...partnerForm, bank_account_holder: e.target.value})}
                      className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm"
                      placeholder="Nama sesuai buku tabungan"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-academic-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 border border-academic-300 rounded-lg text-sm font-bold text-academic-700 hover:bg-academic-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={partnerSubmitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {partnerSubmitting ? 'Menyimpan...' : 'Simpan Mitra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
