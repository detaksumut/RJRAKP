import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  BookOpen, Layers, Printer, Plus, Trash2, 
  FileText, Calendar, Check, AlertCircle, RefreshCw, X, FileCode
} from 'lucide-react';

function getJournalStyle(slug: string) {
  switch (slug) {
    case 'audit-kebijakan-publik':
      return {
        bg: 'from-slate-55 to-indigo-50/50',
        text: 'text-indigo-950',
        accentColor: 'border-indigo-600',
        badgeBg: 'bg-indigo-600',
        badgeText: 'text-white',
        border: 'border-indigo-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-indigo-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="15" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="30" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="45" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="60" strokeWidth="0.25" />
            <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="15" y1="15" x2="85" y2="85" strokeWidth="0.25" strokeDasharray="1,1" />
            <line x1="15" y1="85" x2="85" y2="15" strokeWidth="0.25" strokeDasharray="1,1" />
          </svg>
        )
      };
    case 'hukum-dan-keadilan':
      return {
        bg: 'from-stone-55 to-rose-50/60',
        text: 'text-rose-950',
        accentColor: 'border-rose-600',
        badgeBg: 'bg-rose-600',
        badgeText: 'text-white',
        border: 'border-rose-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05] stroke-rose-700 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M20,90 L80,90 M25,90 L25,10 M35,90 L35,10 M45,90 L45,10 M55,90 L55,10 M65,90 L65,10 M75,90 L75,10" strokeWidth="0.5" />
            <rect x="22" y="7" width="56" height="3" rx="0.5" strokeWidth="0.5" />
            <rect x="18" y="90" width="64" height="4" rx="0.5" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="100" y2="45" strokeWidth="0.25" strokeDasharray="2,2" />
            <line x1="0" y1="45" x2="100" y2="65" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
    case 'pendidikan-dan-pembelajaran':
      return {
        bg: 'from-emerald-55/50 to-teal-50/50',
        text: 'text-emerald-950',
        accentColor: 'border-emerald-600',
        badgeBg: 'bg-emerald-600',
        badgeText: 'text-white',
        border: 'border-emerald-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-emerald-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,20 Q 25,10 50,20 T 100,20" strokeWidth="0.25" />
            <path d="M 0,30 Q 25,20 50,30 T 100,30" strokeWidth="0.25" />
            <path d="M 0,40 Q 25,30 50,40 T 100,40" strokeWidth="0.25" />
            <path d="M 0,50 Q 25,40 50,50 T 100,50" strokeWidth="0.25" />
            <path d="M 0,60 Q 25,50 50,60 T 100,60" strokeWidth="0.25" />
            <path d="M 0,70 Q 25,60 50,70 T 100,70" strokeWidth="0.25" />
            <path d="M 0,80 Q 25,70 50,80 T 100,80" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
    case 'teknik-dan-teknologi':
      return {
        bg: 'from-amber-55/30 to-slate-100/50',
        text: 'text-slate-900',
        accentColor: 'border-amber-600',
        badgeBg: 'bg-amber-600',
        badgeText: 'text-white',
        border: 'border-amber-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-amber-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" strokeWidth="0.25" />
            <polygon points="50,25 68,35 68,55 50,65 32,55 32,35" strokeWidth="0.25" />
            <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="10" y1="28" x2="90" y2="72" strokeWidth="0.15" strokeDasharray="2,2" />
            <line x1="10" y1="72" x2="90" y2="28" strokeWidth="0.15" strokeDasharray="2,2" />
            <circle cx="50" cy="15" r="1" className="fill-amber-600" />
            <circle cx="75" cy="30" r="1" className="fill-amber-600" />
            <circle cx="75" cy="60" r="1" className="fill-amber-600" />
            <circle cx="50" cy="75" r="1" className="fill-amber-600" />
            <circle cx="25" cy="60" r="1" className="fill-amber-600" />
            <circle cx="25" cy="30" r="1" className="fill-amber-600" />
          </svg>
        )
      };
    case 'agama-dan-peradaban-islam':
      return {
        bg: 'from-teal-55 to-emerald-50/50',
        text: 'text-teal-950',
        accentColor: 'border-teal-600',
        badgeBg: 'bg-teal-600',
        badgeText: 'text-white',
        border: 'border-teal-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-teal-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="30" y="30" width="40" height="40" transform="rotate(0 50 50)" strokeWidth="0.25" />
            <rect x="30" y="30" width="40" height="40" transform="rotate(45 50 50)" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="28" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.15" strokeDasharray="1,1" />
            <polygon points="50,5 52,12 59,12 53,16 55,23 50,19 45,23 47,16 41,12 48,12" strokeWidth="0.15" />
            <polygon points="50,95 52,88 59,88 53,84 55,77 50,81 45,77 47,84 41,88 48,88" strokeWidth="0.15" />
            <polygon points="5,50 12,52 12,59 16,53 23,55 19,50 23,45 16,47 12,41 12,48" strokeWidth="0.15" />
            <polygon points="95,50 88,52 88,59 84,53 77,55 81,50 77,45 84,47 88,41 88,48" strokeWidth="0.15" />
          </svg>
        )
      };
    default:
      return {
        bg: 'from-slate-55 to-indigo-50/50',
        text: 'text-slate-900',
        accentColor: 'border-brand-600',
        badgeBg: 'bg-brand-600',
        badgeText: 'text-white',
        border: 'border-slate-100',
        pattern: (
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-slate-500 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="30" strokeWidth="0.25" />
            <line x1="0" y1="0" x2="100" y2="100" strokeWidth="0.25" strokeDasharray="2,2" />
            <line x1="100" y1="0" x2="0" y2="100" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        )
      };
  }
}

