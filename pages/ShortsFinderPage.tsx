import React from 'react';
import { Language } from '../types';
import Home from './Home';
import SEOHead from '../components/SEOHead';

interface ShortsFinderPageProps {
  language: Language;
  onLanguageSelect: (language: Language) => void;
}

const ShortsFinderPage: React.FC<ShortsFinderPageProps> = ({ language, onLanguageSelect }) => {
  return (
    <>
      <SEOHead
        title="VIDHUNT - Global YouTube Shorts Finder | Discover Viral Videos Worldwide"
        description="Find trending YouTube Shorts from around the world with VIDHUNT's advanced search. Discover viral content, analyze global trends, and boost your channel growth."
        url="https://www.vidhunt.me/shorts-finder"
        keywords="YouTube Shorts finder, viral videos finder, global shorts search, trending shorts, YouTube algorithm, viral content discovery, shorts SEO tool, global video trends"
        language={language}
      />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb" style={{ padding: '1rem 2rem', fontSize: '0.9rem', color: '#64748b' }}>
        <span style={{ color: '#4f46e5', fontWeight: '600' }}>Shorts Finder</span>
      </nav>
      
      <Home language={language} onLanguageSelect={onLanguageSelect} />
    </>
  );
};

export default ShortsFinderPage;