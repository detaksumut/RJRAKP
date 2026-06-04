import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Building2, Users, Target, BookOpen, Search, Scale, FileText, Monitor, Globe, Award, ShieldCheck, HeartHandshake, Eye, BarChart, Gavel } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const values = [
    { icon: <ShieldCheck className="w-6 h-6 text-accent-600" />, title: 'Integritas', desc: 'Menjunjung tinggi kejujuran dan etika dalam setiap tahapan publikasi ilmiah.' },
    { icon: <Scale className="w-6 h-6 text-accent-600" />, title: 'Independensi', desc: 'Bebas dari intervensi pihak manapun untuk menjaga marwah dan kualitas akademik.' },
    { icon: <Eye className="w-6 h-6 text-accent-600" />, title: 'Objektivitas', desc: 'Menilai dan memutuskan berdasarkan fakta dan standar keilmuan yang terukur.' },
    { icon: <Award className="w-6 h-6 text-accent-600" />, title: 'Profesionalisme', desc: 'Bekerja dengan standar kompetensi tinggi dan komitmen pada kualitas.' },
    { icon: <Search className="w-6 h-6 text-accent-600" />, title: 'Transparansi', desc: 'Keterbukaan dalam proses editorial, review, dan pengelolaan jurnal.' },
    { icon: <BarChart className="w-6 h-6 text-accent-600" />, title: 'Akuntabilitas', desc: 'Kinerja yang dapat dipertanggungjawabkan kepada masyarakat dan komunitas akademik.' },
    { icon: <Gavel className="w-6 h-6 text-accent-600" />, title: 'Keadilan Publik', desc: 'Berpihak pada nilai-nilai kebenaran, keadilan, dan kesejahteraan masyarakat luas.' }
  ];

  const activities = [
    { icon: <BookOpen className="w-6 h-6" />, title: 'Penerbitan Jurnal Ilmiah' },
    { icon: <FileText className="w-6 h-6" />, title: 'Publikasi Penelitian' },
    { icon: <Scale className="w-6 h-6" />, title: 'Kajian Hukum' },
    { icon: <Target className="w-6 h-6" />, title: 'Kajian Kebijakan Publik' },
    { icon: <Users className="w-6 h-6" />, title: 'Seminar dan Pelatihan' },
    { icon: <Monitor className="w-6 h-6" />, title: 'Pengembangan Teknologi Publikasi' },
    { icon: <Globe className="w-6 h-6" />, title: 'Kerja Sama Akademik' },
    { icon: <FileText className="w-6 h-6" />, title: 'Policy Brief dan Kajian Strategis' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-brand-950 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent-500 text-white text-xs font-bold tracking-widest uppercase mb-6">
              Profil RJRAKP
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
              Tentang Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)
            </h1>
            <p className="text-lg sm:text-xl text-brand-100/80 font-medium max-w-2xl mx-auto">
              "Publikasi Ilmiah untuk Transparansi, Akuntabilitas, dan Keadilan Publik"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Profil & Pendiri */}
      <section className="py-16 md:py-24 bg-academic-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-8 md:p-10 rounded-2xl border border-academic-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-brand-700" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-academic-900">Profil Lembaga</h2>
              </div>
              <p className="text-academic-600 leading-relaxed mb-6 font-medium text-justify">
                Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP) adalah lembaga akademik independen yang didedikasikan untuk memajukan literasi, riset, dan analisis berbasis bukti. Kami hadir sebagai platform strategis bagi para akademisi, peneliti, praktisi hukum, dan pembuat kebijakan.
              </p>
              
              <div className="mt-8 pt-8 border-t border-academic-100">
                 <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-accent-700" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-academic-900">Kedudukan</h2>
                </div>
                <p className="text-academic-600 leading-relaxed font-medium text-justify">
                  Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP) merupakan lembaga publikasi ilmiah yang berada di bawah naungan dan pembinaan LSM Rumah Jurnal Riset, Analisis dan Keadilan Publik.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-8 md:p-10 rounded-2xl border border-academic-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-700" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-academic-900">Pendiri</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-academic-50 border border-academic-100">
                  <div className="w-12 h-12 rounded-full bg-brand-800 text-white flex flex-shrink-0 items-center justify-center font-bold font-serif text-lg">MD</div>
                  <div>
                    <h3 className="text-lg font-bold text-academic-900">Dr. Muhammad Danil, M.Pd.</h3>
                    <p className="text-sm text-academic-500 font-medium">Pendiri & Pembina</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-academic-50 border border-academic-100">
                  <div className="w-12 h-12 rounded-full bg-brand-800 text-white flex flex-shrink-0 items-center justify-center font-bold font-serif text-lg">MR</div>
                  <div>
                    <h3 className="text-lg font-bold text-academic-900">Muhibbuddin Abdul Rahman</h3>
                    <p className="text-sm text-academic-500 font-medium">Pendiri & Pembina</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-academic-50 border border-academic-100">
                  <div className="w-12 h-12 rounded-full bg-brand-800 text-white flex flex-shrink-0 items-center justify-center font-bold font-serif text-lg">RS</div>
                  <div>
                    <h3 className="text-lg font-bold text-academic-900">Robbi Shahary, SH.MH</h3>
                    <p className="text-sm text-academic-500 font-medium">Pendiri & Pembina</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-academic-100 flex items-center justify-between">
                <span className="text-sm font-bold text-academic-500 uppercase tracking-widest">Tanggal Pendirian</span>
                <span className="text-base font-bold text-brand-800 border-b-2 border-accent-500 pb-1">..............................</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visi, Misi, Tujuan */}
      <section className="py-16 md:py-24 bg-white border-y border-academic-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Arah Strategis</h2>
            <p className="text-3xl md:text-4xl font-serif font-bold text-academic-900">Visi, Misi, & Tujuan</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-brand-900 p-8 rounded-2xl shadow-lg relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 -m-6 text-brand-800 opacity-50">
                <Target className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                  <div className="h-px w-8 bg-accent-500"></div> Visi
                </h3>
                <p className="text-brand-100/90 leading-relaxed font-medium">
                  Menjadi pusat publikasi ilmiah dan referensi independen yang terkemuka di tingkat nasional dan internasional, dalam rangka mewujudkan transparansi, akuntabilitas kebijakan, dan keadilan sosial bagi seluruh lapisan masyarakat pada tahun 2030.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-academic-50 border border-academic-200 p-8 rounded-2xl h-full">
              <h3 className="text-2xl font-serif font-bold text-academic-900 mb-6 flex items-center gap-3">
                <div className="h-px w-8 bg-brand-600"></div> Misi
              </h3>
              <ol className="list-decimal list-outside ml-4 space-y-4 text-academic-600 font-medium">
                <li className="pl-2">Menerbitkan jurnal ilmiah dan hasil riset berkualitas yang berfokus pada keadilan publik, hukum, dan transparansi kebijakan.</li>
                <li className="pl-2">Menyediakan ruang diskursus akademik yang independen bagi peneliti, akademisi, dan praktisi.</li>
                <li className="pl-2">Mendorong perumusan kebijakan publik yang berbasis pada data, bukti (evidence-based), dan nilai-nilai keadilan.</li>
                <li className="pl-2">Mengembangkan literasi dan kesadaran masyarakat tentang pentingnya tata kelola pemerintahan yang baik.</li>
              </ol>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-academic-50 border border-academic-200 p-8 rounded-2xl h-full">
              <h3 className="text-2xl font-serif font-bold text-academic-900 mb-6 flex items-center gap-3">
                <div className="h-px w-8 bg-brand-600"></div> Tujuan
              </h3>
              <ol className="list-decimal list-outside ml-4 space-y-4 text-academic-600 font-medium">
                <li className="pl-2">Meningkatkan kuantitas dan kualitas publikasi ilmiah yang terakreditasi secara nasional dan internasional.</li>
                <li className="pl-2">Membangun jejaring kolaborasi antara perguruan tinggi, lembaga pemerintah, dan masyarakat sipil.</li>
                <li className="pl-2">Menghasilkan policy brief dan rekomendasi kebijakan yang berdampak langsung pada kesejahteraan publik.</li>
                <li className="pl-2">Menjadikan RJRAKP sebagai rujukan literatur kredibel di bidang hukum, administrasi publik, dan keadilan sosial.</li>
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nilai-Nilai Dasar */}
      <section className="py-16 md:py-24 bg-academic-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Prinsip & Landasan</h2>
            <p className="text-3xl md:text-4xl font-serif font-bold text-academic-900">Nilai-Nilai Dasar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-accent-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-academic-900 mb-3">{v.title}</h3>
                <p className="text-sm text-academic-500 font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bidang Kegiatan */}
      <section className="py-16 md:py-24 bg-white border-t border-academic-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="flex flex-col items-start">
              <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Fokus & Implementasi</h2>
              <p className="text-2xl font-bold text-academic-900 sm:text-3xl border-l-4 border-accent-600 pl-3 uppercase tracking-wider italic font-serif">
                Bidang Kegiatan
              </p>
            </div>
            <p className="mt-4 md:mt-0 max-w-sm text-sm text-academic-500 font-medium leading-relaxed hidden md:block">
              RJRAKP secara aktif mengembangkan berbagai program strategis guna mewujudkan misi keadilan dan transparansi publik melalui literasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activities.map((act, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-academic-200 bg-white hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <div className="w-10 h-10 bg-academic-100 rounded-lg flex items-center justify-center text-brand-700 group-hover:bg-white transition-colors shrink-0">
                  {act.icon}
                </div>
                <h4 className="font-bold text-academic-800 text-sm">{act.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Komitmen RJRAKP */}
      <section className="py-20 lg:py-28 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-center" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <HeartHandshake className="w-16 h-16 text-accent-500 mx-auto mb-8" />
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-8">
            Komitmen RJRAKP
          </h2>
          <p className="text-lg lg:text-xl text-brand-100 leading-relaxed font-medium mb-10">
            Kami meyakini bahwa transparansi dan keadilan bukanlah sekadar retorika, melainkan capaian nyata yang harus dikawal dengan data, penelitian mendalam, dan pemikiran kritis. RJRAKP hadir sebagai dedikasi tanpa kompromi untuk mencerahkan ruang publik Indonesia.
          </p>
          <div className="h-px w-24 bg-accent-500 mx-auto"></div>
        </div>
      </section>

      <Footer />
    </>
  );
}
