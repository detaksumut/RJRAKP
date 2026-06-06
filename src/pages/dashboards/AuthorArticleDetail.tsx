import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, ArrowLeft, Upload, Send, Clock, MessageSquare, AlertCircle, CheckCircle, Edit3, Save, X, Eye, Download } from 'lucide-react';

export default function AuthorArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [article, setArticle] = useState<any | null>(null);
  const [editorialDecisions, setEditorialDecisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [sendingDiscussion, setSendingDiscussion] = useState(false);
  const [loading, setLoading] = useState(true);

  // Upload revision states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Edit metadata states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', abstract: '', abstract_en: '', bibliography: '' });
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

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
      setEditForm({ title: articleData.title, abstract: articleData.abstract, bibliography: articleData.bibliography || '' });

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
        })
        .eq('id', article.id);
        
      if (error) throw error;
      
      setArticle({ ...article, title: editForm.title, abstract: editForm.abstract, bibliography: editForm.bibliography });
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
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Similarity Index</span>
                  <p className="font-medium text-academic-800">
                    {article.similarity_score !== null ? (
                      <span className={`inline-flex items-center gap-1 ${article.similarity_score > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {article.similarity_score}%
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
                  <span className="block text-xs font-bold text-academic-500 uppercase tracking-widest mb-1">Similarity Index</span>
                  <p className="font-medium text-academic-800">
                    {article.similarity_score !== null ? (
                      <span className={`inline-flex items-center gap-1 ${article.similarity_score > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {article.similarity_score}%
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
            <p className="text-xs text-academic-500 mb-4">Artikel Anda sedang dalam tahap akhir sebelum publikasi. Silakan periksa file dari Editor.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Copyediting File */}
              <div className={`p-4 rounded-lg border ${['copyediting', 'layouting', 'published'].includes(article.status.toLowerCase()) ? 'bg-purple-50 border-purple-100' : 'bg-academic-50 border-academic-100 opacity-50'}`}>
                <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-2">1. Hasil Copyediting</h4>
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

      </div>
    </DashboardLayout>
  );
}
