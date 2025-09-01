import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Language } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { translations } from './i18n/translations';
import LanguageSelector from './components/LanguageSelector';
import Home from './pages/Home';
import ShortsmaKer from './pages/ShortsmaKer';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import AdminPanel from './admin/AdminPanel';

const Header: React.FC<{ language: Language; onLanguageSelect: (lang: Language) => void }> = ({ 
  language, 
  onLanguageSelect 
}) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  {/* URL 쿼리 파라미터에서 언어 감지하여 자동 업데이트 */}
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && urlLang !== language) {
      onLanguageSelect(urlLang);
    }
  }, [location.search, language, onLanguageSelect]);

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
          <img src="/vidhunt_logo.svg" alt="VidHunt Logo" className="header-logo" />
          <div className="header-divider"></div>
          <h1 className="header-title">
            {t('vidhuntTitle')}
          </h1>
        </Link>
        <div className="header-nav">
          {/* Desktop Navigation */}
          <div className="nav-buttons desktop-nav">
            <Link to="/" className={getNavButtonClass('/')}>{t('navShortsFinder')}</Link>
            <Link to="/shortsmaker" className={getNavButtonClass('/shortsmaker')}>{t('navShortsmaker')}</Link>
            <Link to="/news" className={getNavButtonClass('/news')}>{t('navNews')}</Link>
          </div>
          
          {/* Desktop Language Button */}
          <button onClick={() => setIsLangModalOpen(true)} className="language-button desktop-nav">
            <span className="language-emoji">{currentLanguageInfo.emoji}</span>
            <span className="language-text">{currentLanguageInfo.text}</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="mobile-menu-button"
            aria-label="Toggle mobile menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-buttons">
              <Link 
                to="/" 
                className={getNavButtonClass('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navShortsFinder')}
              </Link>
              <Link 
                to="/shortsmaker" 
                className={getNavButtonClass('/shortsmaker')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navShortsmaker')}
              </Link>
              <Link 
                to="/news" 
                className={getNavButtonClass('/news')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navNews')}
              </Link>
              <button 
                onClick={() => {
                  setIsLangModalOpen(true);
                  setIsMobileMenuOpen(false);
                }} 
                className="mobile-language-button"
              >
                <span className="language-emoji">{currentLanguageInfo.emoji}</span>
                <span className="language-text">{currentLanguageInfo.text}</span>
              </button>
            </div>
          </div>
        )}
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

// Function to detect browser language and map to supported languages
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  // Map browser language codes to our supported languages
  const languageMap: Record<string, Language> = {
    'ko': 'ko',
    'ko-kr': 'ko',
    'ja': 'ja', 
    'ja-jp': 'ja',
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh',
    'hi': 'hi',
    'hi-in': 'hi',
    'es': 'es',
    'es-es': 'es',
    'es-mx': 'es',
    'fr': 'fr',
    'fr-fr': 'fr',
    'de': 'de',
    'de-de': 'de',
    'nl': 'nl',
    'nl-nl': 'nl',
    'pt': 'pt',
    'pt-br': 'pt',
    'pt-pt': 'pt',
    'ru': 'ru',
    'ru-ru': 'ru'
  };

  // Check exact match first
  if (languageMap[browserLang]) {
    return languageMap[browserLang];
  }

  // Check language code only (e.g., 'en-US' -> 'en')
  const langCode = browserLang.split('-')[0];
  if (languageMap[langCode]) {
    return languageMap[langCode];
  }

  // Default to English if no match
  return 'en';
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(detectBrowserLanguage());
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  return (
    <Router>
      <div className="app-container">
        <Header language={language} onLanguageSelect={setLanguage} />
        
        <Routes>
          <Route path="/" element={<Home language={language} onLanguageSelect={setLanguage} />} />
          <Route path="/shortsmaker" element={<ShortsmaKer language={language} />} />
          <Route path="/news" element={<News language={language} />} />
          <Route path="/news/article/:id" element={<ArticleDetail language={language} />} />
          <Route path="/admin" element={<AdminPanel />} />
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
                
                {/* Hidden Admin Button */}
                <button 
                  onClick={() => window.location.href = '/admin'}
                  title="Admin Access"
                  className="footer-admin-btn"
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#6b7280',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    marginTop: '1rem',
                    float: 'right',
                    opacity: 0.3
                  }}
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;