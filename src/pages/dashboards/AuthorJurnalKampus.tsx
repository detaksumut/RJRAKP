import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, BookOpen, GraduationCap, Eye, Edit2, Trash2, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';

export default function AuthorJurnalKampus() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tugas-jurnal';

  const [articles, setArticles] = useState<any[]>([]);
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingOpinions, setLoadingOpinions] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchArticles();
      fetchOpinions();
    }
  }, [user?.id]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, journals(name)')
        .eq('submitter_id', user?.id)
        .like('title', '%[Jurnal Perkuliahan%')
        .order('submission_date', { ascending: false });

      if (error) {
        console.error("Error fetching author lecture articles:", error.message);
      } else {
        setArticles(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchOpinions = async () => {
    try {
      const { data, error } = await supabase
        .from('opinions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching author opinions:", error.message);
      } else {
        setOpinions(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpinions(false);
    }
  };

  const handleDeleteOpinion = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus opini ini?")) return;

    try {
      const { error } = await supabase
        .from('opinions')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Gagal menghapus opini: " + error.message);
      } else {
        alert("Opini berhasil dihapus!");
        fetchOpinions();
      }
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus opini.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-brand-700" />
            Workspace Jurnal Kampus
          </h1>
          <p className="text-academic-500">Kelola ulasan Tugas Jurnal Anda dan tulis artikel opini kritis di sini.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 bg-white p-1 rounded-xl border max-w-md shadow-sm">
          <button
            onClick={() => setSearchParams({ tab: 'tugas-jurnal' })}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tugas-jurnal'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-academic-500 hover:text-academic-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tugas Jurnal ({articles.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'opini' })}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'opini'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-academic-500 hover:text-academic-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Opini Saya ({opinions.length})
          </button>
        </div>

        {activeTab === 'tugas-jurnal' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-academic-800">Daftar Tugas Jurnal</h2>
              <Link 
                to="/dashboard/author/submit?type=jurnal_kuliah" 
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Submit Tugas Baru
              </Link>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4 flex flex-col md:flex-row gap-4 items-start shadow-sm">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-800 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-emerald-900 font-bold mb-1.5">Panduan Pengiriman Tugas Jurnal</h4>
                <p className="text-xs text-emerald-800 leading-relaxed text-justify">
                   Gunakan opsi ini untuk mengirimkan artikel luaran perkuliahan Anda. Jurnal yang Anda submit akan diproses oleh Editor dengan tarif terjangkau (Rp 300.000) dan diindeks langsung di Google Scholar setelah disetujui terbit.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
              {loadingArticles ? (
                <div className="p-8 text-center text-academic-500 text-xs">Memuat Tugas Jurnal...</div>
              ) : articles.length === 0 ? (
                <div className="p-8 text-center py-12">
                  <FileText className="w-12 h-12 text-academic-300 mx-auto mb-4" />
                  <p className="text-academic-650 font-medium mb-4 text-sm">Anda belum mengirimkan artikel Tugas Jurnal.</p>
                  <Link to="/dashboard/author/submit?type=jurnal_kuliah" className="text-brand-600 font-bold hover:underline text-sm uppercase tracking-wider">
                    Submit Tugas Pertama Sekarang
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-academic-100">
                  {articles.map(art => {
                    const cleanTitle = art.title.replace('[Jurnal Perkuliahan (Non SINTA)]', '').trim();
                    return (
                      <div key={art.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-academic-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-academic-900 text-base mb-1 truncate leading-snug">{cleanTitle}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-academic-500">
                            <span>Jurnal: <strong className="text-academic-700">{art.journals?.name}</strong></span>
                            <span className="border-l border-academic-200 pl-4">Dikirim: {new Date(art.submission_date).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-academic-400 block">Status</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                              art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              art.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {art.status === 'submitted' ? 'Dalam Antrean' : 
                               art.status === 'in_review' ? 'Proses Review' : 
                               art.status === 'revised' ? 'Perlu Revisi' : 
                               art.status === 'accepted' ? 'Diterima' : 
                               art.status === 'published' ? 'Terbit' : art.status}
                            </span>
                          </div>
                          
                          <Link 
                            to={`/dashboard/author/articles/${art.id}`} 
                            className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-bold transition-all text-xs gap-1.5"
                            title="Lihat Detail Submisi"
                          >
                            <Eye className="w-4 h-4" /> Detail
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-academic-800">Daftar Opini Saya</h2>
              <Link 
                to="/dashboard/author/opinions/new" 
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tulis Opini Baru
              </Link>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4 flex flex-col md:flex-row gap-4 items-start shadow-sm">
              <div className="bg-amber-100 p-2.5 rounded-xl text-amber-800 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-amber-900 font-bold mb-1.5">Aturan Pengiriman Opini</h4>
                <p className="text-xs text-amber-800 leading-relaxed text-justify">
                   Gagasan opini Anda yang disubmit di sini akan otomatis mengirimkan tautan baca opini Anda langsung ke nomor WhatsApp Dosen pengampu mata kuliah Anda untuk penilaian Tugas Jurnal Anda.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
              {loadingOpinions ? (
                <div className="p-8 text-center text-academic-500 text-xs">Memuat data opini...</div>
              ) : opinions.length === 0 ? (
                <div className="p-8 text-center py-12">
                  <BookOpen className="w-12 h-12 text-academic-300 mx-auto mb-4" />
                  <p className="text-academic-650 font-medium mb-4 text-sm">Anda belum menulis opini.</p>
                  <Link to="/dashboard/author/opinions/new" className="text-brand-600 font-bold hover:underline text-sm uppercase tracking-wider">
                    Tulis Opini Pertama Sekarang
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-academic-100">
                  {opinions.map(opinion => (
                    <div key={opinion.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-academic-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-academic-900 text-base mb-1 truncate leading-snug">{opinion.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-academic-500">
                          <span>Dibuat: {new Date(opinion.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="border-l border-academic-200 pl-4">No. HP Dosen: <strong className="text-academic-700">{opinion.lecturer_phone}</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
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
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <Link 
                          to={`/dashboard/author/opinions/edit/${opinion.id}`} 
                          className="p-2 text-academic-400 hover:bg-academic-100 hover:text-brand-600 rounded-lg transition-colors"
                          title="Edit Opini"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        
                        <button 
                          onClick={() => handleDeleteOpinion(opinion.id)} 
                          className="p-2 text-academic-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Hapus Opini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
