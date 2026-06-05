import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, ArrowLeft, Upload, Send, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthorArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [article, setArticle] = useState<any | null>(null);
  const [editorialDecisions, setEditorialDecisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload revision states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    if (user?.id && id) {
      fetchArticleDetails();
    }
  }, [user?.id, id]);

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);

      // 1. Fetch Article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*, journals(name)')
        .eq('id', id)
        .eq('submitter_id', user?.id)
        .single();

      if (articleError) throw articleError;
      setArticle(articleData);

      // 2. Fetch Editorial Decisions
      const { data: decisionData } = await supabase
        .from('editorial_decisions')
        .select('*')
        .eq('article_id', id)
        .order('decision_date', { ascending: false });

      if (decisionData) setEditorialDecisions(decisionData);

      // 3. Fetch Reviews (via review_assignments)
      const { data: reviewsData } = await supabase
        .from('review_assignments')
        .select(`
          id,
          status,
          reviews (
            recommendation,
            comments_for_author,
            created_at
          )
        `)
        .eq('article_id', id)
        .eq('status', 'completed');

      // Flatten and filter reviews that have comments
      if (reviewsData) {
        const flatReviews = reviewsData
          .flatMap((assignment: any) => assignment.reviews || [])
          .filter((review: any) => review && review.comments_for_author);
        setReviews(flatReviews);
      }

    } catch (err) {
      console.error('Error fetching article details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !article) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `revised_manuscript_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('manuscripts').upload(fileName, selectedFile);
      if (uploadError) throw new Error(`Gagal mengunggah file revisi: ${uploadError.message}`);
      
      const manuscriptUrl = supabase.storage.from('manuscripts').getPublicUrl(fileName).data.publicUrl;

      // Update article status and manuscript file
      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          manuscript_file: manuscriptUrl,
          status: 'in_review' // Or back to submitted/revised based on your workflow
        })
        .eq('id', article.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Author submitted revised manuscript for article: ${article.title}`,
        entity_type: 'articles',
        entity_id: article.id
      });

      setUploadSuccess('File revisi berhasil diunggah! Status artikel telah diperbarui.');
      setSelectedFile(null);
      fetchArticleDetails(); // Refresh data

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Terjadi kesalahan saat mengunggah revisi.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl p-8 text-center text-academic-500">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></span>
          <p>Memuat detail artikel...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl text-center p-8 bg-white rounded-xl border border-academic-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-academic-900 mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-academic-500 mb-6">Artikel yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link to="/dashboard/author/articles" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const recommendLabels: Record<string, string> = {
    accept: 'Diterima (Accept)',
    minor_revision: 'Revisi Minor',
    major_revision: 'Revisi Mayor',
    reject: 'Ditolak (Reject)',
    revision: 'Perlu Revisi'
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Link 
          to="/dashboard/author/articles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors uppercase tracking-widest mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
        </Link>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Detail Artikel & Revisi</h1>
            <p className="text-academic-500">Lihat status, komentar reviewer, dan unggah naskah perbaikan Anda.</p>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Status Saat Ini</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border capitalize ${
              article.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              article.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              article.status === 'revised' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {(article.status || '').replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* 1. Article Details Card */}
        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
          <span className="inline-block text-[10px] font-black text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase mb-3">
            {article.journals?.name || 'Jurnal'}
          </span>
          <h2 className="font-serif font-bold text-xl text-academic-900 mb-4">{article.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Tanggal Submit</span>
              <p className="font-medium text-academic-800">{new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Manuskrip Saat Ini</span>
              <a href={article.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                <FileText className="w-4 h-4" /> Buka / Unduh File
              </a>
            </div>
          </div>
          
          <div>
            <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Abstrak</span>
            <p className="text-sm text-academic-700 leading-relaxed text-justify">{article.abstract}</p>
          </div>
        </div>

        {/* 2. Reviewer & Editor Feedback */}
        <div className="mb-6 space-y-4">
          <h3 className="font-serif font-bold text-lg text-academic-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-academic-500" /> Catatan Perbaikan & Keputusan
          </h3>
          
          {editorialDecisions.length === 0 && reviews.length === 0 ? (
            <div className="bg-academic-50 border border-academic-200 rounded-xl p-6 text-center text-academic-500">
              Belum ada catatan atau keputusan dari Editor/Reviewer.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Editorial Decisions */}
              {editorialDecisions.map((decision) => (
                <div key={decision.id} className="bg-white border border-brand-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-brand-50 px-5 py-3 border-b border-brand-100 flex justify-between items-center">
                    <span className="font-bold text-brand-900 text-sm">Keputusan Editorial</span>
                    <span className="text-xs text-brand-600 font-medium">
                      {new Date(decision.decision_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-academic-500 uppercase tracking-widest block mb-1">Keputusan</span>
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded font-bold text-sm">
                        {recommendLabels[decision.decision] || decision.decision}
                      </span>
                    </div>
                    {decision.comments && (
                      <div>
                        <span className="text-xs font-bold text-academic-500 uppercase tracking-widest block mb-1">Pesan untuk Penulis</span>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-academic-700 text-sm whitespace-pre-wrap leading-relaxed italic font-serif">
                          "{decision.comments}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Reviewer Comments */}
              {reviews.map((review, index) => (
                <div key={index} className="bg-white border border-academic-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-academic-50 px-5 py-3 border-b border-academic-100 flex justify-between items-center">
                    <span className="font-bold text-academic-800 text-sm">Hasil Review Mitra Bestari #{index + 1}</span>
                    <span className="text-xs text-academic-500 font-medium">
                      {new Date(review.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-academic-500 uppercase tracking-widest block mb-1">Rekomendasi</span>
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded font-bold text-sm">
                        {recommendLabels[review.recommendation] || review.recommendation}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-academic-500 uppercase tracking-widest block mb-1">Komentar / Saran Perbaikan</span>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-academic-700 text-sm whitespace-pre-wrap leading-relaxed italic font-serif">
                        "{review.comments_for_author}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Upload Revision Form */}
        {['revised', 'in_review', 'under_review'].includes(article.status) && (
          <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-md">
            <h3 className="font-serif font-bold text-lg text-academic-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-600" /> Unggah Manuskrip Revisi
            </h3>
            <p className="text-sm text-academic-500 mb-6">
              Jika Anda telah melakukan perbaikan sesuai catatan dari Editor dan Reviewer, silakan unggah file manuskrip terbaru di sini.
            </p>

            {uploadError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm font-medium mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium mb-4 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadRevision} className="space-y-4">
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-brand-50/30 hover:bg-brand-50 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <Upload className={`w-6 h-6 mb-2 ${selectedFile ? 'text-brand-600' : 'text-brand-400'}`} />
                    {selectedFile ? (
                      <p className="text-sm text-brand-700 font-bold">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-brand-700 font-bold mb-1">Klik untuk memilih file revisi</p>
                        <p className="text-xs text-academic-500">Format DOC, DOCX, atau PDF (Max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    required 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={uploading || !selectedFile}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {uploading ? (
                    'Mengunggah...'
                  ) : (
                    <><Send className="w-4 h-4" /> Kirim Revisi</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
