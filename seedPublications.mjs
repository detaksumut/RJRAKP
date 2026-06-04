import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
globalThis.WebSocket = ws;

dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDcxOTYwLCJleHAiOjE5MzE2NDc5NjB9.placeholder_key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Logging in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'detaksumut@gmail.com',
    password: 'Mikr@210669Mpi'
  });

  if (authError) {
    console.error('Failed to log in as admin:', authError.message);
    return;
  }
  console.log('Logged in successfully. User ID:', authData.user.id);

  console.log('Fetching journals...');
  const { data: journals, error: journalErr } = await supabase.from('journals').select('*');
  if (journalErr || !journals || journals.length === 0) {
    console.error('Failed to fetch journals. Make sure migrations are run.', journalErr);
    return;
  }

  // Get admin user for submitter_id
  const { data: users, error: userErr } = await supabase.from('users').select('id').eq('role', 'admin').limit(1);
  if (userErr || !users || users.length === 0) {
    console.error('No admin user found to associate submissions. Run createAdmin.mjs first.', userErr);
    return;
  }
  const submitterId = users[0].id;

  console.log(`Using submitter_id: ${submitterId}`);

  // Seed sample publications for each journal
  for (const journal of journals) {
    console.log(`Seeding for journal: ${journal.name}`);

    // Update journal ISSNs if they are null
    let eIssn = journal.e_issn;
    let pIssn = journal.p_issn;
    if (!eIssn || !pIssn) {
      if (journal.slug === 'audit-kebijakan-publik') { eIssn = '2985-6485'; pIssn = '2985-6477'; }
      else if (journal.slug === 'hukum-dan-keadilan') { eIssn = '2985-7822'; pIssn = '2985-7814'; }
      else if (journal.slug === 'pendidikan-dan-pembelajaran') { eIssn = '2620-9519'; pIssn = '0216-261X'; }
      else if (journal.slug === 'teknik-dan-teknologi') { eIssn = '2985-9122'; pIssn = '2985-9114'; }
      else if (journal.slug === 'agama-dan-peradaban-islam') { eIssn = '2986-1211'; pIssn = '2986-1203'; }

      await supabase.from('journals').update({ e_issn: eIssn, p_issn: pIssn }).eq('id', journal.id);
      console.log(`Updated ISSNs for ${journal.name}`);
    }

    // 1. Create Volume
    const { data: volume, error: volErr } = await supabase.from('journal_volumes').insert({
      journal_id: journal.id,
      volume_number: 'Vol. 1',
      year: 2026,
      status: 'active'
    }).select().single();

    if (volErr) {
      console.error(`Error seeding volume for ${journal.name}:`, volErr.message);
      continue;
    }

    // 2. Create Issue
    const { data: issue, error: issueErr } = await supabase.from('journal_issues').insert({
      volume_id: volume.id,
      issue_number: 'No. 1',
      title: 'Edisi Perdana Januari-Juni 2026',
      description: `Edisi perdana menerbitkan artikel-artikel pilihan di bidang kajian ${journal.name}.`,
      status: 'published',
      publication_date: new Date().toISOString()
    }).select().single();

    if (issueErr) {
      console.error(`Error seeding issue for ${journal.name}:`, issueErr.message);
      continue;
    }

    // 3. Create Articles
    const sampleArticles = getSampleArticlesForJournal(journal.slug);
    for (let i = 0; i < sampleArticles.length; i++) {
      const art = sampleArticles[i];
      const { data: article, error: artErr } = await supabase.from('articles').insert({
        journal_id: journal.id,
        submitter_id: submitterId,
        title: art.title,
        abstract: art.abstract,
        keywords: art.keywords,
        status: 'published',
        manuscript_file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }).select().single();

      if (artErr) {
        console.error(`Error seeding article for ${journal.name}:`, artErr.message);
        continue;
      }

      // 4. Create Article Authors
      for (let j = 0; j < art.authors.length; j++) {
        const auth = art.authors[j];
        await supabase.from('article_authors').insert({
          article_id: article.id,
          full_name: auth.name,
          email: auth.email,
          affiliation: auth.affiliation,
          is_corresponding: j === 0,
          author_order: j + 1
        });
      }

      // 5. Create Publication
      await supabase.from('publications').insert({
        article_id: article.id,
        issue_number: 'No. 1',
        volume_number: 'Vol. 1',
        publication_date: new Date().toISOString(),
        doi: `10.47822/rjrakp.${journal.slug}.v1i1.${i + 1}`,
        pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        doi_status: 'registered'
      });
    }

    console.log(`Successfully seeded ${sampleArticles.length} publications for ${journal.name}`);
  }
  console.log('Seeding completed successfully!');
}

