import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, Download, FileText, ArrowLeft, Building2, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{article.title} | {journal?.name || 'RJRAKP'}</title>
        <meta name="description" content={article.abstract?.substring(0, 160) || 'Artikel jurnal RJRAKP'} />
        
        {/* Google Scholar Highwire Press Meta Tags */}
        <meta name="citation_title" content={article.title} />
        {authors.map((author: any, index: number) => (
          <meta key={`author-${index}`} name="citation_author" content={author.full_name} />
        ))}
        {authors.map((author: any, index: number) => (
          author.affiliation ? <meta key={`affil-${index}`} name="citation_author_institution" content={author.affiliation} /> : null
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
                      <span className="font-bold text-academic-900 text-lg">{author.full_name} {author.is_corresponding && '*'}</span>
                      {author.affiliation && (
                        <span className="text-sm text-academic-600 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-academic-400" /> {author.affiliation}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Publication Meta */}
              {pub && (
                <div className="flex flex-wrap items-center gap-4 text-sm bg-academic-50 p-4 rounded-xl border border-academic-100">
                  {pub.publication_date && (
                    <div className="flex items-center gap-1.5 text-academic-700">
                      <Calendar className="w-4 h-4 text-academic-500" />
                      <span className="font-medium">Diterbitkan:</span> {pubDate}
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
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-10">
              
              {/* PDF Action */}
              {pub?.pdf_url && (
                <div className="mb-10 flex gap-4">
                  <a 
                    href={pub.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <FileText className="w-5 h-5" />
                    Lihat PDF Artikel
                  </a>
                  <a 
                    href={pub.pdf_url} 
                    download
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-academic-100 hover:bg-academic-200 text-academic-800 px-6 py-3.5 rounded-xl font-bold transition-colors"
                  >
                    <Download className="w-5 h-5 text-academic-600" />
                    Unduh
                  </a>
                </div>
              )}

              <div className="prose prose-academic max-w-none">
                <h3 className="text-xl font-bold text-academic-900 border-b-2 border-academic-100 pb-2 mb-4">Abstrak</h3>
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
            
            {/* Footer Meta */}
            <div className="bg-academic-900 text-academic-300 p-6 text-sm text-center">
              <p>&copy; {pubYear || new Date().getFullYear()} {journal?.name || 'RJRAKP'}. Hak Cipta Dilindungi Undang-Undang.</p>
              <p className="mt-1 text-xs opacity-60">Artikel ini didistribusikan di bawah lisensi akses terbuka (Open Access).</p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
