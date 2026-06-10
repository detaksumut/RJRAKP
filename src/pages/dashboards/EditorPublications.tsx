import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  BookOpen, Layers, Printer, Plus, Trash2, 
  FileText, Calendar, Check, AlertCircle, RefreshCw, X, FileCode
} from 'lucide-react';

export default function EditorPublications() {
  const { user } = useAuth();
  
  const [journals, setJournals] = useState<any[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
  
  const [volumes, setVolumes] = useState<any[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  const [compiledArticles, setCompiledArticles] = useState<any[]>([]);
  const [acceptedArticles, setAcceptedArticles] = useState<any[]>([]);

  // Modals / forms state
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    volume_number: 'Vol. 1',
    year: new Date().getFullYear(),
    issue_number: 'No. 1',
    title: 'Edisi Januari-Juni',
    description: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { data, error: jErr } = await supabase
        .from('journals')
        .select('*')
        .order('name');
      if (jErr) throw jErr;
      setJournals(data || []);
      
      if (data && data.length > 0) {
        setSelectedJournal(data[0]);
        fetchVolumesAndIssues(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat jurnal.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumesAndIssues = async (journalId: string) => {
    try {
      const { data, error: vErr } = await supabase
        .from('journal_volumes')
        .select(`
          id,
          volume_number,
          year,
          journal_issues (
            id,
            issue_number,
            title,
            description,
            status
          )
        `)
        .eq('journal_id', journalId)
        .order('year', { ascending: false });

      if (vErr) throw vErr;
      setVolumes(data || []);

      if (data && data.length > 0) {
        setSelectedVolume(data[0]);
        const issues = data[0].journal_issues;
        if (issues && issues.length > 0) {
          setSelectedIssue(issues[0]);
          fetchCompiledArticles(issues[0].id, data[0].volume_number, issues[0].issue_number, journalId);
        } else {
          setSelectedIssue(null);
          setCompiledArticles([]);
        }
      } else {
        setSelectedVolume(null);
        setSelectedIssue(null);
        setCompiledArticles([]);
      }
      
      fetchAcceptedArticles(journalId);
    } catch (err) {
      console.error('Error fetching volumes/issues:', err);
    }
  };

  const fetchCompiledArticles = async (issueId: string, volNum: string, issueNum: string, journalId: string) => {
    try {
      // Find publications for this volume and issue
      const { data, error: pubErr } = await supabase
        .from('publications')
        .select(`
          id,
          doi,
          pdf_url,
          publication_date,
          articles!inner (
            id,
            title,
            abstract,
            manuscript_file,
            journal_id,
            article_authors ( full_name, affiliation )
          )
        `)
        .eq('volume_number', volNum)
        .eq('issue_number', issueNum)
        .eq('articles.journal_id', journalId);

      if (pubErr) throw pubErr;
      setCompiledArticles(data || []);
    } catch (err) {
      console.error('Error fetching compiled articles:', err);
    }
  };

  const fetchAcceptedArticles = async (journalId: string) => {
    try {
      // Fetch articles with status = 'accepted' for the select journal
      const { data, error: artErr } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          manuscript_file,
          abstract,
          article_authors ( full_name, affiliation )
        `)
        .eq('journal_id', journalId)
        .eq('status', 'accepted');

      if (artErr) throw artErr;
      setAcceptedArticles(data || []);
    } catch (err) {
      console.error('Error fetching accepted articles:', err);
    }
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = journals.find(j => j.id === id);
    if (found) {
      setSelectedJournal(found);
      fetchVolumesAndIssues(found.id);
      setError('');
      setSuccess('');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = volumes.find(v => v.id === id);
    if (found) {
      setSelectedVolume(found);
      const issues = found.journal_issues;
      if (issues && issues.length > 0) {
        setSelectedIssue(issues[0]);
        fetchCompiledArticles(issues[0].id, found.volume_number, issues[0].issue_number, selectedJournal.id);
      } else {
        setSelectedIssue(null);
        setCompiledArticles([]);
      }
    }
  };

  const handleIssueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!selectedVolume) return;
    const found = selectedVolume.journal_issues.find((i: any) => i.id === id);
    if (found) {
      setSelectedIssue(found);
      fetchCompiledArticles(found.id, selectedVolume.volume_number, found.issue_number, selectedJournal.id);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJournal) return;
    setSubmitting(true);
    setError('');
    
    try {
      // 1. Check if Volume exists or create it
      let volumeId = '';
      const existingVol = volumes.find(v => v.volume_number === issueForm.volume_number && v.year === Number(issueForm.year));
      
      if (existingVol) {
        volumeId = existingVol.id;
      } else {
        const { data: newVol, error: newVolErr } = await supabase
          .from('journal_volumes')
          .insert({
            journal_id: selectedJournal.id,
            volume_number: issueForm.volume_number,
            year: Number(issueForm.year),
            status: 'active'
          })
          .select()
          .single();

        if (newVolErr) throw newVolErr;
        volumeId = newVol.id;
      }

      // 2. Create Issue
      const { data: newIssue, error: newIssueErr } = await supabase
        .from('journal_issues')
        .insert({
          volume_id: volumeId,
          issue_number: issueForm.issue_number,
          title: issueForm.title,
          description: issueForm.description,
          status: 'published',
          publication_date: new Date().toISOString()
        })
        .select()
        .single();

      if (newIssueErr) throw newIssueErr;

      setSuccess('Volume & Issue baru berhasil dibuat.');
      setShowAddIssueModal(false);
      fetchVolumesAndIssues(selectedJournal.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuat issue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishArticle = async (article: any) => {
    if (!selectedJournal || !selectedVolume || !selectedIssue) {
      alert('Pilih Jurnal dan Issue tujuan penerbitan terlebih dahulu.');
      return;
    }

    const confirmPublish = window.confirm(`Apakah Anda yakin ingin menerbitkan artikel "${article.title}" pada ${selectedVolume.volume_number} ${selectedIssue.issue_number}?`);
    if (!confirmPublish) return;

    setError('');
    setSuccess('');

    try {
      const journalSlug = selectedJournal.slug;
      const generatedDoi = `10.47822/rjrakp.${journalSlug}.${selectedVolume.volume_number.toLowerCase().replace(/\s+/g, '')}${selectedIssue.issue_number.toLowerCase().replace(/\s+/g, '')}.${article.id.substring(0, 8)}`;

      // Generate article slug for HTML page
      const baseSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueSlug = `${baseSlug}-${article.id.substring(0, 8)}`;

      // 1. Insert into publications
      const { error: pubErr } = await supabase
        .from('publications')
        .insert({
          article_id: article.id,
          volume_number: selectedVolume.volume_number,
          issue_number: selectedIssue.issue_number,
          publication_date: new Date().toISOString(),
          doi: generatedDoi,
          pdf_url: article.manuscript_file || '',
          doi_status: 'registered'
        });

      if (pubErr) throw pubErr;

      // 2. Update article status to published and set slug
      const { error: artErr } = await supabase
        .from('articles')
        .update({ status: 'published', slug: uniqueSlug })
        .eq('id', article.id);

      if (artErr) throw artErr;

      // 2.5 Generate Honorariums (Call RPC)
      await supabase.rpc('generate_article_honorariums', { p_article_id: article.id });

      // 3. Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Published article: "${article.title}" in ${selectedJournal.name} ${selectedVolume.volume_number} ${selectedIssue.issue_number}`,
        entity_type: 'articles',
        entity_id: article.id
      });

      setSuccess(`Artikel "${article.title}" berhasil diterbitkan.`);
      fetchCompiledArticles(selectedIssue.id, selectedVolume.volume_number, selectedIssue.issue_number, selectedJournal.id);
      fetchAcceptedArticles(selectedJournal.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menerbitkan artikel.');
    }
  };

  const handleUnpublishArticle = async (publication: any) => {
    const confirmUnpublish = window.confirm(`Apakah Anda yakin ingin membatalkan publikasi artikel "${publication.articles?.title}"? Artikel akan ditarik dari cetak dan status kembali menjadi Accepted.`);
    if (!confirmUnpublish) return;

    setError('');
    setSuccess('');

    try {
      // 1. Update article status back to accepted
      const { error: artErr } = await supabase
        .from('articles')
        .update({ status: 'accepted' })
        .eq('id', publication.articles.id);

      if (artErr) throw artErr;

      // 2. Delete from publications
      const { error: deleteErr } = await supabase
        .from('publications')
        .delete()
        .eq('id', publication.id);

      if (deleteErr) throw deleteErr;

      // 3. Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Unpublished article: "${publication.articles?.title}"`,
        entity_type: 'articles',
        entity_id: publication.articles.id
      });

      setSuccess('Artikel berhasil ditarik dari publikasi.');
      fetchCompiledArticles(selectedIssue.id, selectedVolume.volume_number, selectedIssue.issue_number, selectedJournal.id);
      fetchAcceptedArticles(selectedJournal.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menarik artikel dari publikasi.');
    }
  };

  const handleDownloadXml = (articleId: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crossref-xml?article_id=${articleId}`;
    window.open(url, '_blank');
  };

  // Printable cover window trigger
  const handlePrintCover = () => {
    if (!selectedJournal || !selectedVolume || !selectedIssue) return;
    
    // Calculate cover color matching Publikasi.tsx
    let gradient = 'linear-gradient(135deg, #334155, #0f172a)';
    let accentColor = '#6366f1';
    const slug = selectedJournal.slug;
    if (slug === 'audit-kebijakan-publik') {
      gradient = 'linear-gradient(135deg, #1e293b, #0f172a)';
      accentColor = '#818cf8';
    } else if (slug === 'hukum-dan-keadilan') {
      gradient = 'linear-gradient(135deg, #450a0a, #0c0a09)';
      accentColor = '#ef4444';
    } else if (slug === 'pendidikan-dan-pembelajaran') {
      gradient = 'linear-gradient(135deg, #064e3b, #022c22)';
      accentColor = '#34d399';
    } else if (slug === 'teknik-dan-teknologi') {
      gradient = 'linear-gradient(135deg, #78350f, #09090b)';
      accentColor = '#fbbf24';
    } else if (slug === 'agama-dan-peradaban-islam') {
      gradient = 'linear-gradient(135deg, #115e59, #0f172a)';
      accentColor = '#2dd4bf';
    }

    const articlesTOC = compiledArticles.map((art, idx) => `
      <div style="font-size: 14px; border-left: 2px solid rgba(255,255,255,0.2); padding-left: 10px; margin-bottom: 12px; font-family: sans-serif; text-align: left;">
        <span style="font-weight: bold; opacity: 0.6;">${idx + 1}.</span>
        ${art.articles?.title}
        <div style="font-size: 11px; opacity: 0.7; margin-top: 2px; font-style: italic;">
          Oleh: ${art.articles?.article_authors?.map((a: any) => a.full_name).join(', ') || 'Penulis'}
        </div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cover Jurnal - ${selectedJournal.name}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Times New Roman', Times, serif;
                background: ${gradient} !important;
                color: white !important;
                width: 210mm;
                height: 297mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 30mm 20mm;
              }
              .header {
                border-bottom: 2px solid rgba(255,255,255,0.2);
                padding-bottom: 15px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
              }
              .header img {
                height: 80px;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
              }
              .header {
                border-bottom: 2px solid rgba(255,255,255,0.2);
                padding-bottom: 15px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
              }
              .title-container {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-top: 10mm;
              }
              .title {
                font-size: 28px;
                font-weight: bold;
                line-height: 1.2;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: left;
              }
              .accent-bar {
                width: 50mm;
                height: 4px;
                background-color: ${accentColor};
                margin-bottom: 20px;
              }
              .issue-badge {
                font-size: 14px;
                font-family: Arial, sans-serif;
                font-weight: bold;
                background-color: rgba(255,255,255,0.15);
                padding: 5px 12px;
                border-radius: 4px;
                width: max-content;
                margin-bottom: 30px;
              }
              .toc-heading {
                font-size: 12px;
                font-family: Arial, sans-serif;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: rgba(255,255,255,0.6);
                margin-bottom: 15px;
                font-weight: bold;
                text-align: left;
              }
              .footer {
                border-top: 1px solid rgba(255,255,255,0.15);
                padding-top: 15px;
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                font-family: Arial, sans-serif;
                opacity: 0.7;
                letter-spacing: 1px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="https://rjrakp.com/logo-rjrakp.png" alt="Logo RJRAKP" />
            </div>
            
            <div class="title-container">
              <div class="title">${selectedJournal.name}</div>
              <div class="accent-bar"></div>
              
              <div class="issue-badge">
                ${selectedVolume.volume_number}, ${selectedIssue.issue_number}, Tahun ${selectedVolume.year}
              </div>
              
              <div class="toc-heading">Daftar Artikel (Table of Contents)</div>
              <div style="max-height: 140mm; overflow: hidden; padding-top: 5px;">
                ${articlesTOC || '<div style="font-style: italic; opacity: 0.5;">Belum ada artikel terbit di issue ini.</div>'}
              </div>
            </div>
            
            <div class="footer">
              <span>P-ISSN: ${selectedJournal.p_issn || '-'}</span>
              <span>E-ISSN: ${selectedJournal.e_issn || '-'}</span>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Determine gradient color based on slug for Cover Live Preview
  let coverGradient = 'from-slate-700 to-indigo-950';
  let accentBorder = 'border-brand-500';
  if (selectedJournal) {
    const slug = selectedJournal.slug;
    if (slug === 'audit-kebijakan-publik') {
      coverGradient = 'from-slate-800 to-indigo-950';
      accentBorder = 'border-indigo-400';
    } else if (slug === 'hukum-dan-keadilan') {
      coverGradient = 'from-rose-950 via-red-950 to-stone-950';
      accentBorder = 'border-red-500';
    } else if (slug === 'pendidikan-dan-pembelajaran') {
      coverGradient = 'from-emerald-900 via-teal-950 to-emerald-950';
      accentBorder = 'border-emerald-400';
    } else if (slug === 'teknik-dan-teknologi') {
      coverGradient = 'from-amber-900 via-stone-900 to-zinc-950';
      accentBorder = 'border-amber-400';
    } else if (slug === 'agama-dan-peradaban-islam') {
      coverGradient = 'from-teal-900 via-emerald-900 to-slate-950';
      accentBorder = 'border-teal-400';
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Generate Cover & Publikasi Jurnal</h1>
            <p className="text-academic-500">Kelola penerbitan naskah, susun edisi berkala, dan cetak sampul depan (cover) jurnal.</p>
          </div>
          <button
            onClick={() => setShowAddIssueModal(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Edisi/Issue
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6">
            {success}
          </div>
        )}

        {/* Dropdowns filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-academic-200 shadow-sm mb-8">
          <div>
            <label className="block text-[10px] font-black text-academic-500 uppercase tracking-wider mb-1.5">Pilih Jurnal</label>
            <select
              value={selectedJournal?.id || ''}
              onChange={handleJournalChange}
              className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium cursor-pointer"
            >
              {journals.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-academic-500 uppercase tracking-wider mb-1.5">Pilih Volume</label>
            <select
              value={selectedVolume?.id || ''}
              onChange={handleVolumeChange}
              disabled={volumes.length === 0}
              className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium cursor-pointer disabled:opacity-50"
            >
              {volumes.map(v => (
                <option key={v.id} value={v.id}>{v.volume_number} ({v.year})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-academic-500 uppercase tracking-wider mb-1.5">Pilih Nomor/Issue</label>
            <select
              value={selectedIssue?.id || ''}
              onChange={handleIssueChange}
              disabled={!selectedVolume || selectedVolume.journal_issues?.length === 0}
              className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium cursor-pointer disabled:opacity-50"
            >
              {selectedVolume?.journal_issues?.map((i: any) => (
                <option key={i.id} value={i.id}>{i.issue_number} - {i.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-academic-500 font-medium">Memuat data publikasi...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Live Preview of Journal Cover */}
            <div className="lg:col-span-1 flex flex-col items-center gap-6">
              <span className="text-xs font-black text-academic-500 uppercase tracking-widest self-start">Live Preview Cover Jurnal</span>
              
              {selectedJournal && selectedVolume && selectedIssue ? (
                <>
                  {/* Journal Cover */}
                  <div className={`w-64 h-90 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col text-white bg-gradient-to-br ${coverGradient} border border-white/10 p-5 select-none shrink-0`}>
                    <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-white/5 blur-xl" />
                    <div className="relative z-10 w-full">
                      <div className="border-b-2 border-white/20 pb-4 mb-4 flex flex-col items-center justify-center text-center w-full">
                        <img src="/logo-rjrakp.png" alt="Logo RJRAKP" className="h-16 w-auto mx-auto object-contain filter brightness-0 invert opacity-100 drop-shadow-md" />
                      </div>
                    </div>

                    <div className="flex-1 z-10 flex flex-col justify-start">
                      <h2 className="text-base font-serif font-black leading-tight mb-2 uppercase tracking-wide line-clamp-3">
                        {selectedJournal.name}
                      </h2>
                      <div className={`w-8 h-1 border-t-2 ${accentBorder} mb-3`} />
                      
                      <p className="text-[10px] font-bold text-white/90 mb-4 bg-white/10 px-2 py-0.5 rounded w-max">
                        {selectedVolume.volume_number}, {selectedIssue.issue_number}, {selectedVolume.year}
                      </p>

                      <div className="space-y-2 mt-2">
                        <p className="text-[9.5px] uppercase font-black tracking-wider text-white/60">Daftar Isi / TOC:</p>
                        {compiledArticles.length === 0 ? (
                          <p className="text-[9px] italic text-white/50">Belum ada artikel terbit.</p>
                        ) : (
                          compiledArticles.slice(0, 4).map((pub, idx) => (
                            <div key={pub.id} className="text-[9px] leading-snug text-white/90 line-clamp-2 border-l border-white/20 pl-2">
                              <span className="font-bold text-white/60 mr-1">{idx + 1}.</span>
                              {pub.articles?.title}
                            </div>
                          ))
                        )}
                        {compiledArticles.length > 4 && (
                          <p className="text-[8px] italic text-white/50 pl-2">dan {compiledArticles.length - 4} artikel lainnya...</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-auto flex justify-between text-[8px] text-white/60 z-10 tracking-widest uppercase font-bold">
                      <span>P-ISSN: {selectedJournal.p_issn || '-'}</span>
                      <span>E-ISSN: {selectedJournal.e_issn || '-'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrintCover}
                    className="inline-flex items-center justify-center gap-1.5 w-64 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
                  >
                    <Printer className="w-4 h-4" /> Cetak / Unduh Cover (A4)
                  </button>
                </>
              ) : (
                <div className="w-64 h-90 rounded-2xl bg-academic-100 border border-dashed border-academic-300 flex items-center justify-center text-center p-6 text-academic-500 text-xs">
                  Buat Edisi/Issue terlebih dahulu untuk melihat cover.
                </div>
              )}
            </div>

            {/* Middle & Right Column - Article Compiler */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Compiled Articles List */}
              <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-academic-100 bg-academic-50/50">
                  <h3 className="font-bold text-academic-900 text-xs uppercase tracking-wider">Artikel yang Terbit di Edisi Ini ({compiledArticles.length})</h3>
                </div>
                <div className="divide-y divide-academic-100">
                  {compiledArticles.length === 0 ? (
                    <div className="p-8 text-center text-academic-500 text-xs italic">
                      Belum ada naskah artikel yang diterbitkan pada edisi ini.
                    </div>
                  ) : (
                    compiledArticles.map((pub: any) => (
                      <div key={pub.id} className="p-4 flex items-center justify-between hover:bg-academic-50/20 transition-colors text-xs">
                        <div className="space-y-1 pr-4">
                          <h4 className="font-bold text-academic-900 leading-snug">{pub.articles?.title}</h4>
                          <p className="text-[10px] text-academic-500 italic">Oleh: {pub.articles?.article_authors?.map((a: any) => a.full_name).join(', ')}</p>
                          <p className="text-[10px] font-mono text-brand-700">DOI: {pub.doi || '-'}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDownloadXml(pub.articles?.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-100 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5" /> XML Crossref
                          </button>
                          <button
                            onClick={() => handleUnpublishArticle(pub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Batal Terbit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Accepted Articles List */}
              <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-academic-100 bg-academic-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-academic-900 text-xs uppercase tracking-wider">Naskah Siap Terbit (Accepted) ({acceptedArticles.length})</h3>
                </div>
                <div className="divide-y divide-academic-100">
                  {acceptedArticles.length === 0 ? (
                    <div className="p-8 text-center text-academic-500 text-xs italic">
                      Tidak ada naskah bersatus "Accepted" yang menunggu diterbitkan.
                    </div>
                  ) : (
                    acceptedArticles.map((article: any) => (
                      <div key={article.id} className="p-4 flex items-center justify-between hover:bg-academic-50/20 transition-colors text-xs">
                        <div className="space-y-0.5 pr-4">
                          <h4 className="font-bold text-academic-900 leading-snug">{article.title}</h4>
                          <p className="text-[10px] text-academic-500 italic">Oleh: {article.article_authors?.map((a: any) => a.full_name).join(', ')}</p>
                        </div>
                        <button
                          onClick={() => handlePublishArticle(article)}
                          disabled={!selectedIssue}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg font-bold text-[10px] transition-colors shadow-sm shrink-0"
                        >
                          Terbitkan Sini
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      {showAddIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-academic-100 flex flex-col my-8">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl sticky top-0">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Buat Edisi / Issue Baru</h3>
              <button onClick={() => setShowAddIssueModal(false)} className="text-academic-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateIssue}>
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-academic-950 uppercase tracking-wider mb-1.5">Volume (Edisi) *</label>
                    <input
                      type="text"
                      required
                      value={issueForm.volume_number}
                      onChange={e => setIssueForm({ ...issueForm, volume_number: e.target.value })}
                      placeholder="Contoh: Vol. 1"
                      className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-academic-950 uppercase tracking-wider mb-1.5">Tahun Terbit *</label>
                    <input
                      type="number"
                      required
                      value={issueForm.year}
                      onChange={e => setIssueForm({ ...issueForm, year: Number(e.target.value) })}
                      placeholder="Contoh: 2026"
                      className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-academic-950 uppercase tracking-wider mb-1.5">Nomor Issue *</label>
                  <input
                    type="text"
                    required
                    value={issueForm.issue_number}
                    onChange={e => setIssueForm({ ...issueForm, issue_number: e.target.value })}
                    placeholder="Contoh: No. 1"
                    className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-academic-950 uppercase tracking-wider mb-1.5">Judul Edisi / Edisi Keterangan *</label>
                  <input
                    type="text"
                    required
                    value={issueForm.title}
                    onChange={e => setIssueForm({ ...issueForm, title: e.target.value })}
                    placeholder="Contoh: Edisi Januari-Juni 2026"
                    className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-academic-950 uppercase tracking-wider mb-1.5">Deskripsi Singkat Edisi</label>
                  <textarea
                    rows={3}
                    value={issueForm.description}
                    onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                    placeholder="Masukkan gambaran singkat artikel-artikel pilihan pada edisi ini..."
                    className="w-full border border-academic-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-academic-100 bg-academic-50/50 flex justify-end gap-3 rounded-b-xl">
                <button 
                  type="button" 
                  onClick={() => setShowAddIssueModal(false)}
                  className="px-4 py-2 border border-academic-300 text-academic-700 font-bold rounded-lg text-xs hover:bg-academic-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Buat Edisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
