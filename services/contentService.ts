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
  const paddedPageNumber = pageNumber.toString().padStart(2, '0');
  
  // Load articles in parallel for better performance
  const articlePromises: Promise<Article | null>[] = [];
  
  // Only try to load articles that we know exist (01.txt, 02.txt for now)
  const knownArticleIds = [1, 2]; // Add more as needed
  
  for (const i of knownArticleIds) {
    articlePromises.push(loadArticleFromFile(pageNumber, i, language));
  }
  
  // Wait for all articles to load in parallel
  const results = await Promise.all(articlePromises);
  
  // Filter out null results and return valid articles
  return results.filter((article): article is Article => article !== null);
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