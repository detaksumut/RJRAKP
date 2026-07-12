import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchOjsArticles, OjsArticle } from '../../lib/ojs';
import { publishArticleToZenodo, ZenodoMetadata } from '../../lib/zenodo';
import { RefreshCw, DownloadCloud, UploadCloud, CheckCircle, Search, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminOjsImporter() {
  const [url, setUrl] = useState('https://jramk.com/index.php/jramk/oai');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<OjsArticle[]>([]);
  const [error, setError] = useState('');
  
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean, message: string, doi?: string }>>({});

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOjsArticles(url);
      setArticles(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data OJS');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (article: OjsArticle) => {
    setPublishingId(article.id);
    try {
      const metadata: ZenodoMetadata = {
        title: article.title,
        description: article.description || 'Diimpor dari OJS JRAMK',
        upload_type: 'publication',
        publication_type: 'article',
        creators: article.creator.split(',').map(name => ({ name: name.trim() })),
        access_right: 'open',
        keywords: article.subject || ['OJS Import']
      };

      // Ensure we have a valid PDF URL
      let fileUrl = article.pdfUrl;
      if (!fileUrl) {
        throw new Error("Artikel ini tidak memiliki link PDF yang terdeteksi di metadata OAI.");
      }

      // Gunakan proxy cors-anywhere untuk menghindari CORS saat download PDF
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fileUrl)}`;
      
      const fileName = `JRAMK_Article_${article.id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const res = await publishArticleToZenodo(metadata, proxyUrl, fileName);

      if (res.success && res.doi) {
        setResults(prev => ({ ...prev, [article.id]: { success: true, message: 'Berhasil!', doi: res.doi } }));
      } else {
        throw new Error(res.error || 'Gagal menerbitkan ke Zenodo');
      }
    } catch (err: any) {
      setResults(prev => ({ ...prev, [article.id]: { success: false, message: err.message } }));
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-academic-900">Integrasi OJS & DOI (Mesin Penyedot)</h1>
          <p className="text-academic-500 mt-1">Sedot artikel dari jurnal OJS eksternal dan terbitkan ke Zenodo untuk mendapatkan DOI.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-academic-700">URL OAI-PMH Jurnal Target</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-academic-200 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="https://jurnal.com/index.php/nama/oai"
            />
            <button 
              onClick={handleFetch}
              disabled={loading}
              className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
              Sedot Data
            </button>
          </div>
          {error && <div className="text-rose-600 text-sm flex items-center gap-1 mt-2"><AlertCircle className="w-4 h-4"/> {error}</div>}
        </div>

        {articles.length > 0 && (
          <div className="bg-white border border-academic-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-academic-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-academic-800">Hasil Tarikan: {articles.length} Artikel</h3>
            </div>
            <div className="divide-y divide-academic-100 max-h-[600px] overflow-y-auto">
              {articles.map(article => (
                <div key={article.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-academic-900">{article.title}</h4>
                    <p className="text-sm text-academic-600">{article.creator}</p>
                    <div className="flex items-center gap-3 text-xs text-academic-400">
                      <span>Terbit: {article.date}</span>
                      {article.pdfUrl && <a href={article.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> View PDF</a>}
                    </div>
                    {results[article.id] && (
                      <div className={`mt-2 p-2 rounded text-sm ${results[article.id].success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {results[article.id].success ? (
                          <span className="flex items-center gap-1 font-bold"><CheckCircle className="w-4 h-4"/> DOI Terbit: {results[article.id].doi}</span>
                        ) : (
                          <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {results[article.id].message}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => handlePublish(article)}
                      disabled={publishingId === article.id || results[article.id]?.success}
                      className={`px-4 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                        results[article.id]?.success 
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      {publishingId === article.id ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</>
                      ) : results[article.id]?.success ? (
                        <><CheckCircle className="w-4 h-4" /> Berhasil</>
                      ) : (
                        <><UploadCloud className="w-4 h-4" /> Terbitkan ke Zenodo</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
