import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Language } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { translations } from './i18n/translations';
import LanguageSelector from './components/LanguageSelector';
// Google Drive 서비스는 더 이상 사용하지 않음 (CloudflareService로 대체됨)

//// 🏠 홈 페이지만 즉시 로딩 (사용자가 가장 많이 사용하는 페이지)
import Home from './pages/Home';

//// 📦 코드 분할: 나머지 페이지들은 필요할 때만 로딩 (첫 로딩 속도 향상)
//// React.lazy()로 동적 import - 클릭할 때만 다운로드됨
const ChannelFinder = React.lazy(() => import('./pages/ChannelFinder'));
const ShortsmaKer = React.lazy(() => import('./pages/ShortsmaKer'));
const News = React.lazy(() => import('./pages/News'));
const ArticleDetail = React.lazy(() => import('./pages/ArticleDetail'));
const AdminPanel = React.lazy(() => import('./admin/AdminPanel'));
const Test = React.lazy(() => import('./pages/Test'));

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
            <Link to="/channelfinder" className={getNavButtonClass('/channelfinder')}>{t('navChannelFinder')}</Link>
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
                to="/channelfinder" 
                className={getNavButtonClass('/channelfinder')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navChannelFinder')}
              </Link>
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

const TOTAL_VISIT_KEY = 'vidhunt_total_visits';
const DAILY_VISIT_KEY = 'vidhunt_daily_visits';
const DAILY_DATE_KEY = 'vidhunt_daily_date';

const getKstDateKey = () => {
  const now = new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstMillis = utcMillis + 9 * 60 * 60000; // KST is UTC+9
  return new Date(kstMillis).toISOString().split('T')[0];
};

const formatVisitCount = (value: number) => {
  return Number.isFinite(value) ? value.toLocaleString() : '0';
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(detectBrowserLanguage());
  const [visitCounts, setVisitCounts] = useState(() => {
    if (typeof window === 'undefined') {
      return { total: 0, daily: 0 };
    }

    try {
      const storedTotal = Number.parseInt(window.localStorage.getItem(TOTAL_VISIT_KEY) ?? '0', 10);
      const storedDaily = Number.parseInt(window.localStorage.getItem(DAILY_VISIT_KEY) ?? '0', 10);
      const storedDate = window.localStorage.getItem(DAILY_DATE_KEY);
      const today = getKstDateKey();

      const total = Number.isFinite(storedTotal) ? storedTotal : 0;
      const daily = storedDate === today && Number.isFinite(storedDaily) ? storedDaily : 0;

      return { total, daily };
    } catch {
      return { total: 0, daily: 0 };
    }
  });
  const hasRecordedVisit = useRef(false);
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  // 📝 Google Drive 설정 함수 제거됨 (CloudflareService로 대체됨)
  // 이제 채널 데이터는 ChannelFinder에서 CloudflareService를 통해 자동으로 로드됩니다.

  useEffect(() => {
    if (typeof window === 'undefined' || hasRecordedVisit.current) {
      return;
    }

    hasRecordedVisit.current = true;

    try {
      const today = getKstDateKey();
      const total = Number.parseInt(window.localStorage.getItem(TOTAL_VISIT_KEY) ?? '0', 10);
      const daily = Number.parseInt(window.localStorage.getItem(DAILY_VISIT_KEY) ?? '0', 10);
      const storedDate = window.localStorage.getItem(DAILY_DATE_KEY);

      const safeTotal = Number.isFinite(total) ? total : 0;
      const safeDaily = Number.isFinite(daily) ? daily : 0;

      const nextTotal = safeTotal + 1;
      const nextDaily = storedDate === today ? safeDaily + 1 : 1;

      window.localStorage.setItem(TOTAL_VISIT_KEY, String(nextTotal));
      window.localStorage.setItem(DAILY_VISIT_KEY, String(nextDaily));
      window.localStorage.setItem(DAILY_DATE_KEY, today);

      setVisitCounts({ total: nextTotal, daily: nextDaily });
    } catch (error) {
      console.error('Failed to record visit counters', error);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Header language={language} onLanguageSelect={setLanguage} />
        
        {/* 🔄 Suspense: 코드 분할된 페이지들이 로딩될 때 로딩 화면 표시 */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* 🏠 홈 페이지: 즉시 로딩 (코드 분할 X) */}
            <Route path="/" element={<Home language={language} onLanguageSelect={setLanguage} />} />
            
            {/* 📦 코드 분할된 페이지들: 클릭할 때만 로딩 */}
            <Route path="/channelfinder" element={<ChannelFinder language={language} />} />
            <Route path="/shortsmaker" element={<ShortsmaKer language={language} />} />
            <Route path="/news" element={<News language={language} />} />
            <Route path="/news/article/:id" element={<ArticleDetail language={language} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/test" element={<Test language={language} />} />
          </Routes>
        </Suspense>
        
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-left">
                <p className="footer-copyright">© 2025 Project VIDHUNT Corp.</p>
                <div className="footer-description">
                  <p>이 웹사이트의 저작권은 VIDHUNT에게 있습니다.</p>
                  <p>기능 사용에 대한 문의는 개발자에게 문의해주세요.</p>
                </div>
                <div className="footer-visit-stats">
                  <span className="footer-visit-label">누적 방문자 :</span>
                  <span className="footer-visit-value">{formatVisitCount(visitCounts.total)}</span>
                  <span className="footer-visit-divider">|</span>
                  <span className="footer-visit-label">일일 방문자 :</span>
                  <span className="footer-visit-value">{formatVisitCount(visitCounts.daily)}</span>
                </div>
              </div>
              <div className="footer-right">
                <a 
                  href="mailto:help.vidhunt@gmail.com"
                  className="footer-contact-link"
                >
                  개발자에게 문의하기
                </a>
                <p className="footer-contact-desc" style={{ whiteSpace: 'pre-line' }}>
                  {'원하는 기능이나 오류가 있다면\n언제든지 이메일로 알려주세요.'}
                </p>
                <div className="footer-admin-wrapper">
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
                      opacity: 0.3
                    }}
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
