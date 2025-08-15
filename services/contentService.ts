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
  const parts = fileContent.split(/^--$/gm);
  
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;
    
    // Check if section starts with language marker like [korea]
    const languageMatch = trimmedPart.match(/^\[(\w+)\]/);
    let languageCode = 'en'; // default to English
    let contentToParse = trimmedPart;
    
    if (languageMatch) {
      const langMarker = languageMatch[1].toLowerCase();
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
      
      languageCode = langMap[langMarker] || 'en';
      contentToParse = trimmedPart.replace(/^\[(\w+)\]\s*/, '');
    }
    
    // Parse metadata and content for this section
    const lines = contentToParse.split('\n');
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
    const content = lines.slice(contentStartIndex).join('\n').trim();
    
    sections.push({
      languageCode,
      metadata,
      content
    });
  }
  
  return sections;
};

export const parseContentFile = (fileContent: string, language: Language = 'en'): ParsedContent => {
  const sections = parseLanguageSections(fileContent);
  
  // Find section for requested language, fallback to English
  let targetSection = sections.find(s => s.languageCode === language);
  if (!targetSection) {
    targetSection = sections.find(s => s.languageCode === 'en') || sections[0];
  }
  
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
  try {
    const paddedPageNumber = pageNumber.toString().padStart(2, '0');
    const paddedArticleId = articleId.toString().padStart(2, '0');
    const filePath = `/contents/${paddedPageNumber}/${paddedArticleId}.txt`;
    
    const response = await fetch(filePath);
    if (!response.ok) {
      console.warn(`Article file not found: ${filePath}`);
      return null;
    }
    
    const fileContent = await response.text();
    const parsed = parseContentFile(fileContent, language);
    
    return {
      id: articleId,
      title: parsed.title,
      excerpt: parsed.excerpt,
      date: parsed.date,
      content: parsed.content,
      category: parsed.category
    };
  } catch (error) {
    console.error('Error loading article:', error);
    return null;
  }
};

export const loadArticlesForPage = async (pageNumber: number, language: Language = 'en'): Promise<Article[]> => {
  const articles: Article[] = [];
  const paddedPageNumber = pageNumber.toString().padStart(2, '0');
  
  // Try to load articles 01.txt through 10.txt
  for (let i = 1; i <= 10; i++) {
    const article = await loadArticleFromFile(pageNumber, i, language);
    if (article) {
      articles.push(article);
    }
  }
  
  return articles;
};

export const getImagePath = (pageNumber: number, imageName: string): string => {
  const paddedPageNumber = pageNumber.toString().padStart(2, '0');
  return `/contents/${paddedPageNumber}/${imageName}`;
};

export const getThumbnailPath = (pageNumber: number, articleId: number): string => {
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