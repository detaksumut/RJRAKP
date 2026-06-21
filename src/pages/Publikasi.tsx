import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileText, Eye, Download, Calendar, ArrowRight, Filter, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface JournalCoverProps {
  name: string;
  slug: string;
  volume: string;
  issue: string;
  year: number;
  eIssn: string;
  pIssn: string;
  articles: any[];
}

function getJournalStyle(slug: string) {
  switch (slug) {
    case 'audit-kebijakan-publik':
      return {
        bg: 'from-slate-55 to-indigo-50/50',
        text: 'text-indigo-950',
        accentColor: 'border-indigo-600',
        badgeBg: 'bg-indigo-600',
        badgeText: 'text-white',
        border: 'border-indigo-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-indigo-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="15" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="30" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="45" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="60" strokeWidth="0.25" />
            <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="15" y1="15" x2="85" y2="85" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="15" y1="85" x2="85" y2="15" strokeWidth="0.25" strokeDasharray="1,1" />
          </svg>
        )
      };
    case 'hukum-dan-keadilan':
      return {
        bg: 'from-stone-55 to-rose-50/60',
        text: 'text-rose-950',
        accentColor: 'border-rose-600',
        badgeBg: 'bg-rose-600',
        badgeText: 'text-white',
        border: 'border-rose-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05] stroke-rose-700 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M20,90 L80,90 M25,90 L25,10 M35,90 L35,10 M45,90 L45,10 M55,90 L55,10 M65,90 L65,10 M75,90 L75,10" strokeWidth="0.5" />
            <rect x="22" y="7" width="56" height="3" rx="0.5" strokeWidth="0.5" />
            <rect x="18" y="90" width="64" height="4" rx="0.5" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="100" y2="45" strokeWidth="0.25" strokeDasharray="2,2" />
            <line x1="0" y1="45" x2="100" y2="65" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
    case 'pendidikan-dan-pembelajaran':
      return {
        bg: 'from-emerald-55/50 to-teal-50/50',
        text: 'text-emerald-950',
        accentColor: 'border-emerald-600',
        badgeBg: 'bg-emerald-600',
        badgeText: 'text-white',
        border: 'border-emerald-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-emerald-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,20 Q 25,10 50,20 T 100,20" strokeWidth="0.25" />
            <path d="M 0,30 Q 25,20 50,30 T 100,30" strokeWidth="0.25" />
            <path d="M 0,40 Q 25,30 50,40 T 100,40" strokeWidth="0.25" />
            <path d="M 0,50 Q 25,40 50,50 T 100,50" strokeWidth="0.25" />
            <path d="M 0,60 Q 25,50 50,60 T 100,60" strokeWidth="0.25" />
            <path d="M 0,70 Q 25,60 50,70 T 100,70" strokeWidth="0.25" />
            <path d="M 0,80 Q 25,70 50,80 T 100,80" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
    case 'teknik-dan-teknologi':
      return {
        bg: 'from-amber-55/30 to-slate-100/50',
        text: 'text-slate-900',
        accentColor: 'border-amber-600',
        badgeBg: 'bg-amber-600',
        badgeText: 'text-white',
        border: 'border-amber-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-amber-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" strokeWidth="0.25" />
            <polygon points="50,25 68,35 68,55 50,65 32,55 32,35" strokeWidth="0.25" />
            <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="10" y1="28" x2="90" y2="72" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="10" y1="72" x2="90" y2="28" strokeWidth="0.15" strokeDasharray="2,2" />
            <circle cx="50" cy="15" r="1" className="fill-amber-600" />
            <circle cx="75" cy="30" r="1" className="fill-amber-600" />
            <circle cx="75" cy="60" r="1" className="fill-amber-600" />
            <circle cx="50" cy="75" r="1" className="fill-amber-600" />
            <circle cx="25" cy="60" r="1" className="fill-amber-600" />
            <circle cx="25" cy="30" r="1" className="fill-amber-600" />
          </svg>
        )
      };
    case 'agama-dan-peradaban-islam':
      return {
        bg: 'from-teal-55 to-emerald-50/50',
        text: 'text-teal-950',
        accentColor: 'border-teal-600',
        badgeBg: 'bg-teal-600',
        badgeText: 'text-white',
        border: 'border-teal-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-teal-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="30" y="30" width="40" height="40" transform="rotate(0 50 50)" strokeWidth="0.25" />
            <rect x="30" y="30" width="40" height="40" transform="rotate(45 50 50)" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="28" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.15" strokeDasharray="1,1" />
            <polygon points="50,5 52,12 59,12 53,16 55,23 50,19 45,23 47,16 41,12 48,12" strokeWidth="0.15" />
            <polygon points="50,95 52,88 59,88 53,84 55,77 50,81 45,77 47,84 41,88 48,88" strokeWidth="0.15" />
            <polygon points="5,50 12,52 12,59 16,53 23,55 19,50 23,45 16,47 12,41 12,48" strokeWidth="0.15" />
            <polygon points="95,50 88,52 88,59 84,53 77,55 81,50 77,45 84,47 88,41 88,48" strokeWidth="0.15" />
          </svg>
        )
      };
    default:
      return {
        bg: 'from-slate-55 to-indigo-50/50',
        text: 'text-slate-900',
        accentColor: 'border-brand-600',
        badgeBg: 'bg-brand-600',
        badgeText: 'text-white',
        border: 'border-slate-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-slate-500 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="30" strokeWidth="0.25" />
            <line x1="0" y1="0" x2="100" y2="100" strokeWidth="0.25" strokeDasharray="2,2" />
            <line x1="100" y1="0" x2="0" y2="100" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
  }
}

