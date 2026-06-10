import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { DollarSign, Search, CheckCircle, Clock } from 'lucide-react';

export default function AdminFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('honorarium_payments')
        .select(`
          id,
          amount,
          status,
          description,
          payment_date,
          users (full_name, email),
          articles (title),
          honorarium_rates (role_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    if (!window.confirm('Tandai tagihan ini sebagai SUDAH DIBAYAR?')) return;
    try {
      const { error } = await supabase
        .from('honorarium_payments')
        .update({ 
          status: 'PAID', 
          payment_date: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      fetchPayments();
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Gagal mengupdate status pembayaran.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-academic-900">Keuangan & Honorarium</h1>
          <p className="text-academic-500 text-sm mt-1">Manajemen pencairan dana untuk staf dan reviewer</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-academic-200 shadow-sm flex items-center gap-4">
           <div>
             <p className="text-xs text-academic-500 font-bold uppercase">Total Pending</p>
             <p className="text-xl font-black text-rose-600">
               Rp {payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
             </p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-academic-100 flex gap-4 items-center bg-academic-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
            <input
              type="text"
              placeholder="Cari penerima atau artikel..."
              className="w-full pl-9 pr-4 py-2 border border-academic-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-academic-50 text-academic-600 text-xs uppercase tracking-wider border-b border-academic-200">
                <th className="p-4 font-bold">Penerima & Peran</th>
                <th className="p-4 font-bold">Artikel / Keterangan</th>
                <th className="p-4 font-bold">Nominal</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-academic-500">Memuat data tagihan...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-academic-500">Belum ada data tagihan pembayaran.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-academic-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-academic-900">{p.users?.full_name}</div>
                      <div className="text-xs text-brand-600 font-medium">{p.honorarium_rates?.role_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-academic-800 line-clamp-2">{p.articles?.title || p.description}</div>
                    </td>
                    <td className="p-4 font-bold text-academic-900 whitespace-nowrap">
                      Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      {p.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => markAsPaid(p.id)}
                          className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
