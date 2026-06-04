import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, Eye, X, MessageSquare, AlertCircle, Calendar } from 'lucide-react';

export default function ReviewerHistory() {
  const { user } = useAuth();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchMyHistory();
    }
  }, [user?.id]);

  const fetchMyHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_assignments')
        .select(`
          id,
          status,
          assigned_date,
          due_date,
          articles (
            id,
            title,
            abstract,
            manuscript_file,
            journals (
              name
            )
          ),
          reviews (
            id,
            recommendation,
            comments_for_author,
            comments_for_editor,
            created_at
          )
        `)
        .eq('reviewer_id', user?.id)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching reviewer history:', err);
    } finally {
      setLoading(false);
    }
  };

  const recommendLabels: Record<string, string> = {
    accept: 'Accept Submission (Diterima)',
    minor_revision: 'Revisions Required (Revisi Minor)',
    major_revision: 'Resubmit for Review (Revisi Mayor)',
    reject: 'Decline Submission (Ditolak)'
  };

  const completedReviews = assignments.filter(
    (a) => a.status === 'completed' || (a.reviews && a.reviews.length > 0)
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Riwayat Review</h1>
          <p className="text-academic-500">Daftar riwayat review artikel yang telah selesai Anda kerjakan.</p>
        </div>

        {/* History List */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-academic-500">
              <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></span>
              <p>Memuat riwayat review...</p>
            </div>
          ) : completedReviews.length === 0 ? (
            <div className="p-8 text-center text-academic-500 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-academic-400" />
              <p>Belum ada riwayat review artikel yang telah selesai.</p>
            </div>
          ) : (
            <div className="divide-y divide-academic-100">
              {completedReviews.map((assign: any) => {
                const review = assign.reviews?.[0];

                return (
                  <div key={assign.id} className="p-6 hover:bg-academic-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Selesai
                          </span>
                          <span className="text-xs text-academic-500 font-bold uppercase tracking-wider">
                            {assign.articles?.journals?.name || 'Jurnal Tidak Diketahui'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold font-serif text-academic-900 leading-tight">
                          {assign.articles?.title || 'Judul Tidak Tersedia'}
                        </h3>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-academic-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Ditugaskan: {new Date(assign.assigned_date).toLocaleDateString('id-ID')}
                          </span>
                          {review && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Disubmit: {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>

                        {review && (
                          <div className="mt-2 inline-flex items-center gap-2">
                            <span className="text-xs font-semibold text-academic-500">Rekomendasi Anda:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                              review.recommendation === 'accept' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              review.recommendation === 'reject' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              review.recommendation === 'minor_revision' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {recommendLabels[review.recommendation] || review.recommendation}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0">
                        <button
                          onClick={() => setSelectedReview(assign)}
                          className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-brand-200"
                        >
                          <Eye className="w-4 h-4" /> Lihat Hasil Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: View Review Details */}
        {selectedReview && (() => {
          const review = selectedReview.reviews?.[0];
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-academic-100 flex flex-col">
                <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl shrink-0">
                  <div>
                    <h3 className="text-lg font-bold text-academic-900 font-serif">Rincian Hasil Review</h3>
                    <p className="text-xs text-academic-500">{selectedReview.articles?.journals?.name || 'Jurnal'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-academic-400 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Article Title */}
                  <div>
                    <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1.5">Judul Artikel</h4>
                    <p className="text-base font-bold font-serif text-academic-900 leading-snug">
                      {selectedReview.articles?.title}
                    </p>
                  </div>

                  {/* Meta Dates & Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Tanggal Submit</h4>
                      <p className="text-sm font-bold text-academic-800">
                        {review?.created_at ? new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Rekomendasi Keputusan</h4>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                        review?.recommendation === 'accept' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        review?.recommendation === 'reject' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        review?.recommendation === 'minor_revision' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {recommendLabels[review?.recommendation] || review?.recommendation || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Comments for Authors */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-brand-700 font-bold text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <h4>Komentar untuk Penulis (Author)</h4>
                    </div>
                    <div className="bg-academic-50/30 p-4 rounded-xl border border-academic-100 text-sm text-academic-700 leading-relaxed whitespace-pre-wrap">
                      {review?.comments_for_author || 'Tidak ada komentar.'}
                    </div>
                  </div>

                  {/* Comments for Editors */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-brand-700 font-bold text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <h4>Catatan Rahasia untuk Editor</h4>
                    </div>
                    <div className="bg-amber-50/10 p-4 rounded-xl border border-amber-100 text-sm text-academic-700 leading-relaxed whitespace-pre-wrap">
                      {review?.comments_for_editor || 'Tidak ada komentar rahasia.'}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-academic-100 bg-academic-50/50 flex justify-end rounded-b-xl shrink-0">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-5 py-2 bg-academic-100 hover:bg-academic-200 text-academic-800 font-bold rounded-lg transition-colors text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}
