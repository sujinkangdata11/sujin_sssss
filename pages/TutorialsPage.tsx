import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import SEOHead from '../components/SEOHead';

interface TutorialsPageProps {
  language: Language;
}

const TutorialsPage: React.FC<TutorialsPageProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  const tutorialVideos: Record<Language, string> = {
    en: 'tKlYb7j1W5M',        // 미국/영어
    ko: 'jv7Srh4afYY',        // 한국어
    ja: 'FUtBT1fM5V8',        // 일본어
    hi: 'uVGQWOTAupw',        // 힌디어
    zh: 'HqHXp3-ke8g',        // 중국어
    es: '6hVPAiebYpo',        // 스페인어
    fr: 'aRRM7y-6P0g',        // 프랑스어
    de: 'HIDYokH0AAc',        // 독일어
    nl: 'uIS5usGlw7A',        // 네덜란드어
    pt: 'BNBU9GG7B4w',        // 포르투갈어
    ru: 'a1ypC0nz80I'         // 러시아어
  };

  const languageNames: Record<Language, string> = {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    hi: 'हिन्दी',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    pt: 'Português',
    ru: 'Русский'
  };

  return (
    <>
      <SEOHead
        title="VIDHUNT Tutorials - How to Use YouTube Shorts Finder | Video Guides"
        description="Learn how to use VIDHUNT to find trending YouTube Shorts and viral videos. Step-by-step tutorials and guides for content creators and marketers."
        url="https://www.vidhunt.me/tutorials"
        keywords="VIDHUNT tutorial, YouTube Shorts guide, how to find viral videos, shorts finder tutorial, YouTube algorithm guide, viral content strategy"
        language={language}
      />

      <main className="tutorials-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ padding: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>&gt;</span>
          <span style={{ color: '#4f46e5', fontWeight: '600' }}>Tutorials</span>
        </nav>

        <div className="tutorials-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: '#f1f5f9', fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            VIDHUNT Tutorials
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Learn how to master YouTube Shorts discovery and boost your content strategy
          </p>
        </div>

        {/* Main Tutorial Video */}
        <div className="main-tutorial" style={{ marginBottom: '3rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '2rem', marginBottom: '1rem' }}>
              How to Use VIDHUNT - {languageNames[language]}
            </h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem' }}>
              <iframe
                src={`https://www.youtube.com/embed/${tutorialVideos[language]}`}
                title={`VIDHUNT Tutorial - ${languageNames[language]}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tutorial Topics */}
        <div className="tutorial-topics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: '1rem' }}>🔍 Finding Viral Shorts</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Discover how to search for trending YouTube Shorts across different countries and languages.
            </p>
            <ul style={{ color: '#cbd5e1', paddingLeft: '1.5rem' }}>
              <li>Global keyword search techniques</li>
              <li>Language-specific content discovery</li>
              <li>Trend analysis and timing</li>
              <li>Content performance metrics</li>
            </ul>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: '1rem' }}>📊 Understanding Analytics</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Learn to interpret VIDHUNT's analytics and metrics for better content strategy.
            </p>
            <ul style={{ color: '#cbd5e1', paddingLeft: '1.5rem' }}>
              <li>View count analysis</li>
              <li>Engagement rate interpretation</li>
              <li>Channel performance metrics</li>
              <li>Comparative analysis tools</li>
            </ul>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: '1rem' }}>🎯 Content Strategy</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Develop winning content strategies using VIDHUNT's insights and data.
            </p>
            <ul style={{ color: '#cbd5e1', paddingLeft: '1.5rem' }}>
              <li>Trending topic identification</li>
              <li>Optimal posting times</li>
              <li>Cross-cultural content adaptation</li>
              <li>Algorithm optimization tips</li>
            </ul>
          </div>
        </div>

        {/* Language-Specific Tutorials */}
        <div className="language-tutorials">
          <h2 style={{ color: '#f1f5f9', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Tutorials in Other Languages
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {Object.entries(languageNames).map(([langCode, langName]) => (
              <div key={langCode} style={{ background: '#374151', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>{langName}</h4>
                <a
                  href={`https://www.youtube.com/watch?v=${tutorialVideos[langCode as Language]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#4f46e5',
                    color: '#f1f5f9',
                    textDecoration: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Watch Tutorial
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section" style={{ marginTop: '4rem' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>How does VIDHUNT differ from regular YouTube search?</h4>
              <p style={{ color: '#94a3b8' }}>
                VIDHUNT searches across multiple countries and languages simultaneously, translating your keywords to discover global trends you might miss with regular YouTube search.
              </p>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Is VIDHUNT free to use?</h4>
              <p style={{ color: '#94a3b8' }}>
                Yes, VIDHUNT is completely free for content creators and marketers looking to discover trending YouTube Shorts and viral content.
              </p>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Which countries and languages are supported?</h4>
              <p style={{ color: '#94a3b8' }}>
                VIDHUNT supports 11 languages including English, Korean, Japanese, Chinese, Hindi, Spanish, French, German, Dutch, Portuguese, and Russian.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TutorialsPage;