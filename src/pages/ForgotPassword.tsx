import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('reset-password-wa', {
        body: { email }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Gagal menghubungi server.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuccess(data?.message || 'Kata sandi baru telah berhasil dikirim ke nomor WhatsApp Anda.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
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
            <h1 className="text-2xl font-serif font-bold text-white mb-2">Lupa Password</h1>
            <p className="text-brand-100 text-sm">SIP RJRAKP</p>
          </div>
          
          <div className="p-8">
            {success ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-sm border border-emerald-200 text-left font-medium">
                  {success}
                </div>
                <p className="text-sm text-academic-600">
                  Silakan periksa pesan masuk WhatsApp Anda. Jika pesan belum diterima dalam beberapa menit, pastikan email yang Anda masukkan sudah terdaftar.
                </p>
                <div className="pt-4 border-t border-academic-100">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-brand-600 font-bold hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-academic-600 mb-4">
                  Masukkan alamat email akun Anda. Kami akan mengirimkan Email/User ID beserta password sementara yang baru langsung ke nomor WhatsApp Anda yang terdaftar.
                </p>

                {error && (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="email@contoh.com"
                    className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Kirim Password ke WhatsApp'}
                </button>

                <p className="text-center text-sm text-academic-600 mt-6 pt-4 border-t border-academic-100">
                  Ingat password Anda? <Link to="/login" className="text-brand-600 font-bold hover:underline">Login disini</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
