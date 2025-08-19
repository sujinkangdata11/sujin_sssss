import { Article, Language } from '../types';

interface ParsedContent {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  content: string;
}

interface LanguageSection {
  languageCode: string;
  metadata: Record<string, string>;
  content: string;
}

const parseLanguageSections = (fileContent: string): LanguageSection[] => {
  const sections: LanguageSection[] = [];
  
  console.log('File content preview:', fileContent.substring(0, 500));
  
  // Split by language markers like [korea], [Japanese], etc.
  const languageMarkerRegex = /\[(\w+)\]/g;
  const matches = [...fileContent.matchAll(languageMarkerRegex)];
  
  console.log('Found language markers:', matches.map(m => m[0]));
  
  if (matches.length === 0) {
    // No language markers found, treat entire content as English
    console.log('No language markers found, treating as English');
    const parsed = parseSection(fileContent, 'en');
    if (parsed) sections.push(parsed);
    return sections;
  }
  
  // First section (before any language marker) is English
  const firstMarkerIndex = matches[0].index!;
  if (firstMarkerIndex > 0) {
    const englishContent = fileContent.substring(0, firstMarkerIndex).trim();
    const parsed = parseSection(englishContent, 'en');
    if (parsed) sections.push(parsed);
  }
  
  // Process each language section
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const langMarker = match[1].toLowerCase();
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : fileContent.length;
    
    const sectionContent = fileContent.substring(startIndex, endIndex).trim();
    
    // Map language markers to codes
    const langMap: Record<string, string> = {
      'korea': 'ko',
      'korean': 'ko',
      'japan': 'ja',
      'japanese': 'ja',
      'china': 'zh',
      'chinese': 'zh',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'dutch': 'nl',
      'portuguese': 'pt',
      'russian': 'ru',
      'hindi': 'hi'
    };
    
    const languageCode = langMap[langMarker] || 'en';
    const parsed = parseSection(sectionContent, languageCode);
    if (parsed) sections.push(parsed);
  }
  
  return sections;
};

const parseSection = (content: string, languageCode: string): LanguageSection | null => {
  const lines = content.split('\n');
  const metadata: Record<string, string> = {};
  let contentStartIndex = 0;
  
  // Parse metadata (first few lines before empty line)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      contentStartIndex = i + 1;
      break;
    }
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  // Get content (everything after metadata)
  const sectionContent = lines.slice(contentStartIndex).join('\n').trim();
  
  if (!sectionContent && Object.keys(metadata).length === 0) {
    return null;
  }
  
  return {
    languageCode,
    metadata,
    content: sectionContent
  };
};

export const parseContentFile = (fileContent: string, language: Language = 'en'): ParsedContent => {
  const sections = parseLanguageSections(fileContent);
  
  console.log('Parsed sections:', sections.map(s => ({ lang: s.languageCode, title: s.metadata.title })));
  console.log('Looking for language:', language);
  
  // Find section for requested language, fallback to English
  let targetSection = sections.find(s => s.languageCode === language);
  if (!targetSection) {
    targetSection = sections.find(s => s.languageCode === 'en') || sections[0];
  }
  
  console.log('Selected section:', targetSection ? { lang: targetSection.languageCode, title: targetSection.metadata.title } : 'none');
  
  if (!targetSection) {
    return {
      title: 'Untitled',
      excerpt: '',
      category: 'General',
      date: new Date().toISOString().split('T')[0],
      content: ''
    };
  }
  
  return {
    title: targetSection.metadata.title || 'Untitled',
    excerpt: targetSection.metadata.excerpt || '',
    category: targetSection.metadata.category || 'General',
    date: targetSection.metadata.date || new Date().toISOString().split('T')[0],
    content: targetSection.content
  };
};

