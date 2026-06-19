import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, UserCheck, Edit3 } from 'lucide-react';

export default function RegisterSelection() {
  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden text-center p-10">
          <h1 className="text-3xl font-serif font-bold text-academic-900 mb-4">Pilih Jenis Registrasi</h1>
          <p className="text-academic-500 mb-10 max-w-2xl mx-auto">
            Silakan pilih peran Anda dalam Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP). 
            Setiap peran memiliki form dan persyaratan yang berbeda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/register/author" className="flex flex-col items-center p-8 border-2 border-academic-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-academic-900 mb-2">Penulis (Author)</h2>
              <p className="text-sm text-academic-500 mb-4">Daftar untuk mengirimkan manuskrip jurnal umum, Tugas Jurnal, atau opini mahasiswa (Jurnal Kampus).</p>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">Akses Langsung Disetujui</span>
            </Link>

            <Link to="/register/reviewer" className="flex flex-col items-center p-8 border-2 border-academic-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-academic-900 mb-2">Reviewer</h2>
              <p className="text-sm text-academic-500 mb-4">Daftar sebagai Mitra Bebestari untuk membantu evaluasi naskah akademik.</p>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">Menunggu Verifikasi Admin</span>
            </Link>

            <Link to="/register/editor" className="flex flex-col items-center p-8 border-2 border-academic-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group">
               <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Edit3 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-academic-900 mb-2">Editor</h2>
              <p className="text-sm text-academic-500 mb-4">Daftar sebagai Dewan Redaksi untuk mengelola penerbitan. Membutuhkan rekam jejak editorial.</p>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">Menunggu Verifikasi Admin</span>
            </Link>
          </div>

          <p className="text-sm text-academic-500 mt-12">
            Sudah memiliki akun? <Link to="/login" className="text-brand-600 font-bold hover:underline">Login di sini</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
