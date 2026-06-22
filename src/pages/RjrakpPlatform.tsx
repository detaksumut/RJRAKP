import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Code2, GitBranch, Link2, BookOpen, ShieldCheck, Users, FileText, Database,
  Award, ArrowRight, Copy, CheckCheck, Globe, Fingerprint, Cpu, RefreshCcw,
  ExternalLink, Star, Package, CloudUpload
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

const CONCEPT_DOI = '10.5281/zenodo.20789682';
const VERSION_DOI = '10.5281/zenodo.20789683';

const features = [
  { icon: <Users className="w-5 h-5" />, label: 'Double-Blind Peer Review' },
  { icon: <RefreshCcw className="w-5 h-5" />, label: 'Editorial Workflow Management' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Similarity Checking' },
  { icon: <Users className="w-5 h-5" />, label: 'Reviewer Management' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Author Dashboard' },
  { icon: <Database className="w-5 h-5" />, label: 'DOI Metadata Support' },
  { icon: <Fingerprint className="w-5 h-5" />, label: 'ORCID Integration' },
  { icon: <Globe className="w-5 h-5" />, label: 'OpenAIRE Integration' },
  { icon: <Link2 className="w-5 h-5" />, label: 'OAI-PMH Support' },
  { icon: <CloudUpload className="w-5 h-5" />, label: 'Open Science Infrastructure' },
];

const ecosystemSteps = [
  {
    icon: <GitBranch className="w-6 h-6" />,
    label: 'GitHub',
    desc: 'Source Code Repository',
    href: 'https://github.com/detaksumut/RJRAKP',
    color: 'from-slate-800 to-slate-700',
    badge: 'bg-slate-700 text-slate-100',
  },
  {
    icon: <Award className="w-6 h-6" />,
    label: 'Zenodo DOI',
    desc: 'Persistent Identifier',
    href: `https://doi.org/${VERSION_DOI}`,
    color: 'from-blue-700 to-blue-600',
    badge: 'bg-blue-700 text-blue-100',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    label: 'OpenAIRE',
    desc: 'Open Science Graph',
    href: 'https://explore.openaire.eu/search/person?pid=0009-0006-8416-6156',
    color: 'from-emerald-700 to-emerald-600',
    badge: 'bg-emerald-700 text-emerald-100',
  },
  {
    icon: <Fingerprint className="w-6 h-6" />,
    label: 'ORCID',
    desc: 'Author Identity',
    href: 'https://orcid.org/0009-0006-8416-6156',
    color: 'from-green-600 to-green-500',
    badge: 'bg-green-600 text-green-100',
  },
  {
    icon: <Database className="w-6 h-6" />,
    label: 'ResearcherID',
    desc: 'WoS Author Registry',
    href: 'https://orcid.org/0009-0006-8416-6156',
    color: 'from-indigo-700 to-indigo-600',
    badge: 'bg-indigo-700 text-indigo-100',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    label: 'Web of Science',
    desc: 'Clarivate WoS Index',
    href: 'https://www.webofscience.com',
    color: 'from-red-800 to-red-700',
    badge: 'bg-red-800 text-red-100',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    label: 'Scopus',
    desc: 'Elsevier Abstract DB',
    href: 'https://www.scopus.com/authid/detail.uri?authorId=59675598500',
    color: 'from-orange-700 to-orange-600',
    badge: 'bg-orange-700 text-orange-100',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
      title="Copy DOI"
    >
      {copied ? <CheckCheck className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-brand-200" />}
    </button>
  );
}

export default function RjrakpPlatform() {
  return (
    <>
      <Helmet>
        <title>RJRAKP Platform – Research Software dengan DOI Zenodo, ORCID & OpenAIRE</title>
        <meta
          name="description"
          content="RJRAKP Platform v1.0.1 adalah sistem manajemen jurnal ilmiah berbasis open science dengan DOI Zenodo, ORCID integration, OpenAIRE, dan OAI-PMH support."
        />
        <meta property="og:title" content="RJRAKP Platform v1.0.1 – Academic Publishing Software" />
        <meta property="og:description" content="Research software dengan DOI permanen, ORCID, dan OpenAIRE." />
        <link rel="canonical" href="https://rjrakp.org/rjrakp-platform" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "RJRAKP Platform",
          "version": "1.0.1",
          "applicationCategory": "Academic Publishing Platform",
          "description": "RJRAKP Platform adalah sistem manajemen jurnal ilmiah dan penelitian yang mendukung editorial workflow, double-blind peer review, similarity checking, OAI-PMH, OpenAIRE, ORCID, dan pengelolaan publikasi ilmiah berbasis open science.",
          "url": "https://rjrakp.org",
          "codeRepository": "https://github.com/detaksumut/RJRAKP",
          "identifier": `https://doi.org/${VERSION_DOI}`,
          "author": {
            "@type": "Person",
            "name": "Muhibbuddin",
            "identifier": "https://orcid.org/0009-0006-8416-6156"
          }
        })}</script>
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        {/* Animated blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Top badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5" /> Active Development
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Package className="w-3.5 h-3.5" /> Research Software
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-500/20 border border-accent-500/30 text-accent-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" /> Academic Publishing Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight mb-4">
              RJRAKP Platform
              <span className="block text-2xl sm:text-3xl md:text-4xl text-brand-300 font-bold mt-1">v1.0.1</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100/80 font-medium max-w-3xl mb-8 leading-relaxed">
              Sistem manajemen jurnal ilmiah dan penelitian yang mendukung editorial workflow,
              double-blind peer review, similarity checking, OAI-PMH, OpenAIRE, ORCID,
              dan pengelolaan publikasi ilmiah berbasis <span className="text-accent-300 font-bold">open science</span>.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://doi.org/${VERSION_DOI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                <Award className="w-4 h-4" /> Lihat DOI
              </a>
              <a
                href="https://github.com/detaksumut/RJRAKP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                <GitBranch className="w-4 h-4" /> Lihat Repository GitHub
              </a>
              <a
                href="https://orcid.org/0009-0006-8416-6156"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                <Fingerprint className="w-4 h-4" /> Lihat ORCID
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DOI CARDS */}
      <section className="py-12 bg-slate-50 border-b border-academic-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Concept DOI */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-brand-900 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-brand-300 uppercase tracking-widest mb-1">DOI Permanen (Concept)</p>
              <div className="flex items-center gap-1">
                <code className="text-sm font-mono font-bold text-white break-all">{CONCEPT_DOI}</code>
                <CopyButton text={CONCEPT_DOI} />
              </div>
              <a href={`https://doi.org/${CONCEPT_DOI}`} target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-brand-300 hover:text-white flex items-center gap-1 transition-colors">
                Buka di Zenodo <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>

            {/* Version DOI */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="bg-blue-700 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">DOI Versi Saat Ini</p>
              <div className="flex items-center gap-1">
                <code className="text-sm font-mono font-bold text-white break-all">{VERSION_DOI}</code>
                <CopyButton text={VERSION_DOI} />
              </div>
              <a href={`https://doi.org/${VERSION_DOI}`} target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-blue-200 hover:text-white flex items-center gap-1 transition-colors">
                Buka di Zenodo <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>

            {/* ORCID */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-green-700 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-1">ORCID Pengembang</p>
              <code className="text-sm font-mono font-bold text-white break-all">0009-0006-8416-6156</code>
              <a href="https://orcid.org/0009-0006-8416-6156" target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-green-200 hover:text-white flex items-center gap-1 transition-colors">
                Lihat Profil ORCID <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>

            {/* GitHub */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="bg-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Repository GitHub</p>
              <code className="text-sm font-mono font-bold text-white break-all">detaksumut/RJRAKP</code>
              <a href="https://github.com/detaksumut/RJRAKP" target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
                Lihat Repository <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>

            {/* Web of Science */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-red-800 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-red-200 uppercase tracking-widest mb-1">Web of Science</p>
              <code className="text-sm font-mono font-bold text-white break-all">Clarivate Analytics</code>
              <a href="https://www.webofscience.com" target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-red-200 hover:text-white flex items-center gap-1 transition-colors">
                Lihat Web of Science <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>

            {/* Scopus */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="bg-orange-700 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mb-1">Scopus</p>
              <code className="text-sm font-mono font-bold text-white break-all">Elsevier · Author ID</code>
              <a href="https://www.scopus.com/authid/detail.uri?authorId=59675598500" target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-orange-200 hover:text-white flex items-center gap-1 transition-colors">
                Lihat Profil Scopus <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Software Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-academic-50 rounded-2xl border border-academic-200 p-8 col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-900 rounded-xl flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-black text-academic-900">RJRAKP Platform v1.0.1</h2>
                  <p className="text-xs text-academic-500 font-medium uppercase tracking-wider">Research Software / Academic Publishing Platform</p>
                </div>
              </div>

              <p className="text-academic-600 leading-relaxed font-medium mb-6 text-justify">
                RJRAKP Platform adalah sistem manajemen jurnal ilmiah dan penelitian yang mendukung editorial
                workflow, double-blind peer review, similarity checking, OAI-PMH, OpenAIRE, ORCID, dan
                pengelolaan publikasi ilmiah berbasis open science. Platform ini dirancang untuk memenuhi
                standar tata kelola jurnal ilmiah nasional dan internasional.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-academic-200">
                {[
                  { label: 'Nama Software', value: 'RJRAKP Platform' },
                  { label: 'Versi', value: 'v1.0.1' },
                  { label: 'Pengembang', value: 'Muhibbuddin' },
                  { label: 'Status', value: 'Active Development' },
                  { label: 'Lisensi', value: 'Open Science' },
                  { label: 'DOI Platform', value: VERSION_DOI },
                ].map((row) => (
                  <div key={row.label} className="bg-white rounded-xl p-3 border border-academic-100">
                    <p className="text-[10px] font-bold text-academic-400 uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-sm font-bold text-academic-900 break-all">{row.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges Column */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-4">
              {/* Zenodo Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-3">Zenodo DOI Badge</p>
                <a href={`https://doi.org/${VERSION_DOI}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Award className="w-4 h-4" /> DOI: {VERSION_DOI}
                </a>
                <p className="text-xs text-blue-500 mt-2 font-medium">Zenodo Community · RJRAKP</p>
              </div>

              {/* OpenAIRE Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3">OpenAIRE Badge</p>
                <a href="https://explore.openaire.eu/search/person?pid=0009-0006-8416-6156" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Globe className="w-4 h-4" /> ✓ OpenAIRE Verified
                </a>
                <p className="text-xs text-emerald-600 mt-2 font-medium">Open Science Graph · EU</p>
              </div>

              {/* ORCID Badge */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">ORCID Badge</p>
                <a href="https://orcid.org/0009-0006-8416-6156" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Fingerprint className="w-4 h-4" /> ORCID: 0009-0006-8416-6156
                </a>
                <p className="text-xs text-green-600 mt-2 font-medium">Researcher Identity · ORCID.org</p>
              </div>

              {/* GitHub Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">GitHub Badge</p>
                <a href="https://github.com/detaksumut/RJRAKP" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <GitBranch className="w-4 h-4" /> detaksumut/RJRAKP
                </a>
                <p className="text-xs text-slate-500 mt-2 font-medium">Open Source Repository</p>
              </div>

              {/* Web of Science Badge */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3">Web of Science Badge</p>
                <a href="https://www.webofscience.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Database className="w-4 h-4" /> ✓ Web of Science
                </a>
                <p className="text-xs text-red-500 mt-2 font-medium">Clarivate Analytics · WoS</p>
              </div>

              {/* Scopus Badge */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-3">Scopus Badge</p>
                <a href="https://www.scopus.com/authid/detail.uri?authorId=59675598500" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <BookOpen className="w-4 h-4" /> ✓ Scopus Indexed
                </a>
                <p className="text-xs text-orange-500 mt-2 font-medium">Elsevier Abstract & Citation DB</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 bg-academic-50 border-y border-academic-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-3">Kemampuan Platform</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-academic-900">Fitur Utama</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl border border-academic-200 p-5 flex flex-col items-center text-center hover:border-brand-400 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-3 text-brand-700 group-hover:bg-brand-900 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <p className="text-xs font-bold text-academic-800 leading-snug">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO CITE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-3">Referensi Akademik</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-academic-900">How to Cite</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-900 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -m-6 text-brand-800 opacity-30">
              <FileText className="w-40 h-40" />
            </div>
            <p className="text-[10px] font-bold text-brand-300 uppercase tracking-widest mb-4">Citation Format</p>
            <blockquote className="text-white font-mono text-base leading-relaxed relative z-10">
              Muhibbuddin. <span className="text-accent-300 font-bold">RJRAKP Platform v1.0.1</span>. Zenodo.{' '}
              <a
                href={`https://doi.org/${VERSION_DOI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white underline transition-colors"
              >
                DOI: {VERSION_DOI}
              </a>
            </blockquote>
            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
              <button
                onClick={() => navigator.clipboard.writeText(`Muhibbuddin. RJRAKP Platform v1.0.1. Zenodo. DOI: ${VERSION_DOI}`)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-white/20"
              >
                <Copy className="w-3.5 h-3.5" /> Salin Kutipan
              </button>
              <a
                href={`https://doi.org/${VERSION_DOI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Lihat di Zenodo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ACADEMIC ECOSYSTEM */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold text-brand-300 uppercase tracking-widest mb-3">Integrasi Open Science</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-white">Academic Ecosystem</h2>
            <p className="text-brand-200/70 mt-3 font-medium">Alur distribusi dan verifikasi karya ilmiah RJRAKP Platform</p>
          </div>

          <div className="flex flex-nowrap overflow-x-auto justify-start xl:justify-center items-center gap-0 pb-2">
            {ecosystemSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex flex-col items-center bg-gradient-to-br ${step.color} p-3.5 rounded-xl w-28 shrink-0 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer group`}
                >
                  <div className={`w-10 h-10 ${step.badge} rounded-lg flex items-center justify-center mb-2`}>
                    {step.icon}
                  </div>
                  <p className="font-black text-xs text-center leading-tight">{step.label}</p>
                  <p className="text-[9px] text-white/70 text-center mt-0.5 leading-tight">{step.desc}</p>
                  <ExternalLink className="w-3 h-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
                {i < ecosystemSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-brand-300/50 shrink-0" />
                )}
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-brand-200/60 text-xs font-medium mt-10"
          >
            Setiap commit di GitHub secara otomatis tercatat di Zenodo dengan DOI permanen,
            terindeks di OpenAIRE, dan terhubung ke ORCID peneliti.
          </motion.p>
        </div>
      </section>

      <Footer />
    </>
  );
}
