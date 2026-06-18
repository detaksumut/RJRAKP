import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Eye, Download, Calendar, BookOpen, Clock } from 'lucide-react';

export default function AuthorLoa() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserLoas();
    }
  }, [user]);

  const fetchUserLoas = async () => {
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
          journals (name),
          acceptance_letters (*)
        `)
        .eq('submitter_id', user?.id)
        .order('submission_date', { ascending: false });

      if (err) throw err;
      setArticles(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data Acceptance Letter.');
    } finally {
      setLoading(false);
    }
  };

  const getCleanTitle = (title: string) => {
    return title.replace(/^\[(SINTA \d+|Jurnal Perkuliahan \(Non SINTA\)|Jurnal Internasional \(Non SINTA\))\]\s*/i, '');
  };

  const getTargetPublikasi = (title: string) => {
    const match = title.match(/^\[(SINTA \d+|Jurnal Perkuliahan \(Non SINTA\)|Jurnal Internasional \(Non SINTA\))\]/i);
    if (match) {
      return match[1];
    }
    return 'Jurnal Internasional (Non SINTA)';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Acceptance Letter (LoA)</h1>
          <p className="text-academic-500">Unduh dokumen Letter of Acceptance (LoA) untuk artikel Anda yang telah disetujui.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-6 font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-academic-500 font-medium bg-white border border-academic-200 rounded-xl shadow-sm">
            Memuat data Acceptance Letter...
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-academic-200 shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-academic-800 mb-1">Belum Ada Riwayat Pengajuan</h3>
            <p className="text-academic-500 text-sm max-w-sm mx-auto">Anda belum mengirimkan manuskrip artikel apa pun ke dalam sistem.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((art) => {
              const hasLoa = art.acceptance_letters && (Array.isArray(art.acceptance_letters) ? art.acceptance_letters.length > 0 : !!art.acceptance_letters);
              const loaData = hasLoa ? (Array.isArray(art.acceptance_letters) ? art.acceptance_letters[0] : art.acceptance_letters) : null;
              const cleanTitle = getCleanTitle(art.title);
              const target = getTargetPublikasi(art.title);
              const formattedDate = new Date(art.submission_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div key={art.id} className="bg-white rounded-xl border border-academic-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-block text-[9px] font-bold tracking-wider text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 uppercase">
                        {art.journals?.name || 'Jurnal'}
                      </span>
                      <span className={`inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${
                        hasLoa ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100'
                      }`}>
                        Target: {target}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-academic-900 text-base leading-snug line-clamp-2">
                      {cleanTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-academic-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Disubmit: {formattedDate}
                      </span>
                      {loaData && (
                        <span className="flex items-center gap-1 text-brand-700 font-semibold">
                          <FileText className="w-3.5 h-3.5" /> No. LOA: {loaData.letter_number}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 md:w-48 justify-end">
                    {hasLoa ? (
                      <>
                        <a 
                          href={`/loa/${art.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center w-full uppercase tracking-wider"
                        >
                          <Eye className="w-4 h-4" /> Lihat / Cetak LoA
                        </a>
                      </>
                    ) : (
                      <div className="bg-academic-50 border border-academic-100 rounded-lg p-3 text-center flex items-center justify-center gap-2 text-academic-500 text-xs w-full">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>LoA Belum Diterbitkan</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
