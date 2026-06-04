import { ArrowRight, Search, BookOpen, Sparkles, ShieldCheck, Globe, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import BoardModal from './BoardModal';

export default function Hero() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  return (
    <div className="relative bg-gradient-to-b from-[#061122] via-[#091b35] to-[#040d1a] min-h-[650px] lg:min-h-[750px] overflow-hidden flex items-center py-16 lg:py-24">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-brand-500/15 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent-500/15 blur-[140px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-indigo-500/8 blur-[110px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <BoardModal isOpen={isBoardModalOpen} onClose={() => setIsBoardModalOpen(false)} />

      {/* Grid Pattern overlay with radial fade */}
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & Search */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-center text-left"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent-400 text-xs font-bold tracking-wider uppercase mb-6 w-fit shadow-inner backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-accent-500 animate-spin-slow" />
              <span>Sistem Informasi Publikasi Ilmiah Terakreditasi</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-serif font-black text-white leading-tight tracking-tight">
              Rumah Jurnal Riset,
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-amber-500 to-accent-600 font-sans tracking-wide">
                Analisis & Keadilan
              </span>
              Publik Indonesia
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-brand-100/80 max-w-2xl leading-relaxed font-medium">
              Mewujudkan keterbukaan ilmiah dan tata kelola pemerintahan yang bersih melalui publikasi riset terapan di bidang kebijakan publik, hukum, teknologi, pendidikan, dan kebudayaan Islam.
            </p>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <a 
                href="/#jurnal" 
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[11px] shadow-lg text-brand-950 bg-gradient-to-r from-accent-400 to-amber-400 hover:from-accent-500 hover:to-amber-500 hover:shadow-accent-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-widest"
              >
                Membaca Jurnal <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button 
                onClick={() => setIsBoardModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-[11px] font-black rounded-xl text-white bg-white/10 hover:bg-white/20 hover:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-widest backdrop-blur-sm"
              >
                <Users className="w-4 h-4 text-accent-400" />
                Dewan Pengurus
              </button>
              <a 
                href="/pedoman" 
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 text-[11px] font-black rounded-xl text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-widest"
              >
                Panduan Penulis
              </a>
            </div>

            {/* Advanced AI-like Search Bar */}
            <div className="mt-10 bg-white/5 p-2 rounded-2xl shadow-2xl border border-white/10 max-w-xl flex backdrop-blur-md focus-within:border-accent-500/40 focus-within:ring-4 focus-within:ring-accent-500/10 transition-all duration-300">
              <div className="flex bg-brand-950/50 flex-1 rounded-xl border border-white/5 overflow-hidden items-center">
                <div className="pl-4">
                  <Search className="h-5 w-5 text-brand-300/40" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-3 pr-3 py-3.5 border-0 focus:ring-0 text-sm text-white placeholder-brand-200/40 rounded-xl outline-none bg-transparent"
                  placeholder="Cari artikel, kata kunci penulis, atau DOI..."
                />
                <button className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-brand-950 font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:shadow-lg transition-all duration-300 m-1.5 rounded-lg active:scale-95">
                  Cari
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Academic/Research Image Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 relative flex justify-center items-center"
          >
            {/* Decorative background glow behind image */}
            <div className="absolute w-96 h-96 rounded-full bg-accent-500/10 blur-[100px] -z-10 animate-pulse" />
            
            {/* Elegant Image Container with Glassmorphic Border */}
            <div className="relative mx-auto w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden bg-white/5 border border-white/10 p-3 group hover:border-accent-500/30 transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] bg-brand-950">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  src="/academic_hero.png"
                  alt="Prestigious Academic Institution Facade"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute -top-1 -left-1 bg-brand-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[9px] font-bold text-accent-400 shadow-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                <span>OJS 3 Verified</span>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute bottom-6 right-6 bg-brand-950/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-bold text-white shadow-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5 text-accent-500 animate-pulse" />
                <span>Riset & Publikasi Global</span>
              </div>

              {/* Floating Badge 3 - Bottom Left */}
              <div className="absolute bottom-6 left-6 bg-brand-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[9px] font-bold text-emerald-400 shadow-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-widest">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Open Access</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
