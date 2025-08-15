import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Language } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { translations } from './i18n/translations';
import LanguageSelector from './components/LanguageSelector';
import Home from './pages/Home';
import ShortsmaKer from './pages/ShortsmaKer';
import News from './pages/News';

const Header: React.FC<{ language: Language; onLanguageSelect: (lang: Language) => void }> = ({ 
  language, 
  onLanguageSelect 
}) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const location = useLocation();

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  const currentLanguageInfo = useMemo(() => {
    const lang = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
    if (!lang) return { emoji: '', text: 'Language' };
    
    const nativeName = lang.nativeName;
    const spaceIndex = nativeName.indexOf(' ');
    if (spaceIndex === -1) return { emoji: '', text: nativeName };
    
    return {
      emoji: nativeName.substring(0, spaceIndex),
      text: nativeName.substring(spaceIndex + 1)
    };
  }, [language]);

  const getNavButtonClass = (path: string) => {
    const isActive = location.pathname === path;
    return `nav-button ${isActive ? 'active' : ''}`;
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-title-link">
          <h1 className="header-title">
            {t('vidhuntTitle')}
          </h1>
        </Link>
        <div className="header-nav">
          <div className="nav-buttons">
            <Link to="/" className={getNavButtonClass('/')}>{t('navShortsFinder')}</Link>
            <Link to="/shortsmaker" className={getNavButtonClass('/shortsmaker')}>{t('navShortsmaker')}</Link>
            <Link to="/news" className={getNavButtonClass('/news')}>{t('navNews')}</Link>
          </div>
          <button onClick={() => setIsLangModalOpen(true)} className="language-button">
            <span className="language-emoji">{currentLanguageInfo.emoji}</span>
            <span className="language-text">{currentLanguageInfo.text}</span>
          </button>
        </div>
      </div>
      
      <LanguageSelector 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)} 
        onSelect={onLanguageSelect} 
        currentLanguage={language} 
      />
    </header>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  return (
    <Router>
      <div className="app-container">
        <Header language={language} onLanguageSelect={setLanguage} />
        
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/shortsmaker" element={<ShortsmaKer language={language} />} />
          <Route path="/news" element={<News language={language} />} />
        </Routes>
        
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-left">
                <p className="footer-copyright">{t('footerCopyright')}</p>
                <div className="footer-description">
                  <p>{t('footerDescription1')}</p>
                  <p>{t('footerDescription2')}</p>
                </div>
              </div>
              <div className="footer-right">
                <a 
                  href="mailto:help.vidhunt@gmail.com"
                  className="footer-contact-link"
                >
                  {t('footerContactLink')}
                </a>
                <p className="footer-contact-desc" style={{whiteSpace: 'pre-line'}}>
                  {t('footerContactDesc')}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;