import React, { useEffect, useState, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('id');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Google Translate
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ar,de,fr,ru,zh-CN,ja,ko',
        autoDisplay: false
      }, 'google_translate_element');
      
      // Auto-apply saved language from localStorage
      const savedLang = localStorage.getItem('user_lang');
      if (savedLang && savedLang !== 'id') {
        applyLanguage(savedLang);
      }
    };

    // Append script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Trigger callback if google translate is already loaded
      if ((window as any).google && (window as any).google.translate) {
        if (window.googleTranslateElementInit) {
          window.googleTranslateElementInit();
        }
      }
    }
  }, []);

  const applyLanguage = (langCode: string) => {
    const selectEl = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
      setCurrentLang(langCode);
      localStorage.setItem('user_lang', langCode);
    } else {
      // Retry logic if the OJS Google Translate iframe is still injecting
      let retries = 0;
      const interval = setInterval(() => {
        const select = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = langCode;
          select.dispatchEvent(new Event('change'));
          setCurrentLang(langCode);
          localStorage.setItem('user_lang', langCode);
          clearInterval(interval);
        }
        retries++;
        if (retries > 12) {
          clearInterval(interval);
        }
      }, 250);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    applyLanguage(langCode);
    setIsOpen(false);
  };

  const currentLanguageObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Target element for Google Translate (must be hidden in DOM) */}
      <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-academic-700 hover:text-brand-900 bg-white border border-academic-200 rounded-lg shadow-sm hover:bg-academic-50 transition-all focus:outline-none"
      >
        <Globe className="w-4 h-4 text-academic-500" />
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
          {currentLanguageObj.flag} {currentLanguageObj.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-academic-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white border border-academic-200 shadow-xl focus:outline-none z-50 p-1.5 max-h-[300px] overflow-y-auto">
          <div className="py-0.5 space-y-0.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  currentLang === lang.code
                    ? 'bg-brand-50 text-brand-900 font-bold'
                    : 'text-academic-700 hover:bg-academic-50 hover:text-brand-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {currentLang === lang.code && (
                  <Check className="w-3.5 h-3.5 text-brand-600 stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
