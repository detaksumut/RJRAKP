import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  BookOpen, Plus, Edit3, Trash2, X, 
  Search, Info, Check, AlertCircle, Save 
} from 'lucide-react';

export default function AdminJournals() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    slug: '',
    description: '',
    e_issn: '',
    p_issn: '',
    status: 'preparation'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    e_issn: '',
    p_issn: '',
    status: 'preparation'
  });

  // Scopes state (loaded for the selected journal in Edit Modal)
  const [scopes, setScopes] = useState<any[]>([]);
  const [newScope, setNewScope] = useState({ name: '', description: '' });
  const [addingScope, setAddingScope] = useState(false);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('journals')
        .select('*')
        .order('name');
      if (fetchErr) throw fetchErr;
      setJournals(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data jurnal.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-slug generator helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // collapse multiple hyphens
  };

  const handleAddNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddForm(prev => ({
      ...prev,
      name: val,
      slug: generateSlug(val)
    }));
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditForm(prev => ({
      ...prev,
      name: val,
      slug: generateSlug(val)
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data, error: insertErr } = await supabase
        .from('journals')
        .insert([addForm])
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Created new journal: ${addForm.name}`,
        entity_type: 'journals',
        entity_id: data.id
      });

      setSuccess(`Jurnal "${addForm.name}" berhasil ditambahkan.`);
      setShowAddModal(false);
      setAddForm({
        name: '',
        slug: '',
        description: '',
        e_issn: '',
        p_issn: '',
        status: 'preparation'
      });
      fetchJournals();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menambahkan jurnal.');
    }
  };

  const handleEditClick = async (journal: any) => {
    setSelectedJournal(journal);
    setEditForm({
      name: journal.name,
      slug: journal.slug,
      description: journal.description || '',
      e_issn: journal.e_issn || '',
      p_issn: journal.p_issn || '',
      status: journal.status
    });
    // Fetch scopes for this journal
    fetchScopes(journal.id);
    setShowEditModal(true);
  };

  const fetchScopes = async (journalId: string) => {
    try {
      const { data, error: scopeErr } = await supabase
        .from('journal_scopes')
        .select('*')
        .eq('journal_id', journalId)
        .order('name');
      if (scopeErr) throw scopeErr;
      setScopes(data || []);
    } catch (err) {
      console.error('Error fetching scopes:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedJournal) return;

    try {
      const { error: updateErr } = await supabase
        .from('journals')
        .update(editForm)
        .eq('id', selectedJournal.id);

      if (updateErr) throw updateErr;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Updated journal details: ${editForm.name}`,
        entity_type: 'journals',
        entity_id: selectedJournal.id
      });

      setSuccess(`Jurnal "${editForm.name}" berhasil diperbarui.`);
      setShowEditModal(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memperbarui jurnal.');
    }
  };

  const handleDeleteJournal = async (journal: any) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus jurnal "${journal.name}" secara permanen? Seluruh data volume, issue, artikel, dan scope yang berelasi dengan jurnal ini akan ikut terhapus.`);
    if (!confirmDelete) return;

    setError('');
    setSuccess('');
    try {
      const { error: deleteErr } = await supabase
        .from('journals')
        .delete()
        .eq('id', journal.id);

      if (deleteErr) throw deleteErr;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Deleted journal: ${journal.name}`,
        entity_type: 'journals',
        entity_id: journal.id
      });

      setSuccess(`Jurnal "${journal.name}" berhasil dihapus.`);
      fetchJournals();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghapus jurnal.');
    }
  };

  // Scope Management Actions
  const handleAddScope = async () => {
    if (!selectedJournal || !newScope.name) return;
    setAddingScope(true);
    try {
      const { error: insertErr } = await supabase
        .from('journal_scopes')
        .insert({
          journal_id: selectedJournal.id,
          name: newScope.name,
          description: newScope.description
        });
      
      if (insertErr) throw insertErr;

      setNewScope({ name: '', description: '' });
      fetchScopes(selectedJournal.id);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan scope: ' + err.message);
    } finally {
      setAddingScope(false);
    }
  };

  const handleDeleteScope = async (scopeId: string) => {
    if (!selectedJournal) return;
    try {
      const { error: deleteErr } = await supabase
        .from('journal_scopes')
        .delete()
        .eq('id', scopeId);
      
      if (deleteErr) throw deleteErr;

      fetchScopes(selectedJournal.id);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menghapus scope: ' + err.message);
    }
  };

  const getFilteredJournals = () => {
    return journals.filter(j => 
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filtered = getFilteredJournals();

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Manajemen Jurnal Publikasi</h1>
            <p className="text-academic-500">Kelola daftar berkala jurnal, ISSN, status publikasi, dan cakupan bidang kajian.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Jurnal
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

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-academic-200 shadow-sm mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-academic-400" />
            </span>
            <input 
              type="text" 
              placeholder="Cari nama jurnal atau deskripsi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-academic-300 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>
        </div>

        {/* Journals Table */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-academic-500 font-medium">Memuat data jurnal...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-academic-500 font-medium">
                <BookOpen className="w-8 h-8 mx-auto text-academic-300 mb-2" />
                Belum ada data jurnal yang cocok atau terdaftar.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-academic-200 text-left border-collapse">
                <thead className="bg-academic-50/50">
                  <tr className="text-xs uppercase tracking-wider text-academic-500 font-bold">
                    <th scope="col" className="px-6 py-4">Nama Jurnal</th>
                    <th scope="col" className="px-6 py-4">ISSN (P / E)</th>
                    <th scope="col" className="px-6 py-4">Slug Jurnal</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                    <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-200 bg-white text-xs">
                  {filtered.map((journal) => {
                    const statusStyles = {
                      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      preparation: 'bg-amber-50 text-amber-700 border-amber-200',
                      inactive: 'bg-slate-50 text-slate-700 border-slate-200'
                    };

                    const statusLabels = {
                      active: 'Aktif',
                      preparation: 'Persiapan',
                      inactive: 'Nonaktif'
                    };

                    const jStatus = (journal.status || 'preparation').toLowerCase();
                    const statusClass = statusStyles[jStatus] || 'bg-slate-50 text-slate-700';
                    const statusLabel = statusLabels[jStatus] || jStatus;

                    return (
                      <tr key={journal.id} className="hover:bg-academic-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-serif font-bold text-academic-900 text-sm line-clamp-1">
                            {journal.name}
                          </div>
                          <div className="text-[10px] text-academic-400 mt-0.5 line-clamp-1">
                            {journal.description || 'Tidak ada deskripsi.'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-academic-700 font-medium">
                          <div>P: {journal.p_issn || '-'}</div>
                          <div>E: {journal.e_issn || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-academic-500 font-mono">
                          /{journal.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-1.5">
                          <button
                            onClick={() => handleEditClick(journal)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit & Scope
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(journal)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-md font-semibold text-[10px] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
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

      {/* Add Journal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-academic-100 flex flex-col my-8">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl sticky top-0">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Tambah Jurnal Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-academic-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Nama Jurnal *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={handleAddNameChange}
                    placeholder="Contoh: Jurnal Audit Kebijakan Publik"
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Slug Jurnal (URL) *</label>
                  <input
                    type="text"
                    required
                    value={addForm.slug}
                    onChange={e => setAddForm({ ...addForm, slug: generateSlug(e.target.value) })}
                    placeholder="Contoh: audit-kebijakan-publik"
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Deskripsi / Fokus Kajian</label>
                  <textarea
                    rows={4}
                    value={addForm.description}
                    onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Jelaskan fokus, visi, dan ruang lingkup dari berkala jurnal ini..."
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">P-ISSN (Cetak)</label>
                    <input
                      type="text"
                      value={addForm.p_issn}
                      onChange={e => setAddForm({ ...addForm, p_issn: e.target.value })}
                      placeholder="Contoh: 2985-6477"
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">E-ISSN (Online)</label>
                    <input
                      type="text"
                      value={addForm.e_issn}
                      onChange={e => setAddForm({ ...addForm, e_issn: e.target.value })}
                      placeholder="Contoh: 2985-6485"
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Status Jurnal</label>
                  <select
                    value={addForm.status}
                    onChange={e => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full border border-academic-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
                  >
                    <option value="preparation">Persiapan (Preparation)</option>
                    <option value="active">Aktif (Active / Menerima Naskah)</option>
                    <option value="inactive">Nonaktif (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-academic-100 bg-academic-50/50 flex justify-end gap-3 rounded-b-xl">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-academic-300 text-academic-700 font-bold rounded-lg text-xs hover:bg-academic-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                >
                  Tambah Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Journal Modal + Scopes Manager */}
      {showEditModal && selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-academic-100 flex flex-col my-8">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl sticky top-0">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Edit Jurnal & Cakupan Bidang</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedJournal(null); }} className="text-academic-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-academic-100 overflow-y-auto">
              
              {/* Left Column - Journal Meta Form */}
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <h4 className="font-bold text-academic-900 text-sm border-b border-academic-100 pb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-brand-600" /> Informasi Utama Jurnal
                </h4>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Nama Jurnal *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={handleEditNameChange}
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Slug Jurnal (URL) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.slug}
                    onChange={e => setEditForm({ ...editForm, slug: generateSlug(e.target.value) })}
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-academic-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Deskripsi / Fokus Kajian</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">P-ISSN (Cetak)</label>
                    <input
                      type="text"
                      value={editForm.p_issn}
                      onChange={e => setEditForm({ ...editForm, p_issn: e.target.value })}
                      placeholder="Contoh: 2985-6477"
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">E-ISSN (Online)</label>
                    <input
                      type="text"
                      value={editForm.e_issn}
                      onChange={e => setEditForm({ ...editForm, e_issn: e.target.value })}
                      placeholder="Contoh: 2985-6485"
                      className="w-full border border-academic-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-950 uppercase tracking-wider mb-1.5">Status Jurnal</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-academic-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
                  >
                    <option value="preparation">Persiapan (Preparation)</option>
                    <option value="active">Aktif (Active)</option>
                    <option value="inactive">Nonaktif (Inactive)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowEditModal(false); setSelectedJournal(null); }}
                    className="px-4 py-2 border border-academic-300 text-academic-700 font-bold rounded-lg text-xs hover:bg-academic-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                  </button>
                </div>
              </form>

              {/* Right Column - Scopes / Cakupan Bidang Kajian */}
              <div className="p-6 flex flex-col space-y-4">
                <h4 className="font-bold text-academic-900 text-sm border-b border-academic-100 pb-2 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-brand-600" /> Ruang Lingkup Kajian (Scopes)
                </h4>

                {/* Scope Input Form */}
                <div className="bg-academic-50 p-3 rounded-lg border border-academic-200 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-academic-700 uppercase tracking-wider mb-1">Nama Bidang Kajian *</label>
                    <input
                      type="text"
                      value={newScope.name}
                      onChange={e => setNewScope({ ...newScope, name: e.target.value })}
                      placeholder="Contoh: Audit Kinerja Sektor Publik"
                      className="w-full border border-academic-300 rounded px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-academic-700 uppercase tracking-wider mb-1">Deskripsi Ringkas</label>
                    <input
                      type="text"
                      value={newScope.description}
                      onChange={e => setNewScope({ ...newScope, description: e.target.value })}
                      placeholder="Fokus riset terkait evaluasi kinerja instansi..."
                      className="w-full border border-academic-300 rounded px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScope}
                    disabled={addingScope || !newScope.name}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-1.5 rounded text-[10px] transition-colors disabled:opacity-50"
                  >
                    {addingScope ? 'Menambahkan...' : 'Tambah Scope'}
                  </button>
                </div>

                {/* Scopes List */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-black text-academic-500 uppercase tracking-widest block mb-2">Scope Terdaftar ({scopes.length})</span>
                  <div className="flex-1 overflow-y-auto max-h-[220px] border border-academic-100 rounded-lg divide-y divide-academic-100 bg-white">
                    {scopes.length === 0 ? (
                      <div className="p-4 text-center text-academic-500 italic text-[11px]">Belum ada scope kajian ditambahkan.</div>
                    ) : (
                      scopes.map(scope => (
                        <div key={scope.id} className="p-2.5 flex items-start justify-between gap-2 hover:bg-academic-50/50">
                          <div className="min-w-0">
                            <div className="font-bold text-academic-800 text-[11px]">{scope.name}</div>
                            {scope.description && (
                              <div className="text-[9.5px] text-academic-500 line-clamp-2 mt-0.5 leading-snug">{scope.description}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteScope(scope.id)}
                            className="text-academic-400 hover:text-rose-600 p-1 shrink-0 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
              
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
