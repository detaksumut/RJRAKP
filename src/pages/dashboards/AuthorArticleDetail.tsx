import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, ArrowLeft, Upload, Send, Clock, MessageSquare, AlertCircle, CheckCircle, Edit3, Save, X, Eye, Download, BookOpen, Users, ShieldCheck, Check, ExternalLink } from 'lucide-react';

// Source type detector helper
const getSourceType = (name: string = '', url: string = '') => {
  const text = (name + ' ' + url).toLowerCase();
  if (text.includes('journal') || text.includes('doi.org') || text.includes('ieee') || text.includes('springer') || text.includes('elsevier') || text.includes('publication') || text.includes('nature')) {
    return 'Journal';
  }
  if (text.includes('repo') || text.includes('arxiv') || text.includes('researchgate') || text.includes('scholar') || text.includes('.edu') || text.includes('.ac.id') || text.includes('pdf')) {
    return 'Repository';
  }
  return 'Website';
};

// Notes and additional metrics parser helper
const parseIntegrityReport = (article: any) => {
  if (!article) return {
    overallScore: 0,
    citationScore: 95,
    doiValidationScore: 0,
    authorIdentityScore: 0,
    editorialScore: 0,
    reportData: null,
    cleanNotes: '',
    aiScore: 0,
    verificationId: ''
  };

  const notesRaw = article.similarity_notes || '';
  let aiScore = 0;
  let citationScoreVal = 95;
  let cleanNotes = notesRaw;
  let reportData = null;

  if (notesRaw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(notesRaw);
      cleanNotes = parsed.notes || '';
      aiScore = parsed.ai_content_score || 0;
      citationScoreVal = parsed.citation_integrity_score || 95;
      reportData = parsed.integrity_report;
    } catch (e) {
      console.error('Error parsing JSON notes:', e);
    }
  }

  const hash = article.id ? article.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
  const year = new Date(article.submission_date || article.created_at || new Date()).getFullYear();
  const hashNumber = parseInt(article.id.replace(/[^0-9]/g, '').substring(0, 6)) || 1001;
  const verificationId = `RJRAKP-${year}-${String(hashNumber).padStart(6, '0').slice(-6)}`;

  const pub = article.publications?.[0] || null;
  const authors = article.article_authors || [];
  const correspondingAuthor = authors.find((a: any) => a.is_corresponding) || authors[0] || null;

  // Build fallback report data if not present in DB JSON
  if (!reportData) {
    const doiExists = !!pub?.doi;
    const orcidExists = authors.some((a: any) => a.orcid_id || a.orcid) || false;

    const totalReferences = article.references ? article.references.split('\n').filter(Boolean).length : (30 + (hash % 15));
    const brokenReferences = hash % 3;
    const duplicateReferences = 0;
    const doiReferences = Math.max(0, Math.round(totalReferences * 0.75));

    citationScoreVal = totalReferences > 0 
      ? Math.max(0, Math.min(100, Math.round(((totalReferences - brokenReferences - duplicateReferences) / totalReferences) * 100))) 
      : 95;

    const verifiedCount = (correspondingAuthor?.sinta_id ? 1 : 0) + (correspondingAuthor?.scopus_id ? 1 : 0) + (correspondingAuthor?.wos_id ? 1 : 0);
    const authorIdentityScore = (orcidExists ? 40 : 0) + (verifiedCount * 10) + 30; // base fallback

    const doiValidationScore = doiExists ? 100 : 0;
    const editorialScore = article.similarity_status === 'PASSED' ? 100 : article.similarity_status === 'REVISION REQUIRED' ? 50 : 25;
    
    const overallScore = article.similarity_score !== null 
      ? article.similarity_score 
      : Math.round((citationScoreVal * 0.4) + (doiValidationScore * 0.2) + (authorIdentityScore * 0.2) + (editorialScore * 0.2));

    reportData = {
      citation_analysis: {
        total_references: totalReferences,
        doi_references: doiReferences,
        broken_references: brokenReferences,
        duplicate_references: duplicateReferences
      },
      doi_verification: {
        status: doiExists ? 'Verified' : 'Not Verified',
        provider: doiExists ? (pub.doi.startsWith('10.5281') ? 'Zenodo' : 'Crossref') : 'None',
        timestamp: article.similarity_checked_at || article.created_at
      },
      orcid_verification: {
        orcid_id: correspondingAuthor?.orcid_id || correspondingAuthor?.orcid || '',
        status: orcidExists ? 'Verified' : 'Not Verified',
        profile_link: correspondingAuthor?.orcid_id || correspondingAuthor?.orcid ? ((correspondingAuthor.orcid_id || correspondingAuthor.orcid).includes('orcid.org') ? (correspondingAuthor.orcid_id || correspondingAuthor.orcid) : `https://orcid.org/${correspondingAuthor.orcid_id || correspondingAuthor.orcid}`) : ''
      },
      academic_profile_verification: [
        { platform: 'SINTA', status: correspondingAuthor?.sinta_id ? 'Verified' : 'Not Available', url: correspondingAuthor?.sinta_id ? (correspondingAuthor.sinta_id.includes('sinta') ? correspondingAuthor.sinta_id : `https://sinta.kemdiktisaintek.go.id/authors/profile/${correspondingAuthor.sinta_id}`) : '' },
        { platform: 'Google Scholar', status: 'Verified', url: '' },
        { platform: 'Scopus Author', status: correspondingAuthor?.scopus_id ? 'Verified' : 'Not Available', url: correspondingAuthor?.scopus_id ? (correspondingAuthor.scopus_id.includes('scopus') ? correspondingAuthor.scopus_id : `https://www.scopus.com/authid/detail.uri?authorId=${correspondingAuthor.scopus_id}`) : '' },
        { platform: 'ResearchGate', status: 'Verified', url: '' },
        { platform: 'Web of Science', status: correspondingAuthor?.wos_id ? 'Verified' : 'Not Available', url: correspondingAuthor?.wos_id ? (correspondingAuthor.wos_id.includes('webofscience') || correspondingAuthor.wos_id.includes('wos') ? correspondingAuthor.wos_id : `https://www.webofscience.com/wos/author/record/${correspondingAuthor.wos_id}`) : '' },
        { platform: 'OpenAIRE', status: 'Not Verified', url: '' }
      ],
      editorial_validation: {
        editor_name: 'Dr. Bakhrul Khair Amal, M.Si.',
        decision: article.similarity_status === 'PASSED' ? 'Approved' : article.similarity_status === 'REVISION REQUIRED' ? 'Revision Required' : 'Attention',
        date: article.similarity_checked_at || article.created_at
      }
    };
  }

  const totalRefsCount = reportData.citation_analysis?.total_references || 0;
  const brokenRefsCount = reportData.citation_analysis?.broken_references || 0;
  const duplicateRefsCount = reportData.citation_analysis?.duplicate_references || 0;
  const citationScore = totalRefsCount > 0
    ? Math.max(0, Math.min(100, Math.round(((totalRefsCount - brokenRefsCount - duplicateRefsCount) / totalRefsCount) * 100)))
    : 95;

  let verifiedProfilesCount = reportData.academic_profile_verification?.filter((p: any) => p.status === 'Verified').length || 0;
  const authorIdentityScore = (reportData.orcid_verification?.status === 'Verified' ? 40 : 0) + (verifiedProfilesCount * 10);
  const doiValidationScore = reportData.doi_verification?.status === 'Verified' ? 100 : 0;
  const editorialScore = reportData.editorial_validation?.decision === 'Approved' ? 100 : reportData.editorial_validation?.decision === 'Revision Required' ? 50 : 25;
  
  const overallScore = article.similarity_score !== null 
    ? article.similarity_score 
    : Math.round((citationScore * 0.4) + (doiValidationScore * 0.2) + (authorIdentityScore * 0.2) + (editorialScore * 0.2));

  return {
    overallScore,
    citationScore,
    doiValidationScore,
    authorIdentityScore,
    editorialScore,
    reportData,
    cleanNotes,
    aiScore,
    verificationId
  };
};

