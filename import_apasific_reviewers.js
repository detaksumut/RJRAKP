import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws'; // Polyfill for Node.js < 22

// Load .env file
const envConfig = fs.readFileSync('.env', 'utf8').split('\n');
for (let line of envConfig) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing from .env");
  process.exit(1);
}

global.WebSocket = WebSocket; // Assign polyfill
const supabase = createClient(supabaseUrl, supabaseKey);

const newReviewers = [
  { "date": "11/25/2025 12:43:16", "full_name": "Dr.Eko Cahyo Mayndarto,SE.,MM.,CMA.,CSRS.,CATr", "country": "Indonesia", "university": "Tama Jagakarsa University", "field": "Accounting", "address": "Asrama Brimob No.1 rt 001/02 Pasarminggu", "email": "ekocmayndarto@gmail.com", "phone": "6287886034909", "role": "reviewer", "status": "APPROVED" },
  { "date": "11/28/2025 19:03:12", "full_name": "LINCE BULUTODING", "country": "INDONESIA", "university": "UNIVERSITAS ISLAM NEGERI ALAUDDIN MAKASSAR", "field": "ACCOUNTING", "address": "PERM TAMAN BUNGA SUDIANG A/12 SUDIANG, JL. GOA RIA MAKASSAR", "email": "lince.bulutoding@uin-alauddin.ac.id", "phone": "081355148080", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/21/2025 10:13:59", "full_name": "NORFAIEZAH SAWANDI", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "PUSAT PENGAJIAN PERAKAUNAN, UUM, 06010 SINTOK KEDAH, MALAYSIA", "email": "ezah@uum.edu.my", "phone": "+60166129626", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:11:57", "full_name": "ARIFATUL HUSNA MOHD ARIFF", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "Accounting", "address": "Tunku Puteri Intan Safinaz School of Accountancy (TISSA-UUM), College of Business, Universiti Utara Malaysia", "email": "arifatul@uum.edu.my", "phone": "60124837913", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:25:51", "full_name": "Assoc. Prof. Ts. Dr. Aidi Ahmi", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting Information Systems, Information Science, Bibliometrics, Auditing, E-Commerce", "address": "Tunku Puteri Intan Safinaz School of Accountancy Universiti Utara Malaysia 06010 UUM Sintok, Kedah, Malaysia", "email": "aidi@uum.edu.my", "phone": "+601111105076", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:29:19", "full_name": "NOR AZIAH ABD MANAF", "country": "Malaysia", "university": "Tunku Puteri Intan Safinaz School of Accountancy/Universiti Utara Malaysia", "field": "Accounting", "address": "Tunku Puteri Intan Safinaz School of Accountancy, Universiti Utara Malaysia, 06010 UUM Sintok, Kedah", "email": "aziah960@uum.edu.my", "phone": "124015200", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:30:11", "full_name": "NOR ATIKAH SHAFAI", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "Universiti Utara Malaysia", "email": "noratikah@uum.edu.my", "phone": "+60195936932", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:31:17", "full_name": "MAZRAH MALIK @ MALEK", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY (TISSA-UUM), UNIVERSITI UTARA MALAYSIA", "email": "mazrah@uum.edu.my", "phone": "+60134882602", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:47:03", "full_name": "Azharudin Ali", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY Universiti Utara Malaysia 06010 Sintok Kedah Darul Aman, Malaysia", "email": "azharudin@uum.edu.my", "phone": "+60194553704", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:48:46", "full_name": "OOI SUE CHERN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "FINANCIAL REPORTING, GOVERNANCE, SOCIAL AND ENVIRONMENTAL ACCOUNTING", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, UNIVERSITI UTARA MALAYSIA, 06010, CHANGLUN KEDAH, MALAYSIA", "email": "suechern@uum.edu.my", "phone": "0060174811673", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 8:49:22", "full_name": "MOHD SYAHRIR BIN RAHIM", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "385 TUNKU INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, UUM COB, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH, MALAYSIA", "email": "syahrir@uum.edu.my", "phone": "60174713969", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:08:33", "full_name": "SAFRUL IZANI MOHD SALLEH", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY (TISSA), UNIVERSITI UTARA MALAYSIA", "email": "s.izani.mohd@uum.edu.my", "phone": "+601161048384", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:14:31", "full_name": "Profesor Dr Ram Al Jaffri Saad", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "TISSA UUM", "email": "ram@uum.edu.my", "phone": "+60195681574", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:16:21", "full_name": "ZAIMAH ZAINOL ARIFFIN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "EDUCATION", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, COLLEGE OF BUSINESS, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH, MALAYSIA", "email": "zaimah@uum.edu.my", "phone": "+60124151883", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:38:55", "full_name": "DR. SAIDATUL NURUL HIDAYAH JANNATUN NAIM NOR AHMAD", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING, TAXATION", "address": "NO 254, JALAN MUTIARA RESIDENCE 8, MUTIARA RESIDENCE, 06000, JITRA KEDAH", "email": "saidatul@uum.edu.my", "phone": "+60189524228", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:43:04", "full_name": "Ayoib Che Ahmad", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Auditing & Corporate Governance", "address": "Tunku Intan Shafinaz School of Accountancy (TISSA-UUM), Universiti Utara Malaysia", "email": "ayoib@uum.edu.my", "phone": "0194518080", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:46:11", "full_name": "PROF. DR. SITI ZABEDAH BINTI SAIDIN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, UNIVERSITI UTARA MALAYSIA (UUM), 06010 SINTOK, KEDAH, MALAYSIA", "email": "zabedah@uum.edu.my", "phone": "+60109007163", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:46:41", "full_name": "Tan Chee Yu", "country": "Malaysia", "university": "Tunku Puteri Intan Safinaz School of Accountancy, Universiti Utara Malaysia", "field": "Accounting", "address": "FPK 3.03 Bangunan Perakaunan, Kolej Perniagaan, Universiti Utara Malaysia, 06010 Sintok, Kedah Darul Aman, Malaysia.", "email": "cytan@uum.edu.my", "phone": "601137236558", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:56:49", "full_name": "Sitraselvi Chandren", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "06010 Sintok Kedah", "email": "sitraselvi@uum.edu.my", "phone": "0195272400", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 9:58:40", "full_name": "NOOR AFZA BINTI AMRAN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY (TISSA), UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH, MALAYSIA.", "email": "afza@uum.edu.my", "phone": "+006 0194001118", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 10:16:08", "full_name": "Dr. Muhammad Syahir Bin Abd. Wahab", "country": "Malaysia", "university": "Universiti Utara Malaysia, Sintok, Kedah", "field": "Accounting", "address": "No 65 Taman Sri Meranti, Changlun, Kedah Darul Aman, 06010, Kedah MALAYSIA", "email": "syahir@uum.edu.my", "phone": "0124099573", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 10:41:49", "full_name": "ARYATI JULIANA BINTI SULAIMAN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING (TAXATION)", "address": "Tunku Puteri Intan Safinaz School of Accountancy UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH", "email": "aryati@uum.edu.my", "phone": "0194460712", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 11:19:19", "full_name": "KU MAISURRAH KU BAHADOR", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TISSA - UUM School of Accountancy Universiti Utara Malaysia", "email": "kumaisurah@uum.edu.my", "phone": "+601 95059009", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 12:06:55", "full_name": "Saliza Binti Abdul Aziz", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting (Taxation)", "address": "Tunku Puteri Intan Safinaz School of Accountancy, Universiti Utara Malaysia, 06010 Sintok, Kedah", "email": "saliza@uum.edu.my", "phone": "+6019 4707650", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 12:10:02", "full_name": "Raja Haslinda Raja Mohd Ali", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "Tunku Puteri Intan Safinaz School of Accountancy, Universiti Utara Malaysia, Kedah, Malaysia", "email": "rj.linda@uum.edu.my", "phone": "0164182556", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 12:24:47", "full_name": "Azharudin Ali", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY Universiti Utara Malaysia 06010 Sintok Kedah Darul Aman, Malaysia", "email": "azharudin@uum.edu.my", "phone": "+60194572786", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 12:26:06", "full_name": "NOOR ASMA JAMALUDDIN", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "SCHOOL OF ACCOUNTANCY, UNIVERSITI UTARA MALAYSIA (UUM), 06010 SINTOK, KEDAH, MALAYSIA", "email": "noorasma@uum.edu.my", "phone": "+6013 4860137", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 12:26:59", "full_name": "Akilah Abdullah", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "Pusat Pengajian Perakaunan Tunku Puteri Intan Safinaz, Kolej Perniagaan, Universiti Utara Malaysia, 06010 UUM Sintok, Kedah, Malaysia", "email": "akilah@uum.edu.my", "phone": "0178672346", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 13:03:31", "full_name": "Dr. Lok Yee Huei", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "2-23-16 Solaria Residences, Medan Rajawali, 11900 Bayan Lepas, Pulau Pinang, Malaysia", "email": "lok.yee.huei@uum.edu.my", "phone": "+60 174880084", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 13:16:38", "full_name": "Wan Norhayati Wan Ahmad", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting, ESG", "address": "TISSA-UUM, Kolej Perniagaan, Universiti Utara Malaysia, 06010 Sintok, Kedah", "email": "wnwa@uum.edu.my", "phone": "+60162823959", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 14:25:37", "full_name": "IDAWATI IBRAHIM", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "TAXATION", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH, MALAYSIA", "email": "idawati@uum.edu.my", "phone": "+60126594828", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 14:53:51", "full_name": "ROHAIDA ABDUL LATIF", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TISSA-UUM", "email": "rohaida6466@gmail.com", "phone": "0194452757", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/22/2025 14:59:53", "full_name": "DR NADZIRAH BT MOHD SAID", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "35, TAMAN SEMARAK API, 06010 CHANGLUN, KEDAH", "email": "nadzirahsaid@uum.edu.my", "phone": "+60148278346", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 6:34:20", "full_name": "DR. MUHAMMAD HARITH BIN ZAHRULLAILI", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING INFORMATION SYSTEMS", "address": "UNIVERSITI UTARA MALAYSIA", "email": "mharith@uum.edu.my", "phone": "+60183222043", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 8:21:42", "full_name": "Ira Geraldina", "country": "Indonesia", "university": "Universitas Terbuka", "field": "Accounting", "address": "Jl. Komplek Prima Indah No. 6 Cirendeu Ciputat Tangerang Selatan Banten Indonesia", "email": "ira@ecampus.ut.ac.id", "phone": "081315515000", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 10:32:52", "full_name": "SAZALI SAAD", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TISSA-UUM, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK, KEDAH", "email": "sazali@uum.edu.my", "phone": "0194100207", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 11:37:18", "full_name": "Nur Azliani Haniza binti Che Pak", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "Pusat Pengajian Perakaunan Tunku Puteri Intan Safinaz (TISSA-UUM), Universiti Utara Malaysia, 06010 UUM Sintok, Kedah, Malaysia", "email": "azliani@uum.edu.my", "phone": "+60 12 695 3448", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 11:42:48", "full_name": "HAFIZAH MOHAMAD HSBOLLAH", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING INFORMATION SYSTEMS", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY, COLLEGE OF BUSINESS, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK KEDAH", "email": "hs.hafizah@uum.edu.my", "phone": "60134336703", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 11:48:25", "full_name": "Adura Binti Ahmad", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting, accountability and sustainability", "address": "433 Sephia, Jalan Sephia 2, Taman Tunku Sarina, 06000 Jitra, Kedah, Malaysia", "email": "uya0009@yahoo.com", "phone": "+601116323268", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 11:57:06", "full_name": "FATHIYYAH ABU BAKAR", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "Pusat Pengajian Perakaunan Tunku Puteri Intan Safinaz (TISSA-UUM), Universiti Utara Malaysia, 06000 Sintok, Kedah, Malaysia", "email": "fathiyyah@uum.edu.my", "phone": "+60194582803", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 12:02:14", "full_name": "HAFIZAH MOHAMAD HSBOLLAH", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING INFORMATION SYSTEMS", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTACY, UNIVERSITI UTARA MALAYSIA, 06010 SINTOK KEDAH MALAYSIA", "email": "hs.hafizah@uum.edu.my", "phone": "60134336703", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 13:25:41", "full_name": "ROKIAH ISHAK", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING", "address": "TISSA-UUM, UNIVERSITI UTARA MALAYSIA, SINTOK, KEDAH , MALAYSIA", "email": "rokiah@uum.edu.my", "phone": "60195908793", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 18:34:51", "full_name": "WAN NORHAYATI WAN AHMAD", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA", "field": "ACCOUNTING, ESG, SUSTAINABILITY", "address": "TUNKU PUTERI INTAN SAFINAZ SCHOOL OF ACCOUNTANCY Universiti Utara Malaysia 06010 Sintok Kedah, Malaysia", "email": "wnwa@uum.edu.my", "phone": "+60162823959", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/23/2025 21:09:32", "full_name": "FAIDZULAINI MUHAMMAD", "country": "MALAYSIA", "university": "UNIVERSITI UTARA MALAYSIA (UUM)", "field": "ACCOUNTING", "address": "260 TAMAN SRI CHANGLUN 2, JALAN PAUH, 06010 CHANGLOON, KEDAH.", "email": "faidzulaini@uum.edu.my", "phone": "019-4166101", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/24/2025 8:30:52", "full_name": "RINDA FITHRIYANA", "country": "INDONESIA", "university": "UNIVERSITAS PAHLAWAN TUANKU TAMBUSAI", "field": "ACCOUNTING", "address": "Jalan Sisingamangaraja no. 17 Bangkinang", "email": "rindauniversitaspahlawan@gmail.com", "phone": "082387800205", "role": "reviewer", "status": "APPROVED" },
  { "date": "12/26/2025 22:43:15", "full_name": "Zaimah binti Abdullah", "country": "Malaysia", "university": "Universiti Utara Malaysia", "field": "Accounting", "address": "School of Accounting, TISSA-UUM, UUM, 06010 Sintok, Kedah", "email": "zaimah2258@uum.edu.my", "phone": "60105131525", "role": "reviewer", "status": "APPROVED" },
  { "date": "1/5/2026 22:53:36", "full_name": "ISMUL MAULUDIN AL HABIB", "country": "INDONESIA", "university": "UNIVERSITAS PGRI ARGOPURO JEMBER", "field": "SAINS TANAMAN", "address": "Perumahan Griya Mangli Indah Blok O.31 Kaliwates Jember", "email": "Ismul.habib1982@gmail.com", "phone": "085258175761", "role": "reviewer", "status": "APPROVED" },
  { "date": "1/28/2026 19:47:29", "full_name": "Zul Azmi", "country": "Indonesia", "university": "Universitas Muhammadiyah Riau", "field": "Accounting", "address": "Jl. Tuanku Tambusai, d/a. Prodi Akuntansi, Fakultas Ekonomi dan Bisnis, Universitas Muhammadiyah Riau, Pekanbaru", "email": "zulazmi@umri.ac.id", "phone": "081371623199", "role": "reviewer", "status": "APPROVED" },
  { "date": "2/2/2026 11:35:42", "full_name": "Assoc. Prof. Wira Ramashar, SE., M.Ak., Ph.D", "country": "Indonesia", "university": "Universitas Muhammadiyah Riau", "field": "Accounting", "address": "Jln. Ababil No.7 Manyar Sakti, Simpang Baru, Bina Widya, Pekanbaru - Riau", "email": "wiraramashar@umri.ac.id", "phone": "+6285355924614", "role": "reviewer", "status": "APPROVED" },
  { "date": "2/25/2026 15:26:01", "full_name": "Saifhul Anuar Syahdan", "country": "Indonesia", "university": "Institut Bisnis dan Teknologi Kalimantan", "field": "Accounting", "address": "Jl. Brigjend H. Hasan Basry No. 9-11 Kayu tangi, Banjarmasin", "email": "saifhulanuarsyahdan@ibitek.ac.id", "phone": "085710766750", "role": "reviewer", "status": "APPROVED" },
  { "date": "2/26/2026 11:23:01", "full_name": "Masithah Akbar", "country": "Indonesia", "university": "Institut Bisnis dan Teknologi Kalimantan", "field": "Management", "address": "JL.Brigjend H.Hasan Basry No. 9-11 Banjarmasin", "email": "masithahakbar@ibitek.ac.id", "phone": "087746312340", "role": "reviewer", "status": "APPROVED" },
  { "date": "2/27/2026 7:20:50", "full_name": "Gemi Ruwanti", "country": "Indonesia", "university": "Institut Bisnis dan Teknologi Kalimantan", "field": "Accounting", "address": "Royal Mahatama Residence B4 Jl. P. Hidayatullah, Banua Anyar Banjarmasin South Kalimantan", "email": "gemiruwanti@ibitek.ac.id", "phone": "085348547742", "role": "reviewer", "status": "APPROVED" },
  { "date": "7/6/2026 15:11:49", "full_name": "ASRI ELIES ALAMANDA, S.H.,M.H", "country": "INDONESIA", "university": "UNIVERSITAS BOJONEGORO", "field": "LAW", "address": "JL. DIPONEGORO GG JIKEN NO 7 KEPATIHAN BOJONEGORO", "email": "alamandaelies@gmail.com", "phone": "0822 6164 3277", "role": "reviewer", "status": "APPROVED" },
  
  // Previous 5 demo reviewers from add_reviewers.js just in case they aren't there
  { "full_name": "Dr. Kiljamilawati, MH", "university": "Universitas Islam Negeri Alauddin Makassar", "country": "Indonesia", "role": "reviewer", "status": "APPROVED", "email": "kiljamilawati.akbar@uin-alauddin.ac.id", "field": "Law", "phone": "" },
  { "full_name": "Ikbar Pratama", "university": "Universitas Medan Area", "country": "Indonesia", "role": "reviewer", "status": "APPROVED", "email": "ikbar.p@gmail.com", "field": "Management", "phone": "" },
  { "full_name": "tri dessy fadillah", "university": "Institut Syekh Abdul Halim Hasan (IAHN) Binjai", "country": "Indonesia", "role": "reviewer", "status": "APPROVED", "email": "T.dessy91@gmail.com", "field": "Islamic Studies", "phone": "" },
  { "full_name": "Adrianus Marselus Nggoro", "university": "Universitas Katolik Indonesia Santu Paulus Ruteng", "country": "Indonesia", "role": "reviewer", "status": "APPROVED", "email": "adrianusnggoro567@gmail.com", "field": "Education", "phone": "" },
  { "full_name": "Dr.Wisanf Candra Bintari.S.E.,M.M", "university": "Universitas Muhammadiyah Sorong", "country": "Indonesia", "role": "reviewer", "status": "APPROVED", "email": "binaricandra@gmail.com", "field": "Management", "phone": "" }
];

