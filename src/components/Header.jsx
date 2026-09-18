import React from 'react';
import { translations } from '../translations';

export default function Header({ lang, setLang, demoMode, setDemoMode }) {
  const t = translations[lang];
  return (
    <header className="header">
      <div>
        <div className="brand"><span>🌱</span><h1>{t.appTitle}</h1></div>
        <p className="subtitle">{t.subTitle} • Built for Bangladesh</p>
        <p className="tagline">{t.tagline}</p>
      </div>
      <div className="header-actions">
        <button className={`pill ${demoMode ? 'demo' : 'live'}`} onClick={() => setDemoMode(!demoMode)}>
          {demoMode ? '⚠️ DEMO MODE' : '🟢 LIVE DATA'}
        </button>
        <button className="pill language" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}>
          🌐 {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </div>
    </header>
  );
}