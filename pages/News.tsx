import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Language, Article } from '../types';
import { translations } from '../i18n/translations';
import { loadArticlesForPage, getThumbnailPath } from '../services/contentService';
import SEOHead from '../components/SEOHead';

interface NewsProps {
  language: Language;
}

const News: React.FC<NewsProps> = ({ language }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const loadedArticles = await loadArticlesForPage(currentPage, language);
        
        if (loadedArticles.length > 0) {
          // First article becomes featured
          setFeaturedArticle(loadedArticles[0]);
          // Rest become regular articles
          setArticles(loadedArticles.slice(1));
          
          // Preload thumbnail images for better UX
          loadedArticles.forEach((article) => {
            const img = new Image();
            img.src = getThumbnailPath(currentPage, article.id);
          });
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage, language]);

  if (loading) {
    return (
      <main className="news-container">
        <div className="news-header">
          <h1 className="news-title" lang={language}>{t('navNews')}</h1>
          <p className="news-subtitle" lang={language}>{t('newsSubtitle')}</p>
        </div>
        
        {/* Loading Skeleton */}
        <div className="featured-article" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          <div className="featured-image-placeholder featured-large-image" style={{ background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>
          <div className="featured-content">
            <div style={{ height: '2rem', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '1rem', borderRadius: '4px' }}></div>
            <div style={{ height: '1rem', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '0.5rem', borderRadius: '4px', width: '80%' }}></div>
            <div style={{ height: '1rem', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', width: '60%' }}></div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `
        }} />
      </main>
    );
  }

  if (!featuredArticle) {
    return (
      <main className="news-container">
        <div className="news-header">
          <h1 className="news-title" lang={language}>{t('navNews')}</h1>
          <p className="news-subtitle" lang={language}>{t('newsSubtitle')}</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No articles found for this page.
        </div>
      </main>
    );
  }


  return (
    <main className="news-container">
      <SEOHead
        title={`${t('navNews')} | VIDHUNT - Discover Trending YouTube Shorts News`}
        description={`${t('newsSubtitle')} - Stay updated with the latest trends in YouTube Shorts and viral video content worldwide.`}
        url="https://www.vidhunt.me/news"
        keywords={`VIDHUNT news, YouTube Shorts news, viral video trends, trending content news, ${language === 'ko' ? '비드헌트 뉴스, 쇼츠 뉴스, 바이럴 영상 뉴스' : language === 'ja' ? 'ビッドハントニュース, ショート動画ニュース, バイラル動画ニュース' : language === 'zh' ? '维德亨特新闻, 短视频新闻, 病毒视频新闻' : 'shorts news, viral video news, trending shorts news'}`}
        language={language}
      />
      <div className="news-header">
        <h1 className="news-title" lang={language}>{t('navNews')}</h1>
        <p className="news-subtitle" lang={language}>{t('newsSubtitle')}</p>
      </div>

      {/* Featured Article */}
      <Link to={`/news/article/${featuredArticle.id}`} className="featured-article">
        <div className="featured-image-placeholder featured-large-image">
          <img 
            src={getThumbnailPath(currentPage, featuredArticle.id)} 
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
              __html: featuredArticle.excerpt
                .replace(/\r\n/g, '\n') // normalize line endings
                .replace(/\r/g, '\n') // normalize line endings
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
                .replace(/##(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // ##text -> larger text
                .replace(/#(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // #text -> larger text
                .replace(/\n/g, '<br>') 
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
                src={getThumbnailPath(currentPage, article.id)} 
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
                  __html: article.excerpt
                    .replace(/\r\n/g, '\n') // normalize line endings
                    .replace(/\r/g, '\n') // normalize line endings
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
                    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
                    .replace(/##(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // ##text -> larger text
                    .replace(/#(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // #text -> larger text
                    .replace(/\n/g, '<br>') 
                }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn active">1</button>
      </div>
    </main>
  );
};

export default News;