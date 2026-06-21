import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Lock, CreditCard, Eye, EyeOff } from 'lucide-react';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    npwp: '',
    referred_by: '',
    referred_by_custom: ''
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [hasReferral, setHasReferral] = useState<'yes' | 'no'>('no');
  const [isManualReferral, setIsManualReferral] = useState(false);

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('bank_name, bank_account_number, bank_account_holder, npwp, referred_by, referred_by_custom')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          bank_name: data.bank_name || '',
          bank_account_number: data.bank_account_number || '',
          bank_account_holder: data.bank_account_holder || '',
          npwp: data.npwp || '',
          referred_by: data.referred_by || '',
          referred_by_custom: data.referred_by_custom || ''
        });
        setHasReferral(data.referred_by || data.referred_by_custom ? 'yes' : 'no');
        setIsManualReferral(!!data.referred_by_custom && !data.referred_by);
      }

      const { data: partnersData, error: partnersError } = await supabase.rpc('get_active_partners');
      if (partnersError) throw partnersError;
      if (partnersData) {
        setPartners(partnersData);
        if (partnersData.length === 0) {
          setIsManualReferral(true);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleUpdateBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          bank_name: formData.bank_name,
          bank_account_number: formData.bank_account_number,
          bank_account_holder: formData.bank_account_holder,
          npwp: formData.npwp,
          referred_by: formData.referred_by || null,
          referred_by_custom: formData.referred_by_custom || null
        })
        .eq('id', user?.id);

      if (error) throw error;
      setSuccessMsg('Data rekening berhasil disimpan.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data rekening');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassErrorMsg('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPassErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;
      
      setPassSuccessMsg('Password berhasil diperbarui.');
      setPasswords({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccessMsg(''), 3000);
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-6">Profil & Rekening</h1>

        {/* Bank Account Section */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex items-center gap-2 bg-academic-50">
            <CreditCard className="w-5 h-5 text-academic-600" />
            <h2 className="font-bold text-lg text-academic-900">Data Rekening Bank (Untuk Pembayaran Honorarium)</h2>
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

            <form onSubmit={handleUpdateBankInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="Contoh: BCA, BSI, Mandiri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                    className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="Contoh: 1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-1">
                    Nama Pemilik Rekening (Sesuai Buku Tabungan)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_account_holder}
                    onChange={(e) => setFormData({...formData, bank_account_holder: e.target.value})}
                    className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-academic-900 mb-1">
                    NPWP (Nomor Pokok Wajib Pajak) <span className="text-academic-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.npwp}
                    onChange={(e) => setFormData({...formData, npwp: e.target.value})}
                    className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="Contoh: 12.345.678.9-012.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-academic-900 mb-1">
                  Apakah Anda memiliki Rujukan Mitra? *
                </label>
                <div className="flex gap-6 mb-3 mt-1">
                  <label className="flex items-center text-sm font-medium text-academic-750 cursor-pointer">
                    <input
                      type="radio"
                      name="has_referral"
                      value="yes"
                      checked={hasReferral === 'yes'}
                      onChange={() => {
                        setHasReferral('yes');
                      }}
                      className="mr-2 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    Ya, Ada Rujukan
                  </label>
                  <label className="flex items-center text-sm font-medium text-academic-750 cursor-pointer">
                    <input
                      type="radio"
                      name="has_referral"
                      value="no"
                      checked={hasReferral === 'no'}
                      onChange={() => {
                        setHasReferral('no');
                        setFormData({...formData, referred_by: '', referred_by_custom: ''});
                      }}
                      className="mr-2 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    Tidak Ada
                  </label>
                </div>

                {hasReferral === 'yes' && (
                  <div className="mt-3">
                    {partners.length > 0 && (
                      <div className="mb-3">
                        <label className="block text-sm font-bold text-academic-900 mb-1">
                          Pilih Mitra Rujukan *
                        </label>
                        <select
                          required={!isManualReferral}
                          value={isManualReferral ? 'custom' : formData.referred_by}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsManualReferral(true);
                              setFormData({...formData, referred_by: ''});
                            } else {
                              setIsManualReferral(false);
                              setFormData({...formData, referred_by: val, referred_by_custom: ''});
                            }
                          }}
                          className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
                        >
                          <option value="">-- Pilih Lembaga atau Personal --</option>
                          {partners.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.full_name} ({p.partner_type === 'lembaga' ? 'Lembaga' : 'Personal'})
                            </option>
                          ))}
                          <option value="custom">Lainnya (Tulis Manual)</option>
                        </select>
                      </div>
                    )}

                    {(partners.length === 0 || isManualReferral) && (
                      <div className="mt-3">
                        <label className="block text-sm font-bold text-academic-900 mb-1">
                          Tulis Nama Rujukan (Lembaga / Perorangan) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.referred_by_custom}
                          onChange={e => setFormData({...formData, referred_by_custom: e.target.value})}
                          placeholder="Contoh: Universitas Indonesia atau Dr. Hermawan"
                          className="w-full px-4 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Data Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-academic-100 flex items-center gap-2 bg-academic-50">
            <Lock className="w-5 h-5 text-academic-600" />
            <h2 className="font-bold text-lg text-academic-900">Ubah Password</h2>
          </div>
          
          <div className="p-6">
            {passSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium">
                {passSuccessMsg}
              </div>
            )}
            
            {passErrorMsg && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm font-medium">
                {passErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-academic-900 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full pl-4 pr-10 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-academic-900 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full pl-4 pr-10 py-2 border border-academic-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 bg-academic-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-academic-900 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
