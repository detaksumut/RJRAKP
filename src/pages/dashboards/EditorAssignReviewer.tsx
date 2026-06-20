import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserCheck, ShieldAlert, Award, Calendar, BookOpen, AlertCircle, ArrowLeft, Send, FileText } from 'lucide-react';

export default function EditorAssignReviewer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('articleId');

  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  
  const [assignedReviewers, setAssignedReviewers] = useState<any[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [reviewerWorkloads, setReviewerWorkloads] = useState<Record<string, number>>({});
  const [editorDailyCount, setEditorDailyCount] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, [articleId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch submitted articles
      const { data: artData } = await supabase
        .from('articles')
        .select('id, title, status, journal_id, abstract, manuscript_file, title_page_file, anonymous_manuscript_file, journals(name, slug)')
        .neq('status', 'published');
      if (artData) setArticles(artData);

      // Set selected article
      if (articleId && artData) {
        const found = artData.find(a => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
          fetchActiveAssignments(found.id);
        }
      } else if (artData && artData.length > 0) {
        setSelectedArticle(artData[0]);
        fetchActiveAssignments(artData[0].id);
      }

      // 2. Fetch reviewers
      const { data: revData } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          reviewer_profiles (
            expertise_area,
            affiliation,
            academic_title
          )
        `)
        .eq('role', 'reviewer')
        .eq('status', 'APPROVED');
      if (revData) setReviewers(revData);

      // 3. Workload Limits Calculation
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: assignmentsData } = await supabase
        .from('review_assignments')
        .select('reviewer_id')
        .gte('assigned_date', todayStart.toISOString());
      
      const counts: Record<string, number> = {};
      if (assignmentsData) {
        assignmentsData.forEach((a: any) => {
          counts[a.reviewer_id] = (counts[a.reviewer_id] || 0) + 1;
        });
      }
      setReviewerWorkloads(counts);

      if (user?.id) {
        const { data: editorLogs } = await supabase
          .from('activity_logs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString())
          .ilike('action', 'Assigned reviewer%');
        
        setEditorDailyCount(editorLogs?.length || 0);
      }
      
      // Set default due date (2 weeks from now)
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      setDueDate(twoWeeks.toISOString().split('T')[0]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAssignments = async (artId: string) => {
    try {
      const { data } = await supabase
        .from('review_assignments')
        .select('id, status, assigned_date, due_date, users!reviewer_id (full_name)')
        .eq('article_id', artId);
      setAssignedReviewers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArticleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = articles.find(a => a.id === id);
    if (found) {
      setSelectedArticle(found);
      fetchActiveAssignments(found.id);
      setSelectedReviewerId('');
      setMessage({ text: '', type: '' });
    }
  };

  // Enforce Expertise matching keywords helper
  const getExpertiseKeywordsForJournal = (slug: string): string[] => {
    switch (slug) {
      case 'audit-kebijakan-publik':
        return ['audit', 'kebijakan', 'pemerintahan', 'pengawasan', 'birokrasi', 'administrasi', 'akuntabilitas', 'publik'];
      case 'hukum-dan-keadilan':
        return ['hukum', 'pidana', 'perdata', 'negara', 'peradilan', 'keadilan', 'normatif', 'konstitusi'];
      case 'pendidikan-dan-pembelajaran':
        return ['pendidikan', 'pembelajaran', 'kurikulum', 'pengajaran', 'pedagogis', 'belajar', 'guru', 'sekolah'];
      case 'teknik-dan-teknologi':
        return ['teknik', 'teknologi', 'informatika', 'sistem', 'rekayasa', 'kecerdasan', 'perangkat', 'komputer', 'iot'];
      case 'agama-dan-peradaban-islam':
        return ['agama', 'islam', 'tafsir', 'hadis', 'tasawuf', 'syariah', 'muslim', 'arab', 'fiqh'];
      default:
        return [];
    }
  };

  // Filter reviewers based on expertise area matching the selected article's journal
  const getMatchingReviewers = () => {
    if (!selectedArticle || !selectedArticle.journals) return [];
    
    const slug = selectedArticle.journals.slug;
    const keywords = getExpertiseKeywordsForJournal(slug);

    return reviewers.map(rev => {
      const profile = rev.reviewer_profiles?.[0] || rev.reviewer_profiles;
      const expertise = (profile?.expertise_area || '').toLowerCase();
      
      // Calculate match count
      let matchScore = 0;
      keywords.forEach(keyword => {
        if (expertise.includes(keyword)) {
          matchScore++;
        }
      });

      return {
        ...rev,
        matchScore,
        expertiseArea: profile?.expertise_area || '-',
        academicTitle: profile?.academic_title || '',
        affiliation: profile?.affiliation || '-',
        reviewerType: profile?.reviewer_type || 'CO_REVIEWER'
      };
    }).sort((a, b) => {
      // Sort primarily by reviewerType (PRIMARY first)
      if (a.reviewerType === 'PRIMARY' && b.reviewerType !== 'PRIMARY') return -1;
      if (a.reviewerType !== 'PRIMARY' && b.reviewerType === 'PRIMARY') return 1;
      // Then sort by matchScore
      return b.matchScore - a.matchScore;
    });
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    if (!selectedReviewerId) {
      setMessage({ text: 'Pilih reviewer terlebih dahulu.', type: 'error' });
      return;
    }

    if (editorDailyCount >= 20) {
      setMessage({ text: 'Batas harian penugasan editor Anda telah tercapai (20/20). Harap hubungi Admin.', type: 'error' });
      return;
    }

    const reviewerCount = reviewerWorkloads[selectedReviewerId] || 0;
    if (reviewerCount >= 5) {
      setMessage({ text: 'Reviewer ini telah mencapai batas penugasan harian maksimal (5/5).', type: 'error' });
      return;
    }

    // Check if reviewer is already assigned
    const alreadyAssigned = assignedReviewers.some(a => a.reviewer_id === selectedReviewerId);
    if (alreadyAssigned) {
      setMessage({ text: 'Reviewer ini sudah ditugaskan untuk artikel ini.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Insert Assignment
      const { error: assignError } = await supabase
        .from('review_assignments')
        .insert({
          article_id: selectedArticle.id,
          reviewer_id: selectedReviewerId,
          due_date: dueDate,
          status: 'assigned'
        });

      if (assignError) throw assignError;

      // 2. Update Article Status to 'in_review'
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'in_review' })
        .eq('id', selectedArticle.id);

      if (updateError) throw updateError;

      // 3. Log administrative action
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Assigned reviewer to article: ${selectedArticle.title}`,
        entity_type: 'articles',
        entity_id: selectedArticle.id
      });

      // Fetch reviewer name
      const reviewerName = reviewers.find(r => r.id === selectedReviewerId)?.full_name || 'Mitra Bestari';

      // Log to article_editorial_history
      await supabase.from('article_editorial_history').insert({
        article_id: selectedArticle.id,
        activity_type: 'reviewer_assigned',
        description: `Mitra Bestari (${reviewerName}) ditugaskan untuk melakukan review naskah.`,
        actor_name: user?.user_metadata?.full_name || 'Editor'
      });

      setMessage({ text: 'Reviewer berhasil ditugaskan!', type: 'success' });

      setSelectedReviewerId('');
      setEditorDailyCount(prev => prev + 1);
      setReviewerWorkloads(prev => ({ ...prev, [selectedReviewerId]: (prev[selectedReviewerId] || 0) + 1 }));
      fetchActiveAssignments(selectedArticle.id);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Gagal menugaskan reviewer.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const matchingReviewers = getMatchingReviewers();
  const recommendedReviewers = matchingReviewers.filter(r => r.matchScore > 0);
  const otherReviewers = matchingReviewers.filter(r => r.matchScore === 0);

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
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Penugasan Mitra Bestari (Reviewer)</h1>
          <p className="text-academic-500">Pilih artikel dan tugaskan reviewer yang memiliki keahlian sebidang.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-academic-500 font-medium">Memuat data...</div>
        ) : articles.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-academic-200 shadow-sm text-center text-academic-500">
            Tidak ada manuskrip aktif yang memerlukan penugasan reviewer saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main Column - Assignment Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {editorDailyCount >= 20 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-800">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Batas Kerja Harian Tercapai (20/20)</h4>
                    <p className="text-xs mt-1">Anda tidak dapat menugaskan reviewer lagi hari ini. Sistem telah memberitahukan Administrator. Co-Editor akan segera diaktifkan jika diperlukan.</p>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm">
                {message.text && (
                  <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-semibold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleAssign} className="space-y-5">
                  {/* Select Article */}
                  <div>
                    <label className="block text-xs font-black text-academic-500 uppercase tracking-wider mb-2">Pilih Artikel Sasaran</label>
                    <select
                      value={selectedArticle?.id || ''}
                      onChange={handleArticleChange}
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50"
                    >
                      {articles.map(a => (
                        <option key={a.id} value={a.id}>
                          [{a.journals?.name}] {a.title.slice(0, 70)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedArticle && (
                    <div className="bg-academic-50/50 p-4 rounded-lg border border-academic-100/80">
                      <div className="text-[10px] font-black text-brand-800 uppercase tracking-widest mb-1">
                        Jurnal Sasaran: {selectedArticle.journals?.name}
                      </div>
                      <h4 className="font-serif font-bold text-academic-900 text-sm mb-2">{selectedArticle.title}</h4>
                      <p className="text-[10px] text-academic-500">Status Artikel saat ini: <span className="font-bold text-brand-700 uppercase">{selectedArticle.status}</span></p>
                    </div>
                  )}

                  {/* Choose Reviewer (Rule Enforced) */}
                  <div>
                    <label className="block text-xs font-black text-academic-500 uppercase tracking-wider mb-2">Pilih Reviewer (Daftar Bidang Keahlian)</label>
                    <select
                      value={selectedReviewerId}
                      onChange={e => setSelectedReviewerId(e.target.value)}
                      required
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 font-medium"
                    >
                      <option value="">-- Pilih Reviewer --</option>
                      
                      {matchingReviewers.filter(r => r.reviewerType === 'PRIMARY').length > 0 && (
                        <optgroup label="⭐ Reviewer Utama (Spesialis)">
                          {matchingReviewers.filter(r => r.reviewerType === 'PRIMARY').map(r => {
                            const count = reviewerWorkloads[r.id] || 0;
                            const isFull = count >= 5;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull}>
                                {r.academicTitle ? `${r.academicTitle} ` : ''}{r.full_name} [{r.expertiseArea}] {isFull ? '(KUOTA PENUH)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}

                      {matchingReviewers.filter(r => r.reviewerType !== 'PRIMARY' && r.matchScore > 0).length > 0 && (
                        <optgroup label="👥 Co-Reviewer (Sesuai Bidang)">
                          {matchingReviewers.filter(r => r.reviewerType !== 'PRIMARY' && r.matchScore > 0).map(r => {
                            const count = reviewerWorkloads[r.id] || 0;
                            const isFull = count >= 5;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull}>
                                {r.academicTitle ? `${r.academicTitle} ` : ''}{r.full_name} [{r.expertiseArea}] {isFull ? '(KUOTA PENUH)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}

                      {matchingReviewers.filter(r => r.reviewerType !== 'PRIMARY' && r.matchScore === 0).length > 0 && (
                        <optgroup label="⚠️ Co-Reviewer (Lainnya)">
                          {matchingReviewers.filter(r => r.reviewerType !== 'PRIMARY' && r.matchScore === 0).map(r => {
                            const count = reviewerWorkloads[r.id] || 0;
                            const isFull = count >= 5;
                            return (
                              <option key={r.id} value={r.id} disabled={isFull}>
                                {r.academicTitle ? `${r.academicTitle} ` : ''}{r.full_name} [{r.expertiseArea}] {isFull ? '(KUOTA PENUH)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                    
                    {selectedReviewerId && (() => {
                      const selected = matchingReviewers.find(r => r.id === selectedReviewerId);
                      if (selected && selected.matchScore === 0) {
                        return (
                          <div className="mt-2 flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded text-xs font-semibold">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>Peringatan: Bidang keahlian reviewer [{selected.expertiseArea}] kurang cocok dengan bidang kajian jurnal [{selectedArticle?.journals?.name}].</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-black text-academic-500 uppercase tracking-wider mb-2">Batas Waktu Review (Due Date)</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      required
                      className="w-full border border-academic-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selectedReviewerId || editorDailyCount >= 20}
                    className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Memproses...' : editorDailyCount >= 20 ? 'Batas Harian Tercapai' : (
                      <>Kirim Penugasan <Send className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </form>
              </div>

              {/* Assignments History Card */}
              <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-academic-100 bg-academic-50/50">
                  <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Reviewer Terkini untuk Artikel Ini</h3>
                </div>
                <div className="divide-y divide-academic-100">
                  {assignedReviewers.length === 0 ? (
                    <div className="p-6 text-center text-academic-500 text-xs">
                      Belum ada reviewer ditugaskan untuk manuskrip ini.
                    </div>
                  ) : (
                    assignedReviewers.map((assign: any) => (
                      <div key={assign.id} className="p-4 flex items-center justify-between hover:bg-academic-50/30 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-academic-900">{assign.users?.full_name}</div>
                          <div className="text-[10px] text-academic-500 mt-1 flex items-center gap-3">
                            <span>Ditugaskan: {new Date(assign.assigned_date).toLocaleDateString('id-ID')}</span>
                            <span>Batas: {assign.due_date ? new Date(assign.due_date).toLocaleDateString('id-ID') : '-'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${assign.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {assign.status === 'completed' ? 'Selesai' : 'Aktif'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Column - Recommended Reviewers & Manuscript Preview */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm">
                <h3 className="text-xs font-black text-academic-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-600" /> Analisis Kesesuaian Reviewer
                </h3>
                
                {selectedArticle && (
                  <div className="mb-4 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                    <span className="font-bold block text-academic-700 uppercase tracking-wide text-[9px] mb-1">Keywords Jurnal:</span>
                    <div className="flex flex-wrap gap-1">
                      {getExpertiseKeywordsForJournal(selectedArticle.journals?.slug).map((k, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {matchingReviewers.map(rev => {
                    const isRec = rev.matchScore > 0;
                    const isPrimary = rev.reviewerType === 'PRIMARY';
                    const revCount = reviewerWorkloads[rev.id] || 0;
                    const isFull = revCount >= 5;
                    return (
                      <div key={rev.id} className={`p-3 rounded-lg border text-xs transition-colors ${isPrimary ? 'bg-amber-50/50 border-amber-200 shadow-sm' : isRec ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50/50 border-slate-200'} ${isFull ? 'opacity-50' : ''}`}>
                        <div className="font-bold text-academic-800 flex justify-between items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            {isPrimary && <span title="Reviewer Utama"><Award className="w-4 h-4 text-amber-500" /></span>}
                            <span>{rev.academicTitle ? `${rev.academicTitle} ` : ''}{rev.full_name}</span>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {isRec && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider rounded shrink-0">Cocok</span>
                            )}
                            {isFull && (
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[8px] font-black uppercase tracking-wider rounded shrink-0">PENUH</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-academic-500 mt-1">{rev.affiliation}</div>
                        <div className="mt-2 pt-2 border-t border-dashed border-academic-200">
                          <span className="font-bold text-academic-600 uppercase text-[8px] tracking-wide block">Bidang Keahlian:</span>
                          <span className="text-academic-800 font-medium">{rev.expertiseArea}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manuscript Preview Card */}
              {selectedArticle && (
                <div className="space-y-4">
                  {/* Anonymous Manuscript (For Reviewer) */}
                  <div className="bg-white p-5 rounded-xl border border-academic-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-academic-100 pb-2">
                      <div>
                        <h3 className="font-serif font-bold text-sm text-academic-900">Naskah Tanpa Nama</h3>
                        <p className="text-[10px] text-academic-500">File yang akan dilihat oleh Reviewer</p>
                      </div>
                      {selectedArticle.anonymous_manuscript_file && (
                        <a 
                          href={selectedArticle.anonymous_manuscript_file}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-1 rounded transition-colors"
                        >
                          Download
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
                            style={{ height: '300px', minHeight: '300px', overflow: 'hidden' }}
                          />
                        </div>
                      );
                    })() : selectedArticle.manuscript_file ? (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-center text-xs space-y-2">
                        <p className="font-bold text-rose-700">⚠️ Perhatian: File Anonim Belum Ada</p>
                        <p className="text-rose-600">Penulis menggunakan format lama. Reviewer mungkin dapat melihat nama penulis di dalam file ini.</p>
                        <a href={selectedArticle.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex text-brand-700 font-bold border border-brand-200 bg-white px-3 py-1 rounded">
                          Lihat Naskah Lama
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs space-y-1">
                        <FileText className="w-6 h-6 mx-auto text-slate-400 mb-1" />
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
                          Download
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

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
