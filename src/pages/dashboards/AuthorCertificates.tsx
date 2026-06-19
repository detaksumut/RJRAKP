import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Award, Printer, Calendar, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AuthorCertificates() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPublications();
    }
  }, [user?.id]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select(`
          id,
          publication_date,
          doi,
          volume_number,
          issue_number,
          articles!inner (
            id,
            title,
            journal_id,
            submitter_id,
            journals ( name, slug, p_issn, e_issn )
          )
        `)
        .eq('articles.submitter_id', user.id);

      if (error) throw error;
      setPublications(data || []);
    } catch (err) {
      console.error('Error fetching publications for certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCertificate = (pub: any) => {
    const article = pub.articles;
    const journal = article?.journals;
    
    const certNumber = `CERT/RJRAKP/${(journal?.slug || 'JR').toUpperCase()}/${new Date(pub.publication_date).getFullYear()}/${pub.id.substring(0, 8).toUpperCase()}`;
    const verificationCode = pub.id.substring(0, 18).toUpperCase();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://rjrakp.ac.id/verify-cert/${verificationCode}`)}`;
    const formattedDate = new Date(pub.publication_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const logoUrl = window.location.origin + '/logo-rjrakp.png';
    const badgeUrl = window.location.origin + '/badge-terbit.png';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Sertifikat Publikasi - ${user?.full_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet">
<style>
@page { size: A4 landscape; margin: 0; }
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
body { width: 297mm; height: 210mm; font-family: 'Inter', sans-serif; background: #ccc; }

.page {
  width: 297mm; height: 210mm; position: relative; overflow: hidden;
  background: linear-gradient(145deg, #fefcf3 0%, #fdf8e8 30%, #fefcf3 60%, #faf2d8 100%);
}

/* ==================== BORDERS ==================== */
.bdr { position: absolute; z-index: 2; }
.bdr-t { top:0; left:0; right:0; height: 7mm; background: linear-gradient(90deg, #071329, #0d1f45, #142d5c, #0d1f45, #071329); }
.bdr-b { bottom:0; left:0; right:0; height: 7mm; background: linear-gradient(90deg, #071329, #0d1f45, #142d5c, #0d1f45, #071329); }
.bdr-l { top:0; left:0; bottom:0; width: 7mm; background: linear-gradient(180deg, #071329, #0d1f45, #142d5c, #0d1f45, #071329); }
.bdr-r { top:0; right:0; bottom:0; width: 7mm; background: linear-gradient(180deg, #071329, #0d1f45, #142d5c, #0d1f45, #071329); }

/* Gold lines */
.gl { position: absolute; z-index: 3; }
.gl-t { top: 7mm; left: 7mm; right: 7mm; height: 1mm; background: linear-gradient(90deg, #8b6914, #c9a227, #f0d060, #c9a227, #8b6914); }
.gl-b { bottom: 7mm; left: 7mm; right: 7mm; height: 1mm; background: linear-gradient(90deg, #8b6914, #c9a227, #f0d060, #c9a227, #8b6914); }
.gl-l { top: 7mm; left: 7mm; bottom: 7mm; width: 1mm; background: linear-gradient(180deg, #8b6914, #c9a227, #f0d060, #c9a227, #8b6914); }
.gl-r { top: 7mm; right: 7mm; bottom: 7mm; width: 1mm; background: linear-gradient(180deg, #8b6914, #c9a227, #f0d060, #c9a227, #8b6914); }

/* Corner decorations */
.cn { position: absolute; z-index: 4; width: 15mm; height: 15mm; }
.cn-tl { top: 9mm; left: 9mm; border-top: 2px solid #c9a227; border-left: 2px solid #c9a227; }
.cn-tr { top: 9mm; right: 9mm; border-top: 2px solid #c9a227; border-right: 2px solid #c9a227; }
.cn-bl { bottom: 9mm; left: 9mm; border-bottom: 2px solid #c9a227; border-left: 2px solid #c9a227; }
.cn-br { bottom: 9mm; right: 9mm; border-bottom: 2px solid #c9a227; border-right: 2px solid #c9a227; }

/* Curved side decorations */
.curve-l {
  position: absolute; left: 1mm; top: 50%; transform: translateY(-50%);
  width: 10mm; height: 65mm; border: 2px solid #c9a227; border-right: none;
  border-radius: 35mm 0 0 35mm; z-index: 4;
}
.curve-r {
  position: absolute; right: 1mm; top: 50%; transform: translateY(-50%);
  width: 10mm; height: 65mm; border: 2px solid #c9a227; border-left: none;
  border-radius: 0 35mm 35mm 0; z-index: 4;
}

/* ==================== LAYOUT ==================== */
.layout {
  position: absolute; top: 9mm; left: 9mm; right: 9mm; bottom: 9mm;
  display: flex; z-index: 10;
}

/* Main content */
.main {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 5mm 8mm 4mm 10mm; position: relative;
}

/* Right sidebar */
.sidebar {
  width: 50mm; display: flex; flex-direction: column; justify-content: center;
  gap: 5mm; padding: 8mm 3mm 6mm 5mm;
  border-left: 1px solid rgba(201,162,39,0.3);
}

/* ==================== HEADER ==================== */
.hdr { display: flex; align-items: center; justify-content: center; gap: 5mm; margin-bottom: 5mm; }
.hdr-logo img { width: 19mm; height: auto; display: block; }
.hdr-txt { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.hdr-rj { font-family: 'Cinzel', 'Playfair Display', serif; font-size: 17px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 6px; line-height: 1; }
.hdr-name { font-family: 'Cinzel', 'Playfair Display', serif; font-size: 24px; font-weight: 900; color: #0a1a3f; line-height: 1.1; letter-spacing: 1.5px; margin-top: 2.3mm; }
.hdr-tag { font-size: 11px; color: #a17a0e; font-style: italic; letter-spacing: 3px; margin-top: 3mm; line-height: 1.2; font-weight: 800; }

/* ==================== TITLE ==================== */
.ttl { text-align: center; margin-top: 10mm; margin-bottom: 3mm; }
.ttl-main {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 40px; font-weight: 900; color: #0a1a3f;
  text-transform: uppercase; letter-spacing: 5px; line-height: 1;
  text-shadow: 1px 1px 2px rgba(201,162,39,0.15);
}
.ttl-bar {
  display: inline-block; margin-top: 2mm;
  background: linear-gradient(135deg, #0a1a3f, #152a5a);
  color: #ffd700; padding: 1.5mm 7mm;
  font-size: 9px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;
  border-radius: 1mm;
}

/* ==================== BODY ==================== */
.body {
  text-align: center; flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; width: 100%;
  position: relative; padding: 0 5mm;
}
.cert-no { font-size: 9px; color: #6b7280; margin-bottom: 3mm; letter-spacing: 0.5px; }
.body-label { font-size: 10.5px; color: #374151; margin-bottom: 1mm; }
.recipient {
  font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900;
  color: #0a1a3f; margin: 1mm 0 3mm 0; padding-bottom: 1.5mm;
  border-bottom: 2px dotted #b0b8c8; min-width: 120mm; display: inline-block;
}
.art-title {
  font-size: 11px; font-weight: 700; font-style: italic;
  color: #0f172a; line-height: 1.5; margin: 1mm 0 2mm 0; max-width: 170mm;
}
.pub-note { font-size: 9.5px; color: #374151; line-height: 1.6; }
.pub-note strong { color: #0a1a3f; font-weight: 800; }

/* TERBIT RESMI badge */
.badge {
  position: absolute; left: -2mm; top: 50%; transform: translateY(-50%);
  width: 25mm; height: auto; z-index: 20;
}
.badge img {
  width: 100%;
  height: auto;
}

/* ==================== DETAILS ROW ==================== */
.det-row { display: flex; justify-content: center; gap: 3mm; margin: 3mm 0; width: 100%; }
.det-box {
  border: 1px solid #c9c9c9; border-radius: 2mm; padding: 2mm 4mm;
  text-align: left; min-width: 48mm; background: rgba(255,255,255,0.4);
  display: flex; align-items: center; gap: 2mm;
}
.det-icon {
  width: 7mm; height: 7mm; border-radius: 50%;
  background: linear-gradient(135deg, #0a1a3f, #152a5a);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: #ffd700; flex-shrink: 0;
}
.det-info { flex: 1; }
.det-lbl { font-size: 6.5px; color: #9ca3af; font-weight: 600; }
.det-val { font-size: 8.5px; color: #0f172a; font-weight: 700; margin-top: 0.3mm; }

.loc-date { font-size: 8.5px; color: #4b5563; margin: 2mm 0; }

/* ==================== FOOTER ==================== */
.ftr { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding: 0 3mm; }
.ftr-col { width: 50mm; text-align: center; }
.ftr-role { font-size: 8.5px; font-weight: 800; color: #0a1a3f; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15mm; }
.ftr-center { text-align: center; width: 40mm; display: flex; flex-direction: column; align-items: center; }
.seal-ring {
  width: 22mm; height: 22mm; border: 2px solid #0a1a3f; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.7);
}
.seal-ring img { width: 16mm; height: auto; }

/* QR Code */
.qr-area { position: absolute; bottom: 2mm; left: 2mm; display: flex; flex-direction: column; align-items: center; z-index: 15; }
.qr-area img { width: 15mm; height: 15mm; background: white; border: 1px solid #e5e7eb; }
.qr-code-text { font-size: 4.5px; color: #9ca3af; margin-top: 0.5mm; text-align: center; max-width: 18mm; word-break: break-all; }

/* ==================== SIDEBAR VALUES ==================== */
.val-item { display: flex; align-items: flex-start; gap: 2mm; }
.val-icon {
  width: 8mm; height: 8mm; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #0a1a3f, #152a5a);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #ffd700;
}
.val-info { flex: 1; }
.val-title { font-size: 7.5px; font-weight: 900; color: #0a1a3f; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.5mm; }
.val-desc { font-size: 6px; color: #6b7280; line-height: 1.4; }
</style>
</head>
<body>
<div class="page">
  <!-- Borders -->
  <div class="bdr bdr-t"></div><div class="bdr bdr-b"></div><div class="bdr bdr-l"></div><div class="bdr bdr-r"></div>
  <div class="gl gl-t"></div><div class="gl gl-b"></div><div class="gl gl-l"></div><div class="gl gl-r"></div>
  <div class="cn cn-tl"></div><div class="cn cn-tr"></div><div class="cn cn-bl"></div><div class="cn cn-br"></div>
  <div class="curve-l"></div><div class="curve-r"></div>

  <div class="layout">
    <!-- ===== MAIN CONTENT ===== -->
    <div class="main">

      <!-- Header -->
      <div class="hdr">
        <div class="hdr-logo"><img src="${logoUrl}" alt="RJRAKP" /></div>
        <div class="hdr-txt">
          <div class="hdr-rj">RUMAH JURNAL</div>
          <div class="hdr-name">RISET, ANALISIS DAN KEADILAN PUBLIK</div>
          <div class="hdr-tag">Integritas &middot; Transparansi &middot; Akademik &middot; Keadilan</div>
        </div>
      </div>

      <!-- Title -->
      <div class="ttl">
        <div class="ttl-main">SERTIFIKAT</div>
        <div class="ttl-bar">Publikasi Artikel Ilmiah</div>
      </div>

      <!-- Body -->
      <div class="body">
        <!-- TERBIT RESMI Badge -->
        <div class="badge">
          <img src="${badgeUrl}" alt="Terbit Resmi" />
        </div>

        <div class="cert-no">Nomor: ${certNumber}</div>
        <div class="body-label">Dengan bangga diberikan kepada:</div>
        <div class="recipient">${user?.full_name}</div>
        <div class="body-label">atas kontribusinya sebagai penulis pada artikel berjudul:</div>
        <div class="art-title">"${article?.title}"</div>
        <div class="pub-note">
          yang telah diterbitkan dalam jurnal terindeks yang dikelola oleh<br/>
          <strong>Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)</strong>
        </div>

        <!-- Detail boxes -->
        <div class="det-row">
          <div class="det-box">
            <div class="det-icon">📅</div>
            <div class="det-info">
              <div class="det-lbl">Volume:</div>
              <div class="det-val">${pub.volume_number}</div>
              <div class="det-lbl" style="margin-top:1mm">Nomor:</div>
              <div class="det-val">${pub.issue_number}</div>
            </div>
          </div>
          <div class="det-box">
            <div class="det-icon">📋</div>
            <div class="det-info">
              <div class="det-lbl">ISSN:</div>
              <div class="det-val">${journal?.p_issn || '—'}</div>
              <div class="det-lbl" style="margin-top:1mm">E-ISSN:</div>
              <div class="det-val">${journal?.e_issn || '—'}</div>
            </div>
          </div>
          <div class="det-box">
            <div class="det-icon">🌐</div>
            <div class="det-info">
              <div class="det-lbl">Website:</div>
              <div class="det-val">www.rjrakp.com</div>
            </div>
          </div>
        </div>

        <div class="loc-date">Ditetapkan di: Samarinda &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; Tanggal: ${formattedDate}</div>
      </div>

      <!-- Footer -->
      <div class="ftr">
        <div class="ftr-col">
          <div class="ftr-role">Direktur</div>
        </div>
        <div class="ftr-center">
          <div class="seal-ring">
            <img src="${logoUrl}" alt="Seal" />
          </div>
        </div>
        <div class="ftr-col">
          <div class="ftr-role">Editor in Chief</div>
        </div>
      </div>

      <!-- QR Code -->
      <div class="qr-area">
        <img src="${qrCodeUrl}" alt="QR" />
        <div class="qr-code-text">${verificationCode}</div>
      </div>
    </div>

    <!-- ===== SIDEBAR ===== -->
    <div class="sidebar">
      <div class="val-item">
        <div class="val-icon">⚖</div>
        <div class="val-info">
          <div class="val-title">Integritas</div>
          <div class="val-desc">Menjunjung tinggi kejujuran akademik dan etika publikasi</div>
        </div>
      </div>
      <div class="val-item">
        <div class="val-icon">🔍</div>
        <div class="val-info">
          <div class="val-title">Transparansi</div>
          <div class="val-desc">Proses yang terbuka, jelas, dan dapat dipertanggungjawabkan</div>
        </div>
      </div>
      <div class="val-item">
        <div class="val-icon">📖</div>
        <div class="val-info">
          <div class="val-title">Akademik</div>
          <div class="val-desc">Mendorong kualitas dan kebermanfaatan ilmu pengetahuan</div>
        </div>
      </div>
      <div class="val-item">
        <div class="val-icon">🏛</div>
        <div class="val-info">
          <div class="val-title">Keadilan</div>
          <div class="val-desc">Berkomitmen pada keadilan dan kepentingan publik</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 600);
  };
<\/script>
</body>
</html>`);
      printWindow.document.close();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        
        {/* Premium Banner */}
        <div className="bg-gradient-to-r from-academic-950 via-brand-900 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden border border-brand-800">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-white/5 font-bold text-9xl font-serif select-none pointer-events-none">
            RJ
          </div>
          <div className="relative z-10 space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Sertifikasi Akademis
            </span>
            <h1 className="text-3xl font-serif font-black tracking-tight text-white sm:text-4xl">
              Apresiasi Riset & Publikasi
            </h1>
            <p className="text-sm text-brand-200/90 leading-relaxed font-medium">
              Unduh dan kelola sertifikat penghargaan atas kontribusi ilmiah Anda dalam memublikasikan naskah riset terbaik di Rumah Jurnal RJRAKP.
            </p>
          </div>
        </div>

        {/* Loading / Content */}
        {loading ? (
          <div className="text-center py-20 text-academic-500 font-medium bg-white rounded-2xl border border-academic-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Memuat Galeri Sertifikat Anda...
          </div>
        ) : publications.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-academic-200 shadow-sm text-center text-academic-500 max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 border border-amber-100 shadow-inner">
              <Award className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-serif font-black text-academic-900 mb-3">Belum Ada Sertifikat Publikasi</h3>
            <p className="text-sm text-academic-500 max-w-md leading-relaxed mb-6 font-medium">
              Sertifikat penghargaan akan otomatis diterbitkan di halaman ini setelah artikel ilmiah Anda selesai diproses, disetujui, dan resmi diterbitkan di salah satu jurnal kami.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-4">Daftar Sertifikat Terbit ({publications.length})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publications.map((pub) => {
                const article = pub.articles;
                const journal = article?.journals;
                const formattedDate = new Date(pub.publication_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });

                return (
                  <div key={pub.id} className="bg-white rounded-3xl border border-academic-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="space-y-5">
                      {/* Mini Certificate Preview */}
                      <div className="w-full h-44 rounded-2xl relative overflow-hidden select-none shadow-md border border-academic-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fefcf3] via-[#fdf8e8] to-[#faf2d8]"></div>
                        {/* Navy borders */}
                        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-[#071329] via-[#142d5c] to-[#071329]"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gradient-to-r from-[#071329] via-[#142d5c] to-[#071329]"></div>
                        <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-gradient-to-b from-[#071329] via-[#142d5c] to-[#071329]"></div>
                        <div className="absolute top-0 right-0 bottom-0 w-[5px] bg-gradient-to-b from-[#071329] via-[#142d5c] to-[#071329]"></div>
                        {/* Gold lines */}
                        <div className="absolute top-[5px] left-[5px] right-[5px] h-[1px] bg-gradient-to-r from-[#8b6914] via-[#f0d060] to-[#8b6914]"></div>
                        <div className="absolute bottom-[5px] left-[5px] right-[5px] h-[1px] bg-gradient-to-r from-[#8b6914] via-[#f0d060] to-[#8b6914]"></div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full px-5 py-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <img src="/logo-rjrakp.png" alt="Logo" className="w-6 h-6 object-contain" />
                            <div className="text-center flex flex-col items-center font-serif">
                              <div className="text-[7px] text-[#475569] font-bold uppercase tracking-widest leading-none">RUMAH JURNAL</div>
                              <div className="text-[10px] font-black text-[#0a1a3f] leading-tight mt-0.5">RISET, ANALISIS & KEADILAN PUBLIK</div>
                            </div>
                          </div>
                          <div className="text-[14px] font-black text-[#0a1a3f] uppercase tracking-[3px] leading-none mb-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>SERTIFIKAT</div>
                          <div className="bg-[#0a1a3f] text-[#ffd700] text-[4px] font-bold px-2 py-[2px] rounded-[1px] uppercase tracking-[2px] mb-1.5">Publikasi Artikel Ilmiah</div>
                          
                          <div className="text-[10px] font-black text-[#0a1a3f] leading-tight truncate max-w-[220px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{user?.full_name}</div>
                          <div className="text-[5px] italic text-[#4b5563] line-clamp-1 max-w-[220px] mt-0.5">"{article?.title}"</div>
                          
                          <div className="w-full flex justify-between items-end mt-auto pt-1">
                            <div className="flex items-center gap-0.5">
                              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f0d060] flex items-center justify-center shadow-sm">
                                <span className="text-[4px] font-black text-[#0a1a3f]">✓</span>
                              </div>
                              <span className="text-[4px] font-bold text-[#8b6914] uppercase">Terbit Resmi</span>
                            </div>
                            <span className="text-[5px] font-bold text-[#0a1a3f] uppercase tracking-wider">{journal?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="inline-block text-[9px] font-black text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            {journal?.name || 'Jurnal'}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            <CheckCircle className="w-3 h-3" /> Terbit
                          </span>
                        </div>

                        <h4 className="font-serif font-black text-academic-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
                          {article?.title}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-academic-100 text-[11px] text-academic-600 font-medium">
                          <div>
                            <span className="text-[9px] font-bold text-academic-400 uppercase tracking-widest block mb-0.5">Edisi Jurnal</span>
                            <span className="text-academic-800 font-semibold">Vol. {pub.volume_number} No. {pub.issue_number}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-academic-400 uppercase tracking-widest block mb-0.5">Tanggal Terbit</span>
                            <span className="text-academic-800 font-semibold">{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-academic-100 flex items-center justify-between gap-4">
                      <span className="text-[9px] font-mono font-bold text-academic-400 uppercase tracking-widest">
                        ID: {pub.id.substring(0, 8).toUpperCase()}
                      </span>
                      <button
                        onClick={() => handlePrintCertificate(pub)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer shrink-0 border-t border-white/20"
                      >
                        <Printer className="w-4 h-4" /> Cetak / Unduh PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
