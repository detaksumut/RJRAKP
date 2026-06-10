import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setStatus('error');
      setErrorMessage('Tidak ada kode otorisasi dari ORCID.');
      return;
    }

    const exchangeCode = async () => {
      try {
        // Panggil fungsi peladen (Edge Function) untuk menukar kode dengan token
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orcid-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengautentikasi dengan ORCID');
        }

        // Login menggunakan kredensial hasil *generate* dari Edge Function
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (authError) throw authError;

        setStatus('success');
        
        // Arahkan pengguna ke dashboard author setelah 2 detik
        setTimeout(() => {
          navigate('/dashboard/author');
        }, 2000);

      } catch (err: any) {
        console.error('ORCID Auth Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Terjadi kesalahan saat verifikasi akun ORCID.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <img src="/ORCID.png" alt="ORCID" className="h-12" onError={(e) => { e.currentTarget.src = 'https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'; }} />
        </div>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-brand-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sedang Mengautentikasi...</h2>
            <p className="text-slate-500 text-sm">Mohon tunggu sebentar sementara kami menghubungkan akun ORCID Anda dengan RJRAKP.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Login Berhasil!</h2>
            <p className="text-slate-500 text-sm">Akun ORCID Anda telah terhubung. Mengalihkan ke Dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="h-16 w-16 text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Login Gagal</h2>
            <p className="text-rose-600 text-sm mb-6">{errorMessage}</p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
