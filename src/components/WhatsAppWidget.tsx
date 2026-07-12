import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  message: string;
  created_at: string;
  users?: { full_name: string } | null;
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guestName, setGuestName] = useState(() => localStorage.getItem('rjrakp_guest_name') || '');
  const [isAskingName, setIsAskingName] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and subscribe to real-time changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('global_chats')
        .select(`
          id, user_id, guest_name, message, created_at,
          users ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (data && !error) {
        setMessages(data.reverse());
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('public:global_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_chats' },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          if (newMessage.user_id) {
            // Fetch name for registered users
            supabase.from('users').select('full_name').eq('id', newMessage.user_id).single().then(({ data }) => {
              newMessage.users = data;
              setMessages((prev) => [...prev, newMessage]);
            });
          } else {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Guest name prompt logic
    if (!user && !guestName) {
      setIsAskingName(true);
      return;
    }

    const currentMsg = message;
    setMessage(''); // Optimistic clear
    
    const { error } = await supabase.from('global_chats').insert([
      {
        user_id: user ? user.id : null,
        guest_name: user ? null : guestName,
        message: currentMsg
      }
    ]);

    if (error) {
      console.error("Error sending message", error);
      setMessage(currentMsg); // Revert on error
    }
  };

  const handleSetGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    localStorage.setItem('rjrakp_guest_name', guestName);
    setIsAskingName(false);
    handleStartChat(e); // Proceed sending the message
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans no-print">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#c9a84c] to-[#a3802b] text-academic-950 rounded-full shadow-[0_4px_25px_rgba(201,168,76,0.5)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group cursor-pointer border border-[#c9a84c]/50 outline-none"
          title="Buka Global Discussion"
        >
          <span className="absolute inset-0 rounded-full bg-[#c9a84c]/30 animate-ping pointer-events-none" />
          <MessageCircle className="w-7 h-7 fill-current" />
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-[#c9a84c]/30 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 text-left h-[500px] max-h-[80vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#05050a] via-[#111120] to-[#05050a] text-white p-4 flex items-center justify-between border-b border-[#c9a84c]/20 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-[#c9a84c]/50">
                  <MessageCircle className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111120] rounded-full" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-wide text-[#c9a84c]">Global Discussion</h4>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  Forum Terbuka ASIA Index
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
          <div className="p-4 bg-slate-50 flex-1 overflow-y-auto flex flex-col gap-4">
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 max-w-[90%] text-sm text-slate-700 leading-relaxed font-medium self-start">
              Selamat datang di Forum Global RJRAKP! Silakan berdiskusi atau bertanya bebas di sini.
            </div>
            
            {messages.map((msg) => {
              const isMine = user ? msg.user_id === user.id : msg.guest_name === guestName && !msg.user_id;
              const senderName = msg.user_id ? 'Registered User' : msg.guest_name || 'Guest';
              
              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[10px] text-slate-400 font-bold mb-1 mx-2">{senderName}</span>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words ${isMine ? 'bg-[#d4b75a] text-slate-900 rounded-tr-none font-medium' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Form */}
          {isAskingName ? (
             <form onSubmit={handleSetGuestName} className="p-4 border-t border-[#c9a84c]/20 bg-white flex flex-col gap-2">
                <p className="text-xs text-slate-500 font-medium">Siapa nama Anda?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan nama Anda..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-grow border-2 border-[#d4b75a] rounded-full pl-6 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#d4b75a]/20 bg-white shadow-sm"
                    autoFocus
                  />
                  <button type="submit" className="px-6 py-3 bg-[#111120] text-[#c9a84c] rounded-full text-sm font-bold hover:bg-[#1a1a2e] transition-colors shadow-md">
                    OK
                  </button>
                </div>
             </form>
          ) : (
            <form onSubmit={handleStartChat} className="p-4 border-t border-[#c9a84c]/20 bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow border-2 border-[#d4b75a] rounded-full pl-6 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#d4b75a]/20 bg-white shadow-sm"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="w-12 h-12 rounded-full bg-[#eadd9e] hover:bg-[#d4b75a] text-[#856e29] flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 border-none outline-none disabled:opacity-50 disabled:hover:scale-100"
                title="Kirim Pesan"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
