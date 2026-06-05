import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Edit, UserCheck, CheckCircle, Clock, X, Download, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [reviewForm, setReviewForm] = useState({
    recommendation: '',
    comments_for_author: '',
    comments_for_editor: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
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
            anonymous_manuscript_file,
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.recommendation) {
      alert("Pilih rekomendasi terlebih dahulu.");
      return;
    }
    if (!reviewForm.comments_for_author || !reviewForm.comments_for_editor) {
      alert("Mohon isi semua komentar untuk author dan editor.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          assignment_id: selectedAssignment.id,
          recommendation: reviewForm.recommendation,
          comments_for_author: reviewForm.comments_for_author,
          comments_for_editor: reviewForm.comments_for_editor
        });
      
      if (reviewError) throw reviewError;

      const { error: updateError } = await supabase
        .from('review_assignments')
        .update({ status: 'completed' })
        .eq('id', selectedAssignment.id);

      if (updateError) throw updateError;
      
      setSelectedAssignment(null);
      setReviewForm({ recommendation: '', comments_for_author: '', comments_for_editor: '' });
      fetchAssignments();
    } catch (err: any) {
      console.error(err);
      alert("Gagal submit review: " + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.status === 'PENDING') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-20 text-center bg-white p-10 rounded-xl border border-amber-200 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-academic-900 mb-4">Permohonan Reviewer sedang menunggu verifikasi Admin</h2>
          <p className="text-academic-600">Terima kasih telah mendaftar. Akun dan CV Anda sedang dalam proses peninjauan oleh Administrator. Silakan cek kembali secara berkala, atau hubungi admin jika membutuhkan bantuan.</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = assignments.filter((a) => a.status !== 'completed' && !(a.reviews && a.reviews.length > 0)).length;
  const completedCount = assignments.filter((a) => a.status === 'completed' || (a.reviews && a.reviews.length > 0)).length;
  const overdueCount = assignments.filter((a) => a.status !== 'completed' && !(a.reviews && a.reviews.length > 0) && a.due_date && new Date(a.due_date) < new Date()).length;

  return (
    <DashboardLayout>
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] shadow-2xl border border-academic-100 flex flex-col">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl shrink-0">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Form Review Artikel</h3>
              <button onClick={() => setSelectedAssignment(null)} className="text-academic-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="mb-6 bg-slate-50 p-5 rounded-lg border border-slate-200 overflow-y-auto flex-1 min-h-0 shadow-inner">
                <h4 className="font-bold text-sm text-brand-600 uppercase tracking-wide mb-1">
                  {selectedAssignment.articles?.journals?.name || 'Jurnal Tidak Diketahui'}
                </h4>
                <h2 className="text-xl font-bold font-serif text-academic-900 mb-3">
                  {selectedAssignment.articles?.title}
                </h2>
                <div className="mb-4">
                  <p className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Abstrak</p>
                  <p className="text-sm text-academic-700 leading-relaxed text-justify">
                    {selectedAssignment.articles?.abstract || 'Tidak ada abstrak.'}
                  </p>
                </div>
                {selectedAssignment.articles?.anonymous_manuscript_file ? (() => {
                  const url = selectedAssignment.articles.anonymous_manuscript_file;
                  const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('/pdf/') || url.includes('dummy.pdf');
                  const isWord = url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc');
                  
                  let embedUrl = '';
                  if (isPdf) {
                    embedUrl = url;
                  } else if (isWord) {
                    embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                  }
                  
                  return (
                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <p className="text-xs font-bold text-academic-500 uppercase tracking-widest font-black">Naskah Lengkap Manuskrip</p>
                        <div className="flex items-center gap-2">
                          <a 
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Buka Pratinjau Penuh
                          </a>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                          </a>
                        </div>
                      </div>
                      
                      {embedUrl ? (
                        <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-slate-100 shadow-inner">
                          <iframe
                            src={embedUrl}
                            className="w-full border-0 block"
                            title="Pratinjau Manuskrip"
                            style={{ height: '650px', minHeight: '650px', overflow: 'hidden' }}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                          <p className="text-sm text-academic-600 mb-2">Manuskrip tersedia tetapi tipe file tidak mendukung pratinjau langsung.</p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            <Download className="w-4 h-4" /> Unduh Dokumen
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })() : selectedAssignment.articles?.manuscript_file ? (
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-center text-xs space-y-2">
                      <p className="font-bold text-rose-700">⚠️ File Anonim Belum Diunggah</p>
                      <p className="text-rose-600">Naskah yang tersedia menggunakan format lama (mungkin berisi nama penulis).</p>
                      <a href={selectedAssignment.articles.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex text-brand-700 font-bold border border-brand-200 bg-white px-3 py-1 rounded mt-2">
                        Lihat Naskah Lama
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white/60 border border-dashed border-slate-200 rounded-lg text-center mt-4">
                    <FileText className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                    <p className="text-xs text-academic-500">Tidak ada naskah terunggah. Hanya menampilkan informasi abstrak.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-academic-200 shrink-0 text-xs">
                <div>
                  <label className="block text-xs font-bold text-academic-900 mb-1">Rekomendasi Keputusan *</label>
                  <select
                    value={reviewForm.recommendation}
                    onChange={(e) => setReviewForm({ ...reviewForm, recommendation: e.target.value })}
                    className="w-full border border-academic-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 py-1.5 text-xs bg-white"
                  >
                    <option value="">-- Pilih Rekomendasi --</option>
                    <option value="accept">Accept Submission (Diterima)</option>
                    <option value="minor_revision">Revisions Required (Revisi Minor)</option>
                    <option value="major_revision">Resubmit for Review (Revisi Mayor)</option>
                    <option value="reject">Decline Submission (Ditolak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-900 mb-1">Komentar untuk Penulis (Author) *</label>
                  <textarea
                    rows={2}
                    value={reviewForm.comments_for_author}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments_for_author: e.target.value })}
                    placeholder="Tulis masukan, kritik konstruktif, dan perbaikan untuk penulis..."
                    className="w-full border border-academic-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs px-3 py-2 bg-white"
                  />
                  <p className="text-[10px] text-academic-500 mt-0.5">Komentar ini akan terlihat oleh penulis.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-900 mb-1">Komentar untuk Editor *</label>
                  <textarea
                    rows={2}
                    value={reviewForm.comments_for_editor}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments_for_editor: e.target.value })}
                    placeholder="Sampaikan catatan rahasia kepada editor (tidak terlihat oleh penulis)..."
                    className="w-full border border-academic-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs px-3 py-2 bg-white"
                  />
                  <p className="text-[10px] text-academic-500 mt-0.5">Komentar rahasia ini hanya bisa dibaca oleh editor/admin.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-academic-100 bg-academic-50/50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setSelectedAssignment(null)}
                disabled={submitting}
                className="px-4 py-2 border border-academic-300 text-academic-700 font-bold rounded-lg hover:bg-academic-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Reviewer</h1>
        <p className="text-academic-500 mb-8">Selamat datang kembali, {user?.full_name}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Pending Review</h3>
               <FileText className="w-5 h-5 text-amber-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Review Selesai</h3>
               <CheckCircle className="w-5 h-5 text-emerald-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-academic-900">{loading ? '-' : completedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-academic-500 text-xs font-bold uppercase tracking-widest">Overdue</h3>
               <Clock className="w-5 h-5 text-rose-500" />
             </div>
             <p className="text-3xl font-bold font-serif text-rose-600">{loading ? '-' : overdueCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Tugas Review</h3>
          </div>
          
          <div className="divide-y divide-academic-100">
            {loading ? (
              <div className="p-6 text-center text-academic-500">Memuat data...</div>
            ) : assignments.length === 0 ? (
              <div className="p-6 text-center text-academic-500">Belum ada tugas review.</div>
            ) : (
              assignments.map((assignment: any) => {
                const isCompleted = assignment.status === 'completed' || (assignment.reviews && assignment.reviews.length > 0);
                return (
                  <div key={assignment.id} className="p-6 hover:bg-academic-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        {isCompleted ? (
                          <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded mb-2 border border-emerald-200">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded mb-2 border border-amber-200">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Menunggu Review</span>
                          </span>
                        )}
                        
                        <h4 className="text-lg font-bold text-academic-900 font-serif leading-tight mt-1">
                          {assignment.articles?.title || 'Judul Tidak Tersedia'}
                        </h4>
                        <p className="text-xs font-bold text-brand-600 mt-2 uppercase tracking-wider">
                          {assignment.articles?.journals?.name || 'Jurnal Tidak Diketahui'}
                        </p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-academic-500">
                          <p>Ditugaskan: {new Date(assignment.assigned_date).toLocaleDateString('id-ID')}</p>
                          {assignment.due_date && (
                            <p className={new Date(assignment.due_date) < new Date() && !isCompleted ? 'text-rose-600 font-bold' : ''}>
                              Batas Waktu: {new Date(assignment.due_date).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {!isCompleted && (
                        <button 
                          onClick={() => setSelectedAssignment(assignment)}
                          className="bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 px-4 py-2 rounded text-sm font-bold transition-colors whitespace-nowrap self-start sm:self-center"
                        >
                          Lanjutkan Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

