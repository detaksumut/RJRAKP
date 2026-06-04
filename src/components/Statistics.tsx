import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Statistics() {
  const [stats, setStats] = useState([
    { label: 'Artikel Terpublikasi', value: '1,245+', id: 'published' },
    { label: 'Jurnal Aktif', value: '5', id: 'journals' },
    { label: 'Penulis', value: '3,500+', id: 'authors' },
    { label: 'Reviewer', value: '450+', id: 'reviewers' }
  ]);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const [pubRes, journalRes, authorRes, reviewerRes] = await Promise.all([
          supabase.from('publications').select('*', { count: 'exact', head: true }),
          supabase.from('journals').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'reviewer'),
        ]);
        
        setStats([
          { label: 'Artikel Terpublikasi', value: (pubRes.count || 0).toString(), id: 'published' },
          { label: 'Jurnal Aktif', value: (journalRes.count || 0).toString(), id: 'journals' },
          { label: 'Penulis', value: (authorRes.count || 0).toString(), id: 'authors' },
          { label: 'Reviewer', value: (reviewerRes.count || 0).toString(), id: 'reviewers' }
        ]);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="bg-brand-900 border-t-4 border-accent-600 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4 divide-x divide-brand-700">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center px-4 flex flex-col items-center justify-center">
              <p className="text-2xl sm:text-3xl font-bold font-sans text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs font-semibold text-accent-500 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
