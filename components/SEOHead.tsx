import React from 'react';
import { Language } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  language?: Language;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "VIDHUNT - Global Shorts Finder | Find Viral YouTube Shorts & TikTok Videos Worldwide",
  description = "VIDHUNT helps you discover trending YouTube Shorts and viral videos from around the world. Find popular short-form content, analyze global trends, and boost your channel growth with our powerful video discovery tool.",
  keywords = "VIDHUNT, VidHunt, YouTube Shorts finder, viral videos, trending shorts, short video discovery, YouTube analytics, viral content finder, global video trends, TikTok videos, social media trends, content creator tools, video marketing, YouTube growth, 비드헌트, 쇼츠파인더, 쇼츠 검색, 바이럴 영상, 인기 쇼츠, ビッドハント, ショート動画ファインダー, バイラル動画, 维德亨特, 短视频搜索器, 病毒视频, विदहंट, शॉर्ट्स फाइंडर, वायरल वीडियो",
  url = "https://www.vidhunt.me/",
  image = "https://www.vidhunt.me/preview.png",
  type = "website",
  language = 'en',
  publishedTime,
  modifiedTime,
  author = "VIDHUNT"
}) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Update basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);
    
    // Update Open Graph tags
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:url', url);
    updateProperty('og:image', image);
    updateProperty('og:image:width', '1200');
    updateProperty('og:image:height', '630');
    updateProperty('og:type', type);
    
    // Update Twitter tags
    updateProperty('twitter:card', 'summary_large_image');
    updateProperty('twitter:title', title);
    updateProperty('twitter:description', description);
    updateProperty('twitter:url', url);
    updateProperty('twitter:image', image);
    
    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateProperty('article:published_time', publishedTime);
      }
      if (modifiedTime) {
        updateProperty('article:modified_time', modifiedTime);
      }
      updateProperty('article:author', author);
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
    
    // Update language
    document.documentElement.lang = language;
    
    // Update JSON-LD structured data for articles
    if (type === 'article') {
      const existingScript = document.querySelector('script[type="application/ld+json"]#article-schema');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'article-schema';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "url": url,
        "image": image,
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "author": {
          "@type": "Organization",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "VIDHUNT",
          "url": "https://www.vidhunt.me",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.vidhunt.me/favicon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "inLanguage": language
      });
      document.head.appendChild(script);
    }
  }, [title, description, keywords, url, image, type, language, publishedTime, modifiedTime, author]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;