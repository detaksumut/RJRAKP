import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IndexingItem } from "../components/IndexingRoadmap";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";

export default function AdminIndexing() {
  const [items, setItems] = useState<IndexingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<IndexingItem>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Replaced API with static data
      const data = [
        { id: 1, index_name: "Persiapan OJS", status: "active", website_url: "", display_order: 1 },
        { id: 2, index_name: "Pengajuan e-ISSN", status: "active", website_url: "", display_order: 2 },
        { id: 3, index_name: "Registrasi Crossref DOI", status: "active", website_url: "", display_order: 3 },
        { id: 4, index_name: "Indeksasi GARUDA", status: "target", website_url: "", display_order: 4 },
        { id: 5, index_name: "Akreditasi SINTA", status: "target", website_url: "", display_order: 5 },
        { id: 6, index_name: "Indeksasi DOAJ", status: "target", website_url: "", display_order: 6 },
      ];
      setItems(data);
    } catch (err) {
      setError("Gagal memuat data indexing roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: IndexingItem) => {
    setIsAdding(false);
    setEditingId(item.id);
    setFormData(item);
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({
      index_name: "",
      status: "target",
      description: "",
      website_url: "",
      display_order: items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 1
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const saveItem = async () => {
    try {
      if (isAdding) {
        const newItem = {
          ...formData,
          id: Math.max(0, ...items.map(i => i.id)) + 1
        } as IndexingItem;
        setItems([...items, newItem]);
      } else if (editingId) {
        setItems(items.map(i => i.id === editingId ? { ...i, ...formData } : i));
      }
      cancelEdit();
    } catch (err) {
      setError("Gagal menyimpan data.");
    }
  };

  const deleteItem = async (id: number) => {
    try {
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      setError("Gagal menghapus data.");
    }
  };

  return (
    <div className="min-h-screen bg-academic-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-academic-900">Admin Dashboard</h1>
            <p className="text-academic-500 mt-1">Kelola data Indexing Roadmap</p>
          </div>
          {!isAdding && !editingId && (
            <button 
              onClick={startAdd}
              className="flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Indexing
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        {(isAdding || editingId) && (
          <div className="bg-white p-6 rounded-xl border border-academic-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold mb-4">{isAdding ? 'Tambah Data Baru' : 'Edit Data'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Nama Index</label>
                <input 
                  type="text" 
                  value={formData.index_name || ""} 
                  onChange={(e) => setFormData({...formData, index_name: e.target.value})}
                  className="w-full border border-academic-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Misal: SINTA / DOAJ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Status</label>
                <select 
                  value={formData.status || "target"} 
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full border border-academic-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="target">Target</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase mb-1">Urutan Tampilan</label>
                <input 
                  type="number" 
                  value={formData.display_order || 0} 
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full border border-academic-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={cancelEdit} className="px-4 py-2 text-sm font-bold text-academic-600 bg-academic-100 hover:bg-academic-200 rounded-md transition-colors">
                Batal
              </button>
              <button 
                onClick={saveItem} 
                disabled={!formData.index_name}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-academic-50 border-b border-academic-200 text-xs uppercase tracking-wider text-academic-500 font-bold">
                <th className="p-4">Urutan</th>
                <th className="p-4">Nama Index</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-academic-500">Memuat data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-academic-500">Belum ada data indexing.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-academic-50 transition-colors">
                    <td className="p-4 text-sm text-academic-600 font-mono">{item.display_order}</td>
                    <td className="p-4 text-sm font-bold text-academic-900">{item.index_name}</td>
                    <td className="p-4">
                      {item.status === 'active' ? (
                         <span className="inline-flex px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Active</span>
                      ) : item.status === 'target' ? (
                         <span className="inline-flex px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800">Target</span>
                      ) : (
                         <span className="inline-flex px-2 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
