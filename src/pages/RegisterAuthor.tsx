import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterAuthor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    institution: '',
    faculty: '',
    study_program: '',
    education_level: 'S1',
    scopus_id: '',
    wos_id: '',
    sinta_id: '',
    google_scholar_id: '',
    referred_by: '',
    password: '',
    confirm_password: '',
    agree_terms: false
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [hasReferral, setHasReferral] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_partners');
      if (error) throw error;
      if (data) {
        setPartners(data);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  };
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOrcidLogin = () => {
    const clientId = import.meta.env.VITE_ORCID_CLIENT_ID || 'APP-AJ40VLU6GXMHQBNA';
    const redirectUri = 'https://rjrakp.com/auth/callback';
    window.location.href = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("STEP 1 FORM SUBMIT");
    console.log(formData);
    
    if (formData.password !== formData.confirm_password) {
      return setError('Password dan Konfirmasi Password tidak cocok');
    }
    if (!formData.agree_terms) {
      return setError('Anda harus menyetujui syarat dan ketentuan');
    }

    setLoading(true);
    setSlowLoading(false);
    setError('');

    const slowTimer = setTimeout(() => {
      setError("Registrasi timeout. Periksa Console Browser.");
      setLoading(false);
    }, 10000);

    try {
      console.log("STEP 2 BEFORE SIGNUP");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("STEP 3 SIGNUP RESULT", authData);
      console.log("STEP 3 SIGNUP ERROR", authError);

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!authData?.user) throw new Error('Gagal mendaftar, respons tidak valid.');

      console.log("STEP 4 INSERT USERS TABLE");
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: 'author',
        status: 'APPROVED',
        institution: formData.institution,
        faculty: formData.faculty,
        study_program: formData.study_program,
        degree_level: formData.education_level,
        scopus_id: formData.scopus_id,
        wos_id: formData.wos_id,
        sinta_id: formData.sinta_id,
        google_scholar_id: formData.google_scholar_id,
        referred_by: formData.referred_by || null
      });

      if (userError) throw userError;

      console.log("STEP 5 INSERT SUCCESS");

      await supabase.from('activity_logs').insert({
        user_id: authData.user.id,
        action: 'Registrasi pengguna',
        entity_type: 'users',
        entity_id: authData.user.id
      });

      navigate('/login', { state: { message: 'Registrasi Penulis berhasil. Silakan login.' } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem.');
      setError(err.message || 'Terjadi kesalahan sistem. Jika macet, coba refresh halaman.');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="bg-brand-900 p-6 text-center">
            <h1 className="text-2xl font-serif font-bold text-white mb-2">Registrasi Penulis</h1>
            <p className="text-brand-100 text-sm">Daftar untuk mengirimkan naskah publikasi Anda</p>
          </div>
          
          <div className="p-8">
            {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200 mb-6">{error}</div>}
            
            <button 
              onClick={handleOrcidLogin}
              className="w-full bg-[#A6CE39] hover:bg-[#8eb82b] text-white font-bold py-3 rounded-lg transition-colors mb-6 flex items-center justify-center gap-2"
              type="button"
            >
              <img src="/ORCID.png" alt="ORCID" className="h-6 bg-white rounded-full p-0.5" onError={(e) => { e.currentTarget.src = 'https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'; }} />
              Daftar Instan dengan ORCID
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">ATAU FORMULIR MANUAL</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Nama Lengkap *</label>
                <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Nomor WhatsApp *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Institusi *</label>
                <input type="text" required value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Fakultas *</label>
                  <input type="text" required value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Program Studi *</label>
                  <input type="text" required value={formData.study_program} onChange={e => setFormData({...formData, study_program: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

                <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Jenjang Pendidikan *</label>
                <select required value={formData.education_level} onChange={e => setFormData({...formData, education_level: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Apakah Anda memiliki Rujukan Mitra? *</label>
                <div className="flex gap-6 mb-3 mt-1">
                  <label className="flex items-center text-sm font-semibold text-academic-700 cursor-pointer">
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
                  <label className="flex items-center text-sm font-semibold text-academic-700 cursor-pointer">
                    <input
                      type="radio"
                      name="has_referral"
                      value="no"
                      checked={hasReferral === 'no'}
                      onChange={() => {
                        setHasReferral('no');
                        setFormData({...formData, referred_by: ''});
                      }}
                      className="mr-2 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    Tidak Ada
                  </label>
                </div>

                {hasReferral === 'yes' && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Pilih Mitra Rujukan *</label>
                    <select
                      required
                      value={formData.referred_by}
                      onChange={e => setFormData({...formData, referred_by: e.target.value})}
                      className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="">-- Pilih Lembaga atau Personal --</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.partner_type === 'lembaga' ? 'Lembaga' : 'Personal'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="border-t border-academic-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Scopus ID (Opsional)</label>
                  <input type="text" value={formData.scopus_id} onChange={e => setFormData({...formData, scopus_id: e.target.value})} placeholder="Contoh: 57211111111" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Web of Science ID (Opsional)</label>
                  <input type="text" value={formData.wos_id} onChange={e => setFormData({...formData, wos_id: e.target.value})} placeholder="Contoh: A-1234-2023" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">SINTA ID (Opsional)</label>
                  <input type="text" value={formData.sinta_id} onChange={e => setFormData({...formData, sinta_id: e.target.value})} placeholder="Contoh: 6012345" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Google Scholar ID (Opsional)</label>
                  <input type="text" value={formData.google_scholar_id} onChange={e => setFormData({...formData, google_scholar_id: e.target.value})} placeholder="Contoh: sTR9aaaaJ" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="border-t border-academic-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full border border-academic-300 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-brand-500 focus:outline-none"
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
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Konfirmasi Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirm_password}
                      onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                      className="w-full border border-academic-300 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-brand-500 focus:outline-none"
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
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" id="terms" required checked={formData.agree_terms} onChange={e => setFormData({...formData, agree_terms: e.target.checked})} className="mt-1" />
                <label htmlFor="terms" className="text-sm text-academic-600">Saya menyetujui Syarat & Ketentuan RJRAKP.</label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Daftar Sebagai Penulis'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
