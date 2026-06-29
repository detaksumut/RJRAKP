// src/lib/plagiarism.ts

export interface PlagiarismResult {
  sentence: string;
  isPlagiarized: boolean;
  wordCount: number;
  sources?: string[];
}

export interface PlagiarismReport {
  totalSentences: number;
  checkedSentences: number; // Sentences >= 10 words
  plagiarizedSentences: number;
  plagiarismPercentage: number;
  results: PlagiarismResult[];
}

/**
 * Membuang bagian Daftar Pustaka atau Referensi dari teks.
 */
export function removeBibliography(text: string): string {
  // Regex untuk mencari header "Daftar Pustaka" atau "Referensi" dsb.
  // Case-insensitive, mempertimbangkan adanya baris baru sebelumnya.
  const regex = /(?:\n|^)\s*(?:DAFTAR PUSTAKA|REFERENSI|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|$)/i;
  const match = text.match(regex);
  
  if (match && match.index !== undefined) {
    // Kembalikan hanya teks sebelum daftar pustaka
    return text.substring(0, match.index);
  }
  return text;
}

/**
 * Memecah teks menjadi kalimat-kalimat.
 */
export function extractSentences(text: string): string[] {
  // Memecah berdasarkan titik, tanda tanya, tanda seru yang diikuti spasi atau akhir string.
  // Menghindari pemecahan pada singkatan seperti "Dr.", "Prof.", dll bisa kompleks, 
  // tapi kita pakai regex sederhana untuk sementara.
  const rawSentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  
  return rawSentences
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Menghitung jumlah kata dalam sebuah string.
 */
export function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

/**
 * Melakukan pengecekan plagiarisme ke Google Custom Search API.
 * 
 * CATATAN: Fungsi ini membutuhkan API Key dan Search Engine ID (CX).
 * Karena kita menjalankan di sisi klien, pastikan variabel environment tersedia.
 */
export async function checkSentencePlagiarism(sentence: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;

  // Jika API Key tidak ada, kita asumsikan simulasi (dummy mode)
  if (!apiKey || !cx) {
    console.warn("API Key Google Search tidak ditemukan. Menggunakan mode simulasi.");
    // Simulasi delay jaringan
    await new Promise(resolve => setTimeout(resolve, 500));
    // Secara acak menandai beberapa kalimat sebagai plagiat untuk demonstrasi UI
    if (Math.random() > 0.8) {
      return ["https://example.com/source-1"];
    }
    return [];
  }

  try {
    // Exact match query: menggunakan tanda kutip
    const query = encodeURIComponent(`"${sentence}"`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Gagal memanggil Google API:", await response.text());
      return [];
    }
    
    const data = await response.json();
    
    // Jika ada hasil pencarian
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => item.link);
    }
    
    return [];
  } catch (error) {
    console.error("Error saat mengecek ke Google:", error);
    return [];
  }
}
