import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, UserPlus, LogIn, Settings, BookOpen, 
  ShieldCheck, FileText, CheckSquare, ClipboardList, 
  Briefcase, Eye, Award, FileSearch, Sparkles, Scale, RefreshCw,
  Fingerprint, Hash, Workflow, TrendingUp
} from 'lucide-react';

export default function PanduanEditor() {
  return (
    <div className="min-h-screen bg-academic-50/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-48 h-48 bg-brand-500/5 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Kualifikasi Tim Editorial RJRAKP</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-black text-academic-900 mb-6 tracking-tight">
            Panduan & Skema Kerja Editor
          </h1>
          <p className="text-lg md:text-xl text-academic-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Pedoman komprehensif bagi Dewan Redaksi (*Editorial Board*) dalam mengelola naskah masuk, melakukan koordinasi peer-review, hingga mengambil keputusan akhir publikasi.
          </p>
        </div>

        {/* Section: Siapa yang dapat menjadi editor */}
        <div className="bg-white rounded-3xl shadow-sm border border-academic-200 p-8 md:p-10 mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/5 rounded-bl-full -z-10" />
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8 pb-4 border-b border-academic-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-600" /> Kualifikasi Dewan Redaksi (Editor)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Pendidikan Akademis Tinggi',
                desc: 'Memiliki gelar minimal Doktor (S3) atau pakar profesional dengan rekam jejak riset kuat di bidang kepakarannya.'
              },
              {
                title: 'Reputasi Publikasi Terindeks',
                desc: 'Telah menerbitkan artikel ilmiah pada jurnal nasional terakreditasi (SINTA) atau jurnal internasional bereputasi.'
              },
              {
                title: 'Komitmen Etika Keilmuan',
                desc: 'Memahami prinsip-prinsip etika publikasi ilmiah internasional (COPE) dan berkomitmen menjaga integritas jurnal.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-academic-50/50 p-6 rounded-2xl border border-academic-100 flex flex-col hover:border-brand-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4 font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-academic-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-academic-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Alur Skema Kerja Editor */}
        <div className="bg-white rounded-3xl shadow-sm border border-academic-200 p-8 md:p-10 mb-12 relative overflow-hidden">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-12 border-b border-academic-100 pb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-600 animate-spin-slow" /> Alur & Skema Kerja Editor
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: '1. Pra-Pemeriksaan Naskah', icon: FileText, desc: 'Editor menerima naskah baru, menyaring kelayakan scope jurnal, kelengkapan berkas, dan tingkat plagiasi (Turnitin).' },
              { title: '2. Pencocokan Keahlian', icon: FileSearch, desc: 'Editor mencari Reviewer yang memiliki rekam jejak kepakaran yang cocok dengan subjek naskah secara double-blind.' },
              { title: '3. Penugasan Reviewer', icon: UserPlus, desc: 'Menetapkan setidaknya 2 Reviewer melalui dashboard editor, menyertakan manuskrip, dan menetapkan batas waktu review.' },
              { title: '4. Monitoring & Remind', icon: ClipboardList, desc: 'Memantau jalannya evaluasi sejawat, melakukan re-routing jika reviewer mengundurkan diri, dan mengirim reminder batas waktu.' },
              { title: '5. Keputusan Editorial', icon: CheckSquare, desc: 'Mengumpulkan ulasan reviewer, menelaah catatan penulis, lalu menetapkan keputusan final: Accept, Revise, atau Reject.' },
              { title: '6. Editing & Penerbitan', icon: Award, desc: 'Mengarahkan naskah lolos ke copyeditor/layouter, mendaftarkan nomor DOI Crossref, dan mengelompokkan ke Issue aktif.' }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-academic-50/30 p-5 rounded-2xl border border-academic-100 hover:shadow-md hover:border-brand-200 transition-all group flex flex-col h-full">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-700 shadow-sm border border-academic-100 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-bold text-academic-900 text-sm md:text-base mb-2 group-hover:text-brand-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-academic-600 leading-relaxed font-medium flex-1">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Instrumen & Sistem Kerja Terintegrasi */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-3xl p-8 md:p-10 mb-12 relative overflow-hidden shadow-lg border border-brand-850">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-brand-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Teknologi Jurnal</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-white">
                  Instrumen & Sistem Kerja Terintegrasi
                </h2>
              </div>
              <p className="text-sm text-brand-200 max-w-md font-medium leading-relaxed">
                Editor RJRAKP bekerja dengan infrastruktur jurnal digital modern untuk memastikan integritas akademis dan indeksasi global tercepat.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Similarity Checker',
                  tool: 'Turnitin & Plagiarism',
                  icon: Fingerprint,
                  desc: 'Pengecekan kesamaan teks otomatis di awal penerimaan naskah dengan toleransi kemiripan maksimal 20%.',
                  color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                },
                {
                  title: 'DOI Registrator',
                  tool: 'Crossref System',
                  icon: Hash,
                  desc: 'Registrasi otomatis Digital Object Identifier (DOI) aktif untuk menjamin persistensi sitasi artikel.',
                  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                },
                {
                  title: 'Sistem OJS 3',
                  tool: 'Editorial Platform',
                  icon: Settings,
                  desc: 'Platform Open Journal System versi 3 untuk pengelolaan review, revisi, layout, hingga penerbitan.',
                  color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                },
                {
                  title: 'Index & API Feed',
                  tool: 'Indexing Engine',
                  icon: TrendingUp,
                  desc: 'Sindikasi otomatis ke Google Scholar, SINTA, Garuda, dan portal sitasi internasional setelah isu dirilis.',
                  color: 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-brand-950/40 border border-brand-800 p-5 rounded-2xl flex flex-col justify-between hover:border-accent-500/40 hover:bg-brand-950/70 transition-all group h-full">
                     <div>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${item.color}`}>
                         <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="text-[10px] font-bold text-accent-400 tracking-wider uppercase mb-1">{item.tool}</div>
                       <h3 className="font-bold text-white text-base mb-2 group-hover:text-accent-300 transition-colors">{item.title}</h3>
                       <p className="text-xs text-brand-300 leading-relaxed font-medium">{item.desc}</p>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section: Duties & Rights Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Tugas Editor */}
          <div className="bg-white rounded-3xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-brand-50 text-brand-700 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Etika & Tanggung Jawab</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Menjamin objektivitas review tanpa bias SARA atau institusi penulis.',
                'Menjaga kerahasiaan naskah yang ditinjau sebelum resmi terbit.',
                'Mencegah segala bentuk konflik kepentingan finansial maupun akademis.',
                'Bertindak tegas terhadap indikasi fabrikasi data atau plagiarisme naskah.',
                'Merespon masukan, sanggahan, atau banding revisi dari penulis secara profesional.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="min-w-2 h-2 rounded-full bg-brand-400 mt-2.5 transition-transform group-hover:scale-150" />
                  <span className="text-academic-700 text-xs md:text-sm leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kewenangan Editor */}
          <div className="bg-white rounded-3xl shadow-sm border border-academic-200 p-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-academic-100 pb-5">
              <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-900">Kewenangan Editorial</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Menolak naskah di tahap penyaringan awal jika tidak sesuai scope jurnal.',
                'Membatalkan penugasan reviewer yang tidak merespon/terlambat berulang kali.',
                'Mengambil keputusan akhir penerimaan berdasarkan substansi dan revisi.',
                'Meminta penulis melakukan perbaikan format, data pendukung, atau tata bahasa.',
                'Mempublikasikan naskah di volume/isu yang paling relevan secara berkala.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="min-w-2 h-2 rounded-full bg-indigo-400 mt-2.5 transition-transform group-hover:scale-150" />
                  <span className="text-academic-700 text-xs md:text-sm leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-academic-200">
          <Link to="/register/editor" className="flex items-center gap-2 px-8 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <UserPlus className="w-5 h-5" />
            Gabung Sebagai Editor
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50 text-brand-800 font-bold rounded-xl shadow-sm transition-all">
            <LogIn className="w-5 h-5" />
            Dashboard Editor
          </Link>
          <Link to="/etika-publikasi" className="flex items-center gap-2 px-6 py-3 text-academic-600 hover:text-brand-700 font-bold rounded-xl transition-colors">
            <BookOpen className="w-5 h-5" />
            Kode Etik
          </Link>
          <Link to="/proses-peer-review" className="flex items-center gap-2 px-6 py-3 text-academic-600 hover:text-brand-700 font-bold rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            Proses Review
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
