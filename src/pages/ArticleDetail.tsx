import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, Download, FileText, ArrowLeft, Building2, User, Eye, Quote, Check, Copy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [scopusCitations, setScopusCitations] = useState<number | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        if (!slug) throw new Error('Slug tidak ditemukan');

        const { data, error } = await supabase
          .from('articles')
          .select(`
            id, 
            title, 
            abstract, 
            keywords, 
            manuscript_file, 
            slug, 
            created_at, 
            status,
            article_authors (*),
            journals (*),
            publications (*)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        if (!data) throw new Error('Artikel tidak ditemukan atau belum diterbitkan');

        // Sort authors
        if (data.article_authors) {
          data.article_authors.sort((a: any, b: any) => {
            if (a.is_corresponding) return -1;
            if (b.is_corresponding) return 1;
            return (a.author_order || 0) - (b.author_order || 0);
          });
        }

        setArticle(data);
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Gagal memuat artikel');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  // Scopus API Fetch
  useEffect(() => {
    async function fetchScopusCitations() {
      const doi = article?.publications?.[0]?.doi;
      if (!doi) return;

      try {
        const apiKey = import.meta.env.VITE_SCOPUS_API_KEY;
        if (!apiKey) return;

        const res = await fetch(`https://api.elsevier.com/content/search/scopus?query=DOI(${doi})`, {
          headers: {
            'X-ELS-APIKey': apiKey,
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        const count = data['search-results']?.entry?.[0]?.['citedby-count'];
        
        if (count !== undefined && count !== null) {
          setScopusCitations(parseInt(count, 10));
        }
      } catch (err) {
        console.error("Error fetching Scopus data:", err);
      }
    }

    if (article) {
      fetchScopusCitations();
    }
  }, [article]);

  // Track View Count once article is loaded
  useEffect(() => {
    if (article?.publications?.[0]?.id) {
      const pubId = article.publications[0].id;
      // Increment view_count using an rpc or a direct update if RLS allows. 
      // Since unauthenticated users can't typically update, we might need a workaround or just an optimistic fetch if an RPC doesn't exist.
      // For now, we'll try to just call an RPC if it existed, but since we just added the column, we'll try a direct update.
      // NOTE: Direct update by anon might fail due to RLS, but we'll include the logic.
      const incrementView = async () => {
        try {
          const currentViews = article.publications[0].view_count || 0;
          await supabase.from('publications').update({ view_count: currentViews + 1 }).eq('id', pubId);
          // Update articles table as well
          const currentArticleViews = article.view_count || 0;
          await supabase.from('articles').update({ view_count: currentArticleViews + 1 }).eq('id', article.id);
        } catch(e) {
          console.error(e);
        }
      };
      // Prevent multiple increments in dev mode strict effects
      const timer = setTimeout(incrementView, 2000);
      return () => clearTimeout(timer);
    }
  }, [article?.publications, article?.id, article?.view_count]);

  const handleDownloadClick = async () => {
    if (pub?.id) {
      try {
        const currentDownloads = pub.download_count || 0;
        await supabase.from('publications').update({ download_count: currentDownloads + 1 }).eq('id', pub.id);
        
        // Update articles table as well
        const currentArticleDownloads = article.download_count || 0;
        await supabase.from('articles').update({ download_count: currentArticleDownloads + 1 }).eq('id', article.id);

        // Optimistically update local state so the user sees it go up
        setArticle((prev: any) => ({
          ...prev,
          download_count: currentArticleDownloads + 1,
          publications: [{ ...prev.publications[0], download_count: currentDownloads + 1 }]
        }));
      } catch(e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-academic-500 font-medium">Memuat artikel...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-academic-900 mb-2">Artikel Tidak Ditemukan</h2>
            <p className="text-academic-500 mb-6">{error || 'Artikel mungkin telah ditarik atau URL tidak valid.'}</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pub = article.publications && article.publications.length > 0 ? article.publications[0] : null;
  const journal = article.journals;
  const authors = article.article_authors || [];
  
  // Format dates
  const pubDate = pub?.publication_date ? new Date(pub.publication_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const pubYear = pub?.publication_date ? new Date(pub.publication_date).getFullYear().toString() : '';

  // Prepare keywords
  const keywordsList = article.keywords ? article.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) : [];

  // Generate Citations
  const generateCitation = (format: 'apa' | 'mla' | 'chicago') => {
    const authorNamesAPA = authors.map((a: any) => {
      const parts = a.full_name.split(' ');
      const last = parts.pop();
      const firstInitials = parts.map((n: string) => n[0] + '.').join(' ');
      return `${last}, ${firstInitials}`;
    }).join(', & ');

    const authorNamesMLA = authors.length > 0 ? 
      `${authors[0].full_name.split(' ').reverse().join(', ')}${authors.length > 1 ? ', et al.' : '.'}` 
      : '';

    const title = article.title;
    const jName = journal?.name || 'RJRAKP';
    const vol = pub?.volume_number || '';
    const iss = pub?.issue_number || '';
    const url = pub?.doi ? `https://doi.org/${pub.doi}` : window.location.href;

    switch (format) {
      case 'apa':
        return `${authorNamesAPA || 'Author'} (${pubYear || 'n.d.'}). ${title}. ${jName}, ${vol}(${iss}). ${url}`;
      case 'mla':
        return `${authorNamesMLA || 'Author.'} "${title}." ${jName}, vol. ${vol}, no. ${iss}, ${pubYear || 'n.d.'}, ${url}.`;
      case 'chicago':
        return `${authorNamesMLA || 'Author'}. "${title}." ${jName} ${vol}, no. ${iss} (${pubYear || 'n.d.'}). ${url}.`;
      default:
        return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{article.title} | {journal?.name || 'RJRAKP'}</title>
        <meta name="description" content={article.abstract?.substring(0, 160) || 'Artikel jurnal RJRAKP'} />
        
        {/* Google Scholar Highwire Press Meta Tags */}
        <meta name="citation_title" content={article.title} />
        {authors.map((author: any, index: number) => (
          <React.Fragment key={`author-meta-${index}`}>
            <meta name="citation_author" content={author.full_name} />
            {author.affiliation && <meta name="citation_author_institution" content={author.affiliation + (author.country ? `, ${author.country}` : '')} />}
            {author.email && <meta name="citation_author_email" content={author.email} />}
            {author.orcid && <meta name="citation_author_orcid" content={author.orcid} />}
          </React.Fragment>
        ))}
        {journal && <meta name="citation_journal_title" content={journal.name} />}
        {journal?.p_issn && <meta name="citation_issn" content={journal.p_issn} />}
        {pub?.volume_number && <meta name="citation_volume" content={pub.volume_number.replace(/[^0-9]/g, '')} />}
        {pub?.issue_number && <meta name="citation_issue" content={pub.issue_number.replace(/[^0-9]/g, '')} />}
        {pubYear && <meta name="citation_publication_date" content={pubYear} />}
        {pub?.doi && <meta name="citation_doi" content={pub.doi} />}
        {pub?.pdf_url && <meta name="citation_pdf_url" content={pub.pdf_url} />}
        {journal?.publisher && <meta name="citation_publisher" content={journal.publisher} />}
        <meta name="citation_language" content="id" />
      </Helmet>

      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <div className="mb-6 text-sm">
            <Link to="/" className="text-academic-500 hover:text-brand-600 transition-colors">Beranda</Link>
            <span className="mx-2 text-academic-300">/</span>
            {journal && (
              <>
                <Link to={`/jurnal/${journal.slug}`} className="text-academic-500 hover:text-brand-600 transition-colors">{journal.name}</Link>
                <span className="mx-2 text-academic-300">/</span>
              </>
            )}
            <span className="text-academic-900 font-medium line-clamp-1 max-w-sm inline-block align-bottom">{article.title}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-academic-200 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-8 md:p-10 border-b border-academic-100 bg-gradient-to-b from-slate-50 to-white">
              
              {journal && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  <BookOpen className="w-3.5 h-3.5" />
                  {journal.name}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-serif font-black text-academic-900 leading-tight mb-6">
                {article.title}
              </h1>

              {/* Authors */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {authors.map((author: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-academic-900 text-lg">{author.full_name} {author.is_corresponding && '*'}</span>
                        {author.orcid && (
                          <a href={author.orcid} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 transition-colors" title="Lihat profil ORCID">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/></svg>
                          </a>
                        )}
                      </div>
                      {(author.affiliation || author.country) && (
                        <span className="text-sm text-academic-600 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-academic-400" /> {author.affiliation}{author.country ? `, ${author.country}` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Publication Meta */}
              {pub && (
                <div className="flex flex-wrap items-center gap-4 text-sm bg-academic-50 p-4 rounded-xl border border-academic-100">
                  {article.submission_date && (
                    <div className="flex items-center gap-1.5 text-academic-700">
                      <span className="font-medium text-xs uppercase tracking-wider">Received:</span> 
                      <span className="text-xs">{new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {(article as any).revised_date && (
                    <div className="flex items-center gap-1.5 text-academic-700">
                      <span className="font-medium text-xs uppercase tracking-wider">Revised:</span> 
                      <span className="text-xs">{new Date((article as any).revised_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {(article as any).accepted_date && (
                    <div className="flex items-center gap-1.5 text-academic-700">
                      <span className="font-medium text-xs uppercase tracking-wider">Accepted:</span> 
                      <span className="text-xs">{new Date((article as any).accepted_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {pub.publication_date && (
                    <div className="flex items-center gap-1.5 text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span className="font-bold text-xs uppercase tracking-wider">Published:</span> 
                      <span className="text-xs">{pubDate}</span>
                    </div>
                  )}
                  {pub.volume_number && (
                    <div className="flex items-center gap-1.5 text-academic-700">
                      <BookOpen className="w-4 h-4 text-academic-500" />
                      <span className="font-medium">{pub.volume_number}, {pub.issue_number}</span>
                    </div>
                  )}
                  {pub.doi && (
                    <div className="flex items-center gap-1.5 text-brand-700 ml-auto bg-brand-50 px-3 py-1 rounded-md border border-brand-100 font-mono text-xs font-semibold">
                      DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{pub.doi}</a>
                    </div>
                  )}
                </div>
              )}
              
              {/* Statistics */}
              {pub && (
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-academic-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-600" /> {pub.view_count || 0} Dilihat
                  </span>
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-brand-600" /> {pub.download_count || 0} Diunduh
                  </span>
                  {scopusCitations !== null && (
                    <span className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.666 0v23.957a11.966 11.966 0 0 0 11.966-11.978C23.632 5.372 18.261 0 11.666 0zM.368 11.978c0 6.607 5.371 11.979 11.978 11.979V0C5.739 0 .368 5.372.368 11.978z"/></svg> 
                      Scopus: {scopusCitations} Citations
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-10">
              
              {/* PDF & Citation Actions */}
              <div className="mb-10 flex flex-wrap gap-4">
                {pub?.pdf_url && (
                  <>
                    <a 
                      href={pub.pdf_url} 
                      onClick={handleDownloadClick}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      <FileText className="w-5 h-5" />
                      Lihat PDF Artikel
                    </a>
                    <a 
                      href={pub.pdf_url} 
                      onClick={handleDownloadClick}
                      download
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-academic-100 hover:bg-academic-200 text-academic-800 px-6 py-3.5 rounded-xl font-bold transition-colors"
                    >
                      <Download className="w-5 h-5 text-academic-600" />
                      Unduh
                    </a>
                  </>
                )}
                <button 
                  onClick={() => setShowCitation(!showCitation)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
                >
                  <Quote className="w-5 h-5" />
                  Kutip Artikel (Cite)
                </button>
              </div>

              {/* Citation Box */}
              {showCitation && (
                <div className="mb-10 bg-brand-50/50 border border-brand-100 rounded-2xl p-6 animate-fadeIn">
                  <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Quote className="w-4 h-4 text-brand-500" /> Format Sitasi
                  </h3>
                  
                  <div className="space-y-4">
                    {['apa', 'mla', 'chicago'].map((format) => {
                      const citationText = generateCitation(format as 'apa' | 'mla' | 'chicago');
                      return (
                        <div key={format} className="relative group">
                          <div className="absolute left-3 top-3 text-[10px] font-black text-brand-400 uppercase">{format}</div>
                          <div className="bg-white p-4 pl-12 pr-12 rounded-lg border border-brand-100 text-sm text-academic-800 font-serif leading-relaxed shadow-sm">
                            {citationText}
                          </div>
                          <button 
                            onClick={() => copyToClipboard(citationText)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-academic-400 hover:text-brand-600 bg-white hover:bg-brand-50 rounded-md transition-colors"
                            title="Salin ke Clipboard"
                          >
                            {copiedCitation ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-brand-100 pt-4">
                    <span className="text-xs font-bold text-academic-500 uppercase tracking-widest flex items-center mr-2">Download:</span>
                    <button onClick={() => {
                      const ris = `TY  - JOUR\nT1  - ${article.title}\nAU  - ${authors.map((a: any) => a.full_name).join('\nAU  - ')}\nJO  - ${journal?.name || 'RJRAKP'}\nVL  - ${pub?.volume_number || ''}\nIS  - ${pub?.issue_number || ''}\nPY  - ${pubYear || ''}\nDO  - ${pub?.doi || ''}\nUR  - ${window.location.href}\nER  - `;
                      const blob = new Blob([ris], { type: 'application/x-research-info-systems' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `citation_${article.id}.ris`;
                      a.click();
                    }} className="text-xs bg-white hover:bg-academic-50 text-academic-700 font-bold py-1.5 px-3 rounded border border-academic-200 transition-colors">.RIS (EndNote, Mendeley)</button>
                    
                    <button onClick={() => {
                      const bib = `@article{${authors[0]?.full_name.split(' ').pop()?.toLowerCase() || 'author'}${pubYear},\n  title={${article.title}},\n  author={${authors.map((a: any) => a.full_name).join(' and ')}},\n  journal={${journal?.name || 'RJRAKP'}},\n  volume={${pub?.volume_number || ''}},\n  number={${pub?.issue_number || ''}},\n  year={${pubYear || ''}},\n  doi={${pub?.doi || ''}}\n}`;
                      const blob = new Blob([bib], { type: 'application/x-bibtex' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `citation_${article.id}.bib`;
                      a.click();
                    }} className="text-xs bg-white hover:bg-academic-50 text-academic-700 font-bold py-1.5 px-3 rounded border border-academic-200 transition-colors">.BibTeX (Zotero, LaTeX)</button>
                  </div>
                </div>
              )}

              <div className="prose prose-academic max-w-none">
                <div className="flex items-center justify-between border-b-2 border-academic-100 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-academic-900 m-0">Abstrak</h3>
                  <a href="https://www.turnitin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Similarity Check
                  </a>
                </div>
                <div className="text-academic-700 leading-relaxed text-justify whitespace-pre-wrap">
                  {article.abstract || 'Abstrak tidak tersedia untuk artikel ini.'}
                </div>

                {keywordsList.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-academic-900 mb-3 uppercase tracking-wider">Kata Kunci (Keywords)</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywordsList.map((kw: string, idx: number) => (
                        <span key={idx} className="bg-academic-100 text-academic-700 px-3 py-1 rounded-md text-sm font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Meta & Creative Commons */}
            <div className="bg-slate-50 border-t border-academic-200 p-8 text-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="font-bold text-academic-900 mb-2">Copyright & Licensing</h4>
                <p className="text-academic-600 mb-4">&copy; {pubYear || new Date().getFullYear()} {authors.map((a: any) => a.full_name).join(', ')}. Hak cipta dipegang oleh penulis.</p>
                <div className="flex items-start gap-4">
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-sa.png" alt="CC BY-SA 4.0" className="h-8" />
                  </a>
                  <p className="text-xs text-academic-500 leading-relaxed max-w-lg">
                    Artikel ini merupakan artikel akses terbuka (Open Access) yang didistribusikan di bawah syarat dan ketentuan 
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-brand-600 font-semibold hover:underline ml-1">
                      Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
