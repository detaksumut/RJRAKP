import { motion } from 'motion/react';
import { ExternalLink, Award, BookOpen, Quote, TrendingUp, FileText, Users, Lightbulb } from 'lucide-react';

// ──────────────────────────────────────────────
//  DATA SINTA — Dr. Bakhrul Khair Amal, M.Si
// ──────────────────────────────────────────────
const EDITOR = {
  name: 'Dr. Bakhrul Khair Amal, M.Si',
  title: 'Editor in Chief',
  affiliation: 'Universitas Negeri Medan',
  department: 'Dept. Sosiologi / Ilmu Sosial',
  sintaScore: { overall: 640, threeYear: 225 },
  photo: '/Dr_Bahkrul_Khair_Amal_MSi.png',
};

const QUARTILE_DATA = [
  { label: 'Q1', value: 1, color: '#06b6d4', pct: 11.11 },
  { label: 'Q2', value: 2, color: '#6366f1', pct: 22.22 },
  { label: 'Q3', value: 1, color: '#f472b6', pct: 11.11 },
  { label: 'Q4', value: 0, color: '#ec4899', pct: 0 },
  { label: 'No-Q', value: 5, color: '#64748b', pct: 55.56 },
];

const METRICS = [
  { label: 'Article',        scopus: 7,   gscholar: 141, icon: FileText },
  { label: 'Citation',       scopus: 22,  gscholar: 1037, icon: Quote },
  { label: 'Cited Document', scopus: 22,  gscholar: 72,  icon: BookOpen },
  { label: 'H-Index',        scopus: 2,   gscholar: 19,  icon: TrendingUp },
  { label: 'i10-Index',      scopus: 1,   gscholar: 26,  icon: Award },
  { label: 'G-Index',        scopus: 1,   gscholar: 1,   icon: Award },
];

const RESEARCH_OUTPUT = [
  { label: 'Articles',    scopus: 7,   garuda: 8,  gscholar: 141, icon: FileText,  color: 'text-cyan-400' },
  { label: 'Books',       scopus: 0,   garuda: 0,  gscholar: 5,   icon: BookOpen,  color: 'text-amber-400' },
  { label: 'IPRs',        scopus: 0,   garuda: 0,  gscholar: 3,   icon: Lightbulb, color: 'text-violet-400' },
  { label: 'Researches',  scopus: 0,   garuda: 8,  gscholar: 0,   icon: Users,     color: 'text-emerald-400' },
];

const ACADEMIC_IDS = [
  {
    label: 'ORCID ID',
    value: '0000-0002-1261-302X',
    url: 'https://orcid.org/0000-0002-1261-302X',
    bg: 'bg-[#A6CE39]/15',
    border: 'border-[#A6CE39]/40',
    textColor: 'text-[#A6CE39]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg',
    logoAlt: 'ORCID',
  },
  {
    label: 'Google Scholar ID',
    value: 'e89cADYAAAAJ',
    url: 'https://scholar.google.com/citations?user=e89cADYAAAAJ',
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/30',
    textColor: 'text-blue-300',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg',
    logoAlt: 'Google Scholar',
  },
  {
    label: 'SINTA ID',
    value: '6019786',
    url: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6019786',
    bg: 'bg-teal-500/10',
    border: 'border-teal-400/30',
    textColor: 'text-teal-300',
    logo: '/logosinta.png',
    logoAlt: 'SINTA',
  },
  {
    label: 'Scopus ID',
    value: '59675598500',
    url: 'https://www.scopus.com/authid/detail.uri?authorId=59675598500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/30',
    textColor: 'text-orange-300',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Scopus_logo.svg',
    logoAlt: 'Scopus',
  },
  {
    label: 'SSRN Author ID',
    value: '11897288',
    url: 'https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=11897288',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-400/30',
    textColor: 'text-indigo-300',
    logo: null,
    logoAlt: 'SSRN',
    abbr: 'SSRN',
  },
  {
    label: 'Zenodo DOI',
    value: '10.5281/zenodo.20637314',
    url: 'https://zenodo.org/doi/10.5281/zenodo.20637314',
    bg: 'bg-sky-500/10',
    border: 'border-sky-400/30',
    textColor: 'text-sky-300',
    logo: '/zenodo.png',
    logoAlt: 'Zenodo',
  },
  {
    label: 'OpenAIRE',
    value: 'Linked Research Output',
    url: 'https://explore.openaire.eu/search/author?author=Bakhrul+Khair+Amal',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    textColor: 'text-emerald-300',
    logo: '/OpenAIRE.png',
    logoAlt: 'OpenAIRE',
  },
  {
    label: 'ResearchGate',
    value: 'Bakhrul-Amal',
    url: 'https://www.researchgate.net/profile/Bakhrul-Amal',
    bg: 'bg-[#00CCBB]/10',
    border: 'border-[#00CCBB]/30',
    textColor: 'text-[#00CCBB]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/ResearchGate_icon_SVG.svg',
    logoAlt: 'ResearchGate',
  },
  {
    label: 'EAI Publication',
    value: '10.4108/eai.19-9-2023',
    url: 'https://eudl.eu/doi/10.4108/eai.19-9-2023.2340543',
    bg: 'bg-[#00B09B]/10',
    border: 'border-[#00B09B]/30',
    textColor: 'text-[#00B09B]',
    logo: '/EAI.png',
    logoAlt: 'EAI',
  },
  {
    label: 'CyberLeninka',
    value: 'Feminization of Poverty',
    url: 'https://cyberleninka.ru/article/n/feminization-of-poverty-a-study-of-women-housewife-in-communities-in-medan-city',
    bg: 'bg-slate-500/10',
    border: 'border-slate-400/30',
    textColor: 'text-slate-300',
    logo: '/LENINKA.png',
    logoAlt: 'CyberLeninka',
  },
  {
    label: 'Remittances Review',
    value: 'Vol.8 No.4 (2023)',
    url: 'https://remittancesreview.com/menu-script/index.php/remittances/article/view/708',
    bg: 'bg-orange-600/10',
    border: 'border-orange-500/30',
    textColor: 'text-orange-300',
    logo: '/remittance.png',
    logoAlt: 'Remittances Review',
  },
  {
    label: 'Wiley Online Library',
    value: '10.1155/2022/6242062',
    url: 'https://onlinelibrary.wiley.com/doi/10.1155/2022/6242062',
    bg: 'bg-emerald-600/10',
    border: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    logo: '/wiley.png',
    logoAlt: 'Wiley Online Library',
  },
];

