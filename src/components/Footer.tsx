import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS } from '../data';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-academic-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-4 mb-6">
              <div className="w-48 h-48 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="RJRAKP Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                <BookOpen className="h-12 w-12 text-brand-900 hidden" />
              </div>
            </Link>
            <p className="text-academic-500 text-[11px] leading-relaxed mb-6 font-medium pr-4">
              Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP) mendedikasikan diri untuk publikasi ilmiah berkualitas demi transparansi, akuntabilitas, dan keadilan publik.
            </p>
          </div>

          {/* Nav & Resources Group (Side by side on mobile) */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            {/* Nav */}
            <div>
              <h3 className="text-academic-900 text-[11px] font-bold uppercase tracking-widest mb-6">Pintasan Cepat</h3>
              <ul className="space-y-3">
                {MENU_ITEMS.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-academic-900 text-[11px] font-bold uppercase tracking-widest mb-6">Informasi</h3>
              <ul className="space-y-3">
                <li><Link to="/tentang" className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">Tentang Kami</Link></li>
                <li><Link to="/pedoman" className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">Panduan Penulisan</Link></li>

                <li><Link to="/etika-publikasi" className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">Etika Publikasi</Link></li>
                <li><Link to="/proses-peer-review" className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">Proses Peer Review</Link></li>
                <li><Link to="/hak-cipta" className="text-academic-500 hover:text-brand-700 transition-colors text-xs font-semibold">Lisensi & Hak Cipta</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div id="kontak">
            <h3 className="text-academic-900 text-[11px] font-bold uppercase tracking-widest mb-6">Kontak Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
                <span className="text-academic-600 text-xs leading-relaxed font-semibold">
                  Gedung LSM MSRI<br />
                  Jalan HM Joni No. 11 Kode Pos 20216<br />
                  Medan, Provinsi Sumatera Utara
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent-600 shrink-0" />
                <span className="text-academic-600 text-xs font-semibold">
                  WA HP : +62 811665212
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent-600 shrink-0" />
                <span className="text-academic-600 text-xs font-semibold">
                  rjrakp@rj.beritaindonesia.news
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 border-t-4 border-accent-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center shrink-0">
          <div className="flex justify-center items-center gap-6 md:gap-10 mb-6">
            <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-2xl backdrop-blur-sm border border-white/10 h-24 md:h-28 flex items-center justify-center">
              <img src="/logo-bernas.png.png" alt="PT. Bernas Sumut Jaya" className="h-16 md:h-20 w-auto object-contain" />
            </div>
            <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-2xl backdrop-blur-sm border border-white/10 h-24 md:h-28 flex items-center justify-center">
              <img src="/logo-binews.png.png" alt="BeritaIndonesia.News" className="h-16 md:h-20 w-auto object-contain" />
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="grid grid-cols-2 gap-x-0 gap-y-1 w-full max-w-lg mx-auto relative mb-6">
               {/* Center vertical divider */}
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2"></div>
               
               {/* Row 1: Labels */}
               <div className="text-right text-[10px] md:text-xs uppercase tracking-widest text-accent-500 font-black pr-4 md:pr-6">Penerbit</div>
               <div className="text-left text-[10px] md:text-xs uppercase tracking-widest text-accent-500 font-black pl-4 md:pl-6">Supervisi</div>
               
               {/* Row 2: Values */}
               <div className="text-right text-xs md:text-sm font-bold text-white pr-4 md:pr-6">PT. Bernas Sumut Jaya</div>
               <div className="text-left text-xs md:text-sm font-bold text-white pl-4 md:pl-6">BeritaIndonesia.News</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl text-center backdrop-blur-sm">
              <h4 className="text-accent-400 text-[10px] uppercase tracking-widest font-bold mb-2">Kebijakan Pengarsipan (Archiving Policy)</h4>
              <p className="text-white/70 text-xs leading-relaxed">
                Jurnal ini menggunakan sistem <strong>LOCKSS</strong> (Lots of Copies Keep Stuff Safe) dan <strong>PKP Preservation Network (PN)</strong> untuk membuat sistem pengarsipan terdistribusi di antara perpustakaan yang berpartisipasi dan mengizinkan perpustakaan tersebut untuk membuat arsip permanen dari jurnal untuk tujuan pelestarian dan pemulihan.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase mt-8">
            &copy; {new Date().getFullYear()} Rumah Jurnal Riset, Analisis dan Keadilan Publik. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
