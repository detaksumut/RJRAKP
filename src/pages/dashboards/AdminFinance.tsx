import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { DollarSign, Search, CheckCircle, Clock, X, TrendingUp, Users, FileText, Award, Filter, RefreshCw } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  reviewer_no_id: 'Reviewer (Non-ID)',
  reviewer_with_id: 'Reviewer (Ber-ID)',
  editor: 'Editor',
  editor_in_chief: 'Editor in Chief',
  administrator: 'Administrator',
  cover_editor: 'Editor Cover',
  layout_editor: 'Editor Layout',
  finance_operator: 'Finance / Operator',
  sdm: 'SDM',
  royalty_referrer_lembaga: 'Royalti Referal (Lembaga)',
  royalty_referrer_personal: 'Royalti Referal (Personal)',
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  reviewer_no_id: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  reviewer_with_id: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  editor: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  editor_in_chief: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  administrator: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  royalty_referrer_lembaga: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  royalty_referrer_personal: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
};

export default function AdminFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'semua' | 'reviewer' | 'editor' | 'eic' | 'royalty'>('semua');
  const [summaryStats, setSummaryStats] = useState({
    totalPending: 0, totalPaid: 0, totalReviewersPaid: 0, totalEditorsPaid: 0, totalEicPaid: 0, totalRoyaltiesPaid: 0
  });

  const [showAddRoyaltyModal, setShowAddRoyaltyModal] = useState(false);
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [royaltyRates, setRoyaltyRates] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  const [royaltyForm, setRoyaltyForm] = useState({
    article_id: '',
    user_id: '',
    role_key: 'royalty_referrer_lembaga',
    amount: 150000,
    description: ''
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    if (showAddRoyaltyModal) {
      fetchModalData();
    }
  }, [showAddRoyaltyModal]);

  const fetchModalData = async () => {
    try {
      const { data: artData } = await supabase
        .from('articles')
        .select('id, title')
        .eq('status', 'published')
        .order('title');
      if (artData) setPublishedArticles(artData);

      const { data: usrData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name');
      if (usrData) setRegisteredUsers(usrData);

      const { data: ratesData } = await supabase
        .from('honorarium_rates')
        .select('*')
        .in('role_key', ['royalty_referrer_lembaga', 'royalty_referrer_personal']);
      if (ratesData) {
        setRoyaltyRates(ratesData);
      }
    } catch (err) {
      console.error('Error fetching modal data:', err);
    }
  };

  const handleRoleChange = (roleKey: string) => {
    const matchedRate = royaltyRates.find(r => r.role_key === roleKey);
    const standardAmount = matchedRate ? matchedRate.amount : 150000;
    setRoyaltyForm(prev => ({
      ...prev,
      role_key: roleKey,
      amount: standardAmount
    }));
  };

  const handleAddRoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!royaltyForm.article_id || !royaltyForm.user_id || !royaltyForm.role_key) {
      alert('Mohon lengkapi semua field pilihan.');
      return;
    }
    setModalSubmitting(true);
    try {
      const selectedArticle = publishedArticles.find(a => a.id === royaltyForm.article_id);
      const labelText = ROLE_LABELS[royaltyForm.role_key] || royaltyForm.role_key;
      const desc = royaltyForm.description || `${labelText} untuk naskah: "${selectedArticle?.title || ''}"`;

      const { error } = await supabase
        .from('honorarium_payments')
        .insert({
          user_id: royaltyForm.user_id,
          article_id: royaltyForm.article_id,
          role_key: royaltyForm.role_key,
          amount: royaltyForm.amount,
          description: desc,
          status: 'PENDING'
        });

      if (error) throw error;
      
      alert('Pencatatan royalti berhasil ditambahkan.');
      setShowAddRoyaltyModal(false);
      setRoyaltyForm({
        article_id: '',
        user_id: '',
        role_key: 'royalty_referrer_lembaga',
        amount: 150000,
        description: ''
      });
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan royalti: ' + (err.message || ''));
    } finally {
      setModalSubmitting(false);
    }
  };

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
          role_key,
          created_at,
          users (id, full_name, email, role, bank_name, bank_account_number, bank_account_holder, npwp),
          articles (id, title),
          honorarium_rates (role_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const data_ = data || [];
      setPayments(data_);

      // Fetch all users to calculate referral stats
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('id, full_name, email, partner_type, referred_by, bank_name, bank_account_number, bank_account_holder, npwp');
      if (usersErr) throw usersErr;
      setAllUsers(usersData || []);

      // Compute summary stats
      const pending = data_.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0);
      const paid = data_.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);
      const revPaid = data_.filter(p => p.status === 'PAID' && (p.role_key === 'reviewer_no_id' || p.role_key === 'reviewer_with_id')).reduce((s, p) => s + Number(p.amount), 0);
      const edPaid = data_.filter(p => p.status === 'PAID' && p.role_key === 'editor').reduce((s, p) => s + Number(p.amount), 0);
      const eicPaid = data_.filter(p => p.status === 'PAID' && p.role_key === 'editor_in_chief').reduce((s, p) => s + Number(p.amount), 0);
      const royPaid = data_.filter(p => p.status === 'PAID' && (p.role_key === 'royalty_referrer_lembaga' || p.role_key === 'royalty_referrer_personal')).reduce((s, p) => s + Number(p.amount), 0);
      setSummaryStats({ totalPending: pending, totalPaid: paid, totalReviewersPaid: revPaid, totalEditorsPaid: edPaid, totalEicPaid: eicPaid, totalRoyaltiesPaid: royPaid });
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    if (!window.confirm('Tandai tagihan ini sebagai SUDAH DIBAYAR?')) return;
    setProcessingId(id);
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
    } finally {
      setProcessingId(null);
    }
  };

  const markAsCancelled = async (id: string) => {
    if (!window.confirm('Batalkan tagihan honorarium ini?')) return;
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('honorarium_payments')
        .update({ status: 'CANCELLED' })
        .eq('id', id);
      if (error) throw error;
      fetchPayments();
    } catch (err) {
      console.error('Error cancelling payment:', err);
      alert('Gagal membatalkan pembayaran.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = useMemo(() => {
    let list = payments;

    // Tab filter
    if (activeTab === 'reviewer') list = list.filter(p => p.role_key === 'reviewer_no_id' || p.role_key === 'reviewer_with_id');
    else if (activeTab === 'editor') list = list.filter(p => p.role_key === 'editor');
    else if (activeTab === 'eic') list = list.filter(p => p.role_key === 'editor_in_chief');
    else if (activeTab === 'royalty') list = list.filter(p => p.role_key === 'royalty_referrer_lembaga' || p.role_key === 'royalty_referrer_personal');

    // Role filter
    if (roleFilter !== 'all') list = list.filter(p => p.role_key === roleFilter);
    
    // Status filter
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.users?.full_name?.toLowerCase().includes(q) ||
        p.articles?.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [payments, activeTab, roleFilter, statusFilter, searchQuery]);

  // Per-person aggregation for the current tab (exclude royalty tab as we show custom partner accumulation)
  const personSummary = useMemo(() => {
    const map: Record<string, { name: string; role: string; totalPaid: number; totalPending: number; count: number }> = {};
    filteredPayments.forEach(p => {
      const uid = p.users?.id || 'unknown';
      if (!map[uid]) {
        map[uid] = { name: p.users?.full_name || '-', role: p.honorarium_rates?.role_name || p.role_key || '-', totalPaid: 0, totalPending: 0, count: 0 };
      }
      if (p.status === 'PAID') map[uid].totalPaid += Number(p.amount);
      else if (p.status === 'PENDING') map[uid].totalPending += Number(p.amount);
      map[uid].count++;
    });
    return Object.values(map).sort((a, b) => (b.totalPaid + b.totalPending) - (a.totalPaid + a.totalPending));
  }, [filteredPayments]);

  const partnerAccumulation = useMemo(() => {
    // Filter users who are partners
    const partners = allUsers.filter(u => u.partner_type === 'lembaga' || u.partner_type === 'personal');
    
    return partners.map(partner => {
      // Find submitters (authors) referred by this partner
      const referredUsers = allUsers.filter(u => u.referred_by === partner.id);
      const submitterCount = referredUsers.length;
      
      // Filter payments to this partner for referral royalty
      const partnerPayments = payments.filter(p => p.user_id === partner.id && (p.role_key === 'royalty_referrer_lembaga' || p.role_key === 'royalty_referrer_personal'));
      
      const totalEarned = partnerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPaid = partnerPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPending = partnerPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);
      
      return {
        ...partner,
        submitterCount,
        totalEarned,
        totalPaid,
        totalPending,
        paymentCount: partnerPayments.length
      };
    });
  }, [allUsers, payments]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-academic-900">Keuangan & Honorarium</h1>
          <p className="text-academic-500 text-sm mt-1">Manajemen pencairan honorarium untuk seluruh staf editorial & pemilik royalti</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddRoyaltyModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer">
            <DollarSign className="w-4 h-4" />
            Tambah Royalti Manual
          </button>
          <button onClick={fetchPayments} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-academic-200 rounded-xl text-sm font-bold text-academic-700 hover:bg-academic-50 transition-colors shadow-sm cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-rose-600" />
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Pending</span>
          </div>
          <p className="text-xl font-black text-rose-700 font-mono">
            Rp {summaryStats.totalPending.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Dibayar</span>
          </div>
          <p className="text-xl font-black text-emerald-700 font-mono">
            Rp {summaryStats.totalPaid.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-sky-600" />
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Reviewer Terbayar</span>
          </div>
          <p className="text-xl font-black text-sky-700 font-mono">
            Rp {summaryStats.totalReviewersPaid.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Editor Terbayar</span>
          </div>
          <p className="text-xl font-black text-indigo-700 font-mono">
            Rp {summaryStats.totalEditorsPaid.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">EiC Terbayar</span>
          </div>
          <p className="text-xl font-black text-purple-700 font-mono">
            Rp {summaryStats.totalEicPaid.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Royalti Terbayar</span>
          </div>
          <p className="text-xl font-black text-amber-700 font-mono">
            Rp {summaryStats.totalRoyaltiesPaid.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-academic-200 bg-white p-2 rounded-xl border mb-6 gap-1">
        {([
          { key: 'semua', label: 'Semua Staf' },
          { key: 'reviewer', label: 'Reviewer' },
          { key: 'editor', label: 'Editor' },
          { key: 'eic', label: 'Editor in Chief' },
          { key: 'royalty', label: 'Pemilik Royalti' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-brand-50 text-brand-800 shadow-sm'
                : 'text-academic-500 hover:text-academic-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Akumulasi Kemitraan Referal (Hanya untuk tab Royalty) */}
      {activeTab === 'royalty' && partnerAccumulation.length > 0 && (
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-academic-100 bg-amber-50/50">
            <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Ringkasan Akumulasi Royalti Rujukan Kemitraan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-academic-200 text-[10px] font-bold text-academic-500 uppercase">
                  <th className="px-4 py-2">Nama Lembaga / Person</th>
                  <th className="px-4 py-2">Tipe</th>
                  <th className="px-4 py-2 text-center">Jumlah Submitter</th>
                  <th className="px-4 py-2 text-center">Jumlah Transaksi</th>
                  <th className="px-4 py-2 text-right">Total Pendapatan</th>
                  <th className="px-4 py-2 text-right">Total Terbayar</th>
                  <th className="px-4 py-2 text-right font-bold text-amber-700">Total Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-academic-100">
                {partnerAccumulation.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-academic-900">{p.full_name}</div>
                      <div className="text-[10px] text-academic-500">{p.email}</div>
                      {p.bank_account_number ? (
                        <div className="text-[9px] text-academic-500 bg-academic-100/50 p-1 rounded mt-1 max-w-xs">
                          {p.bank_name} - {p.bank_account_number} a.n {p.bank_account_holder} | NPWP: {p.npwp || '-'}
                        </div>
                      ) : (
                        <div className="text-[9px] text-rose-500 italic mt-1">Belum melengkapi info bank & NPWP</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 capitalize font-medium text-academic-700">{p.partner_type === 'lembaga' ? 'Lembaga' : 'Personal'}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-academic-800">{p.submitterCount} orang</td>
                    <td className="px-4 py-2.5 text-center font-mono text-academic-600">{p.paymentCount} artikel</td>
                    <td className="px-4 py-2.5 text-right font-mono text-academic-700">Rp {p.totalEarned.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-bold">Rp {p.totalPaid.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-amber-700 font-bold bg-amber-50/30">Rp {p.totalPending.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-person summary (for current tab) */}
      {activeTab !== 'royalty' && personSummary.length > 0 && (
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-academic-100 bg-academic-50/50">
            <h3 className="font-bold text-academic-900 text-xs uppercase tracking-wider">Ringkasan Per Individu</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-academic-200 text-[10px] font-bold text-academic-500 uppercase">
                  <th className="px-4 py-2">Nama Staf</th>
                  <th className="px-4 py-2">Peran</th>
                  <th className="px-4 py-2 text-center">Entri</th>
                  <th className="px-4 py-2 text-right">Total Terbayar</th>
                  <th className="px-4 py-2 text-right">Total Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-academic-100 text-xs">
                {personSummary.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-academic-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-brand-700 font-medium">{p.role}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-academic-600">{p.count}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                      {p.totalPaid > 0 ? `Rp ${p.totalPaid.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-700">
                      {p.totalPending > 0 ? `Rp ${p.totalPending.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-academic-100 flex flex-col md:flex-row gap-3 items-center bg-academic-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
            <input
              type="text"
              placeholder="Cari nama staf atau artikel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-academic-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <Filter className="w-4 h-4 text-academic-500" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-academic-200 rounded-lg px-3 py-2 text-xs font-bold text-academic-700 cursor-pointer bg-white"
            >
              <option value="all">Semua Peran</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-academic-200 rounded-lg px-3 py-2 text-xs font-bold text-academic-700 cursor-pointer bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Terbayar</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
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
                <th className="p-4 font-bold">Tgl Dibayar</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-academic-500">Memuat data tagihan...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-academic-500">Belum ada data tagihan pada kategori ini.</td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const roleColor = ROLE_COLORS[p.role_key] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
                  return (
                    <tr key={p.id} className="hover:bg-academic-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-academic-900">{p.users?.full_name || '-'}</div>
                        <div className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                          {p.honorarium_rates?.role_name || ROLE_LABELS[p.role_key] || p.role_key}
                        </div>
                        {p.users?.bank_account_number ? (
                          <div className="text-[10px] text-academic-600 bg-academic-100/50 p-1.5 rounded border border-academic-200 mt-1.5">
                            <span className="font-bold">{p.users.bank_name}</span> - {p.users.bank_account_number}<br/>
                            <span className="text-academic-500">a.n {p.users.bank_account_holder}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-rose-500 bg-rose-50 p-1.5 rounded border border-rose-100 mt-1.5 italic">
                            Belum mengisi data rekening
                          </div>
                        )}
                        {p.users?.npwp ? (
                          <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                            <span className="font-bold">NPWP:</span> {p.users.npwp}
                          </div>
                        ) : (
                          (p.role_key === 'royalty_referrer_lembaga' || p.role_key === 'royalty_referrer_personal') && (
                            <div className="text-[10px] text-amber-600 bg-amber-50/50 p-1.5 rounded border border-dashed border-amber-200 mt-1 italic">
                              Belum mengisi data NPWP
                            </div>
                          )
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-academic-800 line-clamp-2">{p.articles?.title || p.description || '-'}</div>
                      </td>
                      <td className="p-4 font-bold text-academic-900 whitespace-nowrap font-mono">
                        Rp {Number(p.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        {p.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Lunas
                          </span>
                        ) : p.status === 'CANCELLED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <X className="w-3.5 h-3.5" /> Dibatalkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-academic-500">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="p-4 text-center">
                        {p.status === 'PENDING' && (
                          <div className="flex flex-col gap-1.5 items-center">
                            <button
                              onClick={() => markAsPaid(p.id)}
                              disabled={processingId === p.id}
                              className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap w-24"
                            >
                              {processingId === p.id ? '...' : 'Bayar'}
                            </button>
                            <button
                              onClick={() => markAsCancelled(p.id)}
                              disabled={processingId === p.id}
                              className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap w-24"
                            >
                              Batalkan
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredPayments.length > 0 && (
          <div className="px-4 py-3 border-t border-academic-100 bg-academic-50/30 flex justify-between items-center text-xs text-academic-500">
            <span>Menampilkan <strong>{filteredPayments.length}</strong> entri dari <strong>{payments.length}</strong> total</span>
            <span className="font-bold">
              Total Pending (tampilan ini): Rp {filteredPayments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0).toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>

      {showAddRoyaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-academic-100 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-academic-100 flex justify-between items-center bg-academic-50/50">
              <h3 className="text-lg font-bold text-academic-900 font-serif">Tambah Pembayaran Royalti Manual</h3>
              <button onClick={() => setShowAddRoyaltyModal(false)} className="text-academic-400 hover:text-rose-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddRoyaltySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                  Pilih Artikel Ilmiah (Sudah Terbit) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={royaltyForm.article_id}
                  onChange={e => setRoyaltyForm({...royaltyForm, article_id: e.target.value})}
                  className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm bg-white cursor-pointer"
                >
                  <option value="">-- Pilih Artikel --</option>
                  {publishedArticles.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                  Penerima Royalti (User Terdaftar) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={royaltyForm.user_id}
                  onChange={e => setRoyaltyForm({...royaltyForm, user_id: e.target.value})}
                  className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm bg-white cursor-pointer"
                >
                  <option value="">-- Pilih Penerima --</option>
                  {registeredUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                    Klasifikasi Royalti <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={royaltyForm.role_key}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm bg-white cursor-pointer"
                  >
                    <option value="royalty_referrer_lembaga">Lembaga Perujuk (Lembaga)</option>
                    <option value="royalty_referrer_personal">Perujuk Perorangan (Personal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                    Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={royaltyForm.amount}
                    onChange={e => setRoyaltyForm({...royaltyForm, amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm font-bold font-mono"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-academic-700 uppercase tracking-wider mb-1">
                  Keterangan Pembayaran
                </label>
                <textarea
                  value={royaltyForm.description}
                  onChange={e => setRoyaltyForm({...royaltyForm, description: e.target.value})}
                  placeholder="Contoh: Pembayaran royalti co-author kedua untuk terbitan edisi Vol 3 No 2"
                  rows={3}
                  className="w-full px-3 py-2 border border-academic-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-academic-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoyaltyModal(false)}
                  className="px-4 py-2 border border-academic-300 rounded-lg text-sm font-bold text-academic-700 hover:bg-academic-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {modalSubmitting ? 'Menyimpan...' : 'Simpan Royalti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