// ──────────────────────────────────────────────
//  DONUT CHART  (SVG conic-gradient style)
// ──────────────────────────────────────────────
function QuartileDonut() {
  const total = QUARTILE_DATA.reduce((s, d) => s + d.value, 0) || 1;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const gap = 2; // degrees gap between segments

  let cumPct = 0;
  const segments = QUARTILE_DATA.filter(d => d.value > 0).map(d => {
    const pct = d.value / total;
    const dashLen = (pct * 360 - gap) / 360 * circumference;
    const offset = circumference - (cumPct / 360) * circumference;
    cumPct += pct * 360;
    return { ...d, dashLen: Math.max(dashLen, 0), offset };
  });

  return (
    <svg viewBox="0 0 140 140" className="w-36 h-36 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="18" />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth="18"
          strokeDasharray={`${seg.dashLen} ${circumference}`}
          strokeDashoffset={seg.offset}
          strokeLinecap="butt"
        />
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r="36" fill="#0a1b33" />
    </svg>
  );
}

// ──────────────────────────────────────────────
//  MAIN COMPONENT
// ──────────────────────────────────────────────
export default function EditorInChief() {
  return (
    <section className="bg-gradient-to-b from-[#040d1a] via-[#061122] to-[#091b35] py-16 lg:py-24 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[55%] rounded-full bg-accent-500/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-cyan-500/8 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            <Award className="w-3.5 h-3.5" />
            Pimpinan Redaksi
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
            Editor in Chief
          </h2>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-accent-500 to-amber-400 mx-auto rounded-full" />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-3xl border border-white/10 bg-white/3 backdrop-blur-sm shadow-2xl overflow-hidden"
        >
          {/* ── 🏆 MILESTONE BADGE — pojok kanan atas ── */}
          <div className="absolute top-4 right-4 z-20 hidden xl:block">
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-[#0a1b33]/95 via-amber-950/80 to-[#061122]/95 backdrop-blur-md p-3 shadow-2xl shadow-amber-500/20 min-w-[180px]">
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: 'shimmer 2.5s infinite' }} />
              {/* Stars */}
              <div className="absolute top-1 right-2 text-amber-300/40 text-base select-none">✦</div>
              <div className="absolute bottom-2 left-2 text-yellow-300/20 text-xs select-none">✦</div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🏆</span>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pencapaian Luar Biasa</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 leading-none">1,037</div>
                <div className="text-[9px] text-amber-400/70 font-bold uppercase tracking-widest mt-0.5">Total Citasi</div>
                <p className="text-[10px] text-white/50 mt-1.5 leading-snug border-t border-amber-400/20 pt-1.5">
                  <span className="text-blue-400 font-semibold">Google Scholar</span> &amp; <span className="text-orange-400 font-semibold">Scopus</span>
                  <span className="block text-white/30 text-[9px]">(Jun 2026)</span>
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5">

            {/* ── LEFT: Profile Photo ── */}
            <div className="xl:col-span-2 relative">
              <div className="relative h-full min-h-[340px] xl:min-h-[480px]">
                <img
                  src={EDITOR.photo}
                  alt="Dr. Bakhrul Khair Amal, M.Si — Editor in Chief RJRAKP"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/academic_hero.png';
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#061122]/60 xl:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061122]/80 via-transparent to-transparent xl:hidden" />

                {/* Name badge on image */}
                <div className="absolute bottom-0 left-0 right-0 p-5 xl:hidden">
                  <p className="text-xl font-serif font-black text-white drop-shadow-lg">{EDITOR.name}</p>
                  <p className="text-accent-400 text-xs font-bold uppercase tracking-widest mt-0.5">{EDITOR.title} · RJRAKP</p>
                  <p className="text-white/60 text-xs mt-1">{EDITOR.affiliation}</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: SINTA Metrics ── */}
            <div className="xl:col-span-3 p-6 lg:p-8 flex flex-col gap-6">

              {/* Profile Info (desktop only) */}
              <div className="hidden xl:block">
                <p className="text-2xl font-serif font-black text-white leading-tight">{EDITOR.name}</p>
                <p className="text-accent-400 text-xs font-bold uppercase tracking-widest mt-1">{EDITOR.title} · RJRAKP</p>
                <p className="text-white/50 text-sm mt-1">{EDITOR.affiliation} · {EDITOR.department}</p>
              </div>


              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-400/30">
                  <img src="/logosinta.png" alt="SINTA" className="h-5 object-contain" />
                  <div>
                    <p className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">SINTA Score</p>
                    <p className="text-white font-black text-base leading-tight">{EDITOR.sintaScore.overall} <span className="text-white/40 text-xs font-normal">overall</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-400/30">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">3-Year Score</p>
                    <p className="text-white font-black text-base leading-tight">{EDITOR.sintaScore.threeYear}</p>
                  </div>
                </div>
              </div>

              {/* ── SINTA SUMMARY PANEL ── */}
              <div className="rounded-2xl border border-white/10 bg-brand-950/60 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
                  <img src="/logosinta.png" alt="SINTA" className="h-5 object-contain" />
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">SINTA Summary</span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Article Quartile Donut */}
                  <div>
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-3 text-center">Article Quartile</p>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <QuartileDonut />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-white">{QUARTILE_DATA.reduce((s,d)=>s+d.value,0)}</span>
                          <span className="text-[9px] text-white/40 font-semibold">Articles</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {QUARTILE_DATA.map(q => (
                          <div key={q.label} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: q.color }} />
                            <span className="text-[11px] text-white/80 font-semibold">{q.label}</span>
                            <span className="text-[11px] text-white/40 ml-auto pl-2 font-mono">{q.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Research Output */}
                  <div>
                    <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-3 text-center">Research Output</p>
                    <div className="grid grid-cols-2 gap-2">
                      {RESEARCH_OUTPUT.map((ro) => {
                        const Icon = ro.icon;
                        return (
                          <div key={ro.label} className="rounded-xl bg-white/5 border border-white/8 p-2.5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${ro.color}`} />
                              <span className="text-[10px] text-white/60 font-semibold">{ro.label}</span>
                            </div>
                            <div className="flex gap-2 mt-0.5">
                              {ro.scopus > 0 && (
                                <span className="text-[10px] text-orange-400 font-mono font-bold">{ro.scopus} <span className="text-white/30 font-normal text-[9px]">Scop</span></span>
                              )}
                              {ro.garuda > 0 && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">{ro.garuda} <span className="text-white/30 font-normal text-[9px]">GRD</span></span>
                              )}
                              {ro.gscholar > 0 && (
                                <span className="text-[10px] text-blue-400 font-mono font-bold">{ro.gscholar} <span className="text-white/30 font-normal text-[9px]">GS</span></span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="border-t border-white/10">
                  <div className="grid grid-cols-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/30">Metric</span>
                    <span className="text-orange-400 text-center">Scopus</span>
                    <span className="text-[#06b6d4] text-center">GScholar</span>
                  </div>
                  {METRICS.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.label}
                        className={`grid grid-cols-3 px-4 py-2 items-center text-sm ${i % 2 === 0 ? 'bg-white/3' : ''} ${i === METRICS.length - 1 ? '' : 'border-b border-white/5'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="text-white/70 text-[12px] font-medium">{m.label}</span>
                        </div>
                        <span className={`text-center font-mono font-bold text-[13px] ${m.scopus > 0 ? 'text-orange-400' : 'text-white/30'}`}>
                          {m.scopus}
                        </span>
                        <span className={`text-center font-mono font-bold text-[13px] ${m.gscholar > 0 ? 'text-[#06b6d4]' : 'text-white/30'}`}>
                          {m.gscholar}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ACADEMIC IDENTIFIERS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6"
        >
          <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm p-5">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-accent-500" />
              Academic Identifiers
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {ACADEMIC_IDS.map((id) => (
                <a
                  key={id.label}
                  href={id.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col gap-2 rounded-xl border ${id.border} ${id.bg} p-3 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    {id.logo ? (
                      <img
                        src={id.logo}
                        alt={id.logoAlt}
                        className="h-5 object-contain max-w-[60px]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className={`text-[10px] font-black ${id.textColor} bg-white/10 px-2 py-0.5 rounded`}>{id.abbr}</span>
                    )}
                    <ExternalLink className={`w-3 h-3 ${id.textColor} opacity-0 group-hover:opacity-100 transition-opacity ml-auto`} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider leading-tight">{id.label}</p>
                    <p className={`text-[10px] ${id.textColor} font-mono font-bold leading-tight mt-0.5 break-all`}>{id.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
