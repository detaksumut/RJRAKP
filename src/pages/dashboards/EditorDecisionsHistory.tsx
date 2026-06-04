import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Calendar, MessageSquare, X, ArrowLeft } from 'lucide-react';

export default function EditorDecisionsHistory() {
  const navigate = useNavigate();
  const [decisionsHistory, setDecisionsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedHistoryDecision, setSelectedHistoryDecision] = useState<any | null>(null);

  useEffect(() => {
    fetchDecisionsHistory();
  }, []);

  const fetchDecisionsHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data, error: decError } = await supabase
        .from('editorial_decisions')
        .select(`
          id,
          decision,
          comments,
          decision_date,
          articles (
            id,
            title,
            journals (
              name
            )
          )
        `)
        .order('decision_date', { ascending: false });

      if (decError) throw decError;
      setDecisionsHistory(data || []);
    } catch (err) {
      console.error('Error fetching editorial decisions history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <button 
          onClick={() => navigate('/dashboard/editor')}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors uppercase tracking-widest mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Riwayat Keputusan Editorial</h1>
          <p className="text-academic-500">Tinjau keputusan naskah yang telah diputuskan sebelumnya.</p>
        </div>

        {/* Riwayat Keputusan Editorial */}
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-academic-200 bg-academic-50/50 flex justify-between items-center">
            <h3 className="font-bold text-academic-900 text-sm uppercase tracking-wider">Daftar Keputusan</h3>
          </div>

          <div className="divide-y divide-academic-100">
            {historyLoading ? (
              <div className="p-6 text-center text-academic-500 text-xs">Memuat riwayat...</div>
            ) : decisionsHistory.length === 0 ? (
              <div className="p-6 text-center text-academic-500 text-xs">Belum ada keputusan editorial yang dibuat.</div>
            ) : (
              decisionsHistory.map((item: any) => {
                const isAccept = item.decision === 'accept';
                const isRevision = item.decision === 'revision';
                const isReject = item.decision === 'reject';
                
                const decisionLabels = {
                  accept: 'Accepted (Diterima)',
                  revision: 'Revision Required (Revisi)',
                  reject: 'Rejected (Ditolak)'
                };

                return (
                  <div key={item.id} className="p-6 hover:bg-academic-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isAccept ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isReject ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {decisionLabels[item.decision as keyof typeof decisionLabels] || item.decision}
                          </span>
                          <span className="text-xs text-academic-500 font-bold uppercase tracking-wider">
                            {item.articles?.journals?.name || 'Jurnal Tidak Diketahui'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold font-serif text-academic-900 leading-tight">
                          {item.articles?.title || 'Judul Tidak Tersedia'}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-academic-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Diputuskan: {new Date(item.decision_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex shrink-0">
                        <button
                          onClick={() => setSelectedHistoryDecision(item)}
                          className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-brand-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Lihat Catatan Keputusan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: View Editorial Decision Comments */}
      {selectedHistoryDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-academic-100 flex flex-col animate-scale-up">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50 rounded-t-xl shrink-0">
              <div>
                <h3 className="text-lg font-bold text-academic-900 font-serif">Rincian Keputusan Editorial</h3>
                <p className="text-xs text-academic-500">{selectedHistoryDecision.articles?.journals?.name || 'Jurnal'}</p>
              </div>
              <button
                onClick={() => setSelectedHistoryDecision(null)}
                className="text-academic-400 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg animate-scale-up"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Article Title */}
              <div>
                <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1.5">Judul Artikel</h4>
                <p className="text-base font-bold font-serif text-academic-900 leading-snug">
                  {selectedHistoryDecision.articles?.title}
                </p>
              </div>

              {/* Decision Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Tanggal Keputusan</h4>
                  <p className="text-sm font-bold text-academic-800">
                    {new Date(selectedHistoryDecision.decision_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest mb-1">Status Keputusan</h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                    selectedHistoryDecision.decision === 'accept' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedHistoryDecision.decision === 'reject' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {selectedHistoryDecision.decision === 'accept' ? 'Accepted (Diterima)' :
                     selectedHistoryDecision.decision === 'reject' ? 'Rejected (Ditolak)' :
                     'Revision Required (Revisi)'}
                  </span>
                </div>
              </div>

              {/* Comments / Feedback */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-academic-400 uppercase tracking-widest">Catatan Masukan Untuk Penulis</h4>
                <div className="bg-academic-50/30 p-4 rounded-xl border border-academic-100 text-sm text-academic-700 leading-relaxed whitespace-pre-wrap font-serif italic">
                  "{selectedHistoryDecision.comments || 'Tidak ada catatan masukan.'}"
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-academic-100 bg-academic-50/50 flex justify-end rounded-b-xl shrink-0">
              <button
                onClick={() => setSelectedHistoryDecision(null)}
                className="px-5 py-2 bg-academic-100 hover:bg-academic-200 text-academic-800 font-bold rounded-lg transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
