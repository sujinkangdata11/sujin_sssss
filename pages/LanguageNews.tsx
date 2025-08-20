import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Language, Article } from '../types';
import { translations } from '../i18n/translations';
import { loadArticlesForPage, getThumbnailPath } from '../services/contentService';
import SEOHead from '../components/SEOHead';

const LanguageNews: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const language = (lang as Language) || 'en';
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const loadedArticles = await loadArticlesForPage(1, language);
        
        if (loadedArticles.length > 0) {
          setFeaturedArticle(loadedArticles[0]);
          setArticles(loadedArticles.slice(1));
          
          loadedArticles.forEach((article) => {
            const img = new Image();
            img.src = getThumbnailPath(1, article.id);
          });
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [language]);

  if (loading) {
    return (
      <main className="news-container">
        <div className="news-header">
          <h1 className="news-title">{languageNames[language]} News</h1>
          <p className="news-subtitle">Loading articles...</p>
        </div>
      </main>
    );
  }

  if (!featuredArticle) {
    return (
      <main className="news-container">
        <div className="news-header">
          <h1 className="news-title">{languageNames[language]} News</h1>
          <p className="news-subtitle">No articles found for this language.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="news-container">
      <SEOHead
        title={`${languageNames[language]} News | VIDHUNT - ${t('navNews')}`}
        description={`Discover trending YouTube Shorts news in ${languageNames[language]}. Stay updated with viral video trends and content strategies.`}
        url={`https://www.vidhunt.me/news/${lang}`}
        keywords={`VIDHUNT ${languageNames[language]} news, YouTube Shorts ${languageNames[language]}, viral videos ${languageNames[language]}, trending content ${languageNames[language]}`}
        language={language}
      />
      
      {/* Breadcrumb */}
      <nav className="breadcrumb" style={{ padding: '1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <Link to="/news" style={{ color: '#64748b', textDecoration: 'none' }}>News</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span style={{ color: '#4f46e5', fontWeight: '600' }}>{languageNames[language]}</span>
      </nav>

      <div className="news-header">
        <h1 className="news-title" lang={language}>{languageNames[language]} {t('navNews')}</h1>
        <p className="news-subtitle" lang={language}>
          Trending YouTube Shorts news and insights in {languageNames[language]}
        </p>
      </div>

      {/* Featured Article */}
      <Link to={`/news/article/${featuredArticle.id}`} className="featured-article">
        <div className="featured-image-placeholder featured-large-image">
          <img 
            src={getThumbnailPath(1, featuredArticle.id)} 
            alt={featuredArticle.title}
            className="thumbnail-image featured-thumbnail"
            loading="eager"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="featured-content">
          <h2 className="featured-title" lang={language} style={{ whiteSpace: 'pre-line' }}>
            {featuredArticle.title}
          </h2>
          <p 
            className="featured-excerpt"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(featuredArticle.excerpt
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/##(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>')
                .replace(/#(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>')
                .replace(/\n/g, '<br>'))
            }}
          />
          <button className="read-more-btn">Read More</button>
        </div>
      </Link>

      {/* Articles Grid */}
      <div className="articles-grid">
        {articles.map((article) => (
          <Link key={article.id} to={`/news/article/${article.id}`} className="article-card">
            <div className="article-image-placeholder article-small-image">
              <img 
                src={getThumbnailPath(1, article.id)} 
                alt={article.title}
                className="thumbnail-image small-thumbnail"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="article-content" style={{ textAlign: 'left', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <h3 className="article-title" lang={language} style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
                {article.title}
              </h3>
              <p 
                className="article-excerpt"
                style={{ textAlign: 'left' }}
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(article.excerpt
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/##(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>')
                    .replace(/#(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>')
                    .replace(/\n/g, '<br>'))
                }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Language Navigation */}
      <div className="language-nav" style={{ padding: '2rem 0', borderTop: '1px solid #374151', marginTop: '2rem' }}>
        <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Browse news in other languages:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(languageNames).map(([langCode, langName]) => (
            <Link 
              key={langCode}
              to={`/news/${langCode}`} 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: langCode === language ? '#4f46e5' : '#374151',
                color: '#f1f5f9', 
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                transition: 'background-color 0.2s'
              }}
            >
              {langName}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LanguageNews;