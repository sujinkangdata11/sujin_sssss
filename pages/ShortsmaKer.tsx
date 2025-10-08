import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import SEOHead from '../components/SEOHead';
import InfoShorts from '../components/InfoShorts/InfoShorts';
import StoryShorts from '../components/StoryShorts/StoryShorts';
import YouTubeHoverPlayer from '../components/YouTubeHoverPlayer';

interface ShortsmaKerProps {
  language: Language;
}

const ShortsmaKer: React.FC<ShortsmaKerProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'maker' | 'analyzer'>('maker');
  const [hasSelectedMode, setHasSelectedMode] = useState(false);

  console.log('🔧 SHORTSMAKER TEST - Vercel deployment check');
  console.log('Current language:', language);
  console.log('Timestamp:', new Date().toISOString());

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'maker' || modeParam === 'analyzer') {
      setActiveTab(modeParam);
      setHasSelectedMode(true);
    } else {
      setHasSelectedMode(false);
    }
  }, [searchParams]);

  const handleModeSelect = (mode: 'maker' | 'analyzer') => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('mode', mode);
    setSearchParams(nextParams, { replace: false });
  };

  return (
    <>
      <SEOHead
        title="ShortsmaKer - AI-Powered YouTube Shorts Creator Tool | Coming Soon - VIDHUNT"
        description="Revolutionary AI tool for creating viral YouTube Shorts automatically. Generate trending content, optimize for YouTube algorithm, and scale your channel growth. Advanced shorts creation technology coming soon to VIDHUNT platform."
        url="https://www.vidhunt.me/shortsmaker"
        keywords="AI YouTube Shorts creator, automated video maker, viral shorts generator, AI content creation tool, YouTube automation software, shorts making AI, viral video generator, content creation automation, YouTube algorithm optimizer"
        language={language}
      />
      
      {/* Structured Data for ShortsmaKer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ShortsmaKer",
          "description": "AI-powered YouTube Shorts creator tool for generating viral content",
          "url": "https://www.vidhunt.me/shortsmaker",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser",
          "creator": {
            "@type": "Organization",
            "name": "VIDHUNT",
            "url": "https://www.vidhunt.me"
          },
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/ComingSoon",
            "description": "Coming Soon"
          },
          "featureList": [
            "AI-powered content generation",
            "Viral video creation",
            "YouTube algorithm optimization",
            "Automated shorts production"
          ]
        })
      }} />
      
      {/* Breadcrumb Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.vidhunt.me"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "ShortsmaKer",
              "item": "https://www.vidhunt.me/shortsmaker"
            }
          ]
        })
      }} />
      
      {/* Breadcrumb Navigation - Hidden from UI, kept for SEO */}
      <nav className="breadcrumb" style={{ display: 'none' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span style={{ color: '#4f46e5', fontWeight: '600' }}>ShortsmaKer</span>
      </nav>

      {hasSelectedMode ? (
        <>
          {/* Tab Navigation */}
          <div className="tab-navigation" style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px 16px 0 0',
            padding: '0 1rem'
          }}>
            <button
              onClick={() => setActiveTab('analyzer')}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === 'analyzer' ? '#4f46e5' : '#6b7280',
                fontWeight: activeTab === 'analyzer' ? '600' : '400',
                borderBottom: activeTab === 'analyzer' ? '2px solid #4f46e5' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                marginRight: '1rem'
              }}
            >
              지식쇼츠
            </button>
            <button
              onClick={() => setActiveTab('maker')}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === 'maker' ? '#4f46e5' : '#6b7280',
                fontWeight: activeTab === 'maker' ? '600' : '400',
                borderBottom: activeTab === 'maker' ? '2px solid #4f46e5' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              썰 쇼츠
            </button>
          </div>

          <main className="main-container" style={{
            position: 'relative' /* 원복용 삭제처리가능 - tab-navigation 위치 고정용 */
          }}>
            {/* Tab Content */}
            {activeTab === 'maker' ? (
              <div className="info-shorts-container" style={{ width: '100%' }}>
                <StoryShorts key="story-shorts" language={language} />
              </div>
            ) : (
              <div className="info-shorts-container" style={{ width: '100%' }}>
                <InfoShorts key="info-shorts" language={language} />
              </div>
            )}
          </main>
        </>
      ) : (
        <main className="main-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 120px)'
        }}>
          <div className="onboarding-card" style={{
            width: 'min(100%, 720px)',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '40px'
            }}>쇼츠 유형 선택하기</h1>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'nowrap',
              alignContent: 'flex-start'
            }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleModeSelect('analyzer')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleModeSelect('analyzer');
                  }
                }}
                style={{
                  width: '320px',
                  maxWidth: '100%',
                  height: '560px',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '12px',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#4338ca';
                  (e.currentTarget as HTMLDivElement).style.background = '#eef2ff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                  (e.currentTarget as HTMLDivElement).style.background = '#f9fafb';
                }}
              >
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>지식쇼츠</h2>
                <YouTubeHoverPlayer
                  videoId="M3a3pbfLc7Q"
                  style={{
                    width: '100%',
                    flexGrow: 1,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(67, 56, 202, 0.15)'
                  }}
                />
              </div>
              <button
                onClick={() => handleModeSelect('maker')}
                style={{
                  width: '320px',
                  maxWidth: '100%',
                  height: '560px',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4338ca';
                  e.currentTarget.style.background = '#eef2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: 0
                }}>썰 쇼츠</h2>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#6366f1',
                  background: '#eef2ff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px'
                }}>Coming Soon</span>
              </button>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default ShortsmaKer;
