import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Filter, Calendar, FileText, User, UserPlus, CheckSquare, Eye } from 'lucide-react';

export default function EditorArticles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [journals, setJournals] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJournals();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedJournal]);

  const fetchJournals = async () => {
    const { data } = await supabase.from('journals').select('id, name').order('name');
    if (data) setJournals(data);
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          status,
          submission_date,
          journal_id,
          journals ( name ),
          users!submitter_id ( full_name )
        `)
        .order('submission_date', { ascending: false });
        
      if (selectedJournal !== 'all') {
        query = query.eq('journal_id', selectedJournal);
      }
      
      const { data, error: artError } = await query;
      if (artError) throw artError;
      setArticles(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.status === 'PENDING') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-20 text-center bg-white p-10 rounded-xl border border-amber-200 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-academic-900 mb-4">Permohonan Editor sedang menunggu verifikasi Admin</h2>
          <p className="text-academic-600">Terima kasih telah mendaftar. Akun dan rekam jejak editorial Anda sedang dalam proses peninjauan oleh Administrator. Silakan cek kembali secara berkala.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Artikel Masuk</h1>
          <p className="text-academic-500">Pantau, tugaskan reviewer, dan buat keputusan editorial untuk manuskrip yang masuk.</p>
        </div>

        {/* Filter Dropdown */}
        <div className="bg-white p-4 rounded-xl border border-academic-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-academic-700 font-bold text-sm shrink-0">
            <Filter className="w-4 h-4 text-brand-600" /> Filter Jurnal:
          </div>
          <select 
            value={selectedJournal} 
            onChange={e => setSelectedJournal(e.target.value)}
            className="flex-1 border border-academic-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 cursor-pointer font-medium"
          >
            <option value="all">Semua Jurnal (Tampilkan Seluruh Artikel)</option>
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Articles Table Card */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-academic-500 font-medium">Memuat data artikel...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-academic-500 font-medium bg-academic-50/30">
                <FileText className="w-8 h-8 mx-auto text-academic-300 mb-2" />
                Belum ada data artikel masuk untuk kriteria pencarian ini.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-academic-200 text-left">
                <thead className="bg-academic-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider min-w-[280px]">Info Artikel</th>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider min-w-[180px]">Jurnal Tujuan</th>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider min-w-[150px]">Penulis / Submitter</th>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider min-w-[120px]">Tanggal Masuk</th>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider min-w-[120px]">Status</th>
                    <th scope="col" className="px-6 py-4 text-xs font-black text-academic-500 uppercase tracking-wider text-right w-72 min-w-[288px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-200 bg-white">
                  {articles.map((art) => {
                    const statusColors = {
                      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
                      in_review: 'bg-amber-50 text-amber-700 border-amber-200',
                      under_review: 'bg-amber-50 text-amber-700 border-amber-200',
                      revised: 'bg-purple-50 text-purple-700 border-purple-200',
                      accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      rejected: 'bg-rose-50 text-rose-700 border-rose-200'
                    };

                    const statusLabels = {
                      submitted: 'Baru Masuk',
                      in_review: 'Proses Review',
                      under_review: 'Sedang Direview',
                      revised: 'Telah Direvisi',
                      accepted: 'Diterima',
                      published: 'Terbit',
                      rejected: 'Ditolak'
                    };

                    const currentStatus = (art.status || 'submitted').toLowerCase();
                    const statusClass = statusColors[currentStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
                    const statusLabel = statusLabels[currentStatus] || currentStatus;
                    const formattedDate = new Date(art.submission_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={art.id} className="hover:bg-academic-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-serif font-bold text-academic-900 text-sm line-clamp-2 max-w-sm">
                            {art.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block text-[10px] font-bold tracking-wider text-brand-800 uppercase px-2 py-0.5 bg-brand-50 rounded border border-brand-100">
                            {art.journals?.name || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs font-semibold text-academic-700">
                            <User className="w-3.5 h-3.5 text-academic-400" />
                            {art.users?.full_name || 'Tidak Diketahui'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs font-medium text-academic-600">
                            <Calendar className="w-3.5 h-3.5 text-academic-400" />
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-bold w-72 min-w-[288px]">
                          <div className="flex items-center justify-end gap-2">
                            {currentStatus === 'submitted' && (
                              <button
                                onClick={() => navigate(`/dashboard/editor/reviewers?articleId=${art.id}`)}
                                className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors shrink-0"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Tugaskan Reviewer
                              </button>
                            )}

                            {(currentStatus === 'in_review' || currentStatus === 'under_review' || currentStatus === 'submitted') && (
                              <button
                                onClick={() => navigate(`/dashboard/editor/decisions?articleId=${art.id}`)}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-lg shadow-sm transition-colors shrink-0"
                              >
                                <CheckSquare className="w-3.5 h-3.5" /> Keputusan
                              </button>
                            )}
                            
                            {currentStatus === 'published' && (
                              <span className="text-academic-400 italic whitespace-nowrap">Terbit Publik</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
