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

  // Try to load from bundled content data as fallback
  try {
    const { contentData } = await import('../src/data/contentData.js');
    const filename = `page${pageNumber}_article${articleId}_${language}`;
    
    if (contentData[filename]) {
      const parsed = parseContentFile(contentData[filename], language);
      
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
    console.error('Error loading from bundled content:', error);
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

  // KO articles
  if (pageNumber === 1 && language === 'ko') {
    articles.push({
      id: 1,
      title: "VIDHUNT VS 유튜브 일반 검색.\n무엇이 낫나요?",
      excerpt: "많은 분들이 궁금해하시는 질문이 있습니다. \"VIDHUNT로 인기 쇼츠를 찾는 것과 유튜브에서 직접 영상을 검색하는 것, 무슨 차이가 있나요?\"",
      content: `답은 바로 [키워드 검색의 범위]에 있습니다.

[IMAGE:01_image_1.png]

##전 세계 트렌드를 한눈에

VIDHUNT의 가장 큰 장점은 여러분이 입력한 [[purple: 키워드를 각국의 언어로 자동 변환하여 전 세계 쇼초를]] 한 번에 보여준다는 것입니다.
예를 들어 'cat'라고 검색하면, 'cat', 'gato', '고양이', '猫' 등 다양한 언어로 검색된 결과를 통합해서 보여주죠. 
이렇게 하면 국내에서는 아직 발견되지 않은 해외의 바이럴 콘텐츠까지 놓치지 않고 찾을 수 있습니다.

##유튜브 알고리즘의 특성을 활용하세요

유튜브 알고리즘은 [[purple:"현재" 뜨고 있는 콘텐츠를 비슷한 주제]]의 영상들에게 우선적으로 노출시킵니다. 
따라서 영상을 제작하거나 주제를 선정할 때는 여러분 채널 카테고리에서 지금 가장 인기 있는 핵심 요소를 파악하는 것이 중요합니다.

[IMAGE:01_image_2.png]

##타이밍이 곧 성공의 열쇠

여기서 중요한 팁을 하나 드리겠습니다. 
유튜브는 [[purple:3개월 전 100만 조회수보다 어제 올라온 10만 영상]]을 더 높게 평가합니다.
따라서 검색 기간을 최대한 짧게 설정하세요. **7일, 심지어 3일** 정도로 기간을 좁혀서 계획적으로 쇼츠를 제작하는 것을 권장합니다.
오래된 인기 영상의 경우, 이미 다른 크리에이터들이 유사한 콘텐츠를 많이 제작했을 가능성이 높습니다.
늦게 뛰어든 상황에서는 알고리즘이 여러분의 영상을 우선 노출해주지 않을 확률이 높아집니다.`,
      category: "Technology",
      date: "2025-08-18"
    });
    // Add more Korean articles...
    for (let i = 2; i <= 10; i++) {
      // This will be populated by the bundled data fallback
    }
  }

  // First try to load from localStorage (admin-created articles)
  const publishedArticles = getPublishedArticles(pageNumber, language);
  console.log(`📦 Found ${publishedArticles.length} published articles from localStorage`);
  articles.push(...publishedArticles);

  // Fallback: add empty placeholder articles if not found
  // This ensures we always have the right number of articles for pagination
  for (let articleId = 1; articleId <= 10; articleId++) {
    if (!articles.find(a => a.id === articleId)) {
      articles.push({
        id: articleId,
        title: "Coming Soon",
        excerpt: "This article will be available soon.",
        content: "Content is being prepared.",
        category: "General",
        date: "2025-08-19"
      });
    }
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