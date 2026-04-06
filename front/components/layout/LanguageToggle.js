'use client';
import { useState, useRef, useEffect } from 'react';
import { useI18n, LOCALES } from '../../i18n/I18nContext';

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LOCALES.find(l => l.code === locale) || LOCALES[0];

  return (
    <div className="lang-selector" ref={ref}>
      <button className="lang-toggle" onClick={() => setOpen(!open)}>
        {current.flag}
      </button>

      {open && (
        <div className="lang-dropdown">
          {LOCALES.map(l => (
            <button
              key={l.code}
              className={`lang-option ${l.code === locale ? 'active' : ''}`}
              onClick={() => { setLocale(l.code); setOpen(false); }}
            >
              <span className="lang-flag">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