export const loadArticleFromFile = async (pageNumber: number, articleId: number, language: Language = 'en'): Promise<Article | null> => {
  // First check localStorage for published articles
  try {
    const articleKey = `article_${pageNumber}_${articleId}_${language}`;
    const storedArticle = localStorage.getItem(articleKey);
    
    if (storedArticle) {
      const article = JSON.parse(storedArticle);
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        date: article.date,
        content: article.content,
        category: article.category
      };
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }

  // Try to load from file system as fallback
  try {
    const paddedPageNumber = pageNumber.toString().padStart(2, '0');
    const filename = `page${pageNumber}_article${articleId}_${language}.txt`;
    const response = await fetch(`/contents/${paddedPageNumber}/${filename}`);
    
    if (response.ok) {
      const content = await response.text();
      const parsed = parseContentFile(content, language);
      
      return {
        id: articleId,
        title: parsed.title,
        excerpt: parsed.excerpt,
        date: parsed.date,
        content: parsed.content,
        category: parsed.category
      };
    }
  } catch (error) {
    console.error('Error loading from file system:', error);
  }

  return null;
};

export const loadArticlesForPage = async (pageNumber: number, language: Language = 'en'): Promise<Article[]> => {
  const articles: Article[] = [];

  // First try to load from localStorage (admin-created articles)
  const publishedArticles = getPublishedArticles(pageNumber, language);
  articles.push(...publishedArticles);

  // Then try to load from file system (existing text files)
  try {
    const paddedPageNumber = pageNumber.toString().padStart(2, '0');
    
    // Check for all available article files (1-10)
    for (let articleId = 1; articleId <= 10; articleId++) {
      const filename = `page${pageNumber}_article${articleId}_${language}.txt`;
      const response = await fetch(`/contents/${paddedPageNumber}/${filename}`);
      
      if (response.ok) {
        const content = await response.text();
        const parsed = parseContentFile(content, language);
        
        // Only add if not already in localStorage
        if (!articles.find(a => a.id === articleId)) {
          articles.push({
            id: articleId,
            title: parsed.title,
            excerpt: parsed.excerpt,
            content: parsed.content,
            category: parsed.category,
            date: parsed.date
          });
        }
      }
    }
  } catch (error) {
    console.error('Error loading articles from files:', error);
  }

  return articles.sort((a, b) => a.id - b.id);
};

// Helper function to get published articles from localStorage
const getPublishedArticles = (pageNumber: number, language: Language): Article[] => {
  try {
    const publishedArticlesKey = 'published_articles';
    const allPublished = JSON.parse(localStorage.getItem(publishedArticlesKey) || '[]');
    
    return allPublished
      .filter((article: any) => 
        article.pageNumber === pageNumber && 
        article.language === language &&
        article.published
      )
      .map((article: any) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        date: article.date
      }));
  } catch (error) {
    console.error('Error loading published articles:', error);
    return [];
  }
};

export const getImagePath = (pageNumber: number, imageName: string): string => {
  const paddedPageNumber = pageNumber.toString().padStart(2, '0');
  return `/contents/${paddedPageNumber}/${imageName}`;
};

export const getThumbnailPath = (pageNumber: number, articleId: number): string => {
  // Check localStorage first for published article thumbnails
  const thumbnailKey = `thumbnail_${pageNumber}_${articleId}`;
  const storedThumbnail = localStorage.getItem(thumbnailKey);
  
  if (storedThumbnail) {
    return storedThumbnail; // Return base64 data URL
  }
  
  // Fallback to file system
  const paddedPageNumber = pageNumber.toString().padStart(2, '0');
  const paddedArticleId = articleId.toString().padStart(2, '0');
  return `/contents/${paddedPageNumber}/${paddedArticleId}_thumbnail.png`;
};

export const processContentWithImages = (content: string, pageNumber: number): string => {
  // Replace [IMAGE:filename] with actual image paths
  return content.replace(/\[IMAGE:([^\]]+)\]/g, (match, filename) => {
    return `[IMAGE:${getImagePath(pageNumber, filename)}]`;
  });
};