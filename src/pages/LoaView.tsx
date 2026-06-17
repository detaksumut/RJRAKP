import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft, Loader, ShieldCheck } from 'lucide-react';

export default function LoaView() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (articleId) {
      fetchLoaDetails();
    }
  }, [articleId]);

  const fetchLoaDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          status,
          submission_date,
          journals (name, slug),
          users!submitter_id (id, full_name, email, institution),
          article_authors (*),
          acceptance_letters (*)
        `)
        .eq('id', articleId)
        .single();

      if (err) throw err;
      if (!data) throw new Error('Artikel tidak ditemukan.');
      
      const hasLoa = data.acceptance_letters && (Array.isArray(data.acceptance_letters) ? data.acceptance_letters.length > 0 : !!data.acceptance_letters);
      if (!hasLoa) {
        throw new Error('Letter of Acceptance (LoA) belum diterbitkan untuk artikel ini.');
      }
      
      setArticle(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat dokumen LoA.');
    } finally {
      setLoading(false);
    }
  };

  const getCleanTitle = (title: string) => {
    return title ? title.replace(/^\[SINTA \d+\]\s*/i, '') : '';
  };

  const getTargetPublikasi = (title: string) => {
    if (!title) return 'Jurnal Internasional';
    const match = title.match(/^\[(SINTA \d+)\]/i);
    if (match) {
      return match[1];
    }
    return 'Jurnal Internasional';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader className="w-8 h-8 text-brand-700 animate-spin mb-2" />
        <p className="text-academic-600 text-sm">Memuat dokumen LoA...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-xl p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-rose-700 mb-2">Terjadi Kesalahan</h2>
          <p className="text-academic-600 text-sm mb-6">{error || 'Dokumen tidak ditemukan.'}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white text-xs font-bold rounded-lg hover:bg-brand-800 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>
    );
  }

  const loaData = Array.isArray(article.acceptance_letters) ? article.acceptance_letters[0] : article.acceptance_letters;
  const target = getTargetPublikasi(article.title);
  const cleanTitle = getCleanTitle(article.title);
  const authorsText = article.article_authors?.map((a: any) => a.full_name).join(', ') || article.users?.full_name || '-';
  
  const correspondingAuthor = article.article_authors?.find((a: any) => a.is_corresponding) || article.article_authors?.[0] || {
    full_name: article.users?.full_name || 'Penulis',
    affiliation: article.users?.institution || '-'
  };

  const issuedDateFormatted = new Date(loaData.issued_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:py-0 print:bg-white">
      {/* Print styles style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: #fff !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            padding: 1.5cm 1.5cm !important; 
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />

      {/* Toolbar / Actions (No Print) */}
      <div className="max-w-[800px] mx-auto mb-6 px-4 no-print flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-academic-300 rounded-lg text-xs font-bold text-academic-700 hover:bg-academic-50 shadow-sm transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button 
          onClick={() => window.print()} 
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider"
        >
          <Printer className="w-4 h-4" /> Cetak LoA (Print / PDF)
        </button>
      </div>

      {/* Official LOA Document container */}
      <div className="max-w-[800px] mx-auto bg-white border border-slate-300 shadow-2xl p-10 md:p-12 print-container relative flex flex-col justify-between min-h-[920px] font-sans text-academic-950">
        
        <div>
          {/* Official Letterhead */}
          <div className="flex items-center gap-6 border-b-4 border-double border-academic-950 pb-4 mb-5">
            <img src="/logo-rjrakp.png" alt="RJRAKP Logo" className="h-26 w-auto object-contain shrink-0" />
            <div className="flex-1 text-center" style={{ paddingRight: '128px' }}>
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide leading-tight">
                Rumah Jurnal Riset, Analisis dan Keadilan Publik
              </h1>
              <h2 className="text-xl md:text-2xl font-serif font-black tracking-widest text-brand-900 leading-none mt-1">
                RJRAKP
              </h2>
              <p className="text-[10px] text-academic-600 font-semibold mt-2">
                Sekretariat: Gedung LSM MSRI, Jalan H.M. Joni No. 11, Kode Pos 20216, Medan, Sumatera Utara
              </p>
              <p className="text-[10px] text-brand-700 font-bold mt-0.5">
                Email: redaksi@rjrakp.com | Website: https://rjrakp.com
              </p>
            </div>
          </div>

          {/* LOA Title and Number */}
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold uppercase tracking-wider underline font-serif">
              Letter of Acceptance (LoA)
            </h3>
            <p className="text-sm font-semibold text-academic-700 mt-1">
              Nomor: {loaData.letter_number}
            </p>
          </div>

          {/* Recipient Details */}
          <div className="mb-4 text-sm space-y-1">
            <p className="font-bold">Kepada Yth.</p>
            <p className="font-bold text-academic-900">{correspondingAuthor.full_name} (Corresponding Author)</p>
            <p className="text-academic-700">{correspondingAuthor.affiliation || article.users?.institution}</p>
            <p className="text-academic-600">{correspondingAuthor.country || 'Indonesia'}</p>
          </div>

          {/* Content Body */}
          <div className="text-sm leading-relaxed text-justify space-y-4">
            <p>
              Dengan ini dinyatakan bahwa artikel berjudul "<strong>{cleanTitle}</strong>" telah diterima (Accepted) untuk diproses publikasi melalui Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP) sesuai target publikasi yang dipilih oleh penulis.
            </p>

            {/* Article Metadata Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 border-b border-slate-200/50 pb-2">
                <span className="text-xs font-bold text-academic-500 uppercase tracking-wider col-span-1">Judul Artikel</span>
                <span className="text-sm font-bold text-academic-900 font-serif leading-snug col-span-3">"{cleanTitle}"</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 border-b border-slate-200/50 pb-2">
                <span className="text-xs font-bold text-academic-500 uppercase tracking-wider col-span-1">Nama Penulis</span>
                <span className="text-sm font-semibold text-academic-800 col-span-3">{authorsText}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 border-b border-slate-200/50 pb-2">
                <span className="text-xs font-bold text-academic-500 uppercase tracking-wider col-span-1">Status</span>
                <span className="text-sm font-black text-emerald-700 col-span-3 uppercase tracking-wider">Accepted for Publication</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 pb-1">
                <span className="text-xs font-bold text-academic-500 uppercase tracking-wider col-span-1">Target Publikasi</span>
                <span className="text-sm font-black text-brand-800 col-span-3 uppercase tracking-wider">{target}</span>
              </div>
            </div>

            <p>
              Artikel tersebut telah melalui proses **Evaluasi Internal RJRAKP** (Initial Screening & Editorial Review) dan dinyatakan memenuhi kelayakan ilmiah untuk diteruskan ke tahap publikasi formal. Naskah saat ini sedang disiapkan untuk dimasukkan ke dalam antrean penerbitan pada terbitan jurnal berkala RJRAKP.
            </p>
          </div>
        </div>

        {/* Signature & Seal block */}
        <div className="flex flex-col items-end text-sm mt-5">
          <div className="text-left w-64 space-y-6">
            <div>
              <p>Medan, {issuedDateFormatted}</p>
              <p className="font-bold text-academic-800 mt-1">Publisher RJRAKP</p>
            </div>
            
            {/* Signature Area */}
            <div className="relative h-16 flex items-center">
              {/* Official Stamp Image */}
              <img 
                src="/stempel-rjrakp.png" 
                alt="Stempel Resmi RJRAKP" 
                className="absolute left-[-35px] top-[-32px] w-32 h-32 object-contain select-none pointer-events-none z-20 mix-blend-multiply"
                style={{ mixBlendMode: 'multiply' }}
              />
              <p className="font-serif italic font-bold text-academic-700 text-lg border-b border-academic-300 pb-1 z-10 select-none">
                dto Publisher
              </p>
            </div>

            <div>
              <p className="font-bold text-academic-900 underline">Muhibbuddin</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
