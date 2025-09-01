import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
//////주석////// useSearchParams 추가하여 쿼리 파라미터 처리
import { Language, Article } from '../types';
import { translations } from '../i18n/translations';
import { loadArticleFromFile, processContentWithImages, getThumbnailPath, loadArticlesForPage } from '../services/contentService';
import SEOHead from '../components/SEOHead';

interface ArticleDetailProps {
  language: Language;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  //////주석////// 쿼리 파라미터에서 언어 정보 가져오기
  const [searchParams] = useSearchParams();
  const urlLang = searchParams.get('lang') as Language;
  //////주석////// URL 쿼리 파라미터의 언어가 있으면 사용, 없으면 기본 언어 사용
  const effectiveLanguage = urlLang || language;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  //////주석////// effectiveLanguage 사용하여 번역 처리
  const t = (key: keyof typeof translations['en']) => translations[effectiveLanguage][key] || translations['en'][key];

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
        //////주석////// effectiveLanguage로 아티클 로딩
        const loadedArticle = await loadArticleFromFile(1, parseInt(id), effectiveLanguage);
        //////주석////// 기존: await loadArticleFromFile(1, parseInt(id), language);
        
        if (loadedArticle) {
          // Process content to include proper image paths
          const processedContent = processContentWithImages(loadedArticle.content, 1);
          setArticle({ ...loadedArticle, content: processedContent });
          
          // Preload article images for better UX
          const img = new Image();
          img.src = getThumbnailPath(1, loadedArticle.id);
          
          // Load related articles (exclude current article)
          //////주석////// effectiveLanguage로 관련 아티클 로딩
          const allArticles = await loadArticlesForPage(1, effectiveLanguage);
          //////주석////// 기존: await loadArticlesForPage(1, language);
          const filteredArticles = allArticles.filter(a => a.id !== loadedArticle.id);
          
          // Randomly select 2 articles
          const shuffled = filteredArticles.sort(() => 0.5 - Math.random());
          setRelatedArticles(shuffled.slice(0, 2));
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
  //////주석////// effectiveLanguage를 dependency에 추가
  }, [id, effectiveLanguage]);
  //////주석////// 기존: }, [id, language]);

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
      <SEOHead
        title={`${article.title} | VIDHUNT News`}
        description={article.excerpt || `${article.title} - Discover the latest trends in YouTube Shorts and viral video content on VIDHUNT.`}
        url={`https://www.vidhunt.me/news/${id}`}
        image={`https://www.vidhunt.me${getThumbnailPath(1, article.id)}`}
        type="article"
        language={language}
        publishedTime={article.date ? new Date(article.date).toISOString() : new Date().toISOString()}
        modifiedTime={new Date().toISOString()}
        keywords={`${article.title}, VIDHUNT news, YouTube Shorts, viral videos, trending content, ${language === 'ko' ? '비드헌트 뉴스, 쇼츠 뉴스, 바이럴 영상' : language === 'ja' ? 'ビッドハントニュース, ショート動画ニュース, バイラル動画' : language === 'zh' ? '维德亨特新闻, 短视频新闻, 病毒视频' : 'VidHunt news, shorts news, viral video news'}`}
      />
      
      {/* Article Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.excerpt,
          "url": `https://www.vidhunt.me/news/article/${id}`,
          "datePublished": article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "VIDHUNT"
          },
          "publisher": {
            "@type": "Organization",
            "name": "VIDHUNT",
            "url": "https://www.vidhunt.me"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.vidhunt.me/news/article/${id}`
          },
          "image": `https://www.vidhunt.me${getThumbnailPath(1, article.id)}`,
          "articleSection": "Technology",
          "keywords": `${article.title}, VIDHUNT, YouTube Shorts, viral videos`,
          "inLanguage": language
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
              "name": "News",
              "item": "https://www.vidhunt.me/news"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title.substring(0, 50) + (article.title.length > 50 ? '...' : ''),
              "item": `https://www.vidhunt.me/news/article/${id}`
            }
          ]
        })
      }} />
      
      {/* Breadcrumb Navigation - Hidden from UI, kept for SEO */}
      <nav className="breadcrumb" style={{ display: 'none' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <Link to="/news" style={{ color: '#64748b', textDecoration: 'none' }}>News</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span style={{ color: '#4f46e5', fontWeight: '600' }}>{article.title.substring(0, 50)}{article.title.length > 50 ? '...' : ''}</span>
      </nav>
      
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
          <h1 className="article-detail-title" lang={language} style={{ whiteSpace: 'pre-line' }}>
            {article.title}
          </h1>
          
          <div className="article-body">
            {(() => {
              // Split content by lines and process each element
              const lines = article.content.split('\n');
              const elements = [];
              let currentText = '';
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check for special content (images, youtube, dividers)
                if (line.trim().includes('[IMAGE:')) {
                  // Save current text if exists
                  if (currentText.trim() || currentText.includes('\n')) {
                    elements.push({ type: 'text', content: currentText, key: `text-${elements.length}` });
                    currentText = '';
                  }
                  // Add image
                  elements.push({ type: 'image', content: line.trim(), key: `img-${elements.length}` });
                } else if (line.trim().startsWith('[YOUTUBE:')) {
                  // Save current text if exists
                  if (currentText.trim() || currentText.includes('\n')) {
                    elements.push({ type: 'text', content: currentText, key: `text-${elements.length}` });
                    currentText = '';
                  }
                  // Add youtube
                  elements.push({ type: 'youtube', content: line.trim(), key: `yt-${elements.length}` });
                } else if (line.trim() === '---') {
                  // Save current text if exists
                  if (currentText.trim() || currentText.includes('\n')) {
                    elements.push({ type: 'text', content: currentText, key: `text-${elements.length}` });
                    currentText = '';
                  }
                  // Add divider
                  elements.push({ type: 'divider', content: '---', key: `divider-${elements.length}` });
                } else {
                  // Add to current text (preserve all line breaks)
                  if (currentText || line) {
                    if (currentText) currentText += '\n';
                    currentText += line;
                  }
                }
              }
              
              // Add remaining text
              if (currentText.trim() || currentText.includes('\n')) {
                elements.push({ type: 'text', content: currentText, key: `text-${elements.length}` });
              }
              
              return elements.map(element => {
                if (element.type === 'image') {
                  const imageName = element.content.match(/\[IMAGE:(.*?)\]/)?.[1];
                  if (imageName) {
                    console.log('Looking for image:', imageName);
                    
                    // Check for published image in localStorage
                    const imageKey = `published_image_${imageName}`;
                    const imageData = localStorage.getItem(imageKey);
                    
                    if (imageData) {
                      return (
                        <div key={element.key} className="article-inline-image">
                          <img 
                            src={imageData} 
                            alt="Article image"
                            className="article-inline-image-actual"
                            loading="lazy"
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </div>
                      );
                    } else {
                      const imagePath = imageName.startsWith('/') ? imageName : `/${imageName}`;
                      return (
                        <div key={element.key} className="article-inline-image">
                          <img 
                            src={imagePath} 
                            alt="Article image"
                            className="article-inline-image-actual"
                            loading="lazy"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.style.display = 'block';
                            }}
                          />
                          <div className="article-inline-image-placeholder" style={{ display: 'none' }}></div>
                        </div>
                      );
                    }
                  }
                  return null;
                } else if (element.type === 'youtube') {
                  const url = element.content.match(/\[YOUTUBE:(.*?)\]/)?.[1];
                  if (url) {
                    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                    if (videoId) {
                      return (
                        <div key={element.key} className="article-youtube-embed">
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
                  return null;
                } else if (element.type === 'divider') {
                  return (
                    <hr 
                      key={element.key} 
                      className="article-divider"
                      style={{ 
                        border: 'none',
                        borderTop: '1px solid #d1d5db',
                        margin: '2.5rem 0',
                        width: '100%',
                        height: '0',
                        backgroundColor: 'transparent'
                      }}
                    />
                  );
                } else if (element.type === 'text') {
                  // DEBUG: 줄바꿈 처리 확인
                  console.log('=== TEXT PROCESSING DEBUG ===');
                  console.log('Original element.content:', element.content);
                  console.log('Lines in content:', element.content.split('\n').length);
                  console.log('Content with escaped newlines:', element.content.replace(/\n/g, '\\n'));
                  
                  // Process markdown-style formatting
                  const processedText = element.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
                    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
                    .replace(/##(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // ##text -> larger text
                    .replace(/#(.+?)(?=\n|$)/g, '<span style="font-size: 1.2em; font-weight: 600;">$1</span>') // #text -> larger text
                    .replace(/\[\[purple:(.*?)\]\]/g, '<span style="color: #7c3aed; font-weight: 600;">$1</span>'); // [[purple:text]] -> purple text
                  
                  console.log('Processed text:', processedText);
                  
                  return (
                    <div 
                      key={element.key} 
                      className="article-text-block"
                      style={{ whiteSpace: 'pre-line' }}
                      dangerouslySetInnerHTML={{ __html: processedText }}
                    />
                  );
                }
                return null;
              });
            })()}
          </div>
        </div>
      </article>

      <div className="article-footer">
        <div className="article-share">
          <h3>{t('shareOrTryTitle')}</h3>
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
              {t('copyLinkButton')}
            </button>
            <Link 
              to="/" 
              className="share-btn try-now"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              {t('tryNowButton')}
            </Link>
          </div>
        </div>
        
        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="related-articles">
            <h3>{t('relatedArticlesTitle')}</h3>
            <div className="related-articles-grid">
              {relatedArticles.map((relatedArticle) => (
                <Link 
                  key={relatedArticle.id} 
                  to={`/news/article/${relatedArticle.id}`} 
                  className="related-article-card"
                >
                  <h4>{relatedArticle.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ArticleDetail;