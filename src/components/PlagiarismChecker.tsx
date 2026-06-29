// src/components/PlagiarismChecker.tsx
import React, { useState, useEffect } from 'react';
import { 
  removeBibliography, 
  extractParagraphs, 
  countWords, 
  checkParagraphPlagiarism,
  PlagiarismResult,
  PlagiarismReport
} from '../lib/plagiarism';

interface PlagiarismCheckerProps {
  initialText?: string;
  autoCheck?: boolean;
}

export const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ initialText = '', autoCheck = false }) => {
  const [text, setText] = useState(initialText);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PlagiarismReport | null>(null);

  useEffect(() => {
    if (autoCheck && text.trim() && !isChecking && !report) {
      handleCheck();
    }
  }, [autoCheck, text]);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setReport(null);
    setProgress(0);

    // 1. Hapus daftar pustaka
    const cleanText = removeBibliography(text);
    
    // 2. Ekstrak paragraf
    const paragraphs = extractParagraphs(cleanText);
    
    const results: PlagiarismResult[] = [];
    let checkedCount = 0;
    let plagiarizedCount = 0;

    const targetParagraphs = paragraphs;
    const totalTarget = targetParagraphs.length;

    if (totalTarget === 0) {
      setIsChecking(false);
      setReport({
        totalParagraphs: paragraphs.length,
        checkedParagraphs: 0,
        plagiarizedParagraphs: 0,
        plagiarismPercentage: 0,
        results: []
      });
      return;
    }

    // 3. Cek per paragraf ke API
    for (let i = 0; i < targetParagraphs.length; i++) {
      const paragraph = targetParagraphs[i];
      const wordCount = countWords(paragraph);
      
      const sources = await checkParagraphPlagiarism(paragraph);
      const isPlagiarized = sources.length > 0;
      
      if (isPlagiarized) {
        plagiarizedCount++;
      }
      
      checkedCount++;
      
      results.push({
        sentence: paragraph, // keeping key as sentence for interface
        isPlagiarized,
        wordCount,
        sources
      });

      setProgress(Math.round(((i + 1) / totalTarget) * 100));
    }

    const percentage = Math.round((plagiarizedCount / checkedCount) * 100);

    setReport({
      totalParagraphs: paragraphs.length,
      checkedParagraphs: checkedCount,
      plagiarizedParagraphs: plagiarizedCount,
      plagiarismPercentage: percentage,
      results
    });

    setIsChecking(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Cek Plagiarisme Artikel</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Sistem akan memotong bagian Daftar Pustaka dan mengecek artikel secara per paragraf menggunakan pencarian Google.
      </p>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 min-h-[200px]"
        placeholder="Tempelkan teks artikel Anda di sini..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isChecking}
      />

      <button
        onClick={handleCheck}
        disabled={isChecking || !text.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? 'Sedang Mengecek...' : 'Mulai Pengecekan'}
      </button>

      {isChecking && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">Progres: {progress}%</p>
        </div>
      )}

      {report && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Hasil Pengecekan</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border text-center">
              <p className="text-gray-500 text-sm">Total Paragraf</p>
              <p className="text-2xl font-bold">{report.totalParagraphs}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md border text-center">
              <p className="text-blue-600 text-sm">Paragraf Diperiksa</p>
              <p className="text-2xl font-bold">{report.checkedParagraphs}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-md border text-center">
              <p className="text-red-600 text-sm">Terdeteksi Plagiat</p>
              <p className="text-2xl font-bold">{report.plagiarizedParagraphs}</p>
            </div>
            <div className={`p-4 rounded-md border text-center ${report.plagiarismPercentage > 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <p className="text-sm">Persentase</p>
              <p className="text-2xl font-bold">{report.plagiarismPercentage}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Detail Paragraf yang Diperiksa:</h4>
            {report.results.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Tidak ada paragraf yang ditemukan.</p>
            ) : (
              <ul className="space-y-3">
                {report.results.map((result, idx) => (
                  <li key={idx} className={`p-3 rounded-md border text-sm ${result.isPlagiarized ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                    <p className="mb-1">{result.sentence}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">
                        {result.wordCount} kata
                      </span>
                      {result.isPlagiarized ? (
                        <span className="text-red-600 font-bold">Terindikasi Plagiat!</span>
                      ) : (
                        <span className="text-green-600 font-bold">Aman</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
