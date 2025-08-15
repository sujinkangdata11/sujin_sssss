import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ShortsmaKerProps {
  language: Language;
}

const ShortsmaKer: React.FC<ShortsmaKerProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  return (
    <main className="main-container">
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-description">
            Powerful tools for creating amazing short videos are being developed.
            <br />
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </main>
  );
};

export default ShortsmaKer;