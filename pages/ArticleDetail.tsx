import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Article } from '../types';
import { translations } from '../i18n/translations';
import { loadArticleFromFile, processContentWithImages, getThumbnailPath } from '../services/contentService';

interface ArticleDetailProps {
  language: Language;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        setError('Article ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // For now, we'll use page 1 (01 folder) as default
        const loadedArticle = await loadArticleFromFile(1, parseInt(id), language);
        
        if (loadedArticle) {
          // Process content to include proper image paths
          const processedContent = processContentWithImages(loadedArticle.content, 1);
          setArticle({ ...loadedArticle, content: processedContent });
          
          // Preload article images for better UX
          const img = new Image();
          img.src = getThumbnailPath(1, loadedArticle.id);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, language]);

  if (loading) {
    return (
      <main className="article-detail-container">
        <div className="article-detail-header">
          <Link to="/news" className="back-to-news-btn">
            ← Back to News
          </Link>
        </div>
        
        {/* Article Detail Skeleton */}
        <article className="article-detail" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          {/* Header Image Skeleton */}
          <div className="article-image-container">
            <div 
              className="article-header-image" 
              style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                height: '300px',
                width: '100%'
              }}
            ></div>
          </div>
          
          <div className="article-content">
            {/* Title Skeleton */}
            <div style={{ 
              height: '3rem', 
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
              backgroundSize: '200% 100%', 
              animation: 'shimmer 1.5s infinite',
              marginBottom: '2rem',
              borderRadius: '4px',
              width: '80%'
            }}></div>
            
            {/* Article Body Skeleton */}
            <div className="article-body">
              {/* First paragraph */}
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '1rem',
                borderRadius: '4px',
                width: '100%'
              }}></div>
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '1rem',
                borderRadius: '4px',
                width: '95%'
              }}></div>
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '2rem',
                borderRadius: '4px',
                width: '85%'
              }}></div>
              
              {/* Inline Image Skeleton */}
              <div style={{ 
                height: '200px', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '2rem',
                borderRadius: '8px',
                width: '100%'
              }}></div>
              
              {/* More paragraph skeletons */}
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '1rem',
                borderRadius: '4px',
                width: '90%'
              }}></div>
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '1rem',
                borderRadius: '4px',
                width: '100%'
              }}></div>
              <div style={{ 
                height: '1.2rem', 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', 
                backgroundSize: '200% 100%', 
                animation: 'shimmer 1.5s infinite',
                marginBottom: '2rem',
                borderRadius: '4px',
                width: '75%'
              }}></div>
            </div>
          </div>
        </article>
        
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

  if (error || !article) {
    return (
      <main className="article-detail-container">
        <div className="article-not-found">
          <h1>Article Not Found</h1>
          <p>{error || "The article you're looking for doesn't exist."}</p>
          <Link to="/news" className="back-to-news-btn">
            ← Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="article-detail-container">
      <div className="article-detail-header">
        <Link to="/news" className="back-to-news-btn">
          ← Back to News
        </Link>
      </div>

      <article className="article-detail">
        <div className="article-image-container">
          <img 
            src={getThumbnailPath(1, article.id)} 
            alt={article.title}
            className="article-header-image"
            loading="eager"
            onError={(e) => {
              // Fallback to placeholder if thumbnail fails to load
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'block';
            }}
          />
          <div className="article-image-placeholder" style={{ display: 'none' }}></div>
        </div>
        
        <div className="article-content">
          <h1 className="article-detail-title" lang={language}>{article.title}</h1>
          
          <div className="article-body">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('[IMAGE:')) {
                const imagePath = paragraph.match(/\[IMAGE:(.*?)\]/)?.[1];
                if (imagePath) {
                  return (
                    <div key={index} className="article-inline-image">
                      <img 
                        src={imagePath} 
                        alt={`Article image ${index + 1}`}
                        className="article-inline-image-actual"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'block';
                        }}
                      />
                      <div className="article-inline-image-placeholder" style={{ display: 'none' }}></div>
                    </div>
                  );
                }
                // Fallback for old [IMAGE] format
                return (
                  <div key={index} className="article-inline-image">
                    <div className="article-inline-image-placeholder"></div>
                  </div>
                );
              }
              
              if (paragraph.startsWith('[YOUTUBE:')) {
                const url = paragraph.match(/\[YOUTUBE:(.*?)\]/)?.[1];
                if (url) {
                  // Convert YouTube URL to embed URL
                  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                  if (videoId) {
                    return (
                      <div key={index} className="article-youtube-embed">
                        <iframe
                          width="100%"
                          height="400"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  }
                }
              }
              
              // Process markdown-style formatting
              const processedParagraph = paragraph
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
                .replace(/##(.*?)##/g, '<span style="font-size: 1.5em; font-weight: 600;">$1</span>') // ##text## -> large text
                .replace(/#(.*?)#/g, '<span style="font-size: 1.25em; font-weight: 500;">$1</span>') // #text# -> medium large text  
                .replace(/\\n/g, '<br>'); // \n -> <br>
              
              return (
                <p 
                  key={index} 
                  className="article-paragraph"
                  dangerouslySetInnerHTML={{ __html: processedParagraph }}
                />
              );
            })}
          </div>
        </div>
      </article>

      <div className="article-footer">
        <div className="article-share">
          <h3>Share this article</h3>
          <div className="share-buttons">
            <button 
              className="share-btn copy-link" 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast notification here
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArticleDetail;