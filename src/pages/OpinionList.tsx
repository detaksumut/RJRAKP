import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, User, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OpinionList() {
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpinions() {
      try {
        const { data, error } = await supabase
          .from('opinions')
          .select('*, users(full_name, institution)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching opinions:", error.message);
        } else if (data) {
          setOpinions(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpinions();
  }, []);

  // Helper to extract a short preview text from opinion content
  const getSnippet = (text: string, maxLength: number = 180) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>/g, ''); // strip HTML if any
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100/80 text-amber-800 mb-4 shadow-sm border border-amber-200/50">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-900 mb-4 tracking-tight">Opini Mahasiswa</h1>
          <p className="text-academic-600 text-lg">
            Kumpulan gagasan, opini, dan telaah kritis kritis mahasiswa mitra RJRAKP mengenai berbagai isu kebijakan publik dan fenomena sosial terkini.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-academic-500 mt-4 font-semibold text-sm">Memuat opini mahasiswa...</p>
          </div>
        ) : opinions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-academic-200/80 p-8 shadow-sm">
            <p className="text-academic-500 text-lg mb-2">Belum ada opini yang dipublikasikan.</p>
            <p className="text-academic-400 text-sm">Kembali beberapa saat lagi untuk membaca opini mahasiswa kami.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {opinions.map((opinion) => {
              const formattedDate = new Date(opinion.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <article key={opinion.id} className="bg-white rounded-2xl border border-academic-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 hover:border-amber-300">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/opini/${opinion.slug}`} className="group inline-block">
                        <h2 className="text-xl md:text-2xl font-bold font-serif text-academic-900 leading-tight mb-3 group-hover:text-amber-700 transition-colors">
                          {opinion.title}
                        </h2>
                      </Link>
                      <p className="text-academic-600 text-sm md:text-base mb-6 leading-relaxed">
                        {getSnippet(opinion.content)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-academic-100 mt-auto text-xs sm:text-sm text-academic-500 font-medium">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-academic-800">{opinion.users?.full_name || 'Mahasiswa'}</span>
                          {opinion.users?.institution && (
                            <span className="text-academic-400">({opinion.users.institution})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-academic-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <Link to={`/opini/${opinion.slug}`} className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold transition-colors group">
                        Baca Selengkapnya
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
