import { Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function VisionMission() {
  const missions = [
    "Memfasilitasi publikasi hasil penelitian berkualitas tinggi di bidang kebijakan, analisis hukum, dan keadilan publik.",
    "Mendorong transparansi dan akuntabilitas melalui literasi akademik dan diskusi kritis.",
    "Membangun jaringan sinergis antara akademisi, praktisi, dan pembuat kebijakan di seluruh Indonesia dan global.",
    "Meningkatkan standar etika publikasi ilmiah secara berkelanjutan."
  ];

  return (
    <section id="tentang" className="py-16 sm:py-20 bg-academic-50 border-t border-academic-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start mb-12">
          <h2 className="text-[10px] font-bold text-academic-500 uppercase tracking-widest mb-4">Tentang RJRAKP</h2>
          <p className="text-2xl font-bold text-academic-900 sm:text-3xl border-l-4 border-accent-600 pl-3 uppercase tracking-wider italic font-serif">
            Visi dan Misi Kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Vision */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-academic-200 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-accent-500"></div>
              <h3 className="text-sm font-bold text-brand-800 uppercase italic font-serif">Visi Utama</h3>
            </div>
            <p className="text-sm sm:text-base text-academic-600 leading-relaxed font-medium">
              Menjadi pusat publikasi dan referensi utama nasional dalam pengembangan ilmu pengetahuan yang berfokus pada riset interdisipliner, analisis kebijakan mendalam, serta penegakan keadilan demi kesejahteraan publik pada tahun 2030.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-academic-200 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-accent-500"></div>
              <h3 className="text-sm font-bold text-brand-800 uppercase italic font-serif">Misi Strategis</h3>
            </div>
            <ul className="space-y-4">
              {missions.map((mission, index) => (
                <li key={index} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-academic-600 leading-relaxed font-medium">{mission}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
