import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Users, Search, CheckCircle, Crown, Edit3, Save, X, RefreshCw, Shield, UserCheck } from 'lucide-react';

// All available positions admin can assign
const POSITIONS = [
  { key: 'editor_in_chief',   label: 'Editor in Chief',         group: 'Editor',   honorarium_key: 'editor_in_chief',  color: 'bg-purple-100 text-purple-800 border-purple-200',  icon: '👑' },
  { key: 'editor_utama',      label: 'Editor Utama (Primary)',   group: 'Editor',   honorarium_key: 'editor',           color: 'bg-indigo-100 text-indigo-800 border-indigo-200',  icon: '⭐' },
  { key: 'co_editor',         label: 'Co-Editor',                group: 'Editor',   honorarium_key: 'editor',           color: 'bg-blue-100 text-blue-800 border-blue-200',        icon: '📝' },
  { key: 'cover_editor',      label: 'Cover Editor',             group: 'Editor',   honorarium_key: 'cover_editor',     color: 'bg-cyan-100 text-cyan-800 border-cyan-200',        icon: '🎨' },
  { key: 'layout_editor',     label: 'Layout Editor',            group: 'Editor',   honorarium_key: 'layout_editor',    color: 'bg-teal-100 text-teal-800 border-teal-200',        icon: '🖋️' },
  { key: 'reviewer_with_id',  label: 'Reviewer (Ber-ID Sinta/ORCID)', group: 'Reviewer', honorarium_key: 'reviewer_with_id', color: 'bg-sky-100 text-sky-800 border-sky-200',     icon: '🔍' },
  { key: 'reviewer_no_id',    label: 'Reviewer (Non-ID)',        group: 'Reviewer', honorarium_key: 'reviewer_no_id',   color: 'bg-slate-100 text-slate-800 border-slate-200',     icon: '🔎' },
  { key: 'managing_director', label: 'Managing Director',        group: 'Manajemen', honorarium_key: 'administrator',   color: 'bg-rose-100 text-rose-800 border-rose-200',        icon: '🏛️' },
  { key: 'finance_operator',  label: 'Finance / Operator',       group: 'Manajemen', honorarium_key: 'finance_operator', color: 'bg-amber-100 text-amber-800 border-amber-200',    icon: '💼' },
  { key: 'ahli_arsiparis',    label: 'Ahli Arsiparis',           group: 'Manajemen', honorarium_key: 'sdm',             color: 'bg-orange-100 text-orange-800 border-orange-200',  icon: '📁' },
  { key: 'sdm',               label: 'SDM / Sumber Daya Manusia', group: 'Manajemen', honorarium_key: 'sdm',            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  icon: '👥' },
];

const getPositionInfo = (key: string | null) => {
  if (!key) return null;
  return POSITIONS.find(p => p.key === key) || null;
};

