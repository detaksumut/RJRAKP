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
      </div>
    </DashboardLayout>
  );
}
