import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Language, Article } from '../types';
import { translations } from '../i18n/translations';
import { loadArticlesForPage, getThumbnailPath } from '../services/contentService';

interface NewsProps {
  language: Language;
}

const News: React.FC<NewsProps> = ({ language }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading articles...
        </div>
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
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="featured-content">
          <h2 className="featured-title" lang={language}>{featuredArticle.title}</h2>
          <p className="featured-excerpt">{featuredArticle.excerpt}</p>
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
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="article-content">
              <h3 className="article-title" lang={language}>{article.title}</h3>
              <p className="article-excerpt">{article.excerpt}</p>
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