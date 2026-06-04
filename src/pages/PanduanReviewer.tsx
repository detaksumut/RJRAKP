import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle2, UserPlus, LogIn, Settings, BookOpen, GraduationCap, UploadCloud, ShieldCheck, CheckSquare, Scale, ClipboardList, Eye, Award, FileCheck, CheckCircle } from 'lucide-react';

export default function PanduanReviewer() {
  return (
    <div className="min-h-screen bg-academic-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-academic-900 mb-6 tracking-tight">Panduan Reviewer</h1>
          <p className="text-lg md:text-xl text-academic-600 max-w-3xl mx-auto leading-relaxed">
            Pusat informasi bagi akademisi dan profesional yang ingin berkontribusi sebagai mitra bebestari pada Rumah Jurnal RJRAKP, menjaga standar dan kualitas publikasi ilmiah.
          </p>
        </div>

        {/* Section: Siapa yang dapat menjadi reviewer */}
        <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8 pb-4 border-b border-academic-100 text-center sm:text-left">Siapa yang Dapat Menjadi Reviewer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {['Dosen', 'Peneliti', 'Akademisi', 'Praktisi Berpengalaman'].map((item) => (
              <div key={item} className="flex items-center gap-4 bg-academic-50/50 p-4 rounded-xl border border-academic-100">
                <div className="bg-brand-100 text-brand-700 p-2 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-academic-800">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Alur Menjadi Reviewer */}
        <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 md:p-10 mb-12 overflow-hidden">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-12 border-b border-academic-100 pb-4 text-center sm:text-left">Alur Menjadi Reviewer</h2>
          <div className="relative pt-4 pb-8 md:py-0">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-brand-100 -translate-y-1/2 rounded-full"></div>
            
            {/* Vertical Line for Mobile */}
            <div className="md:hidden absolute top-0 left-8 h-full w-1 bg-brand-100 -translate-x-1/2 rounded-full z-0"></div>

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4">
              {[
                { title: 'Daftar Akun', icon: UserPlus, desc: 'Pilih role Mitra Bebestari saat membuat akun baru.' },
                { title: 'Lengkapi Profil', icon: GraduationCap, desc: 'Isi institusi, fakultas, dan bidang keahlian.' },
                { title: 'Upload CV', icon: UploadCloud, desc: 'Lampirkan CV dan link publikasi ilmiah terkini.' },
                { title: 'Verifikasi', icon: ShieldCheck, desc: 'Admin akan memeriksa kesesuaian keahlian Anda.' },
                { title: 'Persetujuan', icon: CheckSquare, desc: 'Mendapat notifikasi status persetujuan akun.' },
                { title: 'Aktif Reviewer', icon: Scale, desc: 'Menerima penugasan review naskah dari Editor.' }
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex md:flex-col items-center md:flex-1 group relative">
                    <div className="flex-shrink-0 w-16 h-16 md:mb-6 bg-white border-4 border-brand-50 rounded-full flex items-center justify-center text-brand-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-800 z-10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-6 md:ml-0 md:text-center p-5 md:p-4 bg-white border border-academic-100 rounded-xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-brand-300 flex-1 md:w-full">
                      <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1.5 opacity-80">Tahap {index + 1}</div>
                      <h3 className="font-bold text-academic-900 text-sm md:text-base mb-2">{step.title}</h3>
                      <p className="text-xs text-academic-600 hidden md:block leading-relaxed">{step.desc}</p>
                      <p className="text-sm text-academic-600 md:hidden leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Section: Tugas Reviewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-brand-50 text-brand-700 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Tugas Reviewer</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Menilai kualitas ilmiah artikel secara mendalam',
                'Menilai ketepatan dan ketelitian metodologi penelitian',
                'Mengevaluasi relevansi referensi dan kepustakaan',
                'Memberikan rekomendasi perbaikan yang konstruktif',
                'Menjaga kerahasiaan naskah yang belum diterbitkan'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="min-w-2 h-2 rounded-full bg-brand-400 mt-2.5 transition-transform group-hover:scale-150" />
                  <span className="text-academic-700 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Prinsip Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Prinsip Review</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Objektif dalam memberikan penilaian',
                'Independen dari intervensi pihak luar',
                'Profesional dan menggunakan bahasa yang akademis',
                'Rahasia (tidak membagikan naskah review ke pihak lain)',
                'Bebas dari segala jenis Konflik Kepentingan'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="min-w-2 h-2 rounded-full bg-indigo-400 mt-2.5 transition-transform group-hover:scale-150" />
                  <span className="text-academic-700 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Section: Keputusan Review */}
        <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 md:p-10 mb-12">
          <div className="flex items-center gap-4 mb-8 border-b border-academic-100 pb-5">
            <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Rekomendasi Keputusan</h2>
          </div>
          <p className="text-academic-700 mb-6 text-lg">Setelah melakukan telaah, reviewer diharapkan memberikan salah satu rekomendasi berikut:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
             {[
               { label: 'Accept', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }, 
               { label: 'Minor Revision', color: 'bg-blue-50 text-blue-800 border-blue-200' }, 
               { label: 'Major Revision', color: 'bg-amber-50 text-amber-800 border-amber-200' }, 
               { label: 'Reject', color: 'bg-rose-50 text-rose-800 border-rose-200' }
              ].map((item) => (
              <div key={item.label} className={`flex items-center justify-center p-4 rounded-xl border font-bold text-sm md:text-base ${item.color} shadow-sm hover:shadow-md transition-shadow`}>
                {item.label}
              </div>
            ))}
          </div>
          <p className="text-sm italic text-academic-500 bg-academic-50 px-4 py-3 rounded-lg inline-block font-medium border border-academic-100">
            * Catatan: Keputusan akhir penerimaan artikel tetap merupakan kewenangan Editor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Section: Hak Reviewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-teal-50 text-teal-700 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Hak Reviewer</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Mendapatkan akses penuh ke artikel yang ditugaskan',
                'Mendapatkan pengakuan formal sebagai reviewer jurnal',
                'Mendapatkan Sertifikat Penghargaan (opsional sesuai kebijakan)',
                'Mendapatkan rekam jejak aktivitas review di sistem'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <CheckCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                  <span className="text-academic-700 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Kewajiban Reviewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Kewajiban Reviewer</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Menjaga kerahasiaan naskah di setiap tahapan',
                'Memberikan penilaian yang objektif dan bebas bias',
                'Melaporkan segala potensi konflik kepentingan kepada Editor',
                'Menyelesaikan tugas review tepat waktu sesuai tenggat (deadline)'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-academic-700 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-academic-200">
          <Link to="/register" className="flex items-center gap-2 px-8 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <UserPlus className="w-5 h-5" />
            Daftar Sebagai Reviewer
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50 text-brand-800 font-bold rounded-xl shadow-sm transition-all">
            <LogIn className="w-5 h-5" />
            Login Reviewer
          </Link>
          <Link to="/etika-publikasi" className="flex items-center gap-2 px-6 py-3 text-academic-600 hover:text-brand-700 font-bold rounded-xl transition-colors">
            <BookOpen className="w-5 h-5" />
            Kode Etik
          </Link>
          <Link to="/proses-peer-review" className="flex items-center gap-2 px-6 py-3 text-academic-600 hover:text-brand-700 font-bold rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            Peer Review Process
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