function getSampleArticlesForJournal(slug) {
  if (slug === 'audit-kebijakan-publik') {
    return [
      {
        title: 'Evaluasi Efektivitas Audit Kinerja atas Penyaluran Bantuan Sosial di Sumatera Utara',
        abstract: 'Penelitian ini bertujuan untuk mengevaluasi efektivitas audit kinerja yang dilakukan oleh BPKP dalam penyaluran bantuan sosial. Menggunakan metode kualitatif deskriptif, penelitian ini menemukan bahwa audit kinerja secara signifikan meningkatkan transparansi penyaluran bantuan sosial.',
        keywords: 'Audit Kinerja, Bantuan Sosial, BPKP, Transparansi',
        authors: [
          { name: 'Dr. Ahmad Siregar, M.Si.', email: 'ahmad@usu.ac.id', affiliation: 'Universitas Sumatera Utara' },
          { name: 'Rani Paramita, M.Ak.', email: 'rani@bpkp.go.id', affiliation: 'BPKP Perwakilan Sumut' }
        ]
      },
      {
        title: 'Analisis Akuntabilitas Keuangan Alokasi Dana Desa (ADD) pasca Pandemi COVID-19',
        abstract: 'Artikel ini mendiskusikan mekanisme pertanggungjawaban alokasi dana desa pasca pandemi di wilayah administrasi Deli Serdang. Temuan menunjukkan adanya peningkatan kepatuhan administratif namun masih kurang dalam aspek keterlibatan masyarakat.',
        keywords: 'Dana Desa, Akuntabilitas, Tata Kelola Keuangan',
        authors: [
          { name: 'Mhd. Yusuf Nasution, S.E., M.Si.', email: 'yusuf@unimed.ac.id', affiliation: 'Universitas Negeri Medan' }
        ]
      }
    ];
  } else if (slug === 'hukum-dan-keadilan') {
    return [
      {
        title: 'Perlindungan Hukum Hak Konsumen dalam Transaksi E-commerce Berbasis AI',
        abstract: 'Transaksi e-commerce berbasis AI melahirkan tantangan perlindungan hukum baru bagi konsumen terkait manipulasi harga dinamis. Studi ini mengkaji kesiapan UU Perlindungan Konsumen di Indonesia menghadapi era algoritma cerdas.',
        keywords: 'E-commerce, Hukum Konsumen, Kecerdasan Buatan',
        authors: [
          { name: 'Prof. Dr. Hendra Gunawan, S.H., M.Hum.', email: 'hendra@uisu.ac.id', affiliation: 'Universitas Islam Sumatera Utara' }
        ]
      },
      {
        title: 'Implementasi Restorative Justice dalam Penanganan Kasus Tindak Pidana Ringan Anak',
        abstract: 'Keadilan restoratif menawarkan pendekatan penyelesaian hukum non-penjara bagi anak. Penelitian normatif ini menganalisis implementasi restorative justice di tingkat kepolisian resor kota Medan.',
        keywords: 'Restorative Justice, Anak, Tindak Pidana Ringan',
        authors: [
          { name: 'Siti Aminah, S.H., M.H.', email: 'siti@uma.ac.id', affiliation: 'Universitas Medan Area' },
          { name: 'Budi Hartono, S.H.', email: 'budi@polri.go.id', affiliation: 'Polda Sumatera Utara' }
        ]
      }
    ];
  } else if (slug === 'pendidikan-dan-pembelajaran') {
    return [
      {
        title: 'Pengaruh Pembelajaran Hybrid berbasis Project-Based Learning terhadap Kemandirian Belajar Mahasiswa',
        abstract: 'Pembelajaran hybrid yang dikombinasikan dengan metode project-based learning dianalisis efektivitasnya terhadap kemandirian belajar. Hasil eksperimen kuasi menunjukkan signifikansi peningkatan kemandirian siswa secara terukur.',
        keywords: 'Hybrid Learning, Project-Based, Kemandirian Belajar',
        authors: [
          { name: 'Dr. Diana Sari, M.Pd.', email: 'diana.sari@unj.ac.id', affiliation: 'Universitas Negeri Jakarta' }
        ]
      },
      {
        title: 'Analisis Kesiapan Guru Sekolah Dasar dalam Menggunakan Kurikulum Merdeka Belajar',
        abstract: 'Penelitian survei ini memetakan kesiapan kompetensi pedagogis guru SD dalam merancang modul ajar Kurikulum Merdeka di sekolah dasar daerah tertinggal.',
        keywords: 'Kurikulum Merdeka, Guru SD, Kompetensi Pedagogis',
        authors: [
          { name: 'Fahmi Reza, M.Pd.', email: 'reza@unimed.ac.id', affiliation: 'Universitas Negeri Medan' }
        ]
      }
    ];
  } else if (slug === 'teknik-dan-teknologi') {
    return [
      {
        title: 'Rancang Bangun Sistem Monitoring IoT Kualitas Air Budidaya Ikan Nila Berbasis Tenaga Surya',
        abstract: 'Sistem monitoring kualitas air tambak ikan nila dirancang menggunakan mikrokontroler ESP32, sensor pH, dan kekeruhan. Data ditransmisikan secara real-time ke web server dengan daya mandiri solar panel.',
        keywords: 'IoT, Kualitas Air, Solar Panel, Budidaya Ikan',
        authors: [
          { name: 'Ir. Rian Hidayat, M.T.', email: 'rian@usu.ac.id', affiliation: 'Universitas Sumatera Utara' }
        ]
      }
    ];
  } else {
    return [
      {
        title: 'Kajian Filologi Naskah Klasik Islam Nusantara sebagai Sumber Etika Kebangsaan',
        abstract: 'Naskah keagamaan klasik nusantara memiliki pesan harmonisasi nilai keislaman dan kebangsaan. Studi hermeneutika ini menelaah teks naskah abad ke-18 karya ulama lokal.',
        keywords: 'Filologi, Islam Nusantara, Naskah Klasik, Etika',
        authors: [
          { name: 'Dr. H. Zainuddin, M.A.', email: 'zainuddin@uinsu.ac.id', affiliation: 'UIN Sumatera Utara' }
        ]
      }
    ];
  }
}

seed();
