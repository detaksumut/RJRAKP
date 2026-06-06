import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function JurnalList() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('journals')
      .select('*, journal_scopes(name), articles(count)')
      .order('name')
      .then(({ data }) => {
        if (data) setJournals(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-900 mb-4 tracking-tight">Daftar Jurnal</h1>
          <p className="text-academic-600 text-lg">Rumah Jurnal RJRAKP mengelola multi-jurnal untuk mempublikasikan artikel di berbagai disiplin ilmu dengan standar akademik tertinggi.</p>
        </div>

        {loading ? (
          <div className="text-center text-academic-500 py-10">Memuat daftar jurnal...</div>
        ) : journals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-academic-500 mb-4">Belum ada data jurnal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {journals.map((journal: any) => {
              const getJournalImage = (slug: string) => {
                switch (slug) {
                  case 'audit-kebijakan-publik':
                    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
                  case 'hukum-dan-keadilan':
                    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
                  case 'pendidikan-dan-pembelajaran':
                    return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';
                  case 'teknik-dan-teknologi':
                    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                  case 'agama-dan-peradaban-islam':
                    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80';
                  case 'ekonomi-dan-bisnis':
                    return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80';
                  case 'ilmu-pertanian-dan-agribisnis':
                    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80';
                  default:
                    return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';
                }
              };
              const image = getJournalImage(journal.slug);
              const color = journal.metadata?.color || 'bg-slate-50';
              const articleCount = journal.articles?.[0]?.count || 0;
              const submitLink = user 
                ? (user.role === 'author' ? '/dashboard/author/submit' : `/dashboard/${user.role}`) 
                : '/register/author';

              return (
              <div key={journal.id} className="bg-white rounded-2xl border border-academic-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="relative h-48 w-full border-b border-academic-100 overflow-hidden">
                  <div className={`absolute inset-0 opacity-15 ${color}`} />
                  <img 
                    src={image} 
                    alt={journal.name} 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-800 shadow-sm flex items-center border border-white/40">
                    <FileText className="w-3 h-3 mr-1.5" />
                    {articleCount} Artikel
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-academic-900 leading-tight mb-3">
                    {journal.name}
                  </h2>
                  <p className="text-academic-600 text-sm mb-5 leading-relaxed">
                    {journal.description}
                  </p>
                  
                  <div className="bg-academic-50 p-4 rounded-xl mb-6 flex-grow border border-academic-100/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-800 mb-2">Focus & Scope</h3>
                    {journal.journal_scopes && journal.journal_scopes.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-sm text-academic-700 font-medium">
                        {journal.journal_scopes.map((scope: any, idx: number) => (
                          <li key={idx}>{scope.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium text-academic-700 leading-relaxed">-</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-academic-100 mt-auto">
                    <Link to={`/jurnal/${journal.slug}`} className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-sm rounded-lg border border-brand-200 transition-colors">
                      <BookOpen className="w-4 h-4" />
                      Lihat Jurnal
                    </Link>
                    <Link to={submitLink} className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-brand-700 text-white hover:bg-brand-800 font-bold text-sm rounded-lg shadow-sm transition-colors group">
                      Submit Artikel
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