function JournalCover({ name, slug, volume, issue, year, eIssn, pIssn, articles }: JournalCoverProps) {
  const style = getJournalStyle(slug);
  const coverArticles = articles.slice(0, 4);

  return (
    <div className={`w-64 h-90 rounded-2xl shadow-xl relative overflow-hidden flex flex-col bg-gradient-to-br ${style.bg} border ${style.border} p-5 select-none shrink-0 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 text-slate-800`}>
      {/* SVG Watermark Pattern */}
      {style.pattern}

      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-white/40 blur-xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
      
      {/* Logo / Header */}
      <div className="bg-white rounded-xl py-2.5 px-4 shadow-sm border border-slate-200/50 z-10 flex items-center justify-center text-center w-full mb-4 shrink-0">
        <img src="/logo.png" alt="Logo RJRAKP" className="h-10 w-auto object-contain" />
      </div>

      {/* Journal Title */}
      <div className="flex-1 z-10 flex flex-col justify-start">
        <h2 className={`text-[13px] font-serif font-black leading-snug mb-1.5 uppercase tracking-wide line-clamp-3 ${style.text}`}>
          {name}
        </h2>
        <div className={`w-8 h-0.5 border-t-2 ${style.accentColor} mb-3`} />
        
        {/* Issue & Date */}
        <p className={`text-[9px] font-bold ${style.badgeText} ${style.badgeBg} px-2.5 py-0.5 rounded-full w-max shadow-sm mb-4`}>
          {volume}, {issue}, {year}
        </p>

        {/* Small List of articles on cover */}
        <div className="space-y-1.5 mt-1">
          <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Daftar Isi / TOC:</p>
          {coverArticles.length === 0 ? (
            <p className="text-[8.5px] italic text-slate-400">Belum ada artikel terbit.</p>
          ) : (
            coverArticles.map((pub, idx) => (
              <div key={pub.id} className="text-[8.5px] leading-snug text-slate-600 line-clamp-2 border-l border-slate-200 pl-2 hover:text-slate-900 transition-colors">
                <span className="font-bold text-slate-400 mr-1">{idx + 1}.</span>
                {pub.articles?.title}
              </div>
            ))
          )}
          {articles.length > 4 && (
            <p className="text-[7.5px] italic text-slate-400 pl-2">dan {articles.length - 4} artikel lainnya...</p>
          )}
        </div>
      </div>

      {/* Footer with ISSN */}
      <div className="border-t border-slate-200/60 pt-2.5 mt-auto flex justify-between text-[8px] text-slate-400 z-10 tracking-widest uppercase font-bold">
        <span>P-ISSN: {pIssn || '-'}</span>
        <span>E-ISSN: {eIssn || '-'}</span>
      </div>
    </div>
  );
}

