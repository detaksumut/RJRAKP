import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleOrcidLogin = () => {
    const clientId = import.meta.env.VITE_ORCID_CLIENT_ID || 'APP-AJ40VLU6GXMHQBNA';
    const redirectUri = 'https://rjrakp.com/auth/callback';
    window.location.href = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message === 'Invalid login credentials' ? 'Email atau password salah' : authError.message);
      }

      if (authData.user) {
        console.log("AUTH LOGIN SUCCESS", authData.user.id);

        // Fetch user profile from public users table to get properties like role and status
        let { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        console.log("PROFILE DATA", profileData);

        if (profileError || !profileData) {
           if (authData.user.email === 'detaksumut@gmail.com') {
             // Auto-create admin profile if missing for this specific user
             const { data: newAdmin, error: insertError } = await supabase.from('users').upsert({
               id: authData.user.id,
               full_name: 'Admin Detak Sumut',
               email: 'detaksumut@gmail.com',
               role: 'admin',
               status: 'APPROVED'
             }).select().single();
             
             if (!insertError && newAdmin) {
               profileData = newAdmin;
               profileError = null;
               console.log("PROFILE DATA", profileData);
             }
           }

           if (profileError || !profileData) {
             await supabase.auth.signOut();
             throw new Error('Data profil tidak ditemukan di database. Pastikan akun telah diregistrasi dengan benar.');
           }
        }

        console.log("ROLE", profileData.role);
        console.log("STATUS", profileData.status);

        // Log login activity
        await supabase.from('activity_logs').insert({
          user_id: authData.user.id,
          action: 'User login',
          entity_type: 'users',
          entity_id: authData.user.id
        });

        if (profileData.status === "REJECTED") {
           await supabase.auth.signOut();
           throw new Error("Mohon maaf, permohonan Anda belum dapat disetujui. Silakan hubungi Administrator untuk informasi lebih lanjut.");
        } else if (profileData.status === "SUSPENDED") {
           await supabase.auth.signOut();
           throw new Error("Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator RJRAKP.");
        }

        // Redirect based on role
        switch (profileData.role) {
          case 'admin':
            console.log("REDIRECT TO ADMIN");
            navigate('/dashboard/admin');
            break;
          case 'editor':
            console.log("REDIRECT TO EDITOR");
            navigate('/dashboard/editor');
            break;
          case 'reviewer':
            console.log("REDIRECT TO REVIEWER");
            navigate('/dashboard/reviewer');
            break;
          default:
            console.log("REDIRECT TO AUTHOR");
            navigate('/dashboard/author');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="bg-brand-900 p-8 text-center">
            <h1 className="text-2xl font-serif font-bold text-white mb-2">Login SIP RJRAKP</h1>
            <p className="text-brand-100 text-sm">Sistem Informasi Publikasi RJRAKP</p>
          </div>
          
          <div className="p-8">
            {message && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm border border-emerald-200 mb-6">
                {message}
              </div>
            )}
            
            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200 mb-6">
                {error}
              </div>
            )}

            <button 
              onClick={handleOrcidLogin}
              className="w-full bg-[#A6CE39] hover:bg-[#8eb82b] text-white font-bold py-3 rounded-lg transition-colors mb-6 flex items-center justify-center gap-2"
              type="button"
            >
              <img src="/ORCID.png" alt="ORCID" className="h-6 bg-white rounded-full p-0.5" onError={(e) => { e.currentTarget.src = 'https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'; }} />
              Login dengan ORCID
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">ATAU EMAIL</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-academic-300" />
                  <label htmlFor="remember" className="text-sm text-academic-600">Ingat saya</label>
                </div>
                <Link to="/forgot-password" className="text-sm text-brand-600 font-bold hover:underline">Lupa Password?</Link>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Login'}
              </button>

              <p className="text-center text-sm text-academic-600 mt-6 pt-4 border-t border-academic-100">
                Belum memiliki akun? <Link to="/register" className="text-brand-600 font-bold hover:underline">Daftar sekarang</Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
