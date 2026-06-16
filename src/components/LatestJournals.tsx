import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LatestJournals() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('journals')
      .select('*, journal_scopes(name)')
      .limit(3)
      .then(({ data }) => {
        if (data) setJournals(data);
        setLoading(false);
      });
  }, []);

  return (
    <section id="jurnal" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="flex flex-col items-start">
            <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Publikasi Berkala</h2>
            <p className="text-2xl font-bold text-academic-900 sm:text-3xl border-l-4 border-accent-600 pl-3 uppercase tracking-wider italic font-serif">
              Jurnal Terbaru
            </p>
          </div>
          <Link to="/jurnal" className="mt-4 md:mt-0 flex items-center text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors uppercase tracking-widest">
            Lihat semua <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-academic-500 py-10">Memuat jurnal...</div>
        ) : journals.length === 0 ? (
          <div className="text-center text-academic-500 py-10 border border-academic-200 rounded-xl bg-academic-50">Belum ada data jurnal.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal: any) => {
              const getJournalImage = (slug: string) => {
                return '/logo-rjrakp.png';
              };
              const scopes = journal.journal_scopes?.map((s: any) => s.name).join(', ') || journal.metadata?.focus || '-';
              const image = getJournalImage(journal.slug);
              const color = journal.metadata?.color || 'bg-slate-50';

              return (
              <div key={journal.id} className="group rounded-xl border border-academic-200 overflow-hidden bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full overflow-hidden border-b border-academic-100 flex items-center justify-center bg-slate-50 p-6">
                  <div className={`absolute inset-0 opacity-10 ${color}`} />
                  <img 
                    src={image} 
                    alt={journal.name} 
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-all duration-500 z-10"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-[15px] font-bold text-academic-800 leading-snug mb-3 line-clamp-2">
                    {journal.name}
                  </h3>
                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-start text-[11px] text-academic-600 line-clamp-2 leading-relaxed">
                      <span className="font-bold w-12 text-brand-800 uppercase tracking-wide shrink-0">Fokus</span>
                      <span>: {scopes}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-academic-50 border-t border-academic-100 mt-auto">
                  <Link to={`/jurnal/${journal.slug}`} className="text-xs font-bold text-brand-700 flex items-center gap-2 w-full justify-between hover:text-brand-800 transition-colors">
                    <span>Kunjungi Jurnal</span>
                    <BookOpen className="w-4 h-4 text-brand-500" />
                  </Link>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </section>
  );
}
