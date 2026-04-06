import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import fr from './fr.json';
import en from './en.json';
import de from './de.json';
import ja from './ja.json';
import es from './es.json';
import it from './it.json';
import zh from './zh.json';
import ko from './ko.json';

const translations = { fr, en, de, ja, es, it, zh, ko };

export const LOCALES = [
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'ja', label: '日本語', flag: 'JA' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'zh', label: '中文', flag: 'ZH' },
  { code: 'ko', label: '한국어', flag: 'KO' },
];

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((code) => {
    if (translations[code]) {
      setLocaleState(code);
      localStorage.setItem('locale', code);
    }
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
