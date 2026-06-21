import React, { useEffect, useState } from 'react';
import { X, Award, Building2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BoardMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  image_url: string;
  sinta_id?: string;
  google_scholar_id?: string;
  orcid_id?: string;
  scopus_id?: string;
  wos_id?: string;
  ssrn_author_id?: string;
  ssrn_abstract_id?: string;
}

const getProfileUrl = (type: string, id: string) => {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  switch (type) {
    case 'sinta':
      return `https://sinta.kemdikbud.go.id/authors/detail?id=${trimmed}`;
    case 'scholar':
      return `https://scholar.google.com/citations?user=${trimmed}`;
    case 'orcid':
      return `https://orcid.org/${trimmed}`;
    case 'scopus':
      return `https://www.scopus.com/authid/detail.uri?authorId=${trimmed}`;
    case 'wos':
      return `https://www.webofscience.com/wos/author/record/${trimmed}`;
    case 'ssrn_author':
      return `https://ssrn.com/author=${trimmed}`;
    case 'ssrn_abstract':
      return `https://ssrn.com/abstract=${trimmed}`;
    default:
      return trimmed;
  }
};

export default function BoardModal({ isOpen, onClose }: BoardModalProps) {
  const [show, setShow] = useState(false);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      document.body.style.overflow = 'hidden';
      fetchBoardMembers();
    } else {
      setShow(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchBoardMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoardMembers(data || []);
    } catch (error) {
      console.error('Error fetching board members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-academic-950/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-5xl bg-gradient-to-br from-academic-900 to-academic-950 border border-academic-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 flex flex-col max-h-[90vh] ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-academic-800/50 bg-academic-950/50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1">EDITORIAL BOARD</h2>
            <p className="text-academic-400 text-sm">Rumah Jurnal Riset, Analisis & Keadilan Publik Indonesia</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-academic-800 text-academic-400 hover:text-white transition-colors group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
               <RefreshCw className="w-8 h-8 text-accent-500 animate-spin mb-4" />
               <p className="text-academic-400 font-medium">Memuat data pengurus...</p>
             </div>
          ) : boardMembers.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <p className="text-academic-400">Belum ada data pengurus yang ditambahkan.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((member) => (
                <div 
                  key={member.id}
                  className="group relative bg-academic-900/40 hover:bg-academic-800/40 border border-academic-700/30 hover:border-accent-500/50 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(195,156,80,0.2)]"
                >
                  {/* Avatar with Gradient Border */}
                  <div className="relative mb-4">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-500 to-brand-500 opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300 animate-spin-slow"></div>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-academic-900 bg-academic-800 z-10 flex items-center justify-center text-3xl font-bold text-academic-600">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <span>{member.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-bold text-white mb-1 leading-snug font-serif group-hover:text-accent-400 transition-colors">
                    {member.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 justify-center mb-3 text-accent-500">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-xs font-black tracking-wider uppercase">
                      {member.role}
                    </span>
                  </div>

                  {/* Academic Profile Badges */}
                  {(member.sinta_id || member.google_scholar_id || member.orcid_id || member.scopus_id || member.wos_id || member.ssrn_author_id || member.ssrn_abstract_id) && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4 mt-1">
                      {member.sinta_id && (
                        <a
                          href={getProfileUrl('sinta', member.sinta_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all hover:scale-105"
                          title="Sinta Profile"
                        >
                          SINTA
                        </a>
                      )}
                      {member.google_scholar_id && (
                        <a
                          href={getProfileUrl('scholar', member.google_scholar_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all hover:scale-105"
                          title="Google Scholar Profile"
                        >
                          Scholar
                        </a>
                      )}
                      {member.orcid_id && (
                        <a
                          href={getProfileUrl('orcid', member.orcid_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30 transition-all hover:scale-105"
                          title="ORCID Profile"
                        >
                          ORCID
                        </a>
                      )}
                      {member.scopus_id && (
                        <a
                          href={getProfileUrl('scopus', member.scopus_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-all hover:scale-105"
                          title="Scopus Profile"
                        >
                          Scopus
                        </a>
                      )}
                      {member.wos_id && (
                        <a
                          href={getProfileUrl('wos', member.wos_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all hover:scale-105"
                          title="Web of Science Profile"
                        >
                          WoS
                        </a>
                      )}
                      {member.ssrn_author_id && (
                        <a
                          href={getProfileUrl('ssrn_author', member.ssrn_author_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105"
                          title="SSRN Author Profile"
                        >
                          SSRN Author
                        </a>
                      )}
                      {member.ssrn_abstract_id && (
                        <a
                          href={getProfileUrl('ssrn_abstract', member.ssrn_abstract_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 transition-all hover:scale-105"
                          title="SSRN Abstract Page"
                        >
                          SSRN Abstract
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1 text-sm text-academic-400 mt-auto pt-4 border-t border-academic-800/50 w-full">
                    <Building2 className="w-4 h-4 opacity-50" />
                    <span className="leading-tight">{member.affiliation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
