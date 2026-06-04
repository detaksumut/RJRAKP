import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthorLoa() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Acceptance Letter</h1>
        <p className="text-academic-500 mb-8">Unduh dokumen Letter of Acceptance (LoA) Anda.</p>

        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden p-6 text-center text-academic-500">
          Belum ada data.
        </div>
      </div>
    </DashboardLayout>
  );
}
