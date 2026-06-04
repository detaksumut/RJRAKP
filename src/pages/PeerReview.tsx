import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PeerReview() {
  return (
    <div className="min-h-screen flex flex-col bg-academic-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-academic-200 shadow-sm overflow-hidden mb-12 relative">
           <div className="bg-brand-900 px-8 py-10 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">PEER REVIEW PROCESS</h1>
              <p className="text-brand-100 font-medium text-sm">Proses Peer Review Rumah Jurnal RJRAKP</p>
            </div>
           </div>

           <div className="p-8 md:p-10 text-academic-700 leading-relaxed text-sm">
             <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-academic-900 prose-a:text-brand-600 space-y-6">
                
                <p>
                  Seluruh artikel yang dikirimkan ke Rumah Jurnal RJRAKP akan melalui proses peer review untuk memastikan kualitas ilmiah, kebaruan, dan kontribusi akademiknya.
                </p>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Tahapan Review</h2>
                
                <h3 className="text-lg font-bold font-serif text-academic-900">1. Submit Artikel</h3>
                <p>Penulis mengunggah artikel melalui sistem Rumah Jurnal RJRAKP.</p>

                <h3 className="text-lg font-bold font-serif text-academic-900">2. Pemeriksaan Awal</h3>
                <p>Editor memeriksa:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kesesuaian ruang lingkup jurnal</li>
                  <li>Kelengkapan naskah</li>
                  <li>Format penulisan</li>
                  <li>Kepatuhan terhadap pedoman penulisan</li>
                </ul>
                <p>Artikel yang tidak memenuhi persyaratan dapat dikembalikan kepada penulis untuk diperbaiki.</p>

                <h3 className="text-lg font-bold font-serif text-academic-900">3. Penugasan Reviewer</h3>
                <p>Editor menunjuk reviewer yang memiliki kompetensi sesuai bidang ilmu artikel.</p>

                <h3 className="text-lg font-bold font-serif text-academic-900">4. Double Blind Review</h3>
                <p>Identitas penulis dan reviewer dirahasiakan selama proses review.</p>
                <p>Reviewer melakukan penilaian terhadap:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Judul</li>
                  <li>Abstrak</li>
                  <li>Pendahuluan</li>
                  <li>Metode</li>
                  <li>Hasil dan Pembahasan</li>
                  <li>Kesimpulan</li>
                  <li>Referensi</li>
                  <li>Kontribusi Ilmiah</li>
                </ul>

                <h3 className="text-lg font-bold font-serif text-academic-900">5. Keputusan Reviewer</h3>
                <p>Reviewer dapat memberikan rekomendasi:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Accept</li>
                  <li>Minor Revision</li>
                  <li>Major Revision</li>
                  <li>Reject</li>
                </ul>

                <h3 className="text-lg font-bold font-serif text-academic-900">6. Revisi Penulis</h3>
                <p>Penulis memperbaiki artikel sesuai masukan reviewer.</p>

                <h3 className="text-lg font-bold font-serif text-academic-900">7. Keputusan Editor</h3>
                <p>Editor mempertimbangkan seluruh hasil review sebelum menetapkan keputusan akhir.</p>

                <h3 className="text-lg font-bold font-serif text-academic-900">8. Publikasi</h3>
                <p>Artikel yang diterima akan dipublikasikan pada Rumah Jurnal RJRAKP dan memperoleh dokumen publikasi sesuai ketentuan yang berlaku.</p>

                <h2 className="text-xl font-bold font-serif text-brand-900 mt-8 mb-4 border-b border-brand-100 pb-2">Prinsip Review</h2>
                <p>Proses review dilakukan secara:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Objektif</li>
                  <li>Independen</li>
                  <li>Rahasia</li>
                  <li>Profesional</li>
                  <li>Bebas Konflik Kepentingan</li>
                </ul>
                
                <p className="font-medium p-4 bg-brand-50 rounded-lg text-brand-900">
                  Seluruh reviewer dan editor wajib menjaga kerahasiaan dokumen yang sedang diproses.
                </p>

             </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
