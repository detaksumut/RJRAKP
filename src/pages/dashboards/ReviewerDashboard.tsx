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
    score_originality: '3',
    score_methodology: '3',
    score_readability: '3',
    score_contribution: '3',
    comments_for_author: '',
    comments_for_editor: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'aktivitas'>('ringkasan');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleAcceptInvitation = async (assignmentId: string) => {
    setUpdatingStatus(assignmentId);
    try {
      const { error } = await supabase
        .from('review_assignments')
        .update({ status: 'accepted' })
        .eq('id', assignmentId);

      if (error) throw error;
      
      // Update local state
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'accepted' } : a));
      alert("Terima kasih! Anda telah menyetujui peninjauan ini. Sekarang Anda dapat membaca naskah lengkap dan mengisi ulasan.");
    } catch (err: any) {
      console.error(err);
      alert("Gagal menerima undangan: " + (err.message || ''));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeclineInvitation = async (assignmentId: string) => {
    const confirmDecline = window.confirm("Apakah Anda yakin ingin menolak undangan peninjauan ini?");
    if (!confirmDecline) return;

    setUpdatingStatus(assignmentId);
    try {
      const { error } = await supabase
        .from('review_assignments')
        .update({ status: 'declined' })
        .eq('id', assignmentId);

      if (error) throw error;
      
      // Update local state
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'declined' } : a));
      alert("Undangan peninjauan telah ditolak.");
    } catch (err: any) {
      console.error(err);
      alert("Gagal menolak undangan: " + (err.message || ''));
    } finally {
      setUpdatingStatus(null);
    }
  };

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
      const formattedEditorComments = `[SKOR REVIEW]\n- Orisinalitas & Kebaruan: ${reviewForm.score_originality}/5\n- Metodologi & Analisis: ${reviewForm.score_methodology}/5\n- Kejelasan & Tata Bahasa: ${reviewForm.score_readability}/5\n- Kontribusi terhadap Ilmu: ${reviewForm.score_contribution}/5\n\n[CATATAN RAHASIA UNTUK EDITOR]\n${reviewForm.comments_for_editor}`;

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          assignment_id: selectedAssignment.id,
          recommendation: reviewForm.recommendation,
          comments_for_author: reviewForm.comments_for_author,
          comments_for_editor: formattedEditorComments
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

  const pendingCount = assignments.filter((a) => (a.status === 'assigned' || a.status === 'accepted') && a.status !== 'completed' && a.status !== 'declined').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const overdueCount = assignments.filter((a) => (a.status === 'assigned' || a.status === 'accepted') && a.status !== 'completed' && a.status !== 'declined' && a.due_date && new Date(a.due_date) < new Date()).length;

  return (
    <DashboardLayout>
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[95vh] shadow-2xl border border-academic-100 flex flex-col">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl shrink-0">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Form Review Artikel</h3>
              <button onClick={() => setSelectedAssignment(null)} className="text-academic-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 overflow-y-auto flex-1 min-h-0 shadow-inner">
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

              <div className="lg:w-[320px] shrink-0 overflow-y-auto space-y-4 text-xs lg:pr-2 pb-2">
                
                {/* Timeline Section */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-academic-900 mb-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Timeline Review
                  </h4>
                  <div className="relative pl-5 border-l border-brand-200 space-y-4 text-[10px]">
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <p className="font-bold text-academic-800">Undangan Review Dikirim</p>
                      <p className="text-academic-500">
                        {new Date(selectedAssignment.assigned_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <p className="font-bold text-academic-800">Undangan Disetujui</p>
                      <p className="text-academic-500">Reviewer bersedia mengulas</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white"></div>
                      <p className="font-bold text-academic-800">Batas Akhir Penyerahan</p>
                      <p className="text-rose-600 font-bold">
                        {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scoring Section */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-academic-900 mb-3 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-600" />
                    Penilaian Artikel (Skala 1 - 5)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-academic-700 mb-1">Orisinalitas & Kebaruan</label>
                      <select value={reviewForm.score_originality} onChange={(e) => setReviewForm({ ...reviewForm, score_originality: e.target.value })} className="w-full border border-academic-300 rounded shadow-sm text-xs py-1 px-2">
                        <option value="1">1 - Sangat Buruk</option><option value="2">2 - Buruk</option><option value="3">3 - Cukup</option><option value="4">4 - Baik</option><option value="5">5 - Sangat Baik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-academic-700 mb-1">Metodologi & Analisis</label>
                      <select value={reviewForm.score_methodology} onChange={(e) => setReviewForm({ ...reviewForm, score_methodology: e.target.value })} className="w-full border border-academic-300 rounded shadow-sm text-xs py-1 px-2">
                        <option value="1">1 - Sangat Buruk</option><option value="2">2 - Buruk</option><option value="3">3 - Cukup</option><option value="4">4 - Baik</option><option value="5">5 - Sangat Baik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-academic-700 mb-1">Kejelasan & Tata Bahasa</label>
                      <select value={reviewForm.score_readability} onChange={(e) => setReviewForm({ ...reviewForm, score_readability: e.target.value })} className="w-full border border-academic-300 rounded shadow-sm text-xs py-1 px-2">
                        <option value="1">1 - Sangat Buruk</option><option value="2">2 - Buruk</option><option value="3">3 - Cukup</option><option value="4">4 - Baik</option><option value="5">5 - Sangat Baik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-academic-700 mb-1">Kontribusi terhadap Ilmu</label>
                      <select value={reviewForm.score_contribution} onChange={(e) => setReviewForm({ ...reviewForm, score_contribution: e.target.value })} className="w-full border border-academic-300 rounded shadow-sm text-xs py-1 px-2">
                        <option value="1">1 - Sangat Buruk</option><option value="2">2 - Buruk</option><option value="3">3 - Cukup</option><option value="4">4 - Baik</option><option value="5">5 - Sangat Baik</option>
                      </select>
                    </div>
                  </div>
                </div>

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

      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Dashboard Reviewer</h1>
          <p className="text-academic-500">Selamat datang kembali, {user?.full_name}</p>
        </div>

        {/* Stats Section */}
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

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Tasks and Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* OJS style Tab Navigation */}
            <div className="flex border-b border-academic-200 bg-white p-2.5 rounded-xl border">
              <button
                onClick={() => setActiveTab('ringkasan')}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ringkasan'
                    ? 'bg-brand-50 text-brand-800 shadow-sm'
                    : 'text-academic-500 hover:text-academic-800'
                }`}
              >
                Ringkasan (Antrean Aktif)
              </button>
              <button
                onClick={() => setActiveTab('aktivitas')}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'aktivitas'
                    ? 'bg-brand-50 text-brand-800 shadow-sm'
                    : 'text-academic-500 hover:text-academic-800'
                }`}
              >
                Aktivitas (Arsip Riwayat)
              </button>
            </div>

            <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-academic-100">
                {loading ? (
                  <div className="p-6 text-center text-academic-500 text-xs font-medium">Memuat data penugasan...</div>
                ) : (() => {
                  const filtered = assignments.filter((a) => {
                    if (activeTab === 'ringkasan') {
                      return (a.status === 'assigned' || a.status === 'accepted') && a.status !== 'completed' && a.status !== 'declined';
                    } else {
                      return a.status === 'completed' || a.status === 'declined';
                    }
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center text-academic-500 text-xs">
                        Tidak ada tugas review pada kategori ini.
                      </div>
                    );
                  }

                  return filtered.map((assignment: any) => {
                    const isAssignedOnly = assignment.status === 'assigned';
                    const isDeclined = assignment.status === 'declined';
                    const isCompleted = assignment.status === 'completed';

                    return (
                      <div key={assignment.id} className="p-6 hover:bg-academic-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-2.5">
                            <div className="flex flex-wrap gap-2 items-center">
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200 uppercase tracking-wide">
                                  <CheckCircle className="w-3 h-3" /> Selesai
                                </span>
                              )}
                              {isDeclined && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md border border-rose-200 uppercase tracking-wide">
                                  <X className="w-3 h-3" /> Ditolak
                                </span>
                              )}
                              {isAssignedOnly && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200 uppercase tracking-wide">
                                  <Clock className="w-3 h-3" /> Undangan Menunggu Konfirmasi
                                </span>
                              )}
                              {!isCompleted && !isDeclined && !isAssignedOnly && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200 uppercase tracking-wide">
                                  <Clock className="w-3 h-3" /> Ulasan Aktif
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                {assignment.articles?.journals?.name || 'Jurnal'}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-academic-900 font-serif leading-snug">
                              {assignment.articles?.title || 'Judul Tidak Tersedia'}
                            </h4>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-academic-500">
                              <span>Ditugaskan: {new Date(assignment.assigned_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              {assignment.due_date && !isCompleted && !isDeclined && (
                                <span className={new Date(assignment.due_date) < new Date() ? 'text-rose-600 font-bold' : ''}>
                                  Batas Waktu: {new Date(assignment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              )}
                            </div>

                            {/* Invitation Consent Warning Box */}
                            {isAssignedOnly && (
                              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 leading-normal space-y-2">
                                <strong>⚠️ Pernyataan Etika & Konfidensialitas:</strong>
                                <p className="text-amber-800 text-[11px] text-justify leading-relaxed">
                                  Sebelum dapat mengakses naskah lengkap dan memberikan ulasan, Anda berkewajiban mengonfirmasi kesediaan. Dengan mengklik "Terima", Anda menyatakan bersedia mengulas secara profesional dan bebas dari benturan kepentingan dengan penulis.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:items-end gap-2 shrink-0 self-start sm:self-center">
                            {isAssignedOnly ? (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => handleDeclineInvitation(assignment.id)}
                                  disabled={updatingStatus === assignment.id}
                                  className="px-3 py-2 border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Tolak
                                </button>
                                <button
                                  onClick={() => handleAcceptInvitation(assignment.id)}
                                  disabled={updatingStatus === assignment.id}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                                >
                                  Terima Ulasan
                                </button>
                              </div>
                            ) : (
                              !isCompleted && !isDeclined && (
                                <button 
                                  onClick={() => setSelectedAssignment(assignment)}
                                  className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                                >
                                  Lanjutkan Review
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>

          {/* Right Column: Widgets */}
          <div className="space-y-6">
            
            {/* Widget Panduan Reviewer */}
            <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-academic-900 border-b border-academic-100 pb-2">
                Panduan Reviewer
              </h4>
              <p className="text-xs text-academic-500 leading-relaxed text-justify">
                Unduh dokumen petunjuk teknis peninjauan artikel untuk memahami standar orisinalitas, validitas metodologi, serta format pelaporan ulasan di RJRAKP.
              </p>
              <button
                onClick={() => alert("Fitur Unduh Panduan: Berkas panduan mitra bestari sedang disiapkan oleh dewan penyunting.")}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Panduan Ulasan (PDF)
              </button>
            </div>

            {/* Widget Kebijakan Review */}
            <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-academic-900 border-b border-academic-100 pb-2">
                Kebijakan Review Jurnal
              </h4>
              <ul className="text-xs text-academic-500 space-y-2 leading-relaxed text-justify">
                <li>
                  🔐 <strong>Double-Blind Peer Review</strong>: Identitas reviewer dan penulis disembunyikan secara timbal balik untuk menjaga objektivitas ulasan ilmiah.
                </li>
                <li>
                  🤫 <strong>Kerahasiaan (Confidentiality)</strong>: Seluruh naskah adalah dokumen rahasia. Dilarang mendistribusikan, membagikan, atau menggunakan ide naskah sebelum terbit resmi.
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

