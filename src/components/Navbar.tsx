import { Menu, X, BookOpen, User, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../data';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (!user) return navigate('/login');
    if (user.role === 'admin') return navigate('/dashboard/admin');
    if (user.role === 'editor') return navigate('/dashboard/editor');
    if (user.role === 'reviewer') return navigate('/dashboard/reviewer');
    return navigate('/dashboard/author');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-academic-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between py-2 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <img src="/logo.png" alt="RJRAKP Logo" className="w-auto h-12 max-h-12 sm:h-16 sm:max-h-16 lg:h-20 lg:max-h-20 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                <BookOpen className="h-8 w-8 text-brand-900 hidden" />
              </div>
            </Link>
          </div>

          <div className="flex flex-1 justify-center px-2">
            <a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-all shadow-sm group">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" fillOpacity={0.2} />
              <span className="text-[10px] sm:text-xs font-bold text-blue-900 tracking-wide whitespace-nowrap">Google Scholar</span>
            </a>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 text-base font-semibold text-academic-700 hover:text-brand-700 transition-colors py-2"
              >
                {item.label}
              </a>
            ))}
            <div className="ml-4 flex items-center">
              <LanguageSelector />
            </div>
            <button
              onClick={handleDashboardClick}
              className="ml-3 flex items-center gap-2 bg-brand-900 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-brand-800 transition-colors"
            >
              <User className="w-4 h-4" />
              {user ? 'Dashboard' : 'Login / Daftar'}
            </button>
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-academic-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-academic-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="px-3 py-2 border-t border-gray-100 mt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-academic-500 uppercase tracking-widest">Pilih Bahasa</span>
              <LanguageSelector />
            </div>
            <button
              onClick={() => { setIsOpen(false); handleDashboardClick(); }}
              className="flex w-full items-center gap-2 px-3 py-3 rounded-md text-base font-bold text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors mt-2"
            >
              <User className="w-5 h-5" />
              {user ? 'Akses Dashboard' : 'Login / Daftar Sekarang'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
