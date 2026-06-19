import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FileText, CheckSquare, Eye, ArrowLeft, Download, 
  MessageSquare, User, Calendar, Award, Send, X, AlertCircle,
  Bold, Italic, Underline, Link2, Image, List, ListOrdered, Maximize2, Upload
} from 'lucide-react';

const parseEditorComments = (comments: string) => {
  if (!comments) return { scores: null, notes: '' };
  
  if (comments.includes('[SKOR REVIEW]')) {
    try {
      const parts = comments.split('[CATATAN RAHASIA UNTUK EDITOR]');
      const scoreSection = parts[0];
      const notesSection = parts[1] || '';
      
      const scores: { label: string; value: string }[] = [];
      const lines = scoreSection.split('\n');
      lines.forEach(line => {
        if (line.trim().startsWith('-')) {
          const cleanLine = line.replace('-', '').trim();
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex !== -1) {
            const label = cleanLine.substring(0, colonIndex).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();
            scores.push({ label, value });
          }
        }
      });
      
      return {
        scores: scores.length > 0 ? scores : null,
        notes: notesSection.trim()
      };
    } catch (e) {
      return { scores: null, notes: comments };
    }
  }
  
  return { scores: null, notes: comments };
};

export default function EditorDecisions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('articleId');

  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [reviewAssignments, setReviewAssignments] = useState<any[]>([]);
  
  const [decisionForm, setDecisionForm] = useState({
    decision: '',
    comments: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editorDailyCount, setEditorDailyCount] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [articleId]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch articles that are submitted or in review
      const { data, error: artError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          abstract,
          anonymous_manuscript_file,
          title_page_file,
          manuscript_file,
          status,
          submission_date,
          journals (name, slug),
          users!submitter_id(full_name, phone)
        `)
        .in('status', ['submitted', 'in_review', 'under_review', 'revised'])
        .order('submission_date', { ascending: false });

      if (artError) throw artError;
      setArticles(data || []);

      if (articleId && data) {
        const found = data.find(a => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
          fetchReviews(found.id);
        }
      } else if (data && data.length > 0) {
        setSelectedArticle(data[0]);
        fetchReviews(data[0].id);
      }

      if (user?.id) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const { data: editorLogs } = await supabase
          .from('activity_logs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString())
          .or('action.ilike.Assigned reviewer%,action.ilike.Submitted editorial decision%');
        
        setEditorDailyCount(editorLogs?.length || 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      const { data, error: revError } = await supabase
        .from('review_assignments')
        .select(`
          id,
          status,
          assigned_date,
          due_date,
          users!reviewer_id (full_name, email),
          reviews (*)
        `)
        .eq('article_id', id);

      if (revError) throw revError;
      setReviewAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    }
  };


  const handleArticleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = articles.find(a => a.id === id);
    if (found) {
      setSelectedArticle(found);
      fetchReviews(found.id);
      setDecisionForm({ decision: '', comments: '' });
      setError('');
      setSuccess('');
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    if (!decisionForm.decision) {
      setError('Pilih keputusan terlebih dahulu.');
      return;
    }

    if (editorDailyCount >= 20) {
      setError('Batas harian penanganan editor Anda telah tercapai (20/20).');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // 1. Insert into editorial_decisions
      const { error: decError } = await supabase
        .from('editorial_decisions')
        .insert({
          article_id: selectedArticle.id,
          editor_id: user?.id,
          decision: decisionForm.decision,
          comments: decisionForm.comments
        });

      if (decError) throw decError;

      // Map choice to database status column values
      // db check constraint is: 'submitted', 'in_review', 'revised', 'accepted', 'published', 'rejected'
      let targetStatus = 'submitted';
      let statusLabel = '';
      if (decisionForm.decision === 'accept') {
        targetStatus = 'accepted';
        statusLabel = 'DITERIMA';
      } else if (decisionForm.decision === 'revision') {
        targetStatus = 'revised';
        statusLabel = 'PERLU REVISI';
      } else if (decisionForm.decision === 'reject') {
        targetStatus = 'rejected';
        statusLabel = 'DITOLAK';
      }

      // 2. Update status of article
      const updatePayload: any = { status: targetStatus };
      if (targetStatus === 'accepted') {
        updatePayload.accepted_date = new Date().toISOString();
      } else if (targetStatus === 'revised') {
        updatePayload.revised_date = new Date().toISOString();
      }

      const { error: artUpdateError } = await supabase
        .from('articles')
        .update(updatePayload)
        .eq('id', selectedArticle.id);

      if (artUpdateError) throw artUpdateError;

      // 3. Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Submitted editorial decision (${decisionForm.decision}) for article: ${selectedArticle.title}`,
        entity_type: 'articles',
        entity_id: selectedArticle.id
      });

      // 4. Send WhatsApp Notification
      const submitterPhone = selectedArticle.users?.phone;
      if (submitterPhone) {
        supabase.functions.invoke('send-wa', {
          body: {
            target: submitterPhone,
            message: `*Keputusan Editorial RJRAKP*\n\nHalo ${selectedArticle.users?.full_name || 'Penulis'},\n\nArtikel Anda dengan judul *"${selectedArticle.title}"* telah melalui tahap peninjauan. Keputusan akhir: *${statusLabel}*.\n\nCatatan Editor:\n${decisionForm.comments || '-'}\n\nSilakan cek dashboard Anda untuk informasi lebih lanjut.`
          }
        }).catch(err => console.error("Gagal mengirim WA:", err));
      }

      setSuccess(`Keputusan berhasil disimpan sebagai: ${targetStatus.toUpperCase()}`);
      setDecisionForm({ decision: '', comments: '' });
      setEditorDailyCount(prev => prev + 1);
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan keputusan.');
    } finally {
      setSubmitting(false);
    }
  };

  const insertFormat = (format: string) => {
    const textarea = document.getElementById('decision-comments') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'teks'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'teks'}*`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'teks'}</u>`;
        break;
      case 'link':
        replacement = `[${selectedText || 'teks'}](url)`;
        break;
      case 'bullet':
        replacement = `\n- ${selectedText || 'butir'}`;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || 'butir'}`;
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setDecisionForm(prev => ({ ...prev, comments: newValue }));
    
    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      const offset = format === 'bold' ? 2 : format === 'italic' ? 1 : format === 'underline' ? 3 : format === 'link' ? 1 : 3;
      textarea.setSelectionRange(start + offset, start + offset + (selectedText || 'teks').length);
    }, 0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <button 
          onClick={() => navigate('/dashboard/editor/articles')}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors uppercase tracking-widest mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Pemeriksaan Hasil Reviewer & Keputusan Editorial</h1>
          <p className="text-academic-500">Tinjau hasil review mitra bestari dan buat keputusan akhir naskah.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-academic-500 font-medium">Memuat data...</div>
        ) : (
          <>
            {articles.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-academic-200 shadow-sm text-center text-academic-500 mb-8">
                Tidak ada manuskrip aktif yang memerlukan keputusan editorial saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Left/Main Column - Article Info & Reviews */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Selector and core info */}
                  <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm space-y-5">
                    <div>
                      <label className="block text-xs font-black text-academic-500 uppercase tracking-wider mb-2">Pilih Artikel Sasaran</label>
                      <select
                        value={selectedArticle?.id || ''}
                        onChange={handleArticleChange}
                        className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 font-medium cursor-pointer"
                      >
                        {articles.map(a => (
                          <option key={a.id} value={a.id}>
                            [{a.journals?.name}] {a.title.slice(0, 75)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedArticle && (
                      <div className="border-t border-academic-100 pt-4 space-y-3">
                        <span className="inline-block text-[9px] font-black text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase">
                          {selectedArticle.journals?.name}
                        </span>
                        <h2 className="font-serif font-bold text-academic-900 text-lg leading-snug">{selectedArticle.title}</h2>
                      </div>
                    )}
                  </div>

                  {/* Manuscript Files Card */}
                  {selectedArticle && (
                    <div className="space-y-4">
                      {/* Anonymous Manuscript (For Reviewer) */}
                      <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-academic-100 pb-2">
                          <div>
                            <h3 className="font-serif font-bold text-sm text-academic-900">Naskah Tanpa Nama</h3>
                            <p className="text-[10px] text-academic-500">File yang dikirim ke Reviewer</p>
                          </div>
                          {selectedArticle.anonymous_manuscript_file && (
                            <a 
                              href={selectedArticle.anonymous_manuscript_file}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-1 rounded transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Unduh Pratinjau
                            </a>
                          )}
                        </div>
                        
                        {selectedArticle.anonymous_manuscript_file ? (() => {
                          const url = selectedArticle.anonymous_manuscript_file;
                          const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('/pdf/') || url.includes('dummy.pdf');
                          const isWord = url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc');
                          
                          let embedUrl = '';
                          if (isPdf) {
                            embedUrl = url;
                          } else if (isWord) {
                            embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                          }

                          if (!embedUrl) {
                            return (
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs">
                                <p className="text-academic-500">Pratinjau tidak didukung untuk tipe file ini.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-slate-100 shadow-inner">
                              <iframe
                                src={embedUrl}
                                className="w-full border-0 block"
                                title="Pratinjau Manuskrip Anonim"
                                style={{ height: '400px', minHeight: '400px', overflow: 'hidden' }}
                              />
                            </div>
                          );
                        })() : selectedArticle.manuscript_file ? (
                          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-center text-xs space-y-2">
                            <p className="font-bold text-rose-700">⚠️ Perhatian: File Anonim Belum Ada</p>
                            <p className="text-rose-600">Penulis menggunakan format lama. Anda mungkin melihat nama penulis di dalam file ini.</p>
                            <a href={selectedArticle.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex text-brand-700 font-bold border border-brand-200 bg-white px-3 py-1 rounded">
                              Lihat Naskah Lama
                            </a>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs space-y-1">
                            <p className="font-bold text-academic-700">Tidak ada naskah terunggah</p>
                          </div>
                        )}
                      </div>

                      {/* Title Page (For Editor) */}
                      <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-academic-100 pb-2">
                          <div>
                            <h3 className="font-serif font-bold text-sm text-academic-900">Halaman Judul (Title Page)</h3>
                            <p className="text-[10px] text-academic-500">Info lengkap identitas penulis</p>
                          </div>
                          {selectedArticle.title_page_file && (
                            <a 
                              href={selectedArticle.title_page_file}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Unduh Title Page
                            </a>
                          )}
                        </div>
                        {!selectedArticle.title_page_file && (
                          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs space-y-1">
                            <p className="font-bold text-academic-700">Tidak ada title page terunggah</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column - Reviewer Results & Submit Decision Form */}
                <div className="space-y-6">
                  
                  {/* Reviewer Results Card */}
                  <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
                      <h3 className="font-serif font-bold text-sm text-academic-900">Hasil Peninjauan Mitra Bestari (Reviewer)</h3>
                    </div>

                    <div className="divide-y divide-academic-100">
                      {reviewAssignments.length === 0 ? (
                        <div className="p-8 text-center text-academic-500 text-xs font-medium">
                          Belum ada reviewer ditugaskan untuk manuskrip ini.
                        </div>
                      ) : (
                        reviewAssignments.map((assign: any) => {
                          const hasReviewed = assign.reviews && assign.reviews.length > 0;
                          const review = hasReviewed ? assign.reviews[0] : null;

                          const recommendLabels = {
                            accept: 'Accept Submission (Diterima)',
                            minor_revision: 'Revisions Required (Revisi Minor)',
                            major_revision: 'Resubmit for Review (Revisi Mayor)',
                            reject: 'Decline Submission (Ditolak)'
                          };

                          return (
                            <div key={assign.id} className="p-6 space-y-3 hover:bg-academic-50/20 transition-colors">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="text-sm font-bold text-academic-900">{assign.users?.full_name}</h4>
                                  <p className="text-[10px] text-academic-500">{assign.users?.email}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                  (assign.status === 'completed' || hasReviewed) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {(assign.status === 'completed' || hasReviewed) ? 'Review Selesai' : 'Sedang Ditinjau'}
                                </span>
                              </div>

                              {hasReviewed && review ? (() => {
                                const parsed = parseEditorComments(review.comments_for_editor);
                                return (
                                  <div className="space-y-4 bg-white p-4 rounded-lg border border-academic-200 shadow-sm text-xs">
                                    <div className="flex flex-wrap gap-4 justify-between items-center">
                                      <div>
                                        <span className="text-[9px] font-black text-academic-500 uppercase tracking-widest block mb-0.5">Rekomendasi Reviewer</span>
                                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${
                                          review.recommendation === 'accept' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                          review.recommendation === 'reject' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                          'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                          {recommendLabels[review.recommendation as keyof typeof recommendLabels] || review.recommendation}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[9px] font-black text-academic-500 uppercase tracking-widest block mb-0.5">Tanggal Review</span>
                                        <span className="text-academic-700 font-medium">
                                          {review.created_at ? new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Scoring Parameters Rubric Table */}
                                    {parsed.scores && (
                                      <div className="border border-slate-200 rounded-lg overflow-hidden mt-3 shadow-sm bg-slate-50/50">
                                        <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center">
                                          <span className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">Rubrik Penilaian Reviewer</span>
                                          <span className="text-[9px] text-slate-500">Skala 1 - 5</span>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                          {parsed.scores.map((score, sIdx) => {
                                            const numericValue = parseInt(score.value.split('/')[0]);
                                            let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                                            if (numericValue >= 4) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                            else if (numericValue === 3) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                                            else if (numericValue <= 2) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

                                            return (
                                              <div key={sIdx} className="flex justify-between items-center px-3 py-2 text-[11px]">
                                                <span className="font-medium text-slate-600">{score.label}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeColor}`}>
                                                  {score.value}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <span className="text-[9px] font-black text-academic-500 uppercase tracking-widest block mb-1">Komentar Untuk Penulis (Author)</span>
                                      <p className="text-academic-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-serif text-xs italic whitespace-pre-wrap">
                                        "{review.comments_for_author}"
                                      </p>
                                    </div>

                                    <div>
                                      <span className="text-[9px] font-black text-academic-500 uppercase tracking-widest block mb-1">Catatan Rahasia Untuk Editor</span>
                                      <p className="text-academic-700 bg-amber-50/20 p-3 rounded border border-amber-200 leading-relaxed font-serif text-xs italic whitespace-pre-wrap">
                                        "{parsed.notes || '-'}"
                                      </p>
                                    </div>
                                  </div>
                                );
                              })() : (
                                <p className="text-[10px] text-academic-400 italic">Reviewer belum mengirimkan hasil peninjauan berkas.</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* Submission Form */}
                  <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mt-6">
                    <h3 className="text-lg font-bold text-academic-900 mb-4 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-brand-600" />
                      Form Keputusan Editor
                    </h3>

                    {editorDailyCount >= 20 && (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-800 mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm">Batas Kerja Harian Tercapai (20/20)</h4>
                          <p className="text-xs mt-1">Anda tidak dapat memberikan keputusan lagi hari ini. Sistem telah memberitahukan Administrator. Co-Editor akan diaktifkan jika diperlukan.</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-xs font-semibold mb-4">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded text-xs font-semibold mb-4">
                        {success}
                      </div>
                    )}

                    <form onSubmit={handleSubmitDecision} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-2">Keputusan Akhir *</label>
                        <select
                          value={decisionForm.decision}
                          onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                          required
                          disabled={editorDailyCount >= 20}
                          className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer font-medium"
                        >
                          <option value="">-- Pilih Keputusan --</option>
                          <option value="accept">Accept Submission (Diterima)</option>
                          <option value="revision">Revisions Required (Revisi Diperlukan)</option>
                          <option value="reject">Decline Submission (Ditolak)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider">Catatan Masukan Untuk Penulis</label>
                        <div className={`border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-sm ${editorDailyCount >= 20 ? 'opacity-50 pointer-events-none' : ''}`}>
                          {/* Editor Toolbar */}
                          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => insertFormat('bold')}
                              title="Tebal (Bold)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('italic')}
                              title="Miring (Italic)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('underline')}
                              title="Garis Bawah (Underline)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                            
                            <div className="w-[1px] h-4 bg-slate-300 mx-1" />

                            <button
                              type="button"
                              onClick={() => insertFormat('link')}
                              title="Sisipkan Tautan (Link)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alert("Fitur Unggah Gambar/Media disiapkan untuk editor visual.")}
                              title="Sisipkan Gambar"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Image className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-4 bg-slate-300 mx-1" />

                            <button
                              type="button"
                              onClick={() => insertFormat('bullet')}
                              title="Daftar Simbol (Bullet List)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('number')}
                              title="Daftar Angka (Numbered List)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <ListOrdered className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-4 bg-slate-300 mx-1" />

                            <button
                              type="button"
                              onClick={() => alert("Fitur Unggah Lampiran berkas tambahan.")}
                              title="Unggah File"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alert("Tampilan Layar Penuh disiapkan.")}
                              title="Layar Penuh (Fullscreen)"
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            id="decision-comments"
                            rows={6}
                            value={decisionForm.comments}
                            onChange={e => setDecisionForm({ ...decisionForm, comments: e.target.value })}
                            disabled={editorDailyCount >= 20}
                            placeholder="Masukkan masukan penyempurnaan, catatan revisi, atau alasan penolakan naskah..."
                            className="w-full border-0 focus:ring-0 focus:outline-none p-3 text-xs text-slate-700 placeholder-slate-400 bg-white leading-relaxed resize-y min-h-[120px]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !decisionForm.decision || editorDailyCount >= 20}
                        className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? 'Menyimpan Keputusan...' : editorDailyCount >= 20 ? 'Batas Harian Tercapai' : (
                          <>Simpan Keputusan Final <Send className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

          </>
        )}
      </div>
    </DashboardLayout>
  );
}
