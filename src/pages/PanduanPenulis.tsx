import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, UserPlus, LogIn, FileText, Send, Users, Edit3, ShieldCheck, BookOpen } from 'lucide-react';

export default function PanduanPenulis() {
  return (
    <div className="min-h-screen bg-academic-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-900 mb-4">PANDUAN PENULIS</h1>
          <p className="text-lg text-academic-600 max-w-3xl mx-auto">
            Halaman ini memberikan informasi lengkap kepada mahasiswa, dosen, peneliti, dan praktisi yang ingin mengirimkan artikel ke Rumah Jurnal RJRAKP.
          </p>
        </div>

        {/* Section: Siapa yang dapat menjadi penulis */}
        <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-6 border-b border-academic-100 pb-4">Siapa yang Dapat Menjadi Penulis?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['Mahasiswa S1', 'Mahasiswa S2', 'Mahasiswa S3', 'Dosen', 'Peneliti', 'Praktisi'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span className="font-medium text-academic-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Alur Publikasi */}
        <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8 mb-8 overflow-hidden">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8 border-b border-academic-100 pb-4 text-center sm:text-left">Alur Publikasi</h2>
          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-brand-100 -translate-y-1/2 rounded-full"></div>
            
            {/* Vertical Line for Mobile */}
            <div className="md:hidden absolute top-0 left-8 h-full w-1 bg-brand-100 -translate-x-1/2 rounded-full z-0"></div>

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4">
              {[
                { title: 'Registrasi Akun', icon: UserPlus, desc: 'Membuat akun sebagai penulis di sistem RJRAKP.' },
                { title: 'Login Sistem', icon: LogIn, desc: 'Masuk ke dashboard penulis untuk submit naskah.' },
                { title: 'Submit Artikel', icon: Send, desc: 'Mengunggah naskah dan dokumen kelengkapan.' },
                { title: 'Peer Review', icon: Users, desc: 'Proses penilaian oleh mitra bebestari.' },
                { title: 'Revisi Naskah', icon: Edit3, desc: 'Perbaikan naskah sesuai masukan reviewer.' },
                { title: 'Keputusan Editor', icon: ShieldCheck, desc: 'Editor memutuskan status akhir naskah.' },
                { title: 'Publikasi', icon: BookOpen, desc: 'Naskah diterbitkan pada volume/nomor berjalan.' }
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex md:flex-col items-center md:flex-1 group relative">
                    <div className="flex-shrink-0 w-16 h-16 md:mb-4 bg-white border-4 border-brand-50 rounded-full flex items-center justify-center text-brand-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand-100 group-hover:bg-brand-50 group-hover:text-brand-700 z-10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-6 md:ml-0 md:text-center p-4 md:p-3 bg-white border border-academic-100 rounded-xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-brand-200 flex-1 md:w-full">
                      <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Tahap {index + 1}</div>
                      <h3 className="font-bold text-academic-900 text-sm md:text-base mb-1">{step.title}</h3>
                      <p className="text-xs text-academic-600 hidden md:block leading-relaxed">{step.desc}</p>
                      <p className="text-sm text-academic-600 md:hidden leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Section: Persyaratan Naskah */}
          <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8">
            <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 border-b border-academic-100 pb-4">Persyaratan Naskah</h2>
            <ul className="space-y-3">
              {[
                'Karya asli',
                'Tidak sedang diajukan ke jurnal lain',
                'Sesuai fokus dan ruang lingkup jurnal',
                'Mengikuti pedoman penulisan',
                'Bebas plagiarisme'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="min-w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5" />
                  <span className="text-academic-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Dokumen yang harus diunggah */}
          <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8">
            <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 border-b border-academic-100 pb-4">Dokumen yang Harus Diunggah</h2>
            <ul className="space-y-3">
              {[
                'File Artikel (DOCX)',
                'File PDF (Opsional)',
                'Pernyataan Keaslian Artikel'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="min-w-1.5 h-1.5 rounded-full bg-brand-500 mt-2.5" />
                  <span className="text-academic-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Section: Hak Penulis */}
          <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8">
            <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 border-b border-academic-100 pb-4">Hak Penulis</h2>
            <ul className="space-y-3">
              {[
                'Mendapat proses review yang adil',
                'Mendapat informasi status artikel',
                'Mendapat pemberitahuan keputusan editor',
                'Mendapat akses terhadap dokumen publikasi'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="min-w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5" />
                  <span className="text-academic-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Kewajiban Penulis */}
          <div className="bg-white rounded-xl shadow-sm border border-academic-200 p-8">
            <h2 className="text-xl font-serif font-bold text-brand-900 mb-6 border-b border-academic-100 pb-4">Kewajiban Penulis</h2>
            <ul className="space-y-3">
              {[
                'Menjamin keaslian artikel',
                'Menyajikan data yang benar',
                'Mematuhi etika publikasi',
                'Menyebutkan seluruh sumber referensi'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="min-w-1.5 h-1.5 rounded-full bg-amber-500 mt-2.5" />
                  <span className="text-academic-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link to="/register" className="flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-lg shadow-sm transition-colors">
            <UserPlus className="w-5 h-5" />
            Daftar Sebagai Penulis
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 font-bold rounded-lg transition-colors">
            <LogIn className="w-5 h-5" />
            Login Penulis
          </Link>
          <Link to="/pedoman" className="flex items-center gap-2 px-6 py-3 bg-academic-800 hover:bg-academic-900 text-white font-bold rounded-lg shadow-sm transition-colors">
            <FileText className="w-5 h-5" />
            Pedoman Penulisan
          </Link>
          <Link to="/register" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors">
            <Send className="w-5 h-5" />
            Submit Artikel
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
