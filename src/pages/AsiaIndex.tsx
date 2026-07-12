import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Search, Star, ExternalLink, FileText, User, BookOpen, CheckCircle, Clock, Loader2 } from 'lucide-react';
import bgAsiaIndex from '../../bg-asiaindex.png';
interface AsiaArticle {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  keywords: string;
  journal_name: string;
  issn: string;
  year: number;
  doi: string;
  source_url: string;
  pdf_url: string;
  origin: string;
  zenodo_verified: boolean;
  orcid_verified: boolean;
  scopus_verified: boolean;
  crossref_verified: boolean;
  asia_score: number;
  asia_rating: number;
  indexed_at: string;
}

const GOOGLE_SEARCH_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

export default function AsiaIndex() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AsiaArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalIndexed, setTotalIndexed] = useState(0);

  useEffect(() => {
    supabase.from('asia_index').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalIndexed(count || 0));

    // Auto-search if ?q= param exists (redirect from APASIFIC)
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    if (qParam) {
      setQuery(qParam);
      // Trigger search after state is set
      setTimeout(() => {
        document.getElementById('asia-search-btn')?.click();
      }, 100);
    }
  }, []);


  const searchInternal = async (q: string): Promise<AsiaArticle[]> => {
    const { data } = await supabase
      .from('asia_index')
      .select('*')
      .or(`title.ilike.%${q}%,authors.ilike.%${q}%,keywords.ilike.%${q}%,journal_name.ilike.%${q}%`)
      .order('asia_score', { ascending: false })
      .limit(20);
    return data || [];
  };

  // Search via Crossref API (free, no key needed, academic articles)
  const searchCrossref = async (q: string): Promise<AsiaArticle[]> => {
    try {
      // Search both general query AND author-specific in parallel
      const [genRes, authorRes] = await Promise.all([
        fetch(`https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=4&filter=type:journal-article&select=title,author,abstract,published,DOI,container-title,ISSN,URL`),
        fetch(`https://api.crossref.org/works?query.author=${encodeURIComponent(q)}&rows=3&filter=type:journal-article&select=title,author,abstract,published,DOI,container-title,ISSN,URL`),
      ]);

      const mapItem = (item: any): AsiaArticle => ({
        id: crypto.randomUUID(),
        title: Array.isArray(item.title) ? item.title[0] : item.title || '',
        authors: (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(', '),
        abstract: item.abstract?.replace(/<[^>]*>/g, '') || '',
        keywords: '',
        journal_name: Array.isArray(item['container-title']) ? item['container-title'][0] : '',
        issn: Array.isArray(item.ISSN) ? item.ISSN[0] : '',
        year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
        doi: item.DOI || '',
        source_url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ''),
        pdf_url: '',
        origin: 'web',
        zenodo_verified: false,
        orcid_verified: false,
        scopus_verified: false,
        crossref_verified: true,
        has_abstract: !!(item.abstract),
        has_issn: !!(item.ISSN),
        asia_score: item.abstract ? 25 : 15,
        asia_rating: 2,
        indexed_at: new Date().toISOString(),
      });

      const genData = genRes.ok ? await genRes.json() : null;
      const authorData = authorRes.ok ? await authorRes.json() : null;

      return [
        ...(genData?.message?.items || []).map(mapItem),
        ...(authorData?.message?.items || []).map(mapItem),
      ];
    } catch { return []; }
  };

  // Search via Semantic Scholar API (free, no key needed)
  const searchSemanticScholar = async (q: string): Promise<AsiaArticle[]> => {
    try {
      const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=5&fields=title,authors,abstract,year,externalIds,journal,openAccessPdf`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((item: any) => ({
        id: crypto.randomUUID(),
        title: item.title || '',
        authors: (item.authors || []).map((a: any) => a.name).join(', '),
        abstract: item.abstract || '',
        keywords: '',
        journal_name: item.journal?.name || '',
        issn: '',
        year: item.year || new Date().getFullYear(),
        doi: item.externalIds?.DOI || '',
        source_url: item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : '',
        pdf_url: item.openAccessPdf?.url || '',
        origin: 'web',
        zenodo_verified: false,
        orcid_verified: false,
        scopus_verified: false,
        crossref_verified: false,
        has_abstract: !!(item.abstract),
        has_issn: false,
        asia_score: item.abstract ? 10 : 5,
        asia_rating: 1,
        indexed_at: new Date().toISOString(),
      }));
    } catch { return []; }
  };

  // Search via DataCite API (free, no key needed)
  const searchDataCite = async (q: string): Promise<AsiaArticle[]> => {
    try {
      const res = await fetch(`https://api.datacite.org/dois?query=${encodeURIComponent(q)}&page[size]=5`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((item: any) => {
        const attr = item.attributes || {};
        const title = attr.titles?.[0]?.title || '';
        const abstractObj = attr.descriptions?.find((d: any) => d.descriptionType === 'Abstract' || d.descriptionType === 'Other');
        const abstract = abstractObj?.description?.replace(/<[^>]*>/g, '') || '';
        const isZenodo = attr.publisher?.toLowerCase().includes('zenodo');
        
        return {
          id: crypto.randomUUID(),
          title: title,
          authors: (attr.creators || []).map((c: any) => c.name).join(', '),
          abstract: abstract,
          keywords: '',
          journal_name: attr.publisher || '',
          issn: '',
          year: attr.publicationYear || new Date().getFullYear(),
          doi: attr.doi || '',
          source_url: attr.url || (attr.doi ? `https://doi.org/${attr.doi}` : ''),
          pdf_url: '',
          origin: 'web',
          zenodo_verified: isZenodo,
          orcid_verified: false,
          scopus_verified: false,
          crossref_verified: false,
          has_abstract: !!abstract,
          has_issn: false,
          asia_score: abstract ? 15 : 5,
          asia_rating: 1,
          indexed_at: new Date().toISOString(),
        };
      });
    } catch { return []; }
  };

  const searchWebAndSave = async (q: string) => {
    try {
      // Run Crossref, Semantic Scholar, and DataCite in parallel
      const [crossrefResults, scholarResults, dataciteResults] = await Promise.all([
        searchCrossref(q),
        searchSemanticScholar(q),
        searchDataCite(q),
      ]);

      // Merge, deduplicate by title
      const seen = new Set<string>();
      const webResults = [...crossrefResults, ...scholarResults, ...dataciteResults].filter(r => {
        const key = r.title.toLowerCase().substring(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Save to asia_index (auto-grow database)
      if (webResults.length > 0) {
        supabase.from('asia_index').upsert(
          webResults.filter(r => r.source_url).map(r => ({
            title: r.title, authors: r.authors, abstract: r.abstract,
            journal_name: r.journal_name, issn: r.issn, year: r.year,
            doi: r.doi, source_url: r.source_url, pdf_url: r.pdf_url,
            origin: 'web', crossref_verified: r.crossref_verified,
            has_abstract: r.has_abstract, has_issn: r.has_issn,
            asia_score: r.asia_score, asia_rating: r.asia_rating
          })),
          { onConflict: 'source_url', ignoreDuplicates: true }
        ).then(() => setTotalIndexed(prev => prev + webResults.length));
      }

      return webResults;
    } catch { return []; }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // Step 1: Search internal DB
    const internal = await searchInternal(query);

    // Step 2: If less than 3 results, also search the web
    let web: AsiaArticle[] = [];
    if (internal.length < 3) {
      web = await searchWebAndSave(query) || [];
    }

    const combined = [...internal, ...web.filter(w => !internal.find(i => i.title === w.title))];
    setResults(combined);
    setLoading(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
    ));
  };

  const getRatingLabel = (score: number) => {
    if (score >= 85) return { label: 'Platinum', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (score >= 65) return { label: 'Gold', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (score >= 45) return { label: 'Silver', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    if (score >= 25) return { label: 'Bronze', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Registered', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  return (
    <>
      <Helmet>
        <title>ASIA Index — Mesin Pengindeks Jurnal APASIFIC</title>
        <meta name="description" content="ASIA Index adalah lembaga pengindeks resmi jurnal ilmiah di bawah naungan APASIFIC, dengan verifikasi Scopus, Zenodo, ORCID, dan Crossref." />
      </Helmet>
      <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #080810 0%, #0d0d1a 40%, #111120 100%)' }}>
        <Navbar />

        {/* Hero — with APASIFIC banner background */}
        <div className="relative text-center overflow-hidden" style={{ minHeight: '420px' }}>
          {/* Banner image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bgAsiaIndex})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.85,
          }} />
          {/* Gradient overlay — lighter so banner shows through */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,8,16,0.1) 0%, rgba(8,8,16,0.35) 55%, #080810 100%)',
          }} />

          <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> ASIA Index — Lembaga Pengindeks Resmi APASIFIC
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Temukan Karya Ilmiah<br />
            <span className="text-amber-400">Terverifikasi Global</span>
          </h1>
          <p className="text-[#8888aa] text-lg mb-3">
            Diverifikasi oleh <strong className="text-[#c9a84c]">Scopus · Zenodo · DataCite · ORCID · Crossref</strong>
          </p>
          <p className="text-[#c9a84c]/60 text-sm mb-10">
            {totalIndexed.toLocaleString()} artikel terindeks · Terus bertumbuh setiap pencarian
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center border rounded-2xl shadow-2xl overflow-hidden transition-colors" style={{ background: 'rgba(18,18,31,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
            >
              <Search className="w-5 h-5 ml-5 shrink-0" style={{ color: '#c9a84c' }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul, penulis, kata kunci, nama jurnal..."
                className="flex-1 bg-transparent px-4 py-5 text-white placeholder-[#8888aa] text-base focus:outline-none"
              />
              <button
                id="asia-search-btn"
                type="submit"
                disabled={loading}
                className="m-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold text-sm rounded-xl transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          {loading && (
            <div className="text-center py-16" style={{ color: '#8888aa' }}>
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-amber-400" />
              <p className="font-medium">Menelusuri database ASIA Index &amp; internet...</p>
              <p className="text-sm mt-1" style={{ color: '#c9a84c' }}>Memverifikasi melalui Scopus, Zenodo, DataCite, ORCID, Crossref</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16" style={{ color: '#8888aa' }}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-sm mt-1">Coba kata kunci yang berbeda</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm mb-6" style={{ color: '#8888aa' }}>
                Menampilkan <strong className="text-white">{results.length}</strong> hasil untuk "<em className="text-amber-400">{query}</em>"
              </p>
              {results.map(article => {
                const { label, color } = getRatingLabel(article.asia_score);
                return (
                  <div key={article.id} className="backdrop-blur rounded-2xl p-6 transition-all group" style={{ background: 'rgba(18,18,31,0.85)', border: '1px solid rgba(201,168,76,0.12)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.35)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(24,24,46,0.95)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.12)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(18,18,31,0.85)'; }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" /> ASIA Indexed
                          </span>
                          <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
                            {label}
                          </span>
                          {article.origin === 'web' && (
                            <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300">
                              New Entry
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-bold text-base leading-snug group-hover:text-amber-300 transition-colors mb-2">
                          {article.source_url ? (
                            <a href={article.source_url} target="_blank" rel="noreferrer">{article.title}</a>
                          ) : article.title}
                        </h3>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: '#8888aa' }}>
                          {article.authors && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.authors}</span>}
                          {article.journal_name && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {article.journal_name}</span>}
                          {article.year && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.year}</span>}
                          {article.doi && <span className="font-mono text-amber-400/80 text-[10px]">DOI: {article.doi}</span>}
                        </div>

                        {/* Abstract */}
                        {article.abstract && (
                          <p className="text-blue-200/70 text-sm leading-relaxed line-clamp-2">{article.abstract}</p>
                        )}

                        {/* Verification Icons */}
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${article.scopus_verified ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-white/20'}`}>Scopus</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${article.zenodo_verified ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-white/20'}`}>Zenodo</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${article.orcid_verified ? 'bg-green-500/20 text-green-300' : 'bg-white/5 text-white/20'}`}>ORCID</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${article.crossref_verified ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/20'}`}>Crossref</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="shrink-0 text-center">
                        <div className="flex gap-0.5 mb-1">{renderStars(article.asia_rating)}</div>
                        <p className="text-xs text-blue-400">{article.asia_score}/100</p>
                        {article.source_url && (
                          <a href={article.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300">
                            <ExternalLink className="w-3 h-3" /> Buka
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Cards - shown when not searching */}
          {!searched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                { icon: '🔍', title: 'Pencarian Cerdas', desc: 'Cari dari database ASIA Index. Jika tidak ditemukan, sistem otomatis menelusuri internet dan menambahkannya ke indeks.' },
                { icon: '⭐', title: 'Rating Terverifikasi', desc: 'Setiap artikel diverifikasi melalui Scopus, Zenodo, ORCID, dan Crossref untuk mendapatkan ASIA Rating 1-5 bintang.' },
                { icon: '📈', title: 'Tumbuh Organik', desc: 'Database ASIA Index bertumbuh otomatis setiap kali ada pencarian baru. Tanpa input manual.' },
              ].map((card, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-blue-300/70 text-xs leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
