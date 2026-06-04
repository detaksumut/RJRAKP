import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, AlertCircle, Calendar } from 'lucide-react';

export default function ReviewerAssignments() {
  const { user } = useAuth();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMyAssignments();
    }
  }, [user?.id]);

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_assignments')
        .select(`
          id,
          status,
          assigned_date,
          due_date,
          articles (
            id,
            title,
            abstract,
            manuscript_file,
            journals (
              name
            )
          ),
          reviews (
            id
          )
        `)
        .eq('reviewer_id', user?.id)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching reviewer assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingAssignments = assignments.filter(
    (a) => a.status !== 'completed' && !(a.reviews && a.reviews.length > 0)
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Artikel Ditugaskan</h1>
          <p className="text-academic-500">Daftar artikel yang ditugaskan kepada Anda untuk di-review.</p>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-academic-500">
              <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></span>
              <p>Memuat data artikel...</p>
            </div>
          ) : pendingAssignments.length === 0 ? (
            <div className="p-8 text-center text-academic-500 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-academic-400" />
              <p>Belum ada tugas review artikel baru.</p>
            </div>
          ) : (
            <div className="divide-y divide-academic-100">
              {pendingAssignments.map((assign: any) => {
                const isOverdue = assign.due_date && new Date(assign.due_date) < new Date();

                return (
                  <div key={assign.id} className="p-6 hover:bg-academic-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Menunggu Review
                          </span>
                          <span className="text-xs text-academic-500 font-bold uppercase tracking-wider">
                            {assign.articles?.journals?.name || 'Jurnal Tidak Diketahui'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold font-serif text-academic-900 leading-tight">
                          {assign.articles?.title || 'Judul Tidak Tersedia'}
                        </h3>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-academic-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Ditugaskan: {new Date(assign.assigned_date).toLocaleDateString('id-ID')}
                          </span>
                          {assign.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                              <Clock className="w-3.5 h-3.5" />
                              Batas Waktu: {new Date(assign.due_date).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0">
                        <a
                          href="/dashboard/reviewer"
                          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                          Lanjutkan Review
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
