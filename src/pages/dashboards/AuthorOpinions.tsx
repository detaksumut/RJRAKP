import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FileText, Eye, Edit2, Trash2, Plus } from 'lucide-react';

export default function AuthorOpinions() {
  const { user } = useAuth();
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOpinions();
    }
  }, [user?.id]);

  const fetchOpinions = async () => {
    try {
      const { data, error } = await supabase
        .from('opinions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching author opinions:", error.message);
      } else if (data) {
        setOpinions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus opini ini?")) return;

    try {
      const { error } = await supabase
        .from('opinions')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        alert("Opini berhasil dihapus!");
        fetchOpinions();
      }
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Opini Saya</h1>
            <p className="text-academic-500">Daftar tulisan opini yang diwajibkan oleh dosen Anda.</p>
          </div>
          <Link 
            to="/dashboard/author/opinions/new" 
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tulis Opini Baru
          </Link>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-start shadow-sm">
          <div className="bg-amber-100 p-2.5 rounded-xl text-amber-800 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-amber-900 font-bold mb-1.5">Aturan Penulisan Opini</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Tulis opini Anda secara langsung pada sistem ini. Setelah Anda mengirimkan opini, sistem akan secara otomatis mengirimkan <strong>tautan baca opini Anda langsung ke WhatsApp Dosen pengampu</strong> yang Anda cantumkan nomor HP-nya. Pastikan nomor HP Dosen aktif di WhatsApp.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-academic-500">Memuat data opini...</div>
          ) : opinions.length === 0 ? (
            <div className="p-8 text-center py-12">
              <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
              <p className="text-academic-600 font-medium mb-4">Anda belum pernah menulis opini.</p>
              <Link to="/dashboard/author/opinions/new" className="text-brand-600 font-bold hover:underline">
                Tulis opini pertama Anda sekarang
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-academic-100">
              {opinions.map(opinion => (
                <div key={opinion.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-academic-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-academic-900 text-lg mb-1 leading-snug truncate">{opinion.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-academic-500">
                      <span>Dibuat pada: {new Date(opinion.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="border-l border-academic-200 pl-4">No. HP Dosen: <strong className="text-academic-700">{opinion.lecturer_phone}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-right mr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-academic-400 block">Status</span>
                      <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{opinion.status}</span>
                    </div>
                    
                    <Link 
                      to={`/opini/${opinion.slug}`} 
                      target="_blank" 
                      className="p-2 text-academic-400 hover:bg-academic-100 hover:text-academic-600 rounded-lg transition-colors"
                      title="Lihat Halaman Publik"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    
                    <Link 
                      to={`/dashboard/author/opinions/edit/${opinion.id}`} 
                      className="p-2 text-academic-400 hover:bg-academic-100 hover:text-brand-600 rounded-lg transition-colors"
                      title="Edit Opini"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    
                    <button 
                      onClick={() => handleDelete(opinion.id)} 
                      className="p-2 text-academic-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      title="Hapus Opini"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