export default function AdminStaffRoles() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'editor' | 'reviewer' | 'admin'>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone, role, status, position_key, position_label, affiliation, orcid_id, sinta_id, google_scholar_id, created_at')
        .in('role', ['editor', 'reviewer', 'admin'])
        .order('role')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savePosition = async (userId: string) => {
    setSaving(true);
    try {
      const posInfo = getPositionInfo(editPosition || null);
      const { error } = await supabase
        .from('users')
        .update({
          position_key: editPosition || null,
          position_label: posInfo?.label || null,
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, position_key: editPosition || null, position_label: posInfo?.label || null }
        : u
      ));

      setSuccessMsg(`Jabatan berhasil disimpan!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingUserId(null);
    } catch (err: any) {
      alert('Gagal menyimpan jabatan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: any) => {
    setEditingUserId(user.id);
    setEditPosition(user.position_key || '');
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditPosition('');
  };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.affiliation?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, roleFilter, searchQuery]);

  // Group by position group for summary
  const positionSummary = useMemo(() => {
    const filled = users.filter(u => u.position_key);
    const unfilled = users.filter(u => !u.position_key);
    return { filled: filled.length, unfilled: unfilled.length, total: users.length };
  }, [users]);

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (role === 'editor') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-sky-100 text-sky-800 border-sky-200';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-3 h-3" />;
    if (role === 'editor') return <Edit3 className="w-3 h-3" />;
    return <UserCheck className="w-3 h-3" />;
  };

  // Group positions by group for the select dropdown
  const positionGroups = ['Editor', 'Reviewer', 'Manajemen'];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-1">Manajemen Jabatan Staf</h1>
            <p className="text-academic-500 text-sm">Tunjuk jabatan spesifik untuk setiap Editor, Reviewer, dan Administrator RJRAKP.</p>
          </div>
          <button onClick={fetchStaff} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-academic-200 rounded-xl text-sm font-bold text-academic-700 hover:bg-academic-50 transition-colors shadow-sm cursor-pointer shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Success msg */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-academic-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="text-[10px] font-bold text-academic-500 uppercase tracking-wider">Total Staf</span>
            </div>
            <p className="text-2xl font-bold font-serif text-academic-900">{positionSummary.total}</p>
            <p className="text-[10px] text-academic-400 mt-0.5">Akun aktif</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sudah Ditunjuk</span>
            </div>
            <p className="text-2xl font-bold font-serif text-emerald-800">{positionSummary.filled}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">Jabatan terisi</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Belum Ditunjuk</span>
            </div>
            <p className="text-2xl font-bold font-serif text-amber-800">{positionSummary.unfilled}</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Belum ada jabatan</p>
          </div>
          <div className="bg-white border border-academic-200 rounded-xl p-4 shadow-sm">
            <div className="text-[10px] font-bold text-academic-500 uppercase tracking-wider mb-2">Posisi Tersedia</div>
            <p className="text-2xl font-bold font-serif text-academic-900">{POSITIONS.length}</p>
            <p className="text-[10px] text-academic-400 mt-0.5">Jenis jabatan</p>
          </div>
        </div>

        {/* Jabatan Referensi */}
        <div className="bg-white border border-academic-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-xs font-bold text-academic-700 uppercase tracking-wider mb-3">Daftar Jabatan yang Dapat Ditunjuk</h2>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map(p => (
              <span key={p.key} className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.color}`}>
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-academic-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-academic-100 bg-academic-50/50 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="text"
                placeholder="Cari nama, email, atau institusi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-academic-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(['all', 'editor', 'reviewer', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    roleFilter === r ? 'bg-white text-academic-900 shadow-sm' : 'text-academic-500 hover:text-academic-700'
                  }`}
                >
                  {r === 'all' ? 'Semua' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-academic-200 text-[10px] font-bold text-academic-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nama & Kontak</th>
                  <th className="px-4 py-3">Role & Status</th>
                  <th className="px-4 py-3">Jabatan Saat Ini</th>
                  <th className="px-4 py-3">Honorarium Rate</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-academic-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-academic-500">Memuat data staf...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-academic-500">Tidak ada staf ditemukan.</td></tr>
                ) : (
                  filteredUsers.map(u => {
                    const posInfo = getPositionInfo(u.position_key);
                    const isEditing = editingUserId === u.id;

                    return (
                      <tr key={u.id} className={`transition-colors ${isEditing ? 'bg-brand-50/30' : 'hover:bg-slate-50/50'}`}>
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-academic-900 text-sm">{u.full_name}</div>
                          <div className="text-[11px] text-academic-500">{u.email}</div>
                          {u.affiliation && <div className="text-[10px] text-academic-400 mt-0.5 italic">{u.affiliation}</div>}
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {u.orcid_id && <span className="text-[9px] bg-[#A6CE39]/20 text-[#6a9a20] px-1.5 py-0.5 rounded font-bold">ORCID</span>}
                            {u.sinta_id && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SINTA</span>}
                            {u.google_scholar_id && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Scholar</span>}
                          </div>
                        </td>
                        {/* Role & Status */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${getRoleColor(u.role)}`}>
                              {getRoleIcon(u.role)} {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                            <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${
                              u.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              u.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              u.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {u.status || 'N/A'}
                            </span>
                          </div>
                        </td>
                        {/* Jabatan */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={editPosition}
                              onChange={e => setEditPosition(e.target.value)}
                              className="border border-brand-300 rounded-lg px-3 py-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-brand-500 w-full max-w-[200px] cursor-pointer"
                              autoFocus
                            >
                              <option value="">-- Belum ada jabatan --</option>
                              {positionGroups.map(grp => (
                                <optgroup key={grp} label={`── ${grp} ──`}>
                                  {POSITIONS.filter(p => p.group === grp).map(p => (
                                    <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          ) : posInfo ? (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${posInfo.color}`}>
                              {posInfo.icon} {posInfo.label}
                            </span>
                          ) : (
                            <span className="text-[11px] text-academic-400 italic">Belum ditunjuk</span>
                          )}
                        </td>
                        {/* Honorarium Rate */}
                        <td className="px-4 py-3">
                          <span className="text-[10px] text-brand-700 font-mono bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                            {isEditing
                              ? (getPositionInfo(editPosition)?.honorarium_key || '—')
                              : (posInfo?.honorarium_key || '—')
                            }
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => savePosition(u.id)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                {saving ? 'Simpan...' : 'Simpan'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-academic-100 text-academic-800 hover:bg-brand-100 hover:text-brand-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Crown className="w-3 h-3" />
                              Tunjuk Jabatan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="px-4 py-3 border-t border-academic-100 bg-slate-50/30 text-xs text-academic-500">
              Menampilkan <strong>{filteredUsers.length}</strong> dari <strong>{users.length}</strong> staf aktif.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
