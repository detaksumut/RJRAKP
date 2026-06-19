import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GraduationCap, BookOpen, User, Calendar, ArrowRight, Download, FileText, ExternalLink, Upload } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function JurnalKampus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tugas-jurnal';
  
  const [articles, setArticles] = useState<any[]>([]);
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingOpinions, setLoadingOpinions] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchOpinions();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          abstract,
          anonymous_manuscript_file,
          manuscript_file,
          status,
          submission_date,
          journals (name),
          users!submitter_id (full_name, institution)
        `)
        .eq('status', 'published')
        .like('title', '%[Jurnal Perkuliahan%')
        .order('submission_date', { ascending: false });

      if (error) {
        console.error("Error fetching lecture articles:", error.message);
      } else {
        setArticles(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchOpinions = async () => {
    try {
      const { data, error } = await supabase
        .from('opinions')
        .select('*, users(full_name, institution)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching opinions:", error.message);
      } else {
        setOpinions(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpinions(false);
    }
  };

  const getSnippet = (text: string, maxLength: number = 180) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-16 md:py-24 text-white overflow-hidden"
        style={{ backgroundImage: "url('/campus.jpg')" }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/90 to-brand-800/80"></div>
        
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent-400">
            <GraduationCap className="w-4 h-4" />
            Portal Akademik Mahasiswa
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight tracking-tight">
            Jurnal Kampus RJRAKP
          </h1>
          <div className="border-l-4 border-amber-400 pl-4 max-w-3xl py-1 text-left mx-auto md:mx-0">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 leading-relaxed italic">
              "Wadah bagi para Mahasiswa melatih diri untuk menjadi penulis Jurnal go Internasional"
            </p>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            Selamat datang di inkubator publikasi ilmiah RJRAKP. Kami berdedikasi melatih mahasiswa dalam menyusun naskah ilmiah berkualitas hasil luaran perkuliahan dan opini kritis publik agar siap bersaing di kancah global dan terindeks internasional.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 bg-white p-1 rounded-xl border max-w-md mx-auto shadow-sm">
          <button
            onClick={() => setSearchParams({ tab: 'tugas-jurnal' })}
            className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tugas-jurnal'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-academic-500 hover:text-academic-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tugas Perkuliahan ({articles.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'opini' })}
            className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'opini'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-academic-500 hover:text-academic-800 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Opini Mahasiswa ({opinions.length})
          </button>
        </div>

        {activeTab === 'tugas-jurnal' ? (
          <div className="space-y-6">
            {/* CTA Box for Students */}
            <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-accent-500">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent-400 bg-white/10 px-2.5 py-1 rounded-md">Untuk Mahasiswa</span>
                <h3 className="text-xl md:text-2xl font-bold font-serif">Kirimkan Tugas Jurnal Perkuliahan Anda</h3>
                <p className="text-sm text-brand-100 leading-relaxed">
                   RJRAKP memfasilitasi penerbitan luaran tugas artikel ilmiah dari mata kuliah Anda secara resmi dengan biaya yang terjangkau (Rp 300.000) dan terindeks Google Scholar secara otomatis.
                </p>
              </div>
              <Link 
                to="/dashboard/author/submit?type=jurnal_kuliah" 
                className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl shrink-0 flex items-center gap-2 text-sm uppercase tracking-wider self-stretch md:self-auto justify-center"
              >
                <Upload className="w-4 h-4" /> Kirim Tugas Sekarang
              </Link>
            </div>

            {loadingArticles ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-academic-500 mt-4 font-semibold text-sm">Memuat artikel tugas perkuliahan...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-academic-200 p-8 shadow-sm">
                <p className="text-academic-500 text-lg mb-2">Belum ada tugas perkuliahan yang dipublikasikan.</p>
                <p className="text-academic-400 text-sm">Jurnal tugas kuliah yang diterbitkan akan muncul di sini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {articles.map((art) => {
                  const cleanTitle = art.title.replace('[Jurnal Perkuliahan (Non SINTA)]', '').trim();
                  return (
                    <article key={art.id} className="bg-white rounded-2xl border border-academic-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-brand-300">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            Jurnal Perkuliahan
                          </span>
                          <span className="text-xs text-academic-500">
                            {art.journals?.name}
                          </span>
                        </div>
                        <span className="text-xs text-academic-400 font-medium">
                          Diterbitkan: {new Date(art.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <h2 className="text-lg md:text-xl font-bold font-serif text-academic-900 leading-snug mb-3">
                        {cleanTitle}
                      </h2>
                      
                      <p className="text-academic-650 text-sm leading-relaxed mb-5 line-clamp-3 text-justify">
                        {art.abstract || 'Tidak ada abstrak.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-academic-100 text-xs sm:text-sm text-academic-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-academic-800">
                            {art.users?.full_name || 'Mahasiswa'}
                          </span>
                          {art.users?.institution && (
                            <span className="text-academic-400">({art.users.institution})</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Link 
                            to={`/article/${art.id}`} 
                            className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 font-bold transition-colors bg-brand-50 px-3.5 py-2 rounded-lg border border-brand-100 hover:bg-brand-100"
                          >
                            Baca Artikel <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* CTA Box for Opinions */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-amber-800">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2.5 py-1 rounded-md">Opini Mahasiswa</span>
                <h3 className="text-xl md:text-2xl font-bold font-serif">Tulis Gagasan Kritis & Opini Anda</h3>
                <p className="text-sm text-amber-50 leading-relaxed">
                  Tulis opini kritis mengenai isu kebijakan publik atau fenomena sosial. Hasil opini langsung diteruskan secara otomatis ke WhatsApp Dosen pengampu Anda sebagai tugas.
                </p>
              </div>
              <Link 
                to="/dashboard/author/jurnal-kampus?tab=opini" 
                className="bg-white hover:bg-amber-50 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl shrink-0 flex items-center gap-2 text-sm uppercase tracking-wider self-stretch md:self-auto justify-center"
              >
                <BookOpen className="w-4 h-4" /> Tulis Opini Baru
              </Link>
            </div>

            {loadingOpinions ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-academic-500 mt-4 font-semibold text-sm">Memuat opini mahasiswa...</p>
              </div>
            ) : opinions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-academic-200 p-8 shadow-sm">
                <p className="text-academic-500 text-lg mb-2">Belum ada opini yang dipublikasikan.</p>
                <p className="text-academic-400 text-sm">Jurnal opini mahasiswa yang terbit akan muncul di sini.</p>
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
                    <article key={opinion.id} className="bg-white rounded-2xl border border-academic-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 hover:border-amber-300">
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/opini/${opinion.slug}`} className="group inline-block">
                            <h2 className="text-lg md:text-xl font-bold font-serif text-academic-900 leading-snug mb-3 group-hover:text-amber-700 transition-colors">
                              {opinion.title}
                            </h2>
                          </Link>
                          <p className="text-academic-600 text-sm mb-5 leading-relaxed text-justify">
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