function getJournalStyleForPrint(slug: string) {
  switch (slug) {
    case 'audit-kebijakan-publik':
      return {
        gradient: 'linear-gradient(135deg, #f8fafc, #e0e7ff)',
        accentColor: '#4f46e5',
        textColor: '#312e81',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.06; stroke: #4f46e5; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="15" stroke-width="0.25" />
            <circle cx="50" cy="50" r="30" stroke-width="0.25" />
            <circle cx="50" cy="50" r="45" stroke-width="0.25" />
            <circle cx="50" cy="50" r="60" stroke-width="0.25" />
            <line x1="50" y1="0" x2="50" y2="100" stroke-width="0.25" stroke-dasharray="1,1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke-width="0.25" stroke-dasharray="1,1" />
            <line x1="15" y1="15" x2="85" y2="85" stroke-width="0.25" stroke-dasharray="1,1" />
            <line x1="15" y1="85" x2="85" y2="15" stroke-width="0.25" stroke-dasharray="1,1" />
          </svg>
        `
      };
    case 'hukum-dan-keadilan':
      return {
        gradient: 'linear-gradient(135deg, #fafaf9, #ffe4e6)',
        accentColor: '#e11d48',
        textColor: '#4c0519',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.05; stroke: #e11d48; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M20,90 L80,90 M25,90 L25,10 M35,90 L35,10 M45,90 L45,10 M55,90 L55,10 M65,90 L65,10 M75,90 L75,10" stroke-width="0.5" />
            <rect x="22" y="7" width="56" height="3" rx="0.5" stroke-width="0.5" />
            <rect x="18" y="90" width="64" height="4" rx="0.5" stroke-width="0.5" />
            <line x1="0" y1="25" x2="100" y2="45" stroke-width="0.25" stroke-dasharray="2,2" />
            <line x1="0" y1="45" x2="100" y2="65" stroke-width="0.25" stroke-dasharray="2,2" />
          </svg>
        `
      };
    case 'pendidikan-dan-pembelajaran':
      return {
        gradient: 'linear-gradient(135deg, #f0fdf4, #f0fdfa)',
        accentColor: '#059669',
        textColor: '#022c22',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.06; stroke: #059669; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,20 Q 25,10 50,20 T 100,20" stroke-width="0.25" />
            <path d="M 0,30 Q 25,20 50,30 T 100,30" stroke-width="0.25" />
            <path d="M 0,40 Q 25,30 50,40 T 100,40" stroke-width="0.25" />
            <path d="M 0,50 Q 25,40 50,50 T 100,50" stroke-width="0.25" />
            <path d="M 0,60 Q 25,50 50,60 T 100,60" stroke-width="0.25" />
            <path d="M 0,70 Q 25,60 50,70 T 100,70" stroke-width="0.25" />
            <path d="M 0,80 Q 25,70 50,80 T 100,80" stroke-width="0.25" />
            <circle cx="50" cy="50" r="35" stroke-width="0.25" stroke-dasharray="2,2" />
          </svg>
        `
      };
    case 'teknik-dan-teknologi':
      return {
        gradient: 'linear-gradient(135deg, #fef8e7, #f1f5f9)',
        accentColor: '#d97706',
        textColor: '#451a03',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.06; stroke: #d97706; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" stroke-width="0.25" />
            <polygon points="50,25 68,35 68,55 50,65 32,55 32,35" stroke-width="0.25" />
            <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke-width="0.15" stroke-dasharray="2,2" />
            <line x1="50" y1="5" x2="50" y2="95" stroke-width="0.15" stroke-dasharray="2,2" />
            <line x1="10" y1="28" x2="90" y2="72" stroke-width="0.15" stroke-dasharray="2,2" />
            <line x1="10" y1="72" x2="90" y2="28" stroke-width="0.15" stroke-dasharray="2,2" />
            <circle cx="50" cy="15" r="1" fill="#d97706" />
            <circle cx="75" cy="30" r="1" fill="#d97706" />
            <circle cx="75" cy="60" r="1" fill="#d97706" />
            <circle cx="50" cy="75" r="1" fill="#d97706" />
            <circle cx="25" cy="60" r="1" fill="#d97706" />
            <circle cx="25" cy="30" r="1" fill="#d97706" />
          </svg>
        `
      };
    case 'agama-dan-peradaban-islam':
      return {
        gradient: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
        accentColor: '#0d9488',
        textColor: '#042f2e',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.06; stroke: #0d9488; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="30" y="30" width="40" height="40" transform="rotate(0 50 50)" stroke-width="0.25" />
            <rect x="30" y="30" width="40" height="40" transform="rotate(45 50 50)" stroke-width="0.25" />
            <circle cx="50" cy="50" r="28" stroke-width="0.25" />
            <circle cx="50" cy="50" r="35" stroke-width="0.15" stroke-dasharray="1,1" />
            <polygon points="50,5 52,12 59,12 53,16 55,23 50,19 45,23 47,16 41,12 48,12" stroke-width="0.15" />
            <polygon points="50,95 52,88 59,88 53,84 55,77 50,81 45,77 47,84 41,88 48,88" stroke-width="0.15" />
            <polygon points="5,50 12,52 12,59 16,53 23,55 19,50 23,45 16,47 12,41 12,48" stroke-width="0.15" />
            <polygon points="95,50 88,52 88,59 84,53 77,55 81,50 77,45 84,47 88,41 88,48" stroke-width="0.15" />
          </svg>
        `
      };
    default:
      return {
        gradient: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        accentColor: '#4f46e5',
        textColor: '#1e1b4b',
        patternSvg: `
          <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.06; stroke: #4f46e5; fill: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="30" stroke-width="0.25" />
            <line x1="0" y1="0" x2="100" y2="100" stroke-width="0.25" stroke-dasharray="2,2" />
            <line x1="100" y1="0" x2="0" y2="100" stroke-width="0.25" stroke-dasharray="2,2" />
          </svg>
        `
      };
  }
}

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
    if (selectedJournal && selectedVolume && selectedIssue) {
      const printStyle = getJournalStyleForPrint(selectedJournal.slug);

      const articlesTOC = compiledArticles.map((art, idx) => `
        <div style="font-size: 14px; border-left: 2px solid ${printStyle.accentColor}; padding-left: 10px; margin-bottom: 12px; font-family: sans-serif; text-align: left; color: #334155;">
          <span style="font-weight: bold; color: #64748b;">${idx + 1}.</span>
          <span style="font-weight: bold; color: #1e293b;">${art.articles?.title}</span>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px; font-style: italic;">
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
                  background: ${printStyle.gradient} !important;
                  color: #334155 !important;
                  width: 210mm;
                  height: 297mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 30mm 20mm;
                  position: relative;
                }
                .header {
                  text-align: center;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  margin-bottom: 15px;
                  z-index: 10;
                }
                .header-logo-container {
                  background-color: white !important;
                  border: 1px solid rgba(0,0,0,0.08);
                  border-radius: 16px;
                  padding: 12px 30px;
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 70px;
                }
                .header-logo-container img {
                  height: 46px;
                  object-fit: contain;
                }
                .title-container {
                  flex-grow: 1;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  margin-top: 10mm;
                  z-index: 10;
                }
                .title {
                  font-size: 28px;
                  font-weight: bold;
                  line-height: 1.2;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  text-align: left;
                  color: ${printStyle.textColor} !important;
                }
                .accent-bar {
                  width: 50mm;
                  height: 4px;
                  background-color: ${printStyle.accentColor};
                  margin-bottom: 20px;
                }
                .issue-badge {
                  font-size: 14px;
                  font-family: Arial, sans-serif;
                  font-weight: bold;
                  background-color: ${printStyle.accentColor};
                  color: white !important;
                  padding: 6px 16px;
                  border-radius: 20px;
                  width: max-content;
                  margin-bottom: 30px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .toc-heading {
                  font-size: 12px;
                  font-family: Arial, sans-serif;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  color: #64748b;
                  margin-bottom: 15px;
                  font-weight: bold;
                  text-align: left;
                }
                .footer {
                  border-top: 1px solid rgba(0,0,0,0.08);
                  padding-top: 15px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  font-family: Arial, sans-serif;
                  color: #64748b;
                  font-weight: bold;
                  letter-spacing: 1px;
                  z-index: 10;
                }
              </style>
            </head>
            <body>
              <!-- Watermark pattern -->
              ${printStyle.patternSvg}

              <div class="header">
                <div class="header-logo-container">
                  <img src="${window.location.origin}/logo.png" alt="Logo RJRAKP" />
                </div>
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
    }
  };

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
                  {(() => {
                    const style = getJournalStyle(selectedJournal.slug);
                    return (
                      <div className={`w-64 h-90 rounded-2xl shadow-xl relative overflow-hidden flex flex-col bg-gradient-to-br ${style.bg} border ${style.border} p-5 select-none shrink-0 text-slate-800`}>
                        {/* SVG Watermark Pattern */}
                        {style.pattern}

                        {/* Decorative background glow */}
                        <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-white/40 blur-xl pointer-events-none" />
                        
                        {/* Logo / Header */}
                        <div className="bg-white rounded-xl py-2.5 px-4 shadow-sm border border-slate-200/50 z-10 flex items-center justify-center text-center w-full mb-4 shrink-0">
                          <img src="/logo.png" alt="Logo RJRAKP" className="h-10 w-auto object-contain" />
                        </div>

                        {/* Journal Title */}
                        <div className="flex-1 z-10 flex flex-col justify-start">
                          <h2 className={`text-[13px] font-serif font-black leading-snug mb-1.5 uppercase tracking-wide line-clamp-3 ${style.text}`}>
                            {selectedJournal.name}
                          </h2>
                          <div className={`w-8 h-0.5 border-t-2 ${style.accentColor} mb-3`} />
                          
                          {/* Issue & Date */}
                          <p className={`text-[9px] font-bold ${style.badgeText} ${style.badgeBg} px-2.5 py-0.5 rounded-full w-max shadow-sm mb-4`}>
                            {selectedVolume.volume_number}, {selectedIssue.issue_number}, {selectedVolume.year}
                          </p>

                          {/* Small List of articles on cover */}
                          <div className="space-y-1.5 mt-1">
                            <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Daftar Isi / TOC:</p>
                            {compiledArticles.length === 0 ? (
                              <p className="text-[8.5px] italic text-slate-400">Belum ada artikel terbit.</p>
                            ) : (
                              compiledArticles.slice(0, 4).map((pub, idx) => (
                                <div key={pub.id} className="text-[8.5px] leading-snug text-slate-600 line-clamp-2 border-l border-slate-200 pl-2">
                                  <span className="font-bold text-slate-400 mr-1">{idx + 1}.</span>
                                  {pub.articles?.title}
                                </div>
                              ))
                            )}
                            {compiledArticles.length > 4 && (
                              <p className="text-[7.5px] italic text-slate-400 pl-2">dan {compiledArticles.length - 4} artikel lainnya...</p>
                            )}
                          </div>
                        </div>

                        {/* Footer with ISSN */}
                        <div className="border-t border-slate-200/60 pt-2.5 mt-auto flex justify-between text-[8px] text-slate-400 z-10 tracking-widest uppercase font-bold">
                          <span>P-ISSN: {selectedJournal.p_issn || '-'}</span>
                          <span>E-ISSN: {selectedJournal.e_issn || '-'}</span>
                        </div>
                      </div>
                    );
                  })()}

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
