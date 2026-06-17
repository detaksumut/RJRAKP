import { Check } from 'lucide-react';

export default function SintaPackages() {
  const packages = [
    {
      name: 'SINTA 6',
      badge: 'NASIONAL',
      rank: '6',
      badgeColor: 'bg-slate-500',
      subtitle: 'Rekomendasi Dosen & Akademisi',
      features: [
        'Garansi Pendampingan Revisi',
        'Estimasi Proses 1 - 2 Bulan',
        'Full Formatting & Submission',
        'Terindeks SINTA',
      ],
      whatsappUrl: 'https://wa.me/6281343737367?text=Halo%20Admin%20RJRAKP,%20saya%20ingin%20berkonsultasi%20mengenai%20publikasi%20jurnal%20SINTA%206.',
    },
    {
      name: 'SINTA 5',
      badge: 'NASIONAL',
      rank: '5',
      badgeColor: 'bg-blue-600',
      subtitle: 'Rekomendasi Dosen & Akademisi',
      features: [
        'Garansi Pendampingan Revisi',
        'Estimasi Proses 1 - 2 Bulan',
        'Full Formatting & Submission',
        'Terindeks SINTA',
      ],
      whatsappUrl: 'https://wa.me/6281343737367?text=Halo%20Admin%20RJRAKP,%20saya%20ingin%20berkonsultasi%20mengenai%20publikasi%20jurnal%20SINTA%205.',
    },
    {
      name: 'SINTA 4',
      badge: 'NASIONAL',
      rank: '4',
      badgeColor: 'bg-[#EF4444]', // Sinta red-orange
      subtitle: 'Rekomendasi Dosen & Akademisi',
      features: [
        'Garansi Pendampingan Revisi',
        'Estimasi Proses 1 - 2 Bulan',
        'Full Formatting & Submission',
        'Terindeks SINTA',
      ],
      whatsappUrl: 'https://wa.me/6281343737367?text=Halo%20Admin%20RJRAKP,%20saya%20ingin%20berkonsultasi%20mengenai%20publikasi%20jurnal%20SINTA%204.',
      highlighted: true,
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-academic-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-3">Layanan Publikasi</h2>
          <p className="text-2xl font-bold text-academic-900 sm:text-3xl font-serif">Pilihan Paket Jurnal SINTA</p>
          <div className="w-12 h-1 bg-brand-700 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {packages.map((pkg, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300 ${
                pkg.highlighted 
                  ? 'border-2 border-brand-700 shadow-xl bg-brand-50/10 scale-105 z-10' 
                  : 'border border-academic-200 shadow-sm bg-white hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-brand-700 text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                  Rekomendasi
                </div>
              )}
              
              <div className="mb-4">
                <span className="text-[9px] font-black text-academic-500 uppercase tracking-widest bg-academic-100 px-2.5 py-1 rounded">
                  {pkg.badge}
                </span>
              </div>

              {/* SINTA Logo + rank */}
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="https://sinta.kemdiktisaintek.go.id/authorverification/public/images/brand_sinta.png" 
                  alt="SINTA Logo" 
                  className="h-8 w-auto object-contain"
                />
                <div className={`${pkg.badgeColor} text-white text-sm font-black rounded px-2.5 py-1 shadow-sm`}>
                  {pkg.rank}
                </div>
              </div>

              <div className="text-xs text-academic-500 font-semibold mb-6">
                {pkg.subtitle}
              </div>

              <ul className="space-y-3.5 mb-8 flex-grow">
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-academic-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={pkg.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-center transition-colors block ${
                  pkg.highlighted 
                    ? 'bg-brand-700 hover:bg-brand-800 text-white shadow-md' 
                    : 'bg-academic-800 hover:bg-academic-900 text-white shadow-sm'
                }`}
              >
                Konsultasi Paket
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
