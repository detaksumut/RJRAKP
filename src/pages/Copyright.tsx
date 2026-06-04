import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Copyright() {
  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-12 relative">
           <div className="bg-brand-900 px-8 py-10 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">COPYRIGHT NOTICE</h1>
              <p className="text-brand-100 font-medium text-sm">Ketentuan Hak Cipta Rumah Jurnal RJRAKP</p>
            </div>
           </div>

           <div className="p-8 md:p-10 text-academic-700 leading-relaxed text-sm">
             <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-academic-900 prose-a:text-brand-600 space-y-6">
                
                <p>
                  Hak cipta artikel yang diterbitkan pada Rumah Jurnal RJRAKP tetap berada pada penulis.
                </p>
                <p>
                  Dengan mengirimkan artikel ke Rumah Jurnal RJRAKP, penulis memberikan hak kepada Rumah Jurnal RJRAKP untuk:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Meninjau dan mempublikasikan artikel.</li>
                  <li>Menyimpan artikel dalam arsip digital.</li>
                  <li>Menampilkan artikel pada website Rumah Jurnal RJRAKP.</li>
                  <li>Menyebarluaskan artikel untuk kepentingan pendidikan, penelitian, dan pengembangan ilmu pengetahuan.</li>
                </ol>
                <p>
                  Penulis bertanggung jawab penuh atas isi artikel yang dipublikasikan.
                </p>
                <p>
                  Rumah Jurnal RJRAKP tidak bertanggung jawab atas pelanggaran hak cipta, plagiarisme, atau sengketa hukum yang timbul akibat isi artikel yang dikirimkan oleh penulis.
                </p>

             </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
