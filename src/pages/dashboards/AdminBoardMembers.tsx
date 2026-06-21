import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Save, AlertCircle, RefreshCw } from 'lucide-react';

interface BoardMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  image_url: string;
  sort_order: number;
  sinta_id?: string;
  google_scholar_id?: string;
  orcid_id?: string;
  scopus_id?: string;
  wos_id?: string;
  ssrn_author_id?: string;
  ssrn_abstract_id?: string;
}

export default function AdminBoardMembers() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    role: string;
    affiliation: string;
    image_url: string;
    sort_order: number;
    sinta_id: string;
    google_scholar_id: string;
    orcid_id: string;
    scopus_id: string;
    wos_id: string;
    ssrn_author_id: string;
    ssrn_abstract_id: string;
  }>({
    name: '',
    role: '',
    affiliation: '',
    image_url: '',
    sort_order: 0,
    sinta_id: '',
    google_scholar_id: '',
    orcid_id: '',
    scopus_id: '',
    wos_id: '',
    ssrn_author_id: '',
    ssrn_abstract_id: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching board members:', err);
      setError('Gagal memuat data pengurus');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpenModal = (member?: BoardMember) => {
    if (member) {
      setFormData({
        id: member.id,
        name: member.name,
        role: member.role,
        affiliation: member.affiliation,
        image_url: member.image_url,
        sort_order: member.sort_order,
        sinta_id: member.sinta_id || '',
        google_scholar_id: member.google_scholar_id || '',
        orcid_id: member.orcid_id || '',
        scopus_id: member.scopus_id || '',
        wos_id: member.wos_id || '',
        ssrn_author_id: member.ssrn_author_id || '',
        ssrn_abstract_id: member.ssrn_abstract_id || '',
      });
    } else {
      setFormData({
        name: '',
        role: '',
        affiliation: '',
        image_url: '',
        sort_order: members.length,
        sinta_id: '',
        google_scholar_id: '',
        orcid_id: '',
        scopus_id: '',
        wos_id: '',
        ssrn_author_id: '',
        ssrn_abstract_id: '',
      });
    }
    setSelectedFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      let finalImageUrl = formData.image_url;

      // 1. Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, selectedFile);
          
        if (uploadError) {
          throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
          
        finalImageUrl = urlData?.publicUrl || formData.image_url;
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        affiliation: formData.affiliation,
        image_url: finalImageUrl,
        sort_order: formData.sort_order,
        sinta_id: formData.sinta_id || null,
        google_scholar_id: formData.google_scholar_id || null,
        orcid_id: formData.orcid_id || null,
        scopus_id: formData.scopus_id || null,
        wos_id: formData.wos_id || null,
        ssrn_author_id: formData.ssrn_author_id || null,
        ssrn_abstract_id: formData.ssrn_abstract_id || null,
      };

      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('board_members')
          .update(payload)
          .eq('id', formData.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('board_members')
          .insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      console.error('Error saving board member:', err);
      setError(err.message || 'Gagal menyimpan data pengurus.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengurus ini?')) return;
    
    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchMembers();
    } catch (err: any) {
      console.error('Error deleting board member:', err);
      alert('Gagal menghapus data pengurus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editorial Board</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola data Editorial Board yang tampil di Halaman Depan</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengurus
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat data pengurus...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada Pengurus</h3>
            <p className="text-gray-500 max-w-sm mb-6">Anda belum menambahkan data Editorial Board. Silakan klik tombol Tambah Pengurus di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Urutan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengurus</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Afiliasi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {member.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2.5 py-1 bg-accent-50 text-accent-700 font-semibold rounded-md border border-accent-100 text-xs">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.affiliation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          title="Hapus"
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
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <form id="boardForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Contoh: Prof. Dr. Budi Santoso, S.H."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Jabatan (Role)</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Contoh: Editor in Chief, Section Editor..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Afiliasi / Universitas</label>
                  <input
                    type="text"
                    required
                    value={formData.affiliation}
                    onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Contoh: Universitas Indonesia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto Profil</label>
                  <div className="flex flex-col gap-3">
                    {/* Preview Image */}
                    {(selectedFile || formData.image_url) && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group">
                        {selectedFile ? (
                          <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <img src={formData.image_url} alt="Current" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             type="button"
                             onClick={() => {
                               setSelectedFile(null);
                               setFormData({...formData, image_url: ''});
                             }}
                             className="text-white bg-red-500 rounded-full p-1"
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all cursor-pointer"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 font-medium">Bisa memilih langsung file gambar (JPG/PNG) dari perangkat Anda.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nomor Urut Tampil</label>
                  <input
                    type="number"
                    required
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 font-medium">Semakin kecil angkanya, semakin atas tampilnya.</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">ID Profil Akademik (Opsional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Sinta ID</label>
                      <input
                        type="text"
                        value={formData.sinta_id}
                        onChange={(e) => setFormData({...formData, sinta_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: 6012345"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Google Scholar ID</label>
                      <input
                        type="text"
                        value={formData.google_scholar_id}
                        onChange={(e) => setFormData({...formData, google_scholar_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: gF3AAAAJ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ORCID ID</label>
                      <input
                        type="text"
                        value={formData.orcid_id}
                        onChange={(e) => setFormData({...formData, orcid_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: 0000-0002-1825-0097"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Scopus ID</label>
                      <input
                        type="text"
                        value={formData.scopus_id}
                        onChange={(e) => setFormData({...formData, scopus_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: 57211234500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Web of Science (WoS) ID</label>
                      <input
                        type="text"
                        value={formData.wos_id}
                        onChange={(e) => setFormData({...formData, wos_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: AAB-1234-2020"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">SSRN Author ID</label>
                      <input
                        type="text"
                        value={formData.ssrn_author_id}
                        onChange={(e) => setFormData({...formData, ssrn_author_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: 11897288"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">SSRN Abstract ID</label>
                      <input
                        type="text"
                        value={formData.ssrn_abstract_id}
                        onChange={(e) => setFormData({...formData, ssrn_abstract_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm transition-colors"
                        placeholder="Contoh: 6917418"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                form="boardForm"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