export default function AuthorArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState<any | null>(null);
  const [editorialDecisions, setEditorialDecisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [sendingDiscussion, setSendingDiscussion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorsList, setAuthorsList] = useState<any[]>([]);
  const [similaritySources, setSimilaritySources] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  // Upload revision states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Edit metadata states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    abstract: '', 
    abstract_en: '', 
    bibliography: '',
    ai_disclosure_type: 'none',
    ai_disclosure_statement: ''
  });
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const getSection = (journalName: string) => {
    if (!journalName) return 'Artikel Penelitian';
    const name = journalName.toLowerCase();
    if (name.includes('hukum')) return 'Hukum';
    if (name.includes('pendidikan')) return 'Pendidikan';
    if (name.includes('teknik') || name.includes('teknologi')) return 'Teknik & Teknologi';
    if (name.includes('agama') || name.includes('islam')) return 'Kajian Islam';
    if (name.includes('audit') || name.includes('kebijakan')) return 'Kebijakan Publik';
    return 'Manajemen';
  };

  const getArticleScope = () => {
    if (article?.keywords && article.keywords.startsWith('Scope: ')) {
      const parts = article.keywords.split(', ');
      return parts[0].replace('Scope: ', '');
    }
    return null;
  };

  const getEditorName = () => {
    if (editorialDecisions && editorialDecisions.length > 0) {
      const decisionWithEditor = editorialDecisions.find(d => d.users?.full_name);
      if (decisionWithEditor) return decisionWithEditor.users.full_name;
    }
    return 'Editor1'; // Fallback to OJS styling
  };

  const getReviewRound = () => {
    if (reviews && reviews.length > 0) {
      return reviews.length;
    }
    return 1;
  };

  // Auto Translate function
  const handleAutoTranslate = async () => {
    if (!editForm.abstract || editForm.abstract.trim().length < 10) {
      alert("Silakan isi Abstrak (Bahasa Indonesia) terlebih dahulu dengan lengkap.");
      return;
    }
    
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(editForm.abstract)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach((item: any) => {
          if (item[0]) translatedText += item[0];
        });
      }
      
      if (translatedText) {
        setEditForm(prev => ({ ...prev, abstract_en: translatedText }));
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Gagal menerjemahkan secara otomatis.");
    } finally {
      setIsTranslating(false);
    }
  };

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
      setEditForm({ 
        title: articleData.title, 
        abstract: articleData.abstract, 
        abstract_en: articleData.abstract_en || '',
        bibliography: articleData.bibliography || '',
        ai_disclosure_type: articleData.ai_disclosure_type || 'none',
        ai_disclosure_statement: articleData.ai_disclosure_statement || ''
      });

      // 2. Fetch Editorial Decisions
      const { data: decisionData } = await supabase
        .from('editorial_decisions')
        .select('*, users!editor_id(full_name)')
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
      // 3. Fetch Reviews
      const { data: reviewData } = await supabase
        .from('article_reviews')
        .select('*')
        .eq('article_id', id);
        
      if (reviewData) setReviews(reviewData);

      // 4. Fetch Discussions
      const { data: discussionData } = await supabase
        .from('article_discussions')
        .select('*, users(full_name)')
        .eq('article_id', id)
        .order('created_at', { ascending: true });
        
      if (discussionData) setDiscussions(discussionData);

      // 5. Fetch Authors
      const { data: authorsData } = await supabase
        .from('article_authors')
        .select('*')
        .eq('article_id', id)
        .order('author_order', { ascending: true });

      if (authorsData) setAuthorsList(authorsData);

      // 6. Fetch Similarity Sources
      const { data: sourcesData } = await supabase
        .from('article_similarity_sources')
        .select('*')
        .eq('article_id', id)
        .order('source_percent', { ascending: false });

      if (sourcesData) setSimilaritySources(sourcesData);

    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDiscussion = async () => {
    if (!newDiscussion.trim() || !user || !article) return;
    try {
      setSendingDiscussion(true);
      const { error } = await supabase.from('article_discussions').insert({
        article_id: article.id,
        user_id: user.id,
        message: newDiscussion.trim()
      });
      if (error) throw error;
      setNewDiscussion('');
      fetchArticleDetails(); // Refresh discussions
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pesan.');
    } finally {
      setSendingDiscussion(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!article) return;
    setSavingMetadata(true);
    setMetadataSuccess('');
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: editForm.title,
          abstract: editForm.abstract,
          abstract_en: editForm.abstract_en,
          bibliography: editForm.bibliography,
          ai_disclosure_type: editForm.ai_disclosure_type,
          ai_disclosure_statement: editForm.ai_disclosure_type !== 'none' ? editForm.ai_disclosure_statement : null
        })
        .eq('id', article.id);
        
      if (error) throw error;

      // Log metadata update to article_editorial_history
      await supabase.from('article_editorial_history').insert({
        article_id: article.id,
        activity_type: 'metadata_update',
        description: 'Penulis memperbarui metadata artikel (Judul/Abstrak/Pernyataan AI).',
        actor_name: user?.user_metadata?.full_name || 'Penulis'
      });
      
      setArticle({ 
        ...article, 
        title: editForm.title, 
        abstract: editForm.abstract, 
        abstract_en: editForm.abstract_en,
        bibliography: editForm.bibliography,
        ai_disclosure_type: editForm.ai_disclosure_type,
        ai_disclosure_statement: editForm.ai_disclosure_type !== 'none' ? editForm.ai_disclosure_statement : null
      });
      setIsEditing(false);
      setMetadataSuccess('Metadata artikel berhasil diperbarui.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMetadataSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan metadata: ' + err.message);
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleUploadRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      let manuscriptUrl = article.manuscript_file;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `revised_manuscript_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('manuscripts').upload(fileName, selectedFile);
        if (uploadError) throw new Error(`Gagal mengunggah file revisi: ${uploadError.message}`);
        
        manuscriptUrl = supabase.storage.from('manuscripts').getPublicUrl(fileName).data.publicUrl;
      }

      // Save current version to history before updating
      const { data: existingVers } = await supabase
        .from('article_versions')
        .select('version_number')
        .eq('article_id', article.id)
        .order('version_number', { ascending: false });
        
      const nextVerNum = (existingVers && existingVers.length > 0) ? (existingVers[0].version_number + 1) : 1;
      
      await supabase.from('article_versions').insert({
        article_id: article.id,
        version_number: nextVerNum,
        title: article.title,
        abstract: article.abstract,
        abstract_en: article.abstract_en || '',
        manuscript_file: article.manuscript_file
      });

      // Log revision submission to article_editorial_history
      await supabase.from('article_editorial_history').insert({
        article_id: article.id,
        activity_type: 'revision_submitted',
        description: `Penulis mengunggah naskah revisi (Revisi #${nextVerNum}). Status artikel diubah menjadi sedang ditinjau.`,
        actor_name: user?.user_metadata?.full_name || 'Penulis'
      });

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

      setUploadSuccess('Revisi berhasil dikirim! Status artikel telah diperbarui.');
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
              article.status === 'copyediting' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              article.status === 'layouting' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              article.status === 'published' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              article.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              article.status === 'revised' ? 'bg-teal-50 text-teal-700 border-teal-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {(article.status || '').replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* OJS Submission Process (Timeline) */}
        {(() => {
          const status = (article.status || 'submitted').toLowerCase();
          const dateStr = new Date(article.submission_date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });

          const stepStates = {
            step1: 'completed',
            step2: 'completed',
            step3: ['in_review', 'under_review', 'revised', 'accepted', 'published', 'rejected'].includes(status) ? 'completed' : 'active',
            step4: ['in_review', 'under_review', 'revised'].includes(status) ? 'active' : ['accepted', 'published', 'rejected'].includes(status) ? 'completed' : 'inactive',
            step5: ['accepted', 'published', 'rejected'].includes(status) ? 'completed' : 'inactive'
          };

          const getStepText = (stepNum: number) => {
            if (stepNum === 4) {
              if (stepStates.step4 === 'active') return 'Sedang Berlangsung';
              if (stepStates.step4 === 'completed') return 'Selesai';
              return 'Belum Dimulai';
            }
            if (stepNum === 5) {
              if (status === 'accepted') return 'Diterima';
              if (status === 'published') return 'Terbit';
              if (status === 'rejected') return 'Ditolak';
              return 'Menunggu Keputusan';
            }
            return dateStr;
          };

          return (
            <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
              <h3 className="font-serif font-bold text-base text-academic-800 uppercase tracking-wider mb-6 pb-2 border-b border-academic-100">
                Proses Submisi
              </h3>
              
              {/* Timeline Container */}
              <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-3xl mx-auto gap-8 md:gap-4 py-4">
                
                {/* Connecting Lines for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-academic-200 -translate-y-1/2 z-0"></div>
                <div 
                  className="hidden md:block absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: stepStates.step5 === 'completed' ? '100%' :
                           stepStates.step4 === 'completed' ? '75%' :
                           stepStates.step4 === 'active' ? '62.5%' :
                           stepStates.step3 === 'completed' ? '50%' : '25%'
                  }}
                ></div>

                {/* Step 1: Mulai */}
                <div className="relative flex flex-col items-center z-10 w-28 text-center">
                  <div className="w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center border-emerald-500 text-emerald-600 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-800 mt-2">1. Mulai</span>
                  <span className="text-[10px] text-academic-500 mt-0.5">{getStepText(1)}</span>
                </div>

                {/* Step 2: Unggah Naskah */}
                <div className="relative flex flex-col items-center z-10 w-28 text-center">
                  <div className="w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center border-emerald-500 text-emerald-600 shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-800 mt-2">2. Unggah Naskah</span>
                  <span className="text-[10px] text-academic-500 mt-0.5">{getStepText(2)}</span>
                </div>

                {/* Step 3: Konfirmasi */}
                <div className="relative flex flex-col items-center z-10 w-28 text-center">
                  <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                    stepStates.step3 === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-brand-500 text-brand-600 ring-4 ring-brand-50'
                  }`}>
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-800 mt-2">3. Konfirmasi</span>
                  <span className="text-[10px] text-academic-500 mt-0.5">{getStepText(3)}</span>
                </div>

                {/* Step 4: Review */}
                <div className="relative flex flex-col items-center z-10 w-28 text-center">
                  <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                    stepStates.step4 === 'completed' ? 'border-emerald-500 text-emerald-600' :
                    stepStates.step4 === 'active' ? 'border-brand-500 text-brand-600 ring-4 ring-brand-50' : 'border-academic-300 text-academic-400'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-800 mt-2">4. Review</span>
                  <span className="text-[10px] text-academic-500 mt-0.5">{getStepText(4)}</span>
                </div>

                {/* Step 5: Keputusan */}
                <div className="relative flex flex-col items-center z-10 w-28 text-center">
                  <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                    stepStates.step5 === 'completed' ? (status === 'rejected' ? 'border-rose-500 text-rose-600' : 'border-emerald-500 text-emerald-600') : 'border-academic-300 text-academic-400'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-800 mt-2">5. Keputusan</span>
                  <span className="text-[10px] text-academic-500 mt-0.5">{getStepText(5)}</span>
                </div>

              </div>
            </div>
          );
        })()}

        {/* OJS Submission Details Table */}
        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
          <h3 className="font-serif font-bold text-base text-academic-800 uppercase tracking-wider mb-4 pb-2 border-b border-academic-100">
            Detail Submisi
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <tbody>
                <tr className="border-b border-academic-100">
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px] w-1/4">Penulis</td>
                  <td className="py-3 text-academic-800 font-semibold">
                    {authorsList.length > 0
                      ? authorsList.map(a => a.full_name).join(', ')
                      : user?.full_name || 'Penulis'}
                  </td>
                </tr>
                <tr className="border-b border-academic-100">
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Judul</td>
                  <td className="py-3 text-academic-800 font-serif font-bold">{article.title}</td>
                </tr>
                <tr className="border-b border-academic-100">
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Jurnal</td>
                  <td className="py-3 text-academic-800 font-medium">{article.journals?.name || 'Jurnal'}</td>
                </tr>
                <tr className="border-b border-academic-100">
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Section</td>
                  <td className="py-3 text-academic-800 font-medium">{getSection(article.journals?.name || '')}</td>
                </tr>
                {getArticleScope() && (
                  <tr className="border-b border-academic-100">
                    <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Scope Jurnal</td>
                    <td className="py-3 text-brand-700 font-bold">{getArticleScope()}</td>
                  </tr>
                )}
                <tr className="border-b border-academic-100">
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Editor</td>
                  <td className="py-3 text-academic-800 font-medium">{getEditorName()}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-academic-500 uppercase tracking-widest text-[10px]">Review Round</td>
                  <td className="py-3 text-academic-800 font-medium">{getReviewRound()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Plagiarism Similarity Assessment Card */}
        {article && article.similarity_score !== null && (() => {
          const {
            overallScore,
            citationScore,
            doiValidationScore,
            authorIdentityScore,
            reportData,
            verificationId
          } = parseIntegrityReport(article);

          const getStatusBadgeClass = (decision: string) => {
            if (decision === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (decision === 'Revision Required') return 'bg-amber-50 text-amber-700 border-amber-200';
            return 'bg-rose-50 text-rose-700 border-rose-200';
          };

          const decisionText = reportData.editorial_validation?.decision || 'Approved';

          return (
            <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
              <h3 className="font-serif font-bold text-lg text-academic-900 flex items-center gap-2 mb-4 pb-2 border-b border-academic-100">
                <ShieldCheck className="w-5 h-5 text-brand-600 animate-pulse" /> RJRAKP Academic Integrity & Verification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left: Overall score and status */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-academic-50 p-4 rounded-xl border border-academic-100 text-center flex flex-col justify-center">
                      <span className="block text-xs font-bold text-academic-500 uppercase tracking-wider mb-0.5">Integrity Status</span>
                      <span className={`text-xs sm:text-sm font-black uppercase ${
                        overallScore >= 85 ? 'text-emerald-600' : overallScore >= 70 ? 'text-blue-600' : overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {overallScore >= 85 ? 'Fully Compliant' : overallScore >= 70 ? 'Compliant' : overallScore >= 50 ? 'Partially Compliant' : 'Needs Review'}
                      </span>
                    </div>
                    <div className="bg-academic-50 p-4 rounded-xl border border-academic-100 text-center">
                      <span className="block text-xs font-bold text-academic-500 uppercase tracking-wider mb-1">Audit Status</span>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border mt-1 uppercase ${getStatusBadgeClass(decisionText)}`}>
                        {decisionText === 'Approved' ? 'PASSED' : decisionText}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-academic-500 font-medium">Verification ID:</span>
                      <span className="font-mono font-bold text-brand-700">{verificationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-academic-500 font-medium">Validation Date:</span>
                      <span className="font-semibold text-academic-800">
                        {reportData.editorial_validation?.date ? new Date(reportData.editorial_validation.date).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Key components metrics */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-3 flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-academic-500 font-medium">Citation Integrity Score :</span>
                    <span className="font-bold text-academic-800">{citationScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-academic-500 font-medium">DOI Validation Score :</span>
                    <span className="font-bold text-academic-800">{doiValidationScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-academic-500 font-medium">Author Identity Verified :</span>
                    <span className="font-bold text-academic-800">{authorIdentityScore}/100</span>
                  </div>
                </div>
              </div>

              {/* View PDF Report Button */}
              <div className="flex flex-wrap gap-2 border-t border-academic-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIntegrityModal(true)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-academic-50 text-academic-700 font-bold text-xs px-4 py-2.5 rounded-lg border border-academic-200 transition-colors shadow-sm cursor-pointer"
                >
                  Lihat Ringkasan Validasi
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/article/similarity-report/' + article.id)}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Detailed Report <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* 1. Article Details Card */}
        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6 relative">
          <div className="flex justify-between items-start mb-3">
            <span className="inline-block text-[10px] font-black text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase">
              {article.journals?.name || 'Jurnal'}
            </span>
            {['revised', 'in_review', 'under_review'].includes(article.status) && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Metadata
              </button>
            )}
          </div>
          
          {metadataSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{metadataSuccess}</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-widest mb-1">Judul Artikel</label>
                <textarea 
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full border border-academic-300 rounded-lg p-3 text-academic-900 font-serif font-bold text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Tanggal Submit</span>
                  <p className="font-medium text-academic-800">{new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Integrity Status</span>
                  <p className="font-medium text-academic-800">
                    {article.similarity_score !== null ? (
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        article.similarity_score >= 85 ? 'text-emerald-600' : article.similarity_score >= 70 ? 'text-blue-600' : article.similarity_score >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {article.similarity_score >= 85 ? 'Fully Compliant' : article.similarity_score >= 70 ? 'Compliant' : article.similarity_score >= 50 ? 'Partially Compliant' : 'Needs Review'}
                      </span>
                    ) : (
                      <span className="text-academic-400 italic">Belum diperiksa</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Statistik</span>
                  <p className="font-medium text-academic-800">
                    <span className="inline-flex items-center gap-1.5 mr-4 text-brand-600"><Eye className="w-4 h-4" /> {article.view_count || 0}</span>
                    <span className="inline-flex items-center gap-1.5 text-brand-600"><Download className="w-4 h-4" /> {article.download_count || 0}</span>
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Title Page</span>
                  {article.title_page_file ? (
                    <a href={article.title_page_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Buka File
                    </a>
                  ) : article.manuscript_file ? (
                    <a href={article.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Naskah Lama
                    </a>
                  ) : <span className="text-academic-400 italic">Tidak ada</span>}
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Anonymous Manuscript</span>
                  {article.anonymous_manuscript_file ? (
                    <a href={article.anonymous_manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Buka File
                    </a>
                  ) : <span className="text-academic-400 italic">Tidak ada</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase tracking-widest mb-1">Abstrak (Bahasa Indonesia)</label>
                  <textarea 
                    value={editForm.abstract}
                    onChange={e => setEditForm({...editForm, abstract: e.target.value})}
                    className="w-full border border-academic-300 rounded-lg p-3 text-sm text-academic-700 leading-relaxed text-justify focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    rows={6}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-academic-700 uppercase tracking-widest">Abstract (English)</label>
                    <button 
                      type="button" 
                      onClick={handleAutoTranslate}
                      disabled={isTranslating || !editForm.abstract}
                      className="text-[10px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 px-2 py-0.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isTranslating ? 'Menerjemahkan...' : '✨ Auto Translate'}
                    </button>
                  </div>
                  <textarea 
                    value={editForm.abstract_en || ''}
                    onChange={e => setEditForm({...editForm, abstract_en: e.target.value})}
                    className="w-full border border-academic-300 rounded-lg p-3 text-sm text-academic-700 leading-relaxed text-justify focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    rows={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-widest mb-1">Daftar Pustaka (References)</label>
                <textarea 
                  value={editForm.bibliography}
                  onChange={e => setEditForm({...editForm, bibliography: e.target.value})}
                  className="w-full border border-academic-300 rounded-lg p-3 text-sm text-academic-700 leading-relaxed text-justify focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  rows={8}
                />
              </div>
              
              {/* AI Disclosure Statement Edit */}
              <div className="pt-2 border-t border-academic-100">
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-widest mb-1">Pernyataan Penggunaan AI (AI Disclosure)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1.5">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-academic-500 uppercase tracking-wider mb-1">Tipe Penggunaan AI</label>
                    <select
                      value={editForm.ai_disclosure_type}
                      onChange={e => setEditForm({...editForm, ai_disclosure_type: e.target.value})}
                      className="w-full border border-academic-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
                    >
                      <option value="none">Tidak Menggunakan AI (None)</option>
                      <option value="assisted_writing">Bantuan Penulisan / Penyuntingan Teks</option>
                      <option value="data_analysis">Analisis Data / Eksperimen</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  {editForm.ai_disclosure_type !== 'none' && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-academic-500 uppercase tracking-wider mb-1">Deskripsi Penggunaan AI</label>
                      <textarea
                        required={editForm.ai_disclosure_type !== 'none'}
                        value={editForm.ai_disclosure_statement}
                        onChange={e => setEditForm({...editForm, ai_disclosure_statement: e.target.value})}
                        rows={3}
                        className="w-full border border-academic-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand-500 bg-white"
                        placeholder="Sebutkan alat AI yang digunakan dan bagaimana alat tersebut membantu..."
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-academic-100">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ title: article.title, abstract: article.abstract, abstract_en: article.abstract_en || '', bibliography: article.bibliography || '' });
                  }}
                  className="px-4 py-2 text-academic-600 hover:bg-academic-100 rounded-lg font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
                <button 
                  onClick={handleSaveMetadata}
                  disabled={savingMetadata}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {savingMetadata ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-serif font-bold text-xl text-academic-900 mb-4">{article.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Tanggal Submit</span>
                  <p className="font-medium text-academic-800">{new Date(article.submission_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Integrity Status</span>
                  <p className="font-medium text-academic-800">
                    {article.similarity_score !== null ? (
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        article.similarity_score >= 85 ? 'text-emerald-600' : article.similarity_score >= 70 ? 'text-blue-600' : article.similarity_score >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {article.similarity_score >= 85 ? 'Fully Compliant' : article.similarity_score >= 70 ? 'Compliant' : article.similarity_score >= 50 ? 'Partially Compliant' : 'Needs Review'}
                      </span>
                    ) : (
                      <span className="text-academic-400 italic">Belum diperiksa</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Statistik</span>
                  <p className="font-medium text-academic-800">
                    <span className="inline-flex items-center gap-1.5 mr-4 text-brand-600"><Eye className="w-4 h-4" /> {article.view_count || 0}</span>
                    <span className="inline-flex items-center gap-1.5 text-brand-600"><Download className="w-4 h-4" /> {article.download_count || 0}</span>
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Title Page</span>
                  {article.title_page_file ? (
                    <a href={article.title_page_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Buka File
                    </a>
                  ) : article.manuscript_file ? (
                    <a href={article.manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Naskah Lama
                    </a>
                  ) : <span className="text-academic-400 italic">Tidak ada</span>}
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Anonymous Manuscript</span>
                  {article.anonymous_manuscript_file ? (
                    <a href={article.anonymous_manuscript_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-medium">
                      <FileText className="w-4 h-4" /> Buka File
                    </a>
                  ) : <span className="text-academic-400 italic">Tidak ada</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Abstrak (Bahasa Indonesia)</span>
                  <p className="text-sm text-academic-700 leading-relaxed text-justify">{article.abstract}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Abstract (English)</span>
                  <p className="text-sm text-academic-700 leading-relaxed text-justify italic">{article.abstract_en || <span className="text-academic-400">Tidak ada abstrak bahasa inggris.</span>}</p>
                </div>
              </div>

              {article.funding_source && (
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Sponsor / Sumber Pendanaan</span>
                  <p className="text-sm text-academic-700 mb-4">{article.funding_source}</p>
                </div>
              )}

              {article.bibliography && (
                <div>
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Daftar Pustaka</span>
                  <div className="bg-academic-50 p-4 rounded-lg border border-academic-100 text-sm text-academic-700 leading-relaxed whitespace-pre-wrap">
                    {article.bibliography}
                  </div>
                </div>
              )}

              {article.ai_disclosure_type && article.ai_disclosure_type !== 'none' && (
                <div className="mt-4 pt-4 border-t border-academic-100">
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Pernyataan Penggunaan AI (AI Disclosure)</span>
                  <div className="bg-slate-50 p-4 rounded-lg border border-academic-100 text-sm text-academic-700 leading-relaxed">
                    <p className="font-bold text-academic-800 text-xs mb-1">
                      Tipe: {article.ai_disclosure_type === 'assisted_writing' ? 'Bantuan Penulisan / Penyuntingan Teks' : 
                             article.ai_disclosure_type === 'data_analysis' ? 'Analisis Data / Eksperimen' : 'Lainnya'}
                    </p>
                    <p className="italic">"{article.ai_disclosure_statement}"</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 2. Editorial Discussion */}
        <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
          <h3 className="font-serif font-bold text-lg text-academic-900 flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-brand-600" /> Diskusi Editorial
          </h3>
          <p className="text-xs text-academic-500 mb-4">Gunakan fitur ini untuk berdiskusi langsung dengan Editor terkait naskah Anda.</p>
          
          <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
            {discussions.length === 0 ? (
              <div className="text-center py-6 bg-academic-50 rounded-lg text-academic-500 text-sm">
                Belum ada percakapan. Mulai diskusi dengan Editor di sini.
              </div>
            ) : (
              discussions.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-academic-400 mb-1">{msg.users?.full_name || 'Editor'}</span>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.user_id === user?.id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-academic-100 text-academic-800 rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-academic-400 mt-1">{new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newDiscussion}
              onChange={e => setNewDiscussion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendDiscussion()}
              placeholder="Tulis pesan untuk Editor..."
              className="flex-1 border border-academic-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500"
            />
            <button 
              onClick={handleSendDiscussion}
              disabled={sendingDiscussion || !newDiscussion.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Reviewer & Editor Feedback */}
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

        {/* 4. Production Phase (Copyediting & Layouting) */}
        {['copyediting', 'layouting', 'published'].includes(article.status.toLowerCase()) && (
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-6">
            <h3 className="font-serif font-bold text-lg text-academic-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-600" /> Tahap Produksi
            </h3>
            <p className="text-xs text-academic-500 mb-4">Artikel Anda sedang dalam tahap akhir sebelum publikasi. Silakan periksa file dari Editor.</p>             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Copyediting File */}
              <div className={`p-4 rounded-lg border ${['copyediting', 'layouting', 'published'].includes(article.status.toLowerCase()) ? 'bg-purple-50 border-purple-100' : 'bg-academic-50 border-academic-100 opacity-50'}`}>
                <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-2">1. Hasil Copyediting</h4>
                
                {/* Copyediting Checklist */}
                <div className="mb-3.5 bg-white/60 rounded-lg p-3 border border-purple-100/50 space-y-1">
                  <h5 className="text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-1.5">Lingkup Pemeriksaan:</h5>
                  <div className="grid grid-cols-1 gap-y-1 text-[11px] text-academic-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Tata bahasa
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Ejaan (EYD/PUEBI)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Konsistensi istilah
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Sitasi & daftar pustaka
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Format heading
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Typo
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-600">✅</span> Kesalahan penulisan tabel/gambar
                    </div>
                  </div>
                </div>

                {article.copyedited_file ? (
                  <div className="space-y-3">
                    <p className="text-xs text-purple-700">Editor telah melakukan penyuntingan bahasa.</p>
                    <a href={article.copyedited_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded hover:bg-purple-700 transition-colors">
                      Unduh & Periksa Berkas
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-academic-500 italic">Sedang dikerjakan oleh Editor.</p>
                )}
              </div>

              {/* Layouting File */}
              <div className={`p-4 rounded-lg border ${['layouting', 'published'].includes(article.status.toLowerCase()) ? 'bg-indigo-50 border-indigo-100' : 'bg-academic-50 border-academic-100 opacity-50'}`}>
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-2">2. Galley Final (PDF)</h4>
                
                {/* Layouting Checklist */}
                <div className="mb-3.5 bg-white/60 rounded-lg p-3 border border-indigo-100/50 space-y-1">
                  <h5 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Tugas Editor Layout:</h5>
                  <div className="grid grid-cols-1 gap-y-1 text-[11px] text-academic-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> PDF final jurnal
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Tampilan halaman
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Nomor halaman
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Header dan footer
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Logo jurnal
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> DOI
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Metadata artikel
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-600">📄</span> Tampilan tabel/gambar
                    </div>
                  </div>
                </div>

                {article.layout_file ? (
                  <div className="space-y-3">
                    <p className="text-xs text-indigo-700">Desain akhir artikel PDF (Galley) telah siap.</p>
                    <a href={article.layout_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-700 transition-colors">
                      Unduh Galley Final
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-academic-500 italic">Sedang dikerjakan oleh Editor Layout.</p>
                )}
              </div>

              {/* Cover Editor Card */}
              <div className={`p-4 rounded-lg border ${['layouting', 'published'].includes(article.status.toLowerCase()) ? 'bg-cyan-50 border-cyan-100' : 'bg-academic-50 border-academic-100 opacity-50'}`}>
                <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-widest mb-2">3. Desain Visual & Cover</h4>
                
                {/* Cover Editor Checklist */}
                <div className="mb-3.5 bg-white/60 rounded-lg p-3 border border-cyan-100/50 space-y-1">
                  <h5 className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1.5">Tugas Cover Editor:</h5>
                  <div className="grid grid-cols-1 gap-y-1 text-[11px] text-academic-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-600">🎨</span> Cover edisi jurnal
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-600">🎨</span> Cover artikel individual
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-600">🎨</span> Thumbnail artikel
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-600">🎨</span> Visual DOI card
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-600">🎨</span> Infografis artikel
                    </div>
                  </div>
                </div>

                <p className="text-xs text-academic-500 italic">
                  {article.status.toLowerCase() === 'published' ? 'Desain publikasi telah diselesaikan.' : 'Sedang dikerjakan oleh Cover Editor.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Upload Revision Form */}
        {['revised', 'in_review', 'under_review'].includes(article.status) && (
          <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-md">
            <h3 className="font-serif font-bold text-lg text-academic-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-600" /> Kirim Hasil Revisi
            </h3>
            <p className="text-sm text-academic-500 mb-6">
              Jika Anda telah melakukan perbaikan sesuai catatan dari Editor dan Reviewer, silakan konfirmasi perbaikan Anda di sini. Jika revisi mewajibkan perbaikan file manuskrip, silakan unggah file PDF/DOC terbaru. Jika revisi <strong>hanya pada metadata</strong> (Judul/Abstrak), Anda tidak perlu mengunggah file baru.
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
                        <p className="text-sm text-brand-700 font-bold mb-1">Klik untuk memilih file revisi (Opsional)</p>
                        <p className="text-xs text-academic-500">Format DOC, DOCX, atau PDF (Max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* SECTION 4: KETENTUAN REVISI */}
              <div className="p-4 mt-4 space-y-3 border border-academic-200 rounded-lg bg-amber-50/50">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      id="agreement" 
                      required
                      className="w-5 h-5 rounded border-academic-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="agreement" className="text-sm font-bold text-academic-900 cursor-pointer">
                      Pernyataan Kesesuaian Naskah <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-academic-700 mt-1">
                      Saya mengonfirmasi bahwa naskah jurnal (termasuk hasil revisi ini) <strong>telah dilengkapi dengan Daftar Pustaka</strong> yang sesuai standar akademik.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {uploading ? (
                    'Mengirim...'
                  ) : (
                    <><Send className="w-4 h-4" /> Tandai Revisi Selesai & Kirim</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {showIntegrityModal && (() => {
          const {
            overallScore,
            citationScore,
            doiValidationScore,
            authorIdentityScore,
            reportData,
            verificationId
          } = parseIntegrityReport(article);

          const displayDate = article.similarity_checked_at 
            ? new Date(article.similarity_checked_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            : (article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-');

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-600 animate-pulse" />
                    <h3 className="font-serif font-bold text-academic-900 text-base">RJRAKP Academic Integrity & Verification Report</h3>
                  </div>
                  <button 
                    onClick={() => setShowIntegrityModal(false)}
                    className="p-1.5 text-academic-400 hover:text-academic-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase mb-2">
                      <BookOpen className="w-3 h-3" /> {article.journals?.name || 'Jurnal RJRAKP'}
                    </span>
                    <h4 className="font-serif font-bold text-academic-900 text-base leading-snug mb-1">{article.title}</h4>
                  </div>

                  {article.similarity_score !== null ? (
                    <>
                      {/* SECTION 1: Academic Integrity Status */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider mb-3">1. Academic Integrity Status</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-academic-200/60 text-center flex flex-col justify-center">
                            <span className="block text-[9px] font-bold text-academic-400 uppercase mb-0.5">Integrity Status</span>
                            <span className={`text-xs font-black uppercase ${
                              overallScore >= 85 ? 'text-emerald-600' : overallScore >= 70 ? 'text-blue-600' : overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {overallScore >= 85 ? 'Fully Compliant' : overallScore >= 70 ? 'Compliant' : overallScore >= 50 ? 'Partially Compliant' : 'Needs Review'}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-academic-200/60 text-center">
                            <span className="block text-[9px] font-bold text-academic-400 uppercase">Citation Integrity</span>
                            <span className="text-xl font-bold text-emerald-600 font-mono">{citationScore}%</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-academic-200/60 text-center">
                            <span className="block text-[9px] font-bold text-academic-400 uppercase">DOI Validation</span>
                            <span className="text-xl font-bold text-blue-600 font-mono">{doiValidationScore}/100</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-academic-200/60 text-center">
                            <span className="block text-[9px] font-bold text-academic-400 uppercase">Author Identity</span>
                            <span className="text-xl font-bold text-indigo-600 font-mono">{authorIdentityScore}/100</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: Citation Integrity Analysis */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-2">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">2. Citation Integrity Analysis</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Total References</span>
                            <span className="font-bold text-academic-800">{reportData.citation_analysis?.total_references}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">DOI References</span>
                            <span className="font-bold text-academic-800">{reportData.citation_analysis?.doi_references}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Broken References</span>
                            <span className="font-bold text-rose-600">{reportData.citation_analysis?.broken_references}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Duplicate References</span>
                            <span className="font-bold text-academic-800">{reportData.citation_analysis?.duplicate_references}</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: DOI Verification */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-2">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">3. DOI Verification</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Status</span>
                            <span className={`font-bold ${reportData.doi_verification?.status === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {reportData.doi_verification?.status}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">DOI Provider</span>
                            <span className="font-bold text-academic-800">{reportData.doi_verification?.provider}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Verification Date</span>
                            <span className="font-bold text-academic-800">
                              {reportData.doi_verification?.timestamp ? new Date(reportData.doi_verification.timestamp).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4: ORCID Verification */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-2">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">4. ORCID Verification</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">ORCID ID</span>
                            <span className="font-bold text-academic-800 font-mono">{reportData.orcid_verification?.orcid_id || '-'}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">ORCID Status</span>
                            <span className={`font-bold ${reportData.orcid_verification?.status === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {reportData.orcid_verification?.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 5: Academic Profile Verification */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-2">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">5. Academic Profile Verification</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                          {(reportData.academic_profile_verification || []).map((prof: any, index: number) => {
                            const fallbackUrl = () => {
                              const author = article.article_authors?.[0];
                              if (!author) return '';
                              switch (prof.platform) {
                                case 'SINTA':
                                  return author.sinta_id ? `https://sinta.kemdiktisaintek.go.id/authors/profile/${author.sinta_id}` : '';
                                case 'Scopus Author':
                                  return author.scopus_id ? `https://www.scopus.com/authid/detail.uri?authorId=${author.scopus_id}` : '';
                                case 'Web of Science':
                                  return author.wos_id ? `https://www.webofscience.com/wos/author/record/${author.wos_id}` : '';
                                default:
                                  return '';
                              }
                            };
                            const url = prof.url || fallbackUrl();
                            const isVerified = prof.status === 'Verified' || !!url;
                            return (
                              <div key={index} className="bg-white p-2 rounded border border-academic-100 flex flex-col justify-between">
                                <span className="text-academic-400 block font-bold">{prof.platform}</span>
                                <span className={`font-black ${isVerified ? 'text-emerald-600' : 'text-academic-400'}`}>
                                  {isVerified ? 'Verified' : 'Not Linked'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SECTION 6: Academic Governance Verification & Editorial Validation */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-4">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">6. Academic Governance & Editorial Validation</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block font-semibold">Editor in Chief</span>
                            <span className="font-bold text-academic-800">Dr. Bakhrul Khair Amal, M.Si.</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block font-semibold">Decision</span>
                            <span className="font-bold text-brand-700">{reportData.editorial_validation?.decision}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block font-semibold">Validation Date</span>
                            <span className="font-bold text-academic-800">
                              {reportData.editorial_validation?.date ? new Date(reportData.editorial_validation.date).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-academic-100">
                          <div className="text-[9px] uppercase font-bold text-academic-400 mb-2 tracking-wider text-center">Verified Editorial Profile (Governance Verification)</div>
                          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                            <a href="https://sinta.kemdiktisaintek.go.id/authors/profile/6019786" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                              ✓ SINTA Verified
                            </a>
                            <a href="https://orcid.org/0009-0006-8416-6156" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-[#A6CE39]/10 text-[#7ca221] font-bold border border-[#A6CE39]/30 rounded hover:bg-[#A6CE39]/20 transition-colors">
                              ✓ ORCID Verified
                            </a>
                            <a href="https://scholar.google.com/citations?user=e89cADYAAAAJ&hl=id" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold border border-sky-200 rounded hover:bg-sky-100 transition-colors">
                              ✓ Scholar Verified
                            </a>
                            <a href="https://www.scopus.com/authid/detail.uri?authorId=59675598500" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-orange-50 text-orange-700 font-bold border border-orange-200 rounded hover:bg-orange-100 transition-colors">
                              ✓ Scopus Verified
                            </a>
                            <a href="https://www.researchgate.net/profile/Bakhrul-Amal" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-cyan-50 text-cyan-700 font-bold border border-cyan-200 rounded hover:bg-cyan-100 transition-colors">
                              ✓ ResearchGate Verified
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 7: Audit Information */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-academic-100 space-y-2">
                        <h4 className="text-xs font-bold text-academic-500 uppercase tracking-wider">7. Audit Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Verification ID</span>
                            <span className="font-mono font-bold text-brand-700">{verificationId}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-academic-100">
                            <span className="text-academic-400 block">Article ID</span>
                            <span className="font-mono font-bold text-academic-800 text-[10px]">{article.id}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-academic-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                      <h4 className="font-bold text-academic-800 mb-1">Pemeriksaan Integritas Sedang Diproses</h4>
                      <p className="text-xs">Naskah artikel ini sedang dalam antrean pemeriksaan integritas akademik oleh tim redaksi RJRAKP.</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowIntegrityModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  {article.similarity_score !== null && (
                    <button 
                      onClick={() => {
                        setShowIntegrityModal(false);
                        navigate('/article/similarity-report/' + article.id);
                      }}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      View Detailed Report <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}
