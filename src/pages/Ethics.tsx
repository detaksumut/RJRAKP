import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Ethics() {
  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-12 relative">
           <div className="bg-brand-900 px-8 py-10 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">PUBLICATION ETHICS</h1>
              <p className="text-brand-100 font-medium text-sm">Etika Publikasi Rumah Jurnal RJRAKP</p>
            </div>
           </div>

           <div className="p-8 md:p-10 text-academic-700 leading-relaxed text-sm">
             <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-academic-900 prose-a:text-brand-600 space-y-6">
                
                <p>
                  Rumah Jurnal RJRAKP berkomitmen menjaga integritas, objektivitas, dan kualitas publikasi ilmiah.
                </p>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Tanggung Jawab Penulis</h2>
                <p>Penulis wajib:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Menyerahkan karya ilmiah yang asli dan bukan hasil plagiarisme.</li>
                  <li>Menyajikan data penelitian secara jujur dan akurat.</li>
                  <li>Menyebutkan seluruh sumber referensi secara benar.</li>
                  <li>Tidak mengirimkan artikel yang sama ke lebih dari satu jurnal secara bersamaan.</li>
                  <li>Memastikan seluruh penulis yang tercantum telah memberikan persetujuan terhadap naskah yang diajukan.</li>
                </ol>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Tanggung Jawab Reviewer</h2>
                <p>Reviewer wajib:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Menilai artikel secara objektif dan profesional.</li>
                  <li>Menjaga kerahasiaan naskah yang direview.</li>
                  <li>Memberikan masukan yang konstruktif kepada penulis.</li>
                  <li>Menghindari konflik kepentingan dalam proses review.</li>
                  <li>Menyampaikan hasil review sesuai bidang keahliannya.</li>
                </ol>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Tanggung Jawab Editor</h2>
                <p>Editor wajib:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Mengambil keputusan editorial secara adil dan independen.</li>
                  <li>Menjaga kerahasiaan proses editorial.</li>
                  <li>Menugaskan reviewer yang kompeten.</li>
                  <li>Menolak artikel yang terbukti melanggar etika publikasi.</li>
                  <li>Menjaga kualitas ilmiah jurnal.</li>
                </ol>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Pelanggaran Etika</h2>
                <p>Rumah Jurnal RJRAKP tidak mentolerir:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plagiarisme</li>
                  <li>Fabrikasi data</li>
                  <li>Manipulasi data</li>
                  <li>Duplikasi publikasi</li>
                  <li>Penyalahgunaan sitasi</li>
                  <li>Konflik kepentingan yang tidak diungkapkan</li>
                </ul>
                
                <p className="font-medium mt-4 p-4 bg-brand-50 rounded-lg text-brand-900">
                  Artikel yang terbukti melanggar etika dapat ditolak, dibatalkan proses publikasinya, atau ditarik setelah dipublikasikan.
                </p>

             </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
