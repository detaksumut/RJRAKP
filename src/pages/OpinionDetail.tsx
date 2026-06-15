import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Calendar, ArrowLeft, BookOpen, Share2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OpinionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [opinion, setOpinion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpinionDetail() {
      try {
        if (!slug) return;
        const { data, error } = await supabase
          .from('opinions')
          .select('*, users(full_name, institution)')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error("Error fetching opinion details:", error.message);
        } else {
          setOpinion(data);
        }
      } catch (err) {
        console.error("Detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpinionDetail();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opinion?.title,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link opini berhasil disalin ke clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/opini" className="inline-flex items-center gap-2 text-academic-500 hover:text-brand-700 font-semibold text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Opini
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-academic-500 mt-4 font-semibold text-sm">Memuat isi opini...</p>
          </div>
        ) : !opinion ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-academic-200 p-8 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-academic-900 mb-2">Opini Tidak Ditemukan</h2>
            <p className="text-academic-500 mb-6">Maaf, tulisan opini yang Anda cari tidak tersedia atau belum dipublikasikan.</p>
            <Link to="/opini" className="px-6 py-2 bg-brand-700 text-white rounded-lg font-bold hover:bg-brand-800 transition-colors shadow-sm">
              Kembali ke Daftar Opini
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-3xl border border-academic-200/80 shadow-sm overflow-hidden">
            {/* Header Banner Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-academic-100 p-6 md:p-10 relative">
              <div className="absolute top-4 right-4 md:top-6 md:right-8">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white hover:bg-amber-100 text-academic-600 hover:text-amber-800 border border-slate-200/80 shadow-sm transition-colors"
                  title="Bagikan Tautan"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs mb-4 border border-amber-200/50">
                <BookOpen className="w-3.5 h-3.5" />
                Opini Mahasiswa
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-academic-900 leading-tight mb-6">
                {opinion.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-academic-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    {opinion.users?.full_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <span className="block font-bold text-academic-900 leading-none mb-0.5">
                      {opinion.users?.full_name || 'Mahasiswa'}
                    </span>
                    {opinion.users?.institution && (
                      <span className="text-xs text-academic-400 font-semibold">{opinion.users.institution}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 border-l border-academic-200 pl-6 h-8">
                  <Calendar className="w-4 h-4 text-academic-400" />
                  <span>
                    {new Date(opinion.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Body Section */}
            <div className="p-6 md:p-10 lg:p-12">
              <div 
                className="rich-text-content prose prose-lg max-w-none text-academic-700 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: opinion.content }}
              />
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
