import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Eye, Trash2, Search, RefreshCw, MessageSquare, ExternalLink, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Opinion {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  lecturer_phone: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users?: {
    full_name: string;
    email: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  draft:     { label: 'Draft',     className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  archived:  { label: 'Archived',  className: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

export default function AdminOpinions() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchOpinions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('opinions')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setOpinions(data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data opini.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id + '_status');
    try {
      const { error: updateErr } = await supabase
        .from('opinions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (updateErr) throw updateErr;
      setOpinions(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as Opinion['status'] } : o));
    } catch (err: any) {
      alert('Gagal mengubah status: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus opini "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(id + '_delete');
    try {
      const { error: deleteErr } = await supabase.from('opinions').delete().eq('id', id);
      if (deleteErr) throw deleteErr;
      setOpinions(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus opini: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = opinions.filter(o => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.users?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.users?.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const counts = {
    all: opinions.length,
    published: opinions.filter(o => o.status === 'published').length,
    draft: opinions.filter(o => o.status === 'draft').length,
    archived: opinions.filter(o => o.status === 'archived').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-1 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-600" />
              Manajemen Opini
            </h1>
            <p className="text-academic-500 text-sm">Kelola semua opini yang ditulis mahasiswa.</p>
          </div>
          <button
            onClick={fetchOpinions}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-academic-100 hover:bg-academic-200 text-academic-700 font-semibold text-sm transition-colors self-start"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(['all', 'published', 'draft', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterStatus === s
                  ? 'bg-brand-700 border-brand-700 text-white shadow-md'
                  : 'bg-white border-academic-200 text-academic-700 hover:border-brand-300'
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${filterStatus === s ? 'text-brand-200' : 'text-academic-400'}`}>
                {s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
              </p>
              <p className="text-2xl font-bold font-serif">{counts[s]}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-academic-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-academic-400" />
            <input
              type="text"
              placeholder="Cari judul, nama, atau email penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-academic-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-academic-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-academic-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-academic-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-academic-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-brand-500" />
              Memuat data opini...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-academic-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-academic-300" />
              {search || filterStatus !== 'all' ? 'Tidak ada opini yang cocok dengan filter.' : 'Belum ada opini yang ditulis.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-academic-50 border-b border-academic-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-academic-500 uppercase tracking-wider">Judul Opini</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-academic-500 uppercase tracking-wider">Penulis</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-academic-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-academic-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-academic-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-100">
                  {filtered.map(opinion => (
                    <tr key={opinion.id} className="hover:bg-academic-50/50 transition-colors">
                      {/* Title */}
                      <td className="px-4 py-4 max-w-xs">
                        <p className="font-semibold text-academic-900 line-clamp-2 leading-snug">{opinion.title}</p>
                        <p className="text-xs text-academic-400 mt-1 font-mono truncate">/{opinion.slug}</p>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-academic-800">{opinion.users?.full_name || '—'}</p>
                        <p className="text-xs text-academic-400">{opinion.users?.email || '—'}</p>
                        <p className="text-xs text-academic-400 mt-0.5">📞 {opinion.lecturer_phone}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[opinion.status]?.className}`}>
                            {STATUS_LABELS[opinion.status]?.label}
                          </span>
                          <select
                            value={opinion.status}
                            disabled={actionLoading === opinion.id + '_status'}
                            onChange={e => handleStatusChange(opinion.id, e.target.value)}
                            className="text-xs border border-academic-200 rounded-md px-2 py-1 bg-white text-academic-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                          >
                            <option value="published">→ Published</option>
                            <option value="draft">→ Draft</option>
                            <option value="archived">→ Archived</option>
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-academic-700 text-xs">{formatDate(opinion.created_at)}</p>
                        {opinion.updated_at !== opinion.created_at && (
                          <p className="text-academic-400 text-xs mt-0.5">Edit: {formatDate(opinion.updated_at)}</p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/opini/${opinion.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Lihat opini (tab baru)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(opinion.id, opinion.title)}
                            disabled={actionLoading === opinion.id + '_delete'}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Hapus opini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-academic-100 bg-academic-50/50 text-xs text-academic-500">
              Menampilkan <span className="font-bold text-academic-700">{filtered.length}</span> dari <span className="font-bold text-academic-700">{opinions.length}</span> opini
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
