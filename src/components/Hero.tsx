import { ArrowRight, Search, BookOpen, Sparkles, ShieldCheck, Globe, Users } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardModal from './BoardModal';
import ElsevierLogo from '../assets/logoelsevier.png';

export default function Hero() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/publikasi?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        
        {/* Top Banner: OJS & Connected (Moved right below top menu) */}
        <div className="flex flex-col items-center justify-center w-full mb-10 lg:mb-16 border-b border-white/10 pb-8 pt-4">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="inline-flex bg-slate-100/10 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-200/20 items-center gap-2 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-slate-300" />
              <span>Fully Compatible with OJS 3</span>
            </div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-300 font-black">Connected</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
            
            <a href="https://www.scopus.com/dashboard.uri?origin=&zone=TopNavBar" target="_blank" rel="noopener noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Scopus_logo.svg" alt="Scopus" className="h-10 md:h-14 transition-all duration-300 transform hover:scale-110 cursor-pointer" />
            </a>
            
            <img src="https://assets.crossref.org/logo/crossref-logo-landscape-200.svg" alt="Crossref logo" className="h-9 md:h-12 transition-all duration-300 transform hover:scale-110 cursor-pointer" />


            <a href="https://scholar.google.com/citations?user=EoHXXg0AAAAJ&hl=en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg" alt="Google Scholar Logo" className="h-10 md:h-14" />
              <span className="text-white font-bold text-lg md:text-2xl font-sans tracking-tight">Google Scholar</span>
            </a>

            <a href="https://zenodo.org/me/uploads?q=&f=shared_with_me%3Afalse&l=list&p=1&s=10&sort=newest" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="/zenodo.png" alt="Zenodo Logo" className="h-10 md:h-14 rounded-md" />
            </a>

            <a href="https://www.doi.org" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/DOI_logo.svg" alt="DOI Logo" className="h-10 md:h-14" />
            </a>

            <a href="https://orcid.org/my-orcid?orcid=0009-0006-8416-6156" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg" alt="ORCID Logo" className="h-10 md:h-14" />
            </a>

            <a href="https://www.webofscience.com/wos/author/record/QKY-3514-2026" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="/logo-WebofScience.png" alt="Web of Science Logo" className="h-9 md:h-12 bg-white/95 rounded-lg px-2.5 py-1.5 shadow-sm" />
            </a>

            <a href="https://explore.openaire.eu/search/advanced/research-outcomes?f0=resultauthor&fv0=Muhibbuddin%20Mr" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src="/OpenAIRE.png" alt="OpenAIRE Logo" className="h-9 md:h-12 bg-white/95 rounded-lg px-2.5 py-1.5 shadow-sm" />
            </a>

            <a href="https://hq.ssrn.com/login/authentication.cfm?partid=11897288" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 transform hover:scale-110 cursor-pointer">
              <img src={ElsevierLogo} alt="Elsevier Logo" className="h-8 md:h-10 bg-white/95 rounded shadow-sm px-2 py-1" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & Search */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-center text-left"
          >

            {/* Top Badges / Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-inner backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>Sistem Informasi Publikasi Ilmiah</span>
              </div>
              <button 
                onClick={() => setIsBoardModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-800/40 border border-brand-500/30 text-brand-100 text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-inner backdrop-blur-md hover:bg-brand-700/60 hover:border-brand-400/50 hover:text-white transition-all cursor-pointer group"
              >
                <Users className="w-3.5 h-3.5 text-brand-400 group-hover:text-brand-300" />
                <span>Dewan Pengurus</span>
              </button>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-serif font-black text-white leading-tight tracking-tight">
              Rumah Jurnal Riset,
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-amber-500 to-accent-600 font-sans tracking-wide">
                Analisis & Keadilan
              </span>
              Publik Indonesia
            </h1>

            {/* Subtitle - Professional Academic Description */}
            <p className="mt-6 text-[15px] sm:text-base text-brand-100/90 max-w-2xl leading-relaxed font-medium">
              RJRAKP berkomitmen menyediakan platform publikasi ilmiah bertaraf internasional melalui sistem <strong>Open Journal Systems (OJS)</strong> yang transparan. Melalui proses <strong>Double-Blind Peer Review</strong> yang ketat, kami menjamin kualitas akademis setiap naskah. Kami mendedikasikan komitmen penuh untuk kemajuan ilmu pengetahuan terbuka (Open Access) dan penyebaran karya Anda ke berbagai lembaga pengindeks global bergengsi.
            </p>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 items-center">
              <a 
                href="/#jurnal" 
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-xl font-bold text-[10px] sm:text-xs shadow-lg text-brand-950 bg-gradient-to-r from-accent-400 to-amber-400 hover:from-accent-500 hover:to-amber-500 hover:shadow-accent-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-wider whitespace-nowrap"
              >
                Membaca Jurnal <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a 
                href="/portofolio-rjrakp.png" 
                download="Portofolio_RJRAKP.png"
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-xl font-bold text-[10px] sm:text-xs shadow-lg text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-wider whitespace-nowrap"
              >
                Unduh Portofolio
              </a>
              <a 
                href="/pedoman" 
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 border border-white/10 text-[10px] sm:text-xs font-bold rounded-xl text-white/80 bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-0.5 duration-200 uppercase tracking-wider whitespace-nowrap"
              >
                Panduan Penulis
              </a>
            </div>

            {/* Advanced AI-like Search Bar */}
            <form onSubmit={handleSearch} className="mt-10 bg-white/5 p-2 rounded-2xl shadow-2xl border border-white/10 max-w-xl flex backdrop-blur-md focus-within:border-accent-500/40 focus-within:ring-4 focus-within:ring-accent-500/10 transition-all duration-300">
              <div className="flex bg-brand-950/50 flex-1 rounded-xl border border-white/5 overflow-hidden items-center">
                <div className="pl-4">
                  <Search className="h-5 w-5 text-brand-300/40" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-3 pr-3 py-3.5 border-0 focus:ring-0 text-sm text-white placeholder-brand-200/40 rounded-xl outline-none bg-transparent"
                  placeholder="Cari artikel, penulis, atau kata kunci..."
                />
                <button type="submit" className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-brand-950 font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:shadow-lg transition-all duration-300 m-1.5 rounded-lg active:scale-95">
                  Cari
                </button>
              </div>
            </form>
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

              {/* Floating Badge 1 - Top Left (Moved) */}

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
