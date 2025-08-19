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
  // Exclude IMAGE and other non-language markers
  const languageMarkerRegex = /\[(korea|korean|japan|japanese|china|chinese|spanish|french|german|dutch|portuguese|russian|hindi)\]/gi;
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
  let currentKey = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      contentStartIndex = i + 1;
      break;
    }
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      currentKey = key.trim();
      metadata[currentKey] = valueParts.join(':').trim();
    } else if (currentKey && line) {
      // Continue previous metadata field (multiline)
      metadata[currentKey] += '\n' + line;
    }
  }
  
  // Get content (everything after metadata)
  let sectionContent = lines.slice(contentStartIndex).join('\n').trim();
  
  // Additional cleanup: only remove isolated metadata lines (not part of actual content)
  // Only remove if the line starts with metadata pattern and is followed by a colon
  sectionContent = sectionContent.replace(/^(category|date):\s*.*$/gm, '').trim();
  
  // Remove multiple consecutive newlines
  sectionContent = sectionContent.replace(/\n\n+/g, '\n\n');
  
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
  // Hardcoded English article 1 for page 1
  if (pageNumber === 1 && articleId === 1 && language === 'en') {
    return {
      id: 1,
      title: "VIDHUNT vs. Regular YouTube Search.\nWhich is better?",
      excerpt: "There's a question many people are curious about. \"What's the difference between finding trending Shorts with VIDHUNT and searching videos directly on YouTube?\"",
      content: `The answer lies in the [scope of keyword search].

[IMAGE:01_image_1.png]

##See global trends at a glance

The biggest advantage of VIDHUNT is that it shows you [[purple: global Shorts by automatically converting your keyword into each country's language]] all at once.
For example, if you search 'cat,' it aggregates results in various languages like 'cat,' 'gato,' '고양이,' and '猫' and shows them together.
This way, you won't miss overseas viral content that hasn't been discovered domestically yet.

##Leverage the traits of the YouTube algorithm

YouTube's algorithm gives priority exposure to [[purple: videos on similar topics to content that is "currently" trending]].
Therefore, when producing a video or choosing a topic, it's important to identify the core elements that are most popular right now within your channel's category.

[IMAGE:01_image_2.png]

##Timing is the key to success

Here's an important tip.
YouTube values [[purple: a 100K-view video uploaded yesterday more than a 1M-view video from three months ago]].
So set your search window as short as possible. We recommend narrowing it to 7 days, or even 3 days, and producing Shorts in a planned way.
For older hit videos, there's a high chance many creators have already made similar content.
If you jump in late, the algorithm is less likely to prioritize your video.`,
      category: "Technology",
      date: "2025-08-18"
    };
  }

  // Hardcoded Japanese article 1 for page 1
  if (pageNumber === 1 && articleId === 1 && language === 'ja') {
    return {
      id: 1,
      title: "VIDHUNT VS YouTube一般検索。\nどちらが良いですか？",
      excerpt: "多くの方が疑問に思っている質問があります。「VIDHUNTで人気ショートを見つけることとYouTubeで直接動画を検索することに、どんな違いがありますか？」",
      content: `答えは[キーワード検索の範囲]にあります。

[IMAGE:01_image_1.png]

##世界のトレンドを一目で

VIDHUNTの最大の利点は、入力された[[purple: キーワードを各国の言語に自動変換して世界中のショートを]]一度に表示することです。
例えば「cat」と検索すると、「cat」「gato」「고양이」「猫」など様々な言語で検索された結果を統合して表示します。
これにより、国内ではまだ発見されていない海外のバイラルコンテンツも見逃すことなく見つけることができます。

##YouTubeアルゴリズムの特性を活用しましょう

YouTubeアルゴリズムは[[purple:「現在」トレンドになっているコンテンツと類似した主題]]の動画に優先的に露出させます。
したがって動画を制作したり主題を選定する際は、あなたのチャンネルカテゴリで今最も人気のある核心要素を把握することが重要です。

[IMAGE:01_image_2.png]

##タイミングこそ成功の鍵

ここで重要なヒントを一つお教えします。
YouTubeは[[purple:3か月前の100万再生よりも昨日アップされた10万再生の動画]]をより高く評価します。
したがって検索期間を可能な限り短く設定してください。**7日、さらには3日**程度に期間を絞って計画的にショートを制作することをお勧めします。
古い人気動画の場合、すでに他のクリエイターが類似したコンテンツを多く制作している可能性が高いです。
遅れて参入した状況では、アルゴリズムがあなたの動画を優先露出してくれない確率が高くなります。`,
      category: "Technology",
      date: "2025-08-18"
    };
  }

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
  console.log(`🔍 Loading articles for page ${pageNumber}, language: ${language}`);
  const articles: Article[] = [];

  // Hardcoded English article 1 for page 1
  if (pageNumber === 1 && language === 'en') {
    articles.push({
      id: 1,
      title: "VIDHUNT vs. Regular YouTube Search.\nWhich is better?",
      excerpt: "There's a question many people are curious about. \"What's the difference between finding trending Shorts with VIDHUNT and searching videos directly on YouTube?\"",
      content: `The answer lies in the [scope of keyword search].

[IMAGE:01_image_1.png]

##See global trends at a glance

The biggest advantage of VIDHUNT is that it shows you [[purple: global Shorts by automatically converting your keyword into each country's language]] all at once.
For example, if you search 'cat,' it aggregates results in various languages like 'cat,' 'gato,' '고양이,' and '猫' and shows them together.
This way, you won't miss overseas viral content that hasn't been discovered domestically yet.

##Leverage the traits of the YouTube algorithm

YouTube's algorithm gives priority exposure to [[purple: videos on similar topics to content that is "currently" trending]].
Therefore, when producing a video or choosing a topic, it's important to identify the core elements that are most popular right now within your channel's category.

[IMAGE:01_image_2.png]

##Timing is the key to success

Here's an important tip.
YouTube values [[purple: a 100K-view video uploaded yesterday more than a 1M-view video from three months ago]].
So set your search window as short as possible. We recommend narrowing it to 7 days, or even 3 days, and producing Shorts in a planned way.
For older hit videos, there's a high chance many creators have already made similar content.
If you jump in late, the algorithm is less likely to prioritize your video.`,
      category: "Technology",
      date: "2025-08-18"
    });
  }

  // Hardcoded Japanese article 1 for page 1
  if (pageNumber === 1 && language === 'ja') {
    articles.push({
      id: 1,
      title: "VIDHUNT VS YouTube一般検索。\nどちらが良いですか？",
      excerpt: "多くの方が疑問に思っている質問があります。「VIDHUNTで人気ショートを見つけることとYouTubeで直接動画を検索することに、どんな違いがありますか？」",
      content: `答えは[キーワード検索の範囲]にあります。

[IMAGE:01_image_1.png]

##世界のトレンドを一目で

VIDHUNTの最大の利点は、入力された[[purple: キーワードを各国の言語に自動変換して世界中のショートを]]一度に表示することです。
例えば「cat」と検索すると、「cat」「gato」「고양이」「猫」など様々な言語で検索された結果を統合して表示します。
これにより、国内ではまだ発見されていない海外のバイラルコンテンツも見逃すことなく見つけることができます。

##YouTubeアルゴリズムの特性を活用しましょう

YouTubeアルゴリズムは[[purple:「現在」トレンドになっているコンテンツと類似した主題]]の動画に優先的に露出させます。
したがって動画を制作したり主題を選定する際は、あなたのチャンネルカテゴリで今最も人気のある核心要素を把握することが重要です。

[IMAGE:01_image_2.png]

##タイミングこそ成功の鍵

ここで重要なヒントを一つお教えします。
YouTubeは[[purple:3か月前の100万再生よりも昨日アップされた10万再生の動画]]をより高く評価します。
したがって検索期間を可能な限り短く設定してください。**7日、さらには3日**程度に期間を絞って計画的にショートを制作することをお勧めします。
古い人気動画の場合、すでに他のクリエイターが類似したコンテンツを多く制作している可能性が高いです。
遅れて参入した状況では、アルゴリズムがあなたの動画を優先露出してくれない確率が高くなります。`,
      category: "Technology",
      date: "2025-08-18"
    });
  }

  // First try to load from localStorage (admin-created articles)
  const publishedArticles = getPublishedArticles(pageNumber, language);
  console.log(`📦 Found ${publishedArticles.length} published articles from localStorage`);
  articles.push(...publishedArticles);

  // Then try to load from file system (existing text files)
  try {
    const paddedPageNumber = pageNumber.toString().padStart(2, '0');
    console.log(`📁 Looking for files in /contents/${paddedPageNumber}/`);
    
    // Check for all available article files (1-10)
    for (let articleId = 1; articleId <= 10; articleId++) {
      const filename = `page${pageNumber}_article${articleId}_${language}.txt`;
      const url = `/contents/${paddedPageNumber}/${filename}`;
      console.log(`🔗 Trying to fetch: ${url}`);
      const response = await fetch(url);
      
      if (response.ok) {
        const content = await response.text();
        const parsed = parseContentFile(content, language);
        console.log(`✅ Successfully loaded article ${articleId}: "${parsed.title}" (excerpt: "${parsed.excerpt.substring(0, 50)}...")`);
        
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
      } else {
        console.log(`❌ Failed to load ${url}: ${response.status} ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error loading articles from files:', error);
  }

  console.log(`📊 Total articles loaded: ${articles.length}`);
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