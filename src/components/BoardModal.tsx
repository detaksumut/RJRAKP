import React, { useEffect, useState } from 'react';
import { X, Award, Building2 } from 'lucide-react';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOARD_MEMBERS = [
  { 
    id: 1,
    name: 'Dr. H. Ahmad Sudirman, M.Si.', 
    role: 'Editor in Chief', 
    affiliation: 'Universitas Indonesia', 
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80' 
  },
  { 
    id: 2,
    name: 'Prof. Dr. Siti Aminah, M.Pd.', 
    role: 'Managing Editor', 
    affiliation: 'Universitas Gadjah Mada', 
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' 
  },
  { 
    id: 3,
    name: 'Dr. Budi Santoso, S.H., M.H.', 
    role: 'Editorial Board', 
    affiliation: 'Universitas Diponegoro', 
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' 
  },
  { 
    id: 4,
    name: 'Dr. Rina Wati, S.T., M.T.', 
    role: 'Section Editor', 
    affiliation: 'Institut Teknologi Bandung', 
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80' 
  },
  { 
    id: 5,
    name: 'Prof. Dr. Andi Wijaya', 
    role: 'Reviewer', 
    affiliation: 'Universitas Airlangga', 
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' 
  },
  { 
    id: 6,
    name: 'Dr. Linda Kusuma, M.A.', 
    role: 'Reviewer', 
    affiliation: 'Universitas Brawijaya', 
    img: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=256&q=80' 
  }
];

export default function BoardModal({ isOpen, onClose }: BoardModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setShow(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
            <h2 className="text-2xl font-serif font-bold text-white mb-1">Dewan Pengurus</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {BOARD_MEMBERS.map((member) => (
              <div 
                key={member.id}
                className="group relative bg-academic-900/40 hover:bg-academic-800/40 border border-academic-700/30 hover:border-accent-500/50 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(195,156,80,0.2)]"
              >
                {/* Avatar with Gradient Border */}
                <div className="relative mb-4">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-500 to-brand-500 opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300 animate-spin-slow"></div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-academic-900 bg-academic-800 z-10">
                    <img 
                      src={member.img} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
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

                <div className="flex flex-col items-center gap-1 text-sm text-academic-400 mt-auto pt-4 border-t border-academic-800/50 w-full">
                  <Building2 className="w-4 h-4 opacity-50" />
                  <span className="leading-tight">{member.affiliation}</span>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
