import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, User, FileText, Bell, Settings, Edit, Users, BarChart } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const role = user?.role;
    if (role === 'author') {
      return [
        { label: 'Dashboard', path: '/dashboard/author', icon: LayoutDashboard },
        { label: 'Artikel Saya', path: '/dashboard/author/articles', icon: FileText },
        { label: 'Submit Artikel', path: '/dashboard/author/submit', icon: Edit },
        { label: 'Status Review', path: '/dashboard/author/review-status', icon: Bell },
        { label: 'Acceptance Letter', path: '/dashboard/author/loa', icon: Settings },
        { label: 'Sertifikat Publikasi', path: '/dashboard/author/certificates', icon: User },
      ];
    } else if (role === 'reviewer') {
      return [
        { label: 'Dashboard', path: '/dashboard/reviewer', icon: LayoutDashboard },
        { label: 'Artikel Ditugaskan', path: '/dashboard/reviewer/assignments', icon: FileText },
        { label: 'Review Saya', path: '/dashboard/reviewer/my-reviews', icon: Edit },
        { label: 'Riwayat Review', path: '/dashboard/reviewer/history', icon: Edit },
      ];
    } else if (role === 'editor') {
      return [
        { label: 'Dashboard', path: '/dashboard/editor', icon: LayoutDashboard },
        { label: 'Artikel Masuk', path: '/dashboard/editor/articles', icon: FileText },
        { label: 'Assign Reviewer', path: '/dashboard/editor/reviewers', icon: Users },
        { label: 'Pemeriksaan Hasil Reviewer', path: '/dashboard/editor/decisions', icon: FileText },
        { label: 'Riwayat Keputusan', path: '/dashboard/editor/decisions-history', icon: FileText },
        { label: 'Generate Cover & Publikasi', path: '/dashboard/editor/publications', icon: BarChart },
      ];
    } else if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Verifikasi Reviewer', path: '/dashboard/admin/reviewers', icon: Users },
        { label: 'Verifikasi Editor', path: '/dashboard/admin/editors', icon: Users },
        { label: 'Dewan Pengurus', path: '/dashboard/admin/board-members', icon: Users },
        { label: 'Manajemen Jurnal', path: '/dashboard/admin/journals', icon: FileText },
        { label: 'Manajemen Artikel', path: '/dashboard/admin/articles', icon: FileText },
        { label: 'Manajemen Pengguna', path: '/dashboard/admin/users', icon: User },
        { label: 'Activity Logs', path: '/dashboard/admin/logs', icon: BarChart },
        { label: 'Pengaturan Akun', path: '/dashboard/admin/settings', icon: Settings },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-academic-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-brand-900 border-r border-brand-800 flex flex-col font-sans hidden md:flex shrink-0 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-brand-800 bg-brand-950">
          <Link to="/" className="text-white font-bold tracking-widest uppercase font-serif text-lg">RJRAKP</Link>
        </div>
        
        <div className="p-4 border-b border-brand-800">
          <p className="text-brand-300 text-[10px] font-bold uppercase tracking-widest mb-1">Signed in as</p>
          <p className="text-white font-bold truncate">{user?.full_name}</p>
          <p className="text-brand-400 text-xs capitalize mt-0.5">{user?.role}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path || (item.path !== '#' && location.pathname.startsWith(item.path))
                  ? 'bg-brand-800 text-white' 
                  : 'text-brand-100 hover:bg-brand-800 hover:text-white'
              }`}
              onClick={(e) => {
                if (item.path === '#') {
                  e.preventDefault();
                }
              }}
            >
              <item.icon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800">
          <button onClick={logout} className="flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-brand-100 hover:bg-rose-900 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen min-w-0">
         <header className="h-16 bg-white border-b border-academic-200 sticky top-0 z-10 flex items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex h-full items-center gap-4">
              <Link to="/" className="text-sm font-bold text-academic-600 hover:text-brand-600 transition-colors uppercase tracking-wider">
                Kembali ke Beranda Public
              </Link>
            </div>
         </header>
         <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto overflow-x-hidden min-w-0">
            {children}
         </main>
      </div>
    </div>
  );
}