export default function Publikasi() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [journals, setJournals] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from('journals').select('*').order('name').then(({data}) => {
      if (data) setJournals(data);
    });
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [selectedJournal, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const fetchLatest = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('publications')
        .select(`
          id,
          publication_date,
          doi,
          pdf_url,
          volume_number,
          issue_number,
          view_count,
          download_count,
          articles!inner (
            id,
            title,
            abstract,
            keywords,
            slug,
            journal_id,
            article_authors ( full_name, affiliation ),
            journals ( name, slug, e_issn, p_issn, description )
          )
        `)
        .order('publication_date', { ascending: false });
        
      if (selectedJournal !== 'all') {
        query = query.eq('articles.journal_id', selectedJournal);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;

      let filteredData = data || [];

      // Filter based on search query
      const currentQ = searchParams.get('q');
      if (currentQ) {
        const lowerQ = currentQ.toLowerCase();
        filteredData = filteredData.filter((pub: any) => {
          const titleMatch = pub.articles?.title?.toLowerCase().includes(lowerQ);
          const keywordMatch = pub.articles?.keywords?.toLowerCase().includes(lowerQ);
          const authorMatch = pub.articles?.article_authors?.some((a: any) => a.full_name?.toLowerCase().includes(lowerQ));
          return titleMatch || keywordMatch || authorMatch;
        });
      }

      setArticles(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Find currently selected journal info
  const activeJournal = journals.find(j => j.id === selectedJournal);

  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-900 mb-4 tracking-tight">Publikasi Artikel</h1>
          <p className="text-academic-600 text-lg">Eksplorasi artikel dan riset terbaru yang diterbitkan oleh Rumah Jurnal RJRAKP dari berbagai disiplin ilmu.</p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-academic-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-academic-700 font-bold text-sm shrink-0">
              <Filter className="w-4 h-4 text-brand-600" /> Jurnal:
            </div>
            <select 
              value={selectedJournal} 
              onChange={e => setSelectedJournal(e.target.value)}
              className="w-full sm:w-auto flex-1 border border-academic-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 cursor-pointer font-medium"
            >
              <option value="all">Semua Jurnal (Seluruh Artikel)</option>
              {journals.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 flex w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari artikel, penulis..."
              className="w-full border border-academic-300 rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 font-medium"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded shadow-sm transition-colors">
              <ExternalLink className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Dynamic Cover Section ("Baju Jurnal") */}
        {selectedJournal !== 'all' && activeJournal && (
          <div className="bg-white border border-academic-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-start">
            {/* Journal Cover Left */}
            <div className="w-full md:w-auto flex justify-center shrink-0">
              <JournalCover 
                name={activeJournal.name}
                slug={activeJournal.slug}
                volume={articles[0]?.volume_number || 'Vol. 1'}
                issue={articles[0]?.issue_number || 'No. 1'}
                year={articles[0]?.publication_date ? new Date(articles[0].publication_date).getFullYear() : 2026}
                eIssn={activeJournal.e_issn}
                pIssn={activeJournal.p_issn}
                articles={articles}
              />
            </div>

            {/* Journal Details Right */}
            <div className="flex-1 flex flex-col justify-start">
              {/* Journal Info */}
              <h2 className="text-2xl font-serif font-bold text-academic-900 mb-3 border-l-4 border-accent-600 pl-3">
                {activeJournal.name}
              </h2>
              
              {/* Description */}
              <p className="text-academic-600 text-sm leading-relaxed mb-6">
                {activeJournal.description || 'Jurnal ini mempublikasikan artikel riset berkualitas tinggi yang fokus pada kontribusi ilmiah terapan.'}
              </p>



              {/* Indexing Badges */}
              <div>
                <span className="text-[10px] font-black text-academic-500 uppercase tracking-wider block mb-3">Indeksasi Jurnal:</span>
                <div className="flex flex-wrap gap-3">
                  {/* Google Scholar */}
                  <div className="flex items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                      <path d="M12 15.3L5 11.5v3c0 2.2 3.1 4 7 4s7-1.8 7-4v-3l-7 3.8z"/>
                    </svg>
                    <div>
                      <div className="text-[7.5px] font-bold uppercase tracking-wider text-emerald-800/60 leading-none">Indexed In</div>
                      <div className="text-xs font-black text-emerald-900 tracking-wider">Google Scholar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Index of All Journals cover list when in 'all' mode */}
        {selectedJournal === 'all' && journals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-6">Berkala Publikasi RJRAKP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {journals.map(j => {
                const style = getJournalStyle(j.slug);

                return (
                  <div key={j.id} className="bg-white border border-academic-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex p-4 gap-4 items-center">
                    <div className={`w-20 h-28 rounded-lg shadow-sm border ${style.border} bg-gradient-to-br ${style.bg} flex flex-col p-2 text-slate-800 shrink-0 font-serif select-none relative overflow-hidden`}>
                      {style.pattern}
                      <div className="bg-white rounded py-0.5 px-1 shadow-sm border border-slate-200/30 z-10 flex items-center justify-center shrink-0 mb-1.5">
                        <img src="/logo.png" alt="Logo" className="h-3.5 w-auto object-contain" />
                      </div>
                      <span className={`text-[7px] font-black leading-tight uppercase line-clamp-3 ${style.text} mb-auto z-10`}>{j.name}</span>
                      <span className="text-[5px] text-slate-400 text-right uppercase font-bold tracking-widest z-10">Vol. 1 No. 1</span>
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h3 className="text-sm font-bold text-academic-900 line-clamp-1 mb-1 font-serif">{j.name}</h3>
                      <p className="text-academic-500 text-xs line-clamp-2 leading-relaxed mb-2">{j.description}</p>
                      <button 
                        onClick={() => setSelectedJournal(j.id)}
                        className="text-[10px] font-bold text-brand-700 hover:text-brand-800 transition-colors uppercase tracking-wider flex items-center gap-1 w-max"
                      >
                        Buka Jurnal <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Heading Section for Articles */}
        <div className="border-b border-academic-200 pb-4 mb-6">
          <h3 className="text-lg font-serif font-bold text-academic-950">
            {selectedJournal === 'all' ? 'Seluruh Publikasi Terbaru' : `Daftar Artikel (Table of Contents) - ${activeJournal?.name}`}
          </h3>
        </div>

        {/* Articles List / Table of Contents */}
        {loading ? (
          <div className="text-center py-12 text-academic-500 font-medium">Memuat daftar artikel...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 border border-academic-200 rounded-2xl bg-white shadow-sm max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-academic-300 mx-auto mb-3" />
            <h4 className="font-bold text-academic-800 mb-1">Belum ada artikel terbit</h4>
            <p className="text-academic-500 text-xs">Belum ada artikel yang disetujui untuk terbit pada edisi ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((pub) => {
              const article = pub.articles;
              const id = pub.id;
              const title = article?.title || 'Judul Tidak Tersedia';
              const journalName = article?.journals?.name || 'Jurnal Tidak Diketahui';
              const authors = article?.article_authors?.map((a: any) => a.full_name).join(', ') || 'Penulis Tidak Diketahui';
              const date = pub.publication_date ? new Date(pub.publication_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-';
              const isExpanded = !!expandedAbstracts[id];

              return (
                <div key={pub.id} className="bg-white rounded-xl border border-academic-200 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Journal Tag (only in 'all' mode) */}
                      {selectedJournal === 'all' && (
                        <span className="inline-block text-[9px] font-black text-brand-700 uppercase tracking-widest bg-brand-50 border border-brand-100 px-2 py-0.5 rounded mb-2">
                          {journalName}
                        </span>
                      )}
                      
                      {/* Title */}
                      <h4 className="text-base font-serif font-bold text-academic-950 hover:text-brand-700 transition-colors leading-snug mb-1.5">
                        <Link to={article?.slug ? `/article/${article.slug}` : '#'}>
                          {title}
                        </Link>
                      </h4>
                      
                      {/* Authors */}
                      <p className="text-xs text-academic-600 font-medium mb-3">
                        Oleh: <span className="font-semibold text-academic-800">{authors}</span>
                      </p>

                      {/* Date & DOI */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-academic-500 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 text-brand-700">
                          <Calendar className="w-3.5 h-3.5" /> {date}
                        </div>
                        {pub.doi && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-academic-300">|</span>
                            <span>DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">{pub.doi}</a></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PDF Download Button & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 md:w-32">
                      <div className="flex gap-4 justify-between md:justify-end text-[10px] font-bold text-academic-400 uppercase tracking-widest px-1">
                        <span className="flex items-center gap-1" title="Jumlah Pembaca">
                          <Eye className="w-3.5 h-3.5 shrink-0" /> {pub.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Jumlah Unduhan PDF">
                          <Download className="w-3.5 h-3.5 shrink-0" /> {pub.download_count || 0}
                        </span>
                      </div>
                      {pub.pdf_url && (
                        <a 
                          href={pub.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" /> PDF (Unduh)
                        </a>
                      )}
                      
                      <button 
                        onClick={() => toggleAbstract(id)}
                        className="border border-academic-300 hover:bg-academic-50 text-academic-700 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        {isExpanded ? (
                          <>Abstrak <ChevronUp className="w-3.5 h-3.5 shrink-0" /></>
                        ) : (
                          <>Abstrak <ChevronDown className="w-3.5 h-3.5 shrink-0" /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Abstract Content */}
                  {isExpanded && article?.abstract && (
                    <div className="mt-4 pt-4 border-t border-academic-100 bg-academic-50/50 p-4 rounded-lg text-xs leading-relaxed text-academic-700 animate-fadeIn">
                      <h5 className="font-bold text-academic-900 mb-1.5 uppercase tracking-wider text-[10px]">Abstrak / Abstract:</h5>
                      <p className="font-serif italic mb-3">{article.abstract}</p>
                      {article.keywords && (
                        <p className="text-[11px]">
                          <span className="font-bold text-academic-800">Kata Kunci:</span> {article.keywords.startsWith('Scope: ') ? article.keywords.split(', ').slice(1).join(', ') : article.keywords}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
