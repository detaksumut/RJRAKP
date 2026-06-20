import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  CheckCircle2, AlertCircle, RefreshCw, Send, Check, 
  Bold, Italic, Underline, Link2, Image, List, ListOrdered, Upload, Maximize2, Download,
  Fingerprint, ArrowLeft, CheckSquare, Calendar, Plus, Trash2, ShieldCheck, X
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
  const [similarityScore, setSimilarityScore] = useState<string>('');
  const [largestMatch, setLargestMatch] = useState<string>('');
  const [similarityStatus, setSimilarityStatus] = useState<string>('PASSED');
  const [similarityReportUrl, setSimilarityReportUrl] = useState<string>('');
  const [peerReviewStatus, setPeerReviewStatus] = useState<string>('PENDING');
  const [isOpenAccess, setIsOpenAccess] = useState<boolean>(true);
  const [similaritySources, setSimilaritySources] = useState<any[]>([]);
  const [similarityNotes, setSimilarityNotes] = useState<string>('');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'assessment'>('files');
  const [editorialHistory, setEditorialHistory] = useState<any[]>([]);

  const fetchAssessmentData = async (artId: string) => {
    try {
      const { data: sourcesData, error: err } = await supabase
        .from('article_similarity_sources')
        .select('*')
        .eq('article_id', artId)
        .order('source_percent', { ascending: false });

      if (err) throw err;
      setSimilaritySources(sourcesData || []);
    } catch (e) {
      console.error('Error fetching similarity sources:', e);
      setSimilaritySources([]);
    }
  };

  const fetchEditorialHistory = async (artId: string) => {
    try {
      const { data, error } = await supabase
        .from('article_editorial_history')
        .select('*')
        .eq('article_id', artId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEditorialHistory(data || []);
    } catch (e) {
      console.error('Error fetching editorial history:', e);
      setEditorialHistory([]);
    }
  };

  useEffect(() => {
    if (selectedArticle) {
      setSimilarityScore(selectedArticle.similarity_score !== null ? String(selectedArticle.similarity_score) : '');
      setLargestMatch(selectedArticle.largest_match !== null ? String(selectedArticle.largest_match) : '');
      setSimilarityStatus(selectedArticle.similarity_status || 'PASSED');
      setSimilarityReportUrl(selectedArticle.similarity_report_url || '');
      setPeerReviewStatus(selectedArticle.peer_review_status || 'PENDING');
      setIsOpenAccess(selectedArticle.is_open_access !== false); // default to true
      setSimilarityNotes(selectedArticle.similarity_notes || '');
      fetchAssessmentData(selectedArticle.id);
      fetchEditorialHistory(selectedArticle.id);
    } else {
      setSimilarityScore('');
      setLargestMatch('');
      setSimilarityStatus('PASSED');
      setSimilarityReportUrl('');
      setPeerReviewStatus('PENDING');
      setIsOpenAccess(true);
      setSimilarityNotes('');
      setSimilaritySources([]);
      setEditorialHistory([]);
    }
  }, [selectedArticle]);

  const handleScoreChange = (val: string) => {
    setSimilarityScore(val);
    if (val !== '') {
      const score = parseInt(val);
      if (!isNaN(score)) {
        if (score <= 20) {
          setSimilarityStatus('PASSED');
        } else if (score <= 30) {
          setSimilarityStatus('REVISION REQUIRED');
        } else {
          setSimilarityStatus('ATTENTION');
        }
      }
    }
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedArticle) return;

    setUploadingReport(true);
    setError('');
    setSuccess('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `similarity_report_${selectedArticle.id}_${Date.now()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, file);

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('manuscripts')
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl || '';
      setSimilarityReportUrl(publicUrl);
      setSuccess('Laporan PDF similarity berhasil diunggah.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengunggah laporan similarity.');
    } finally {
      setUploadingReport(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!selectedArticle || !user) return;
    setSavingAssessment(true);
    setError('');
    setSuccess('');
    try {
      const score = similarityScore === '' ? null : parseInt(similarityScore);
      const match = largestMatch === '' ? null : parseInt(largestMatch);

      // 1. Update articles table
      const { error: updateErr } = await supabase
        .from('articles')
        .update({
          similarity_score: score,
          largest_match: match,
          similarity_status: similarityStatus,
          similarity_report_url: similarityReportUrl,
          peer_review_status: peerReviewStatus,
          is_open_access: isOpenAccess,
          similarity_notes: similarityNotes,
          similarity_checked_at: new Date().toISOString(),
          similarity_checked_by: user.id
        })
        .eq('id', selectedArticle.id);

      if (updateErr) throw updateErr;

      // 2. Synchronize matching sources
      const { error: deleteErr } = await supabase
        .from('article_similarity_sources')
        .delete()
        .eq('article_id', selectedArticle.id);

      if (deleteErr) throw deleteErr;

      if (similaritySources.length > 0) {
        const insertData = similaritySources.map(s => ({
          article_id: selectedArticle.id,
          source_name: s.source_name,
          source_percent: parseInt(s.source_percent) || 0,
          source_url: s.source_url || null
        }));

        const { error: insertErr } = await supabase
          .from('article_similarity_sources')
          .insert(insertData);

        if (insertErr) throw insertErr;
      }

      setSuccess('Editorial Assessment berhasil disimpan.');

      // Write log to article_editorial_history
      await supabase.from('article_editorial_history').insert({
        article_id: selectedArticle.id,
        activity_type: 'assessment',
        description: `Editor memperbarui penilaian editorial: Turnitin score ${score !== null ? score : '-'}%, largest match ${match !== null ? match : '-'}%, status similarity: ${similarityStatus}, status peer review: ${peerReviewStatus}.`,
        actor_name: user.user_metadata?.full_name || 'Editor'
      });

      fetchEditorialHistory(selectedArticle.id);
      
      // Update selectedArticle locally
      setSelectedArticle(prev => prev ? {
        ...prev,
        similarity_score: score,
        largest_match: match,
        similarity_status: similarityStatus,
        similarity_report_url: similarityReportUrl,
        peer_review_status: peerReviewStatus,
        is_open_access: isOpenAccess,
        similarity_notes: similarityNotes
      } : null);

      fetchArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan Editorial Assessment.');
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleAddSource = () => {
    setSimilaritySources(prev => [
      ...prev,
      { source_name: '', source_percent: '', source_url: '' }
    ]);
  };

  const handleSourceChange = (index: number, field: string, value: any) => {
    setSimilaritySources(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveSource = (index: number) => {
    setSimilaritySources(prev => prev.filter((_, idx) => idx !== index));
  };

  
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
          similarity_score,
          largest_match,
          similarity_status,
          similarity_report_url,
          similarity_notes,
          peer_review_status,
          is_open_access,
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
      const { error: decError } = await supabase
        .from('editorial_decisions')
        .insert({
          article_id: selectedArticle.id,
          editor_id: user?.id,
          decision: decisionForm.decision,
          comments: decisionForm.comments
        });

      if (decError) throw decError;

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

      const score = similarityScore === '' ? null : parseInt(similarityScore);
      const updatePayload: any = { 
        status: targetStatus,
        similarity_score: score
      };
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

      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Submitted editorial decision (${decisionForm.decision}) for article: ${selectedArticle.title}`,
        entity_type: 'articles',
        entity_id: selectedArticle.id
      });

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

      // Write log to article_editorial_history
      let decisionLabel = 'Menunggu';
      if (decisionForm.decision === 'accept') decisionLabel = 'Disetujui (Accepted)';
      else if (decisionForm.decision === 'revision') decisionLabel = 'Perlu Revisi (Revision Required)';
      else if (decisionForm.decision === 'reject') decisionLabel = 'Ditolak (Rejected)';

      await supabase.from('article_editorial_history').insert({
        article_id: selectedArticle.id,
        activity_type: 'decision',
        description: `Editor mengirimkan keputusan editorial: ${decisionLabel}.`,
        actor_name: user?.user_metadata?.full_name || 'Editor'
      });

      fetchEditorialHistory(selectedArticle.id);
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
                
                <div className="lg:col-span-2 space-y-6">
                  
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
                        <h2 className="font-serif font-bold text-academic-900 text-lg leading-snug mb-2">{selectedArticle.title}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-academic-500 pt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ditransfer: {new Date(selectedArticle.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><Fingerprint className="w-3.5 h-3.5 text-emerald-600" /> Similarity: {selectedArticle.similarity_score !== null ? `${selectedArticle.similarity_score}%` : 'Belum diperiksa'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedArticle && (
                    <>
                      {/* Tab Navigation */}
                      <div className="flex border border-academic-200 rounded-xl p-1 bg-white shadow-sm mb-5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('files')}
                          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider cursor-pointer ${
                            activeTab === 'files'
                              ? 'bg-brand-50 text-brand-700 font-black'
                              : 'text-academic-500 hover:text-brand-600'
                          }`}
                        >
                          Naskah & Identitas
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('assessment')}
                          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider cursor-pointer ${
                            activeTab === 'assessment'
                              ? 'bg-brand-50 text-brand-700 font-black'
                              : 'text-academic-500 hover:text-brand-600'
                          }`}
                        >
                          Editorial Assessment
                        </button>
                      </div>

                      {activeTab === 'files' ? (
                        <div className="space-y-4 animate-fadeIn">
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
                      ) : (
                        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm space-y-6 animate-fadeIn">
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-academic-100">
                            <ShieldCheck className="w-5 h-5 text-brand-600" />
                            <h3 className="text-base font-serif font-black text-academic-900">Editorial Assessment</h3>
                          </div>

                          <div className="space-y-4">
                            {/* Score & Largest Match */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Similarity Score (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="Contoh: 15"
                                  value={similarityScore}
                                  onChange={e => handleScoreChange(e.target.value)}
                                  className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Largest Match (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="Contoh: 4"
                                  value={largestMatch}
                                  onChange={e => setLargestMatch(e.target.value)}
                                  className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                />
                              </div>
                            </div>

                            {/* Similarity Status & Peer Review Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Similarity Status</label>
                                <select
                                  value={similarityStatus}
                                  onChange={e => setSimilarityStatus(e.target.value)}
                                  className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white cursor-pointer"
                                >
                                  <option value="PASSED">PASSED</option>
                                  <option value="REVISION REQUIRED">REVISION REQUIRED</option>
                                  <option value="ATTENTION">ATTENTION</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Peer Review Status</label>
                                <select
                                  value={peerReviewStatus}
                                  onChange={e => setPeerReviewStatus(e.target.value)}
                                  className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white cursor-pointer"
                                >
                                  <option value="PENDING">PENDING (Menunggu)</option>
                                  <option value="UNDER REVIEW">UNDER REVIEW (Sedang Ditinjau)</option>
                                  <option value="REVISION REQUIRED">REVISION REQUIRED (Butuh Revisi)</option>
                                  <option value="APPROVED">APPROVED (Disetujui)</option>
                                  <option value="REJECTED">REJECTED (Ditolak)</option>
                                </select>
                              </div>
                            </div>

                            {/* Open Access Option */}
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="checkbox"
                                id="is-open-access"
                                checked={isOpenAccess}
                                onChange={e => setIsOpenAccess(e.target.checked)}
                                className="w-4 h-4 text-brand-600 border-academic-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                              <label htmlFor="is-open-access" className="text-xs font-bold text-academic-700 uppercase tracking-wider cursor-pointer">Is Open Access</label>
                            </div>

                            {/* Similarity Report PDF Upload */}
                            <div>
                              <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Laporan PDF Similarity</label>
                              <div className="flex flex-col gap-2 bg-academic-50 p-4 rounded-xl border border-academic-200">
                                {similarityReportUrl ? (
                                  <div className="flex items-center justify-between gap-3">
                                    <a 
                                      href={similarityReportUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline truncate max-w-[300px] flex items-center gap-1"
                                    >
                                      <FileText className="w-4 h-4 shrink-0" /> Lihat Laporan Terunggah
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => setSimilarityReportUrl('')}
                                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" /> Hapus
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-academic-400 italic">Belum ada file terunggah</span>
                                    <label className="bg-white hover:bg-academic-100 text-academic-800 border border-academic-300 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                                      <Upload className="w-3.5 h-3.5" /> {uploadingReport ? 'Mengunggah...' : 'Upload Laporan PDF'}
                                      <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleReportUpload}
                                        disabled={uploadingReport}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Top Matching Sources */}
                            <div className="pt-4 border-t border-academic-100">
                              <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider">Top Matching Sources</label>
                                <button
                                  type="button"
                                  onClick={handleAddSource}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Tambah Sumber
                                </button>
                              </div>

                              {similaritySources.length === 0 ? (
                                <p className="text-xs text-academic-400 italic bg-academic-50 p-4 rounded-xl text-center border border-dashed border-academic-200">
                                  Belum ada sumber kecocokan ditambahkan.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {similaritySources.map((source, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-academic-50 p-3 rounded-xl border border-academic-200">
                                      <span className="text-xs font-bold text-academic-500 w-4">{idx + 1}.</span>
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <input
                                          type="text"
                                          placeholder="Nama Sumber (e.g. Journal Article A)"
                                          value={source.source_name}
                                          onChange={e => handleSourceChange(idx, 'source_name', e.target.value)}
                                          className="col-span-2 border border-academic-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                          required
                                        />
                                        <div className="flex gap-2">
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="Match %"
                                            value={source.source_percent}
                                            onChange={e => handleSourceChange(idx, 'source_percent', e.target.value)}
                                            className="w-20 border border-academic-300 rounded px-2.5 py-1.5 text-xs bg-white text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            required
                                          />
                                          <input
                                            type="text"
                                            placeholder="URL (Opsional)"
                                            value={source.source_url || ''}
                                            onChange={e => handleSourceChange(idx, 'source_url', e.target.value)}
                                            className="flex-1 border border-academic-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSource(idx)}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Additional Notes */}
                            <div className="pt-4 border-t border-academic-100">
                              <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1.5">Catatan Evaluasi Plagiarisme</label>
                              <textarea
                                rows={4}
                                placeholder="Masukkan catatan penelaahan kesamaan atau saran untuk penulis..."
                                value={similarityNotes}
                                onChange={e => setSimilarityNotes(e.target.value)}
                                className="w-full border border-academic-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                              />
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 border-t border-academic-100">
                              <button
                                type="button"
                                onClick={handleSaveAssessment}
                                disabled={savingAssessment || uploadingReport}
                                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {savingAssessment ? 'Menyimpan Assessment...' : 'Simpan Editorial Assessment'}
                              </button>
                            </div>

                            {/* Editorial History Log (Admin/Editor Only) */}
                            <div className="pt-6 border-t border-academic-100 mt-4">
                              <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-2">Riwayat Proses Editorial (Log Audit)</label>
                              {editorialHistory.length === 0 ? (
                                <p className="text-xs text-academic-400 italic bg-academic-50 p-3 rounded-lg border border-dashed border-academic-200">
                                  Belum ada catatan log riwayat editorial.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {editorialHistory.map((log) => (
                                    <div key={log.id} className="text-xs bg-academic-50 border border-academic-200 rounded-lg p-2.5 flex justify-between items-start gap-3">
                                      <div className="space-y-1">
                                        <p className="font-semibold text-academic-800">{log.description}</p>
                                        <p className="text-[10px] text-academic-400">Oleh: {log.actor_name || '-'}</p>
                                      </div>
                                      <span className="text-[9px] font-mono text-academic-400 shrink-0 font-bold">
                                        {new Date(log.created_at).toLocaleDateString('id-ID')} {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>

                <div className="space-y-6">
                  
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