async function addReviewersToRjrakp() {
  try {
    console.log(`Starting to add ${newReviewers.length} reviewers to RJRAKP...`);
    let addedCount = 0;
    
    for (let i = 0; i < newReviewers.length; i++) {
      let r = newReviewers[i];
      const password = "ReviewerPassword123!";
      
      // Attempt to register them to Supabase Auth so they have real accounts
      const { data, error } = await supabase.auth.signUp({
        email: r.email,
        password: password,
        options: {
          data: { full_name: r.full_name }
        }
      });
      
      const userId = data?.user?.id;
      
      if (userId) {
         // Insert into RJRAKP 'users' table (since it uses a custom users table that links to auth.users)
         // Note: Some databases might have triggers that automatically insert into users, so we use upsert
         const { error: userError } = await supabase.from('users').upsert({
           id: userId,
           full_name: r.full_name,
           email: r.email,
           phone: r.phone || null,
           role: 'reviewer',
           status: 'APPROVED',
           institution: r.university
         });
         
         if (userError) {
           console.log(`Note: User upsert error (might be handled by trigger) for ${r.email}:`, userError.message);
         }

         // Insert into RJRAKP 'reviewer_profiles' table
         const { error: profError } = await supabase.from('reviewer_profiles').upsert({
           user_id: userId,
           affiliation: r.university,
           expertise_area: r.field,
           academic_title: r.full_name.includes('Dr.') ? 'Dr.' : (r.full_name.includes('Prof.') ? 'Prof.' : null)
         }, { onConflict: 'user_id' }); // Assuming user_id is the conflict target

         if (profError) {
           console.log(`Error inserting reviewer profile for ${r.email}:`, profError.message);
         }
      } else {
         console.log(`Could not create auth user for ${r.email}. They might already exist.`);
      }
      
      addedCount++;
      console.log(`Processed: ${r.full_name} (${r.email})`);
    }

    console.log(`Successfully processed ${addedCount} reviewers to the RJRAKP system!`);
    
  } catch (e) {
    console.error("Script error:", e);
  }
}

addReviewersToRjrakp();
