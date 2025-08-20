import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import SEOHead from '../components/SEOHead';

interface ShortsmaKerProps {
  language: Language;
}

const ShortsmaKer: React.FC<ShortsmaKerProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  console.log('🔧 SHORTSMAKER TEST - Vercel deployment check');
  console.log('Current language:', language);
  console.log('Timestamp:', new Date().toISOString());

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
    </>
  );
};

export default ShortsmaKer;