import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

export default function RegisterReviewer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    institution: '',
    faculty: '',
    education_level: 'S1',
    expertise_area: '',
    orcid_id: '',
    google_scholar: '',
    scopus_id: '',
    wos_id: '',
    cv_url: '',
    password: '',
    confirm_password: '',
    agree_terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!formData.cv_url) {
      return setError('Mohon upload CV Anda dalam format PDF');
    }

    setLoading(true);
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
      if (!authData?.user) throw new Error('Gagal mendaftar, user tidak tersedia');

      console.log("STEP 4 INSERT USERS TABLE");
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: 'reviewer',
        status: 'PENDING',
        institution: formData.institution,
        faculty: formData.faculty,
        degree_level: formData.education_level,
        scopus_id: formData.scopus_id,
        wos_id: formData.wos_id
      });

      if (userError) throw userError;

      console.log("STEP 5 INSERT REVIEWER PROFILE");
      const { error: profileError } = await supabase.from('reviewer_profiles').insert({
        user_id: authData.user.id,
        affiliation: formData.institution,
        faculty: formData.faculty,
        education_level: formData.education_level,
        expertise_area: formData.expertise_area,
        orcid_id: formData.orcid_id,
        google_scholar: formData.google_scholar,
        scopus_id: formData.scopus_id,
        wos_id: formData.wos_id,
        cv_url: formData.cv_url, // In a real app we upload the file and get the URL
      });

      if (profileError) throw profileError;
      console.log("STEP 6 INSERT SUCCESS");

      await supabase.from('activity_logs').insert({
        user_id: authData.user.id,
        action: 'Pengajuan reviewer',
        entity_type: 'users',
        entity_id: authData.user.id
      });

      navigate('/login', { state: { message: 'Registrasi berhasil. Akun Anda berstatus Pending Review dan sedang diverifikasi Administrator.' } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem.');
      setError(err.message || 'Terjadi kesalahan sistem. Coba refresh halaman.');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({...formData, cv_url: e.target.files[0].name });
    }
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="bg-brand-900 p-6 text-center">
            <h1 className="text-2xl font-serif font-bold text-white mb-2">Registrasi Reviewer</h1>
            <p className="text-brand-100 text-sm">Daftar sebagai Mitra Bebestari (Reviewer)</p>
          </div>
          
          <div className="p-8">
            {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200 mb-6">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Nama Lengkap beserta Gelar *</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Institusi *</label>
                  <input type="text" required value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Fakultas *</label>
                  <input type="text" required value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Pendidikan Terakhir *</label>
                  <select required value={formData.education_level} onChange={e => setFormData({...formData, education_level: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Bidang Keahlian *</label>
                  <input type="text" required value={formData.expertise_area} onChange={e => setFormData({...formData, expertise_area: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="border-t border-academic-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">ORCID ID (Opsional)</label>
                  <input type="text" value={formData.orcid_id} onChange={e => setFormData({...formData, orcid_id: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Google Scholar (Opsional)</label>
                  <input type="text" value={formData.google_scholar} onChange={e => setFormData({...formData, google_scholar: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Scopus ID (Opsional)</label>
                  <input type="text" value={formData.scopus_id} onChange={e => setFormData({...formData, scopus_id: e.target.value})} placeholder="Contoh: 57211111111" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Web of Science ID (Opsional)</label>
                  <input type="text" value={formData.wos_id} onChange={e => setFormData({...formData, wos_id: e.target.value})} placeholder="Contoh: A-1234-2023" className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Upload CV (PDF) *</label>
                <div className="flex items-center gap-4">
                  <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-academic-100 text-academic-700 hover:bg-academic-200 font-bold text-sm rounded-md border border-academic-300">Pilih File</button>
                  <span className="text-sm text-academic-600">{formData.cv_url || 'Belum ada file'}</span>
                </div>
              </div>

              <div className="border-t border-academic-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Password *</label>
                  <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase mb-2">Konfirmasi Password *</label>
                  <input type="password" required value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} className="w-full border border-academic-300 rounded-md px-4 py-2 text-sm focus:ring-brand-500" />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" id="terms" required checked={formData.agree_terms} onChange={e => setFormData({...formData, agree_terms: e.target.checked})} className="mt-1" />
                <label htmlFor="terms" className="text-sm text-academic-600">Saya menyetujui Syarat & Ketentuan RJRAKP.</label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Daftar Sebagai Reviewer'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
