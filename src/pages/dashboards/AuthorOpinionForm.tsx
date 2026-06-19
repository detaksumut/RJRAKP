import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered } from 'lucide-react';

export default function AuthorOpinionForm() {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [lecturerPhone, setLecturerPhone] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  // Strip HTML tags untuk validasi plain text
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor content once fetched (for editing mode)
  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleCommand = (e: React.MouseEvent, command: string, value: string = '') => {
    e.preventDefault();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorChange();
  };

  const handleListTypeWithoutEvent = (type: 'decimal' | 'upper-roman' | 'upper-alpha' | 'lower-alpha' | 'bullet') => {
    if (type === 'bullet') {
      document.execCommand('insertUnorderedList', false);
    } else {
      document.execCommand('insertOrderedList', false);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'OL') {
            (node as HTMLOListElement).style.listStyleType = type;
            break;
          }
          node = node.parentNode!;
        }
      }
    }
    handleEditorChange();
  };

  const handleListType = (e: React.MouseEvent, type: 'decimal' | 'upper-roman' | 'upper-alpha' | 'lower-alpha' | 'bullet') => {
    e.preventDefault();
    handleListTypeWithoutEvent(type);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Markdown-like auto bullet and numbering list triggers on Space
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent || '';
          const offset = range.startOffset;
          const startOfTextContent = text.substring(0, offset);

          if (startOfTextContent === '*' || startOfTextContent === '-') {
            e.preventDefault();
            textNode.textContent = text.substring(offset);
            handleListTypeWithoutEvent('bullet');
          } else if (startOfTextContent === '1.') {
            e.preventDefault();
            textNode.textContent = text.substring(offset);
            handleListTypeWithoutEvent('decimal');
          } else if (startOfTextContent === 'I.') {
            e.preventDefault();
            textNode.textContent = text.substring(offset);
            handleListTypeWithoutEvent('upper-roman');
          } else if (startOfTextContent === 'A.') {
            e.preventDefault();
            textNode.textContent = text.substring(offset);
            handleListTypeWithoutEvent('upper-alpha');
          } else if (startOfTextContent === 'a.') {
            e.preventDefault();
            textNode.textContent = text.substring(offset);
            handleListTypeWithoutEvent('lower-alpha');
          }
        }
      }
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchOpinion(id);
    }
  }, [id]);

  const fetchOpinion = async (opinionId: string) => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('opinions')
        .select('*')
        .eq('id', opinionId)
        .single();

      if (fetchErr) {
        throw new Error(fetchErr.message);
      }

      if (data) {
        if (data.user_id !== user?.id) {
          throw new Error("Anda tidak diizinkan mengedit opini ini.");
        }
        setTitle(data.title);
        setLecturerPhone(data.lecturer_phone);
        setContent(data.content);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data opini.");
      alert(err.message || "Gagal memuat data opini.");
      navigate('/dashboard/author/opinions');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')       // replace spaces with hyphens
      .replace(/-+/g, '-')        // remove double hyphens
      .trim();
    
    // add short random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${cleanText}-${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Selalu baca langsung dari DOM editor (state bisa stale karena async setState)
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : content;
    const plainContent = stripHtml(currentHtml);
    
    if (!title.trim() || !lecturerPhone.trim() || !plainContent.trim()) {
      const msg = "Semua kolom wajib diisi.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (plainContent.trim().length < 100) {
      const msg = `Isi tulisan opini terlalu pendek (${plainContent.trim().length} karakter). Tulis minimal 100 karakter.`;
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Sync content state dengan HTML terbaru sebelum submit
    const finalContent = currentHtml;

    setLoading(true);

    try {
      let finalSlug = '';
      let opinionData: any = null;

      if (isEditing && id) {
        // Fetch current slug to keep it consistent on update
        const { data: current } = await supabase
          .from('opinions')
          .select('slug')
          .eq('id', id)
          .single();
        
        finalSlug = current?.slug || generateSlug(title);

        const { data, error: updateErr } = await supabase
          .from('opinions')
          .update({
            title,
            lecturer_phone: lecturerPhone,
            content: finalContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        opinionData = data;
      } else {
        finalSlug = generateSlug(title);

        const { data, error: insertErr } = await supabase
          .from('opinions')
          .insert([{
            user_id: user?.id,
            title,
            lecturer_phone: lecturerPhone,
            content: finalContent,
            slug: finalSlug,
            status: 'published'
          }])
          .select()
          .single();

        if (insertErr) throw insertErr;
        opinionData = data;
      }

      // Kirim Notifikasi WhatsApp ke HP Dosen Pengampu
      const authorName = user?.full_name || 'Mahasiswa';
      const opinionUrl = `${window.location.origin}/opini/${finalSlug}`;
      const waMessage = `*NOTIFIKASI OPINI MAHASISWA (RJRAKP)*\n\nHalo Bapak/Ibu Dosen,\n\nMahasiswa Anda yang bernama *${authorName}* baru saja mengirimkan tulisan opini sebagai pemenuhan Tugas Jurnal dengan judul:\n\n*"${title}"*\n\nBapak/Ibu dapat membaca tulisan opini lengkap mahasiswa tersebut melalui tautan publik berikut:\n${opinionUrl}\n\nTerima kasih.\n_Rumah Jurnal RJRAKP_`;

      try {
        await supabase.functions.invoke('send-wa', {
          body: {
            target: lecturerPhone,
            message: waMessage
          }
        });
      } catch (waErr) {
        console.error("Gagal mengirim WhatsApp ke Dosen:", waErr);
        // We do not abort the process if WA fails, we just log it and inform the user
      }

      alert(isEditing ? "Opini berhasil diperbarui!" : "Opini berhasil dikirim dan link telah dikirimkan ke WhatsApp Dosen!");
      navigate('/dashboard/author/opinions');
    } catch (err: any) {
      console.error('Submit opini error:', err);
      const errMsg = err?.message || err?.details || err?.hint || JSON.stringify(err) || "Terjadi kesalahan saat menyimpan opini.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <Link 
            to="/dashboard/author/opinions" 
            className="inline-flex items-center gap-2 text-academic-500 hover:text-brand-700 font-semibold text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Opini Saya
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-academic-900 mb-2">
            {isEditing ? "Edit Opini Mahasiswa" : "Tulis Opini Baru"}
          </h1>
          <p className="text-academic-500">
            {isEditing 
              ? "Ubah data opini yang sudah Anda tulis." 
              : "Tuliskan opini Anda mengenai kebijakan publik atau fenomena sosial terkini."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-academic-200 shadow-sm overflow-hidden p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-academic-900 mb-2">
                Judul Opini <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500"
                placeholder="Masukkan judul opini Anda..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-academic-900 mb-1">
                Nomor HP Dosen Pengampu <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-academic-500 mb-2">
                Format nomor HP diawali angka 0 atau 62 (contoh: 08123456789 atau 628123456789). Link baca opini akan dikirim ke nomor ini via WhatsApp.
              </p>
              <input
                type="text"
                required
                value={lecturerPhone}
                onChange={(e) => setLecturerPhone(e.target.value)}
                className="w-full border border-academic-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500"
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-academic-900 mb-1">
                Isi Tulisan Opini <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-academic-500 mb-2">
                Tulis opini secara lengkap di sini. Tuliskan analisis kritis yang mendalam (minimal 100 karakter).
              </p>
              
              {/* Custom Rich Text Editor Toolbar */}
              <div className="bg-academic-50 border-t border-x border-academic-300 rounded-t-lg p-2 flex flex-wrap gap-1 items-center shadow-sm">
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'bold')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Tebal (Bold)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'italic')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Miring (Italic)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'underline')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Garis Bawah (Underline)"
                >
                  <Underline className="w-4 h-4" />
                </button>
                
                <div className="w-[1px] h-5 bg-academic-300 mx-1" />

                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'justifyLeft')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Rata Kiri"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'justifyCenter')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Rata Tengah"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'justifyRight')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Rata Kanan"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => handleCommand(e, 'justifyFull')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Rata Kiri Kanan (Justify)"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-academic-300 mx-1" />

                <button
                  type="button"
                  onMouseDown={(e) => handleListType(e, 'bullet')}
                  className="p-1.5 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors"
                  title="Daftar Bullets (•)"
                >
                  <List className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onMouseDown={(e) => handleListType(e, 'decimal')}
                  className="p-1 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors text-xs font-black px-1.5"
                  title="Daftar Angka (1, 2, 3)"
                >
                  1.
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleListType(e, 'upper-roman')}
                  className="p-1 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors text-xs font-black px-1.5"
                  title="Romawi Besar (I, II, III)"
                >
                  I.
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleListType(e, 'upper-alpha')}
                  className="p-1 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors text-xs font-black px-1.5"
                  title="Huruf Besar (A, B, C)"
                >
                  A.
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleListType(e, 'lower-alpha')}
                  className="p-1 text-academic-700 hover:bg-academic-200 hover:text-academic-900 rounded transition-colors text-xs font-black px-1.5"
                  title="Huruf Kecil (a, b, c)"
                >
                  a.
                </button>
              </div>

              {/* Rich Text Editor contentEditable Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onKeyDown={handleKeyDown}
                className="rich-text-editor rich-text-content w-full border border-academic-300 rounded-b-lg px-4 py-3 min-h-[350px] focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-academic-900 font-sans"
                placeholder="Tulis opini lengkap Anda di sini..."
                style={{ outline: 'none' }}
              />
            </div>

            <div className="pt-4 border-t border-academic-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-brand-700 text-white font-bold hover:bg-brand-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Send className="w-5 h-5" /> 
                    {isEditing ? "Perbarui Opini" : "Submit & Kirim ke WhatsApp Dosen"}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
