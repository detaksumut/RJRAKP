import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { BookMarked } from 'lucide-react';

export default function Pedoman() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-brand-950 py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent-500 text-white text-xs font-bold tracking-widest uppercase mb-6">
              <BookMarked className="w-4 h-4" />
              Pedoman Penulisan
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
              Pedoman Penulisan Artikel Ilmiah
            </h1>
            <p className="text-lg sm:text-xl text-brand-100/80 font-medium max-w-2xl mx-auto">
              Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-academic-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-academic-200 shadow-sm">
            

            {/* A */}
            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 mb-4">A. KETENTUAN UMUM</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Naskah merupakan karya ilmiah asli yang belum pernah dipublikasikan dan tidak sedang diajukan pada jurnal atau media publikasi lain.</li>
              <li>Naskah harus sesuai dengan fokus dan ruang lingkup jurnal yang diterbitkan oleh RJRAKP.</li>
              <li>Penulis bertanggung jawab penuh terhadap isi, keaslian, data, kutipan, dan referensi yang digunakan.</li>
              <li>Naskah ditulis menggunakan bahasa Indonesia yang baik dan benar atau bahasa Inggris akademik.</li>
              <li>Setiap naskah akan melalui proses pemeriksaan administrasi, review substansi, dan penyuntingan sebelum diputuskan untuk diterbitkan.</li>
            </ol>

            {/* B */}
            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">B. STRUKTUR NASKAH</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Naskah harus disusun dengan sistematika sebagai berikut:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Judul</li>
              <li>Nama Penulis</li>
              <li>Afiliasi Penulis</li>
              <li>Alamat Email</li>
              <li>Abstrak</li>
              <li>Kata Kunci</li>
              <li>Pendahuluan</li>
              <li>Metode Penelitian</li>
              <li>Hasil dan Pembahasan</li>
              <li>Kesimpulan</li>
              <li>Ucapan Terima Kasih (Opsional)</li>
              <li>Daftar Pustaka</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">C. JUDUL</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Judul harus singkat, jelas, dan mencerminkan isi penelitian.</li>
              <li>Maksimal 20 kata.</li>
              <li>Ditulis menggunakan huruf kapital pada awal kata utama.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">D. ABSTRAK</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Ditulis dalam Bahasa Indonesia dan Bahasa Inggris.</li>
              <li>Panjang abstrak 150–250 kata.</li>
              <li>Memuat:
                <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                  <li>Latar belakang singkat</li>
                  <li>Tujuan penelitian</li>
                  <li>Metode penelitian</li>
                  <li>Hasil utama</li>
                  <li>Kesimpulan</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">E. KATA KUNCI</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Terdiri dari 3–5 kata atau frasa.</li>
              <li>Mencerminkan topik utama penelitian.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">F. PENDAHULUAN</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Pendahuluan harus memuat:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Latar belakang masalah.</li>
              <li>Rumusan masalah.</li>
              <li>Tujuan penelitian.</li>
              <li>Urgensi penelitian.</li>
              <li>Kebaruan (novelty) penelitian.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">G. METODE PENELITIAN</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Penulis wajib menjelaskan:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-4">
              <li>Jenis penelitian.</li>
              <li>Pendekatan penelitian.</li>
              <li>Sumber data.</li>
              <li>Teknik pengumpulan data.</li>
              <li>Teknik analisis data.</li>
            </ol>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Untuk penelitian hukum dapat menggunakan:</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Pendekatan yuridis normatif.</li>
              <li>Pendekatan yuridis empiris.</li>
              <li>Pendekatan perundang-undangan.</li>
              <li>Pendekatan kasus.</li>
              <li>Pendekatan konseptual.</li>
            </ul>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">H. HASIL DAN PEMBAHASAN</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Bagian ini harus:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Menyajikan hasil penelitian secara sistematis.</li>
              <li>Menganalisis temuan berdasarkan teori, konsep, atau regulasi yang relevan.</li>
              <li>Menunjukkan kontribusi penelitian terhadap pengembangan ilmu pengetahuan.</li>
              <li>Menghindari pengulangan isi pendahuluan.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">I. KESIMPULAN</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Kesimpulan harus:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Menjawab rumusan masalah.</li>
              <li>Menjelaskan temuan utama penelitian.</li>
              <li>Memberikan rekomendasi apabila diperlukan.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">J. DAFTAR PUSTAKA</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Menggunakan sumber yang relevan dan mutakhir.</li>
              <li>Minimal 15 referensi untuk artikel penelitian.</li>
              <li>Minimal 60% referensi berasal dari sumber primer.</li>
              <li>Menggunakan gaya sitasi APA Style Edisi 7 atau standar sitasi yang ditetapkan jurnal.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">K. FORMAT PENULISAN</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Ukuran kertas: A4.</li>
              <li>Font: Times New Roman.</li>
              <li>Ukuran font: 12 pt.</li>
              <li>Spasi: 1,5.</li>
              <li>Margin:
                <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                  <li>Atas: 3 cm</li>
                  <li>Bawah: 3 cm</li>
                  <li>Kiri: 4 cm</li>
                  <li>Kanan: 3 cm</li>
                </ul>
              </li>
              <li>Panjang artikel:
                <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                  <li>Minimal 5.000 kata.</li>
                  <li>Maksimal 10.000 kata.</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">L. ETIKA PUBLIKASI</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Penulis wajib:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Menjamin keaslian karya.</li>
              <li>Tidak melakukan plagiarisme.</li>
              <li>Tidak melakukan fabrikasi atau manipulasi data.</li>
              <li>Mengungkapkan konflik kepentingan apabila ada.</li>
              <li>Mematuhi seluruh kebijakan etika publikasi jurnal.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">M. PROSES REVIEW</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed">Setiap naskah akan melalui tahapan:</p>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Pemeriksaan administrasi.</li>
              <li>Pemeriksaan kesesuaian ruang lingkup.</li>
              <li>Peer Review.</li>
              <li>Revisi penulis.</li>
              <li>Keputusan editor.</li>
              <li>Publikasi.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">N. HAK CIPTA DAN LISENSI</h3>
            <ol className="list-decimal list-outside ml-5 space-y-2 text-academic-700 font-medium leading-relaxed mb-8">
              <li>Hak cipta tetap berada pada penulis.</li>
              <li>Penulis memberikan hak publikasi kepada jurnal.</li>
              <li>Artikel yang diterbitkan dapat diakses sesuai kebijakan lisensi yang ditetapkan jurnal.</li>
            </ol>

            <h3 className="text-lg md:text-xl font-bold font-serif text-brand-900 pt-6 mt-8 border-t border-academic-100 mb-4">O. KONTAK REDAKSI</h3>
            <p className="mb-4 text-academic-700 font-medium leading-relaxed"><strong>Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)</strong></p>
            <ul className="list-none space-y-2 text-academic-700 font-medium leading-relaxed">
              <li><strong>Email:</strong> redaksi@rjrakp.com</li>
              <li><strong>Website:</strong> rjrakp.com</li>
              <li><strong>Alamat:</strong> Gedung LSM MSRI, Jalan H.M. Joni No. 11, Kode Pos 20216, Medan, Sumatera Utara</li>
            </ul>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
