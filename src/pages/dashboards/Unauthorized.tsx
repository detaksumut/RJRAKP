import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl border border-academic-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-rose-600 text-3xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">Akses Ditolak</h1>
          <p className="text-academic-600 mb-8">
            Anda tidak memiliki izin role yang sesuai untuk mengakses halaman ini.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
