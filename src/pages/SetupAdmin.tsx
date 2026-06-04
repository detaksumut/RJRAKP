import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SetupAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: 'Admin',
    email: 'admin@rjrakp.ac.id',
    password: 'admin123'
  });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Memproses...');
    try {
      const { password, name } = formData;
      const email = formData.email.replace(/\s+/g, '').trim();

      let userId = null;

      // Coba daftar baru
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Jika sudah terdaftar atau kena rate limit signUp, coba login saja untuk dapatkan ID
        if (authError.message.includes('already registered') || authError.message.includes('rate limit')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            throw new Error(`Gagal membuat akun baru dan gagal login: ${signInError.message}`);
          }
          userId = signInData.user?.id;
        } else {
          throw authError; // Error lain
        }
      } else {
        userId = authData.user?.id;
      }

      if (!userId) throw new Error('Gagal mendapatkan ID User Supabase');

      // Upsert ke tabel users sebagai admin
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        full_name: name,
        email: email,
        role: 'admin',
        status: 'APPROVED',
      }, { onConflict: 'id' });

      if (userError) throw userError;

      setMessage(`SUCCESS: Akun admin berhasil disiapkan! Silakan langsung menuju halaman Login menggunakan ${email} dan password Anda.`);
    } catch (err: any) {
      if (err.message.includes('rate limit exceeded')) {
        setMessage('Error: Sering mencoba mendaftar/login (Rate Limit dari Supabase). Tunggu beberapa saat atau coba ganti password di supabase.');
      } else {
        setMessage('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-academic-200 shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Setup Admin</h1>
          <p className="mb-6 text-sm text-academic-600 text-center">Buat akun Admin baru di sistem ini.</p>
          
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="text" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : 'Buat Akun Admin'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-sm font-bold ${message.startsWith('SUCCESS') || message.includes('sudah terdaftar') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {message}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
