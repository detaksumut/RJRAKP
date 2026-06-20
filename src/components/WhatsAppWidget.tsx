import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = '62811665212';
    const encodedText = encodeURIComponent(message || 'Halo Admin RJRAKP, saya ingin bertanya mengenai publikasi jurnal.');
    const waUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans no-print">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group cursor-pointer border-none outline-none"
          title="Hubungi Kami via WhatsApp"
        >
          {/* Ripple effect */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />
          
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M12.031 2c-5.524 0-10 4.48-10 10 0 1.954.563 3.775 1.533 5.316l-1.53 5.684 5.839-1.505c1.478.85 3.197 1.34 5.011 1.34 5.524 0 10-4.48 10-10s-4.476-10-10-10zm-.031 18c-1.634 0-3.17-.456-4.505-1.246l-.323-.191-3.35.863.88-3.265-.21-.334C3.696 14.53 3.2 12.825 3.2 11c0-4.852 3.948-8.8 8.8-8.8 4.851 0 8.8 3.948 8.8 8.8s-3.949 8.8-8.8 8.8zm4.704-6.493c-.258-.129-1.524-.752-1.76-.838-.236-.086-.407-.129-.579.129-.172.258-.666.838-.816.994-.15.156-.3.172-.558.043-.258-.129-1.089-.402-2.074-1.282-.767-.684-1.285-1.53-1.436-1.787-.15-.258-.016-.398.113-.526.116-.115.258-.3.387-.451.129-.15.172-.258.258-.43.086-.172.043-.322-.022-.451-.064-.13-.578-1.393-.794-1.91-.21-.505-.44-.436-.602-.444-.156-.008-.335-.01-.515-.01-.18 0-.472.067-.719.335-.246.268-.94.92-.94 2.24 0 1.32.96 2.593 1.096 2.772.137.18 1.888 2.88 4.575 4.04.639.277 1.137.442 1.527.566.643.204 1.228.175 1.691.106.516-.077 1.524-.623 1.738-1.226.215-.602.215-1.118.15-1.226-.064-.108-.236-.172-.494-.3z"/>
          </svg>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 text-left">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-academic-950 to-brand-900 text-white p-5 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <img src="/logo-rjrakp.png" alt="RJRAKP" className="w-7 h-7 object-contain brightness-0 invert" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-academic-950 rounded-full" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-wide">Redaksi RJRAKP</h4>
                <p className="text-[10px] text-brand-200 font-medium flex items-center gap-1">
                  Online &bull; Biasanya membalas cepat
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors cursor-pointer border-none bg-transparent outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-5 bg-slate-50 flex-1 min-h-[100px]">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[90%] text-xs text-slate-700 leading-relaxed font-medium">
              Halo! Ada yang bisa kami bantu terkait submisi, review, pembayaran reward, atau penerbitan artikel di RJRAKP? Silakan kirimkan pesan Anda di bawah ini. 😊
            </div>
          </div>

          {/* Chat Footer / Form */}
          <form onSubmit={handleStartChat} className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-[#25D366] hover:bg-[#20ba56] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0 border-none outline-none"
              title="Kirim ke WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
