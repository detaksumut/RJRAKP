import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Map } from "lucide-react";
import { motion } from "motion/react";

export interface IndexingItem {
  id: number;
  index_name: string;
  status: "target" | "active" | "inactive";
  description: string;
  website_url: string;
  display_order: number;
}

export default function IndexingRoadmap() {
  const [items, setItems] = useState<IndexingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replaced API with static data
    const data: IndexingItem[] = [
      { id: 1, index_name: "Persiapan OJS", status: "active", description: "", website_url: "", display_order: 1 },
      { id: 2, index_name: "Pengajuan e-ISSN", status: "active", description: "", website_url: "", display_order: 2 },
      { id: 3, index_name: "Registrasi Crossref DOI", status: "active", description: "", website_url: "", display_order: 3 },
      { id: 4, index_name: "Indeksasi GARUDA", status: "target", description: "", website_url: "", display_order: 4 },
      { id: 5, index_name: "Akreditasi SINTA", status: "target", description: "", website_url: "", display_order: 5 },
      { id: 6, index_name: "Indeksasi DOAJ", status: "target", description: "", website_url: "", display_order: 6 },
    ];
    setItems(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white border-t border-academic-200" id="indexing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full mb-6">
              <Map className="w-4 h-4 text-brand-700" />
              <span className="text-[10px] font-bold text-brand-800 uppercase tracking-widest">Arah Pengembangan</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-academic-900 mb-6 leading-tight">
              Indexing Roadmap
            </h2>
            
            <p className="text-academic-600 font-medium leading-relaxed mb-8">
              RJRAKP sedang mempersiapkan proses indeksasi, akreditasi, dan penguatan tata kelola jurnal sesuai standar publikasi ilmiah nasional dan internasional.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded text-[10px] font-bold tracking-widest uppercase">
                Open Access Journal
              </span>
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold tracking-widest uppercase">
                Peer Review Process
              </span>
              <span className="px-3 py-1.5 bg-accent-50 text-accent-700 border border-accent-200 rounded text-[10px] font-bold tracking-widest uppercase">
                Academic Publishing
              </span>
            </div>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="bg-academic-50 border border-academic-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.filter(item => item.status !== 'inactive').map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-academic-100 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.status === 'active' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-academic-900 mb-1">{item.index_name}</h3>
                      <div className="flex items-center gap-2">
                        {item.status === 'active' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Target
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
