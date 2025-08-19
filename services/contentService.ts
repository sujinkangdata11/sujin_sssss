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

  // ALL HARDCODED CONTENT - 109 articles across 11 languages

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
    articles.push({
      id: 2,
      title: "YouTube Data\n10초 만에 무료 발급받기.",
      excerpt: "YouTube의 모든 데이터를",
      content: `##YouTube Data API v3가 뭔가요?

데이터 API? 이게 뭘까요? 처음 듣는 분들이 많을텐데요, 걱정하지 마세요! 

"돈을 내야 하나요?" → 아니요, [[purple:완전 무료입니다.]]
"신용카드가 필요한가요?" → [[purple:전혀 필요 없습니다.]]
"어려운가요?" → [[purple:10세 어린이도 할 수 있어요.]]

YouTube Data API v3는 구글에서 제공하는 무료 서비스입니다.

예를 들어, \`ABC @gmail.com\` 계정을 만들면, 
구글이 해당 계정에 "YouTube 데이터를 조회할 수 있는 권한"을 제공해주는 거죠.
[[purple:쉽게 말해서, 구글이 제공하는 무료 서비스 중 하나입니다!]]

[IMAGE:02_image_1.png]

ㅤ
## 정말 간단합니다 - 클릭 7번이면 끝!
제가 직접 새로 API를 발급받아보니, 정말 클릭 7번이면 무료 API 키를 받을 수 있습니다.
그러니까 함께 따라해보세요!


## 📹 영상으로 보고 싶다면?

[YOUTUBE:https://youtu.be/0ZYlKw4x7W0]
ㅤ
ㅤ
---
ㅤ
## 📝 단계별 텍스트 가이드
영상을 보기 어려운 분들을 위해 이미지와 함께 상세히 설명해드릴게요.


## 1단계: Google Cloud Console 접속

구글에서 [[purple:"google console"]]을 검색하세요. 
가장 첫 번째로 나오는 구글 공식 웹사이트를 클릭합니다.
[IMAGE:02_image_2.png]
ㅤㅤ
ㅤㅤ
## 2단계: 가입

가입 팝업창이 나타나면 약관에 체크한 후 가입을 진행하세요.
⚠️ **주의사항**: 각 나라마다 다르지만, 가입과 동시에 $300 크레딧을 제공한다며 프리미엄 가입을 유도하는 경우가 있습니다.
이때는 "뒤로가기" 버튼을 누르세요. [[purple:우리는 무료 API]]만 사용할 예정이니까요!

[IMAGE:02_image_3.png]
ㅤㅤ
ㅤㅤ
## 3단계: YouTube Data API 검색

가입이 완료되면 상단 검색창에 [[purple:"youtube"]]라고 입력하세요.
검색 결과에서 맨 첫 번째에 나오는 [[purple:"YouTube Data API v3"]]를 클릭합니다.
[IMAGE:02_image_4.png]
ㅤㅤ
ㅤㅤ
## 4단계: API 활성화

이 파란색 버튼을 클릭하세요.
그러면 YouTube Data API 관리 화면으로 이동합니다.

[IMAGE:02_image_5.png]
ㅤㅤ
ㅤㅤ
## 5단계: API 키 생성

3번째 탭을 클릭한 후, [[purple:"+ 플러스 버튼"]]을 누르세요.
정말 간단하죠?

[IMAGE:02_image_6.png]
[IMAGE:02_image_7.png]
ㅤㅤ
ㅤㅤ
ㅤㅤ
## 💡 유용한 팁!

API 키를 잊어도 걱정하지 마세요. 
언제든지 Google Cloud Console에서 확인할 수 있고, 
필요하면 삭제하고 새로 발급받을 수도 있습니다.

[IMAGE:02_image_8.png]
ㅤㅤ
ㅤㅤ
## 이제 구글의 강력한 서비스를 활용하세요!

축하합니다! 
이제 YouTube Data API v3를 통해
구글이 제공하는 다양한 데이터 서비스를 마음껏 활용할 수 있습니다.

[IMAGE:03_image_1.png]


더 자세한 활용 방법이나 궁금한 점이 있으시면 언제든지 댓글로 남겨주세요. 
빠르게 답변드리겠습니다!`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 3,
      title: "Google Gemini API 키 \n10초만에 무료 발급받기!",
      excerpt: "구글의 강력한 AI를 내 손안에!",
      content: `##Google Gemini API v3가 뭔가요?

구글 API? 이게 뭘까요? 처음 듣는 분들이 많을텐데요, 걱정하지 마세요! 

"돈을 내야 하나요?" → 아니요, [[purple:완전 무료입니다.]]
"신용카드가 필요한가요?" → [[purple:전혀 필요 없습니다.]]
"어려운가요?" → [[purple:10세 어린이도 할 수 있어요.]]

Google Gemini API는 구글에서 제공하는 무료 서비스입니다.

예를 들어, \`ABC @gmail.com\` 계정을 만들면, 
구글이 해당 계정에 "무료 AI 기능"을 제공해주는 거죠.
[[purple:쉽게 말해서, 구글이 제공하는 무료 AI 서비스 중 하나입니다!]]

[IMAGE:03_image_1.png]


정말 간단합니다 - 클릭 6번이면 끝!
제가 직접 새로 API를 발급받아보니,
정말 클릭 6번이면 금방 API 키를 받을 수 있더라구요.
그러니까 함께 따라해보세요!

##📹 영상으로 보고 싶다면?

[YOUTUBE:https://youtu.be/JmQe-AIYh3w]
ㅤ
---
ㅤ
##📝 단계별 가이드
영상을 보기 어려운 분들을 위해 이미지와 함께 상세히 설명해드릴게요.
ㅤ
ㅤ
##1단계: Google AI Studio 접속

구글에서 [[purple:"ai studio"]]를 검색하세요.
가장 첫 번째로 나오는 Google AI Studio 공식 웹사이트를 클릭합니다.

[IMAGE:03_image_3.png]
ㅤ
ㅤ
##2단계: 시작

오른쪽 상단의 "시작하기" 버튼을 클릭해주세요.

[IMAGE:03_image_4.png]
ㅤ
ㅤ
## 3단계: 약관 동의

동의하기 화면이 나타나면 체크박스에 체크한 후 "확인" 버튼을 눌러주세요.

[IMAGE:03_image_5.png]
ㅤ
ㅤ
##4단계: API 키 생성 시작

화면 상단의 파란색 "API 키 받기" 버튼을 클릭합니다.

[IMAGE:03_image_6.png]
ㅤ
ㅤ
##5단계: API 키 만들기

API 키 세팅 창이 나타납니다.
당연히 아직 키가 없죠. "새 API 키 만들기" 버튼을 클릭하세요.

[IMAGE:03_image_7.png]
ㅤ
ㅤ
## 6단계: 완료!

"API 키 생성" 버튼을 클릭하면 끝입니다!
축하합니다! API 키가 성공적으로 만들어졌습니다.

[IMAGE:03_image_8.png]
ㅤ
ㅤ
## 💡 유용한 팁!
[[purple:* 키를 잊어버렸다면? 걱정하지 마세요.]]
"API 키 보기" 버튼을 눌러 언제든지 다시 확인할 수 있습니다.
[[purple:* 키를 삭제하고 싶다면? ]]
기존 키를 삭제하고 새로 만들 수 있습니다. 새로운 키는 이전 키와 완전히 다른 고유한 키입니다.
ㅤ
축하합니다!
이제 Google Gemini API를 통해 구글이 제공하는 최첨단 AI 기능을 마음껏 활용할 수 있습니다.
텍스트 생성, 이미지 분석, 코딩 도움 등 다양한 AI 기능을 무료로 사용해보세요! 
ㅤ
ㅤ
---
더 자세한 활용 방법이나 궁금한 점이 있으시면 언제든지 댓글로 남겨주세요. 빠르게 답변드리겠습니다!`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 4,
      title: "갑자기 오류 메세지를 마주했을 때!",
      excerpt: "해결 방법? 아주 간단해요.",
      content: `이 글을 모두 읽고나면, 너무 쉽게 문제를 해결 할 수 있습니다.

[IMAGE:04_image_1.png]
ㅤ
## "할당량을 초과했습니다" 오류 해결법
ㅤ
API를 사용하다가 갑자기 [[purple:"할당량을 초과했습니다"]] 라는 오류 메시지를 봤나요?
당황하지 마세요.
이는 매우 흔한 문제이고, 완벽한 해결방법이 있습니다.
ㅤ
## 현재 상황 파악
현재 당신의 API 키는 24시간 대기 상태입니다. 하지만 그냥 기다릴 필요는 없죠!   
ㅤ
[IMAGE:04_image_2.png]

## 해결 1.
ㅤ
가장 간단하고 효과적인 방법입니다.
구글은 회원가입에 큰 제한이 없습니다.
따라서 [[purple: 여러 개의 구글 계정을 만들어 각각 API 키]]를 발급받을 수 있습니다.

ㅤ
## 실전 활용.
1. 평소에 [[purple: 3-5개의 구글 계정으로 API 키]]를 발급받아 두기
2. [[purple:첫 번째 키가 한계에 도달하면 두 번째 키]]로 교체
3. 로테이션 시스템으로 순환 사용
ㅤ
## 우선 API 를 최대한 많이 확보하세요.
ㅤ
API 키 1 (main.account@gmail.com) - ABCDEFG...
API 키 2 (backup.account@gmail.com) - ABCDEFG...
API 키 3 (extra.account@gmail.com) - ABCDEFG...
이렇게 키를 저장해놓고, 로테이션 시키세요.

[IMAGE:04_image_3.png]

이렇게 하면 무제한으로 사용가능합니다.
아래 이미지처럼 메모장에 적어두고, 로테이션 시키세요.
API가 많으면 많을수록 좋습니다.

[IMAGE:04_image_4.png]
ㅤ
---
ㅤ
## 해결 2.

API 할당량을 조절하는 것도 중요한 전략입니다.
검색 범위를 축소하는 것만으로, 할당량을 크게 절약할 수 있습니다.

[IMAGE:04_image_5.png]
ㅤ
[[purple:비효율적인 방법 (피해야 할 것)]]
- 전체 국가를 대상으로 검색
- 불필요하게 넓은 범위 설정
- 한 번에 너무 많은 데이터 요청
ㅤ
[[purple:효율적인 방법 (권장)]]
- 필요한 국가만 선택 (한국, 미국, 일본 등 타겟 국가만)
- 지역별로 순차 검색
- 꼭 필요한 데이터만 요청`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 5,
      title: "API 할당량이 남았는데\n에러가 발생할 때!?",
      excerpt: "API 할당량 초과 에러! 어떻게 해결하죠?",
      content: `맙소사. 한 번 밖에 검색안했는데..?

[IMAGE:05_image_1.png]

딱 한번 검색했는데!
API 할당량 초과 에러 메세지를 봤나요?
그 이유를 알려드릴께요.

[[purple: API는 검색 국가가 많아질수록 더 많은 할당량]]을 사용합니다. 
검색 시 전체 국가를 선택하셨다면,
총 82개국에 API 요청을 보내게 되어 상당한 할당량이 소모됩니다.

따라서 검색할 국가 수를 줄여보세요.

---

[IMAGE:05_image_2.png]

## 구글 콘솔에서 할당량이 많이 남았는데, 오류가 떴어요.

이는 매우 빈번하게 발생하는 문제입니다.
API 할당량 사용량이 실시간으로 반영되지 않기 때문에,
[[purple:구글 콘솔에서 보는 화면은 아직 최신 사용량이 반영되지 않은 상태]]일 가능성이 높습니다.

---

## 가장 확실한 해결 방법
## 새로운 API 키를 사용하는 것입니다.

효과적인 바이럴 쇼츠를 찾기 위해서는
[[purple: 반드시 여러 개의 API 키를 미리 준비해두세요.]]

[IMAGE:04_image_4.png]

구글은 Gmail 계정을 무제한으로 생성할 수 있으며,
각 Gmail 계정마다 개별 API 키를 발급받을 수 있습니다.
즉, [[purple: 필요에 따라 얼마든지 많은 API 키]]를 확보할 수 있다는 의미입니다.

지금 당장 여러 Gmail 계정으로 API 키를 발급받아 메모장에 정리해두세요.`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 6,
      title: "경쟁 채널의 바이럴을\n뺏어올 수 있는 기회!",
      excerpt: "바로 즐겨찾기 채널을 사용하세요.",
      content: `고급옵션에서 [[purple:'즐겨찾기 채널' 을 보셨나요?]]

YouTube 크리에이터라면 누구나 [[purple:롤모델 채널이나 경쟁 채널]]이 있을 것입니다.
이 채널들의 바이럴 요소를 분석할 수 있다면 어떠신가요?

[IMAGE:06_image_1.png]

## 고급옵션의 '즐겨찾기 채널'을 사용하세요.

고급 옵션의 '즐겨찾는 채널'에 관심 있는 채널들을 등록하면,
다음과 같은 인사이트를 얻을 수 있습니다:

- [[purple:🎯 바이럴 쇼츠 분석]]: 이 채널의 바이럴 요소
- [[purple: 📊 성과 지표 확인]]: 구독자 대비 조회수 비율 및 성장률
- [[purple:📈 트렌드 파악]]: 경쟁 채널들의 최신 콘텐츠 동향

---

[IMAGE:06_image_2.png]

## 매번 채널명을 써야하는게 귀찮아요.

경쟁사의 채널이 많고, 다양한 그룹의 경쟁사들을 보고싶을 경우
[[purple:텍스트 파일]]을 이용하세요.

1. 관심 있는 채널 목록을 텍스트 파일로 정리
2. 파일 업로드.

파일이 업로드가 되면, 이렇게 자동으로 채널이 입력됩니다.
자, 이제 검색을 눌러서 경쟁 채널을 분석하세요! 
[IMAGE:06_image_3.png]`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 7,
      title: "고객님의 API 키 처리 안내",
      excerpt: "API 키 보안에 대한 안내",
      content: `##API 키 보안에 대한 안내
서비스의 보안 정책을 안내드립니다.

##🔒 저희 서비스의 보안 원칙

[[purple: API 키 비저장 원칙]]
* 고객님의 API 키는 서버로 전송·저장하지 않습니다.
* API 키는 브라우저 메모리에서만 일시적으로 사용되며, 페이지 새로고침 또는 탭 종료 시 삭제됩니다.
* 회원가입/로그인이 없어 개인 식별 정보를 서버에 수집·보관하지 않습니다.

[[purple: 서버 측 저장 없음 & 브라우저 저장소 안내]]
* 서버 측 데이터베이스/세션/서버 캐시는 사용하지 않습니다.
* 서비스 이용 편의를 위한 비민감 정보(예: 언어 설정, 보기 상태 등)만 브라우저 로컬 저장소에 저장되며, 브라우저를 삭제하기 전까지 유지됩니다.
* API 키와 같은 민감 정보는 로컬/세션 저장소 및 쿠키에 저장하지 않습니다

[[purple: 💡 브라우저 자동완성 안내]]
API 키가 자동 완성되거나 저장된 것처럼 보이는 경우가 있을 수 있으며, 이는 사용자 브라우저의 자동완성/비밀번호 관리자 설정이 원인일 수 있습니다.

[[purple: 해결 방법 ]]
1. 브라우저 설정에서 자동완성/저장 기능 비활성화
2. 브라우저 저장소(localStorage/캐시/쿠키) 정리
3. 시크릿 모드(개인정보 보호 모드) 이용

저희는 적절한 보안 조치를 적용하여 고객님의 정보를 보호하기 위해 노력하고 있습니다.  
API 키는 요청 처리 목적으로만 사용되며, 그외 목적으로 사용하지 않는 것을 원칙으로 합니다.`,
      category: "General",
      date: "2025-08-19"
    });
    articles.push({
      id: 8,
      title: "이 서비스를 잘 이용하는 유저 - A씨.",
      excerpt: "3일만에 1억 쇼츠 만들기.",
      content: `이 서비스의 파워 유저는 어떤 식으로 사용하나요?

---

저희 서비스를 최대한 활용하시는 분들에게는 공통점이 있습니다.
바로 체계적인 준비입니다.

## 효율적인 활용을 위한 준비사항

📁 필수 파일 2개만 준비하세요
[[purple: 1. api키.txt ]]
ㄴ* Gemini API 키
ㄴ* YouTube Data API 키 (10개 이상 권장)

 
[[purple:  2. 즐겨찾기 채널.txt ]]
* 경쟁사 채널 목록 (@채널명 형식)

[IMAGE:08_image_1.png]
---`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 9,
      title: "영어 쇼츠를 올릴 때\n주의사항.",
      excerpt: "당신이 광고비용이 높은",
      content: `##당신이 영어 쇼츠를 제작한다면 반드시 VPN을 사용하세요.

미국이 아닌 다른 국가에서 쇼츠를 업로드할 경우,
여러분의 쇼츠는 RPM이 낮은 국가들에게 타겟될 수 있습니다.

단적인 예시로,[[purple:800만 조회수를 달성해도 불과 4만원]] 정도의 수익밖에 얻지 못할 수 있다는 뜻입니다.
미국을 타겟으로 할 때는 반드시 VPN을 미국으로 설정한 후 업로드하세요.

##2025년 기준 RPM 단가가 높은 상위 10개국:

미국 🇺🇸 ($11.95)
호주 🇦🇺 ($8.93)
노르웨이 🇳🇴 ($8.19)
스위스 🇨🇭 ($8.02)
영국 🇬🇧 ($7.60)
덴마크 🇩🇰 ($7.43)
뉴질랜드 🇳🇿 ($6.72)
캐나다 🇨🇦 ($6.65)
벨기에 🇧🇪 ($6.52)
네덜란드 🇳🇱 ($6.44)

이 국가들을 타겟할 때는 VPN을 적극 활용하시기 바랍니다.`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 10,
      title: "VIDHUNT의 로드맵",
      excerpt: "앞으로 나올 기능들을 알려드립니다.",
      content: `# VIDHUNT의 로드맵

앞으로 나올 우리의 로드맵에 대해 안내드립니다.
상황에 따라 변경될 수 있지만, [[purple:최선을 다해 무료서비스의 품질]]을 높이겠습니다.

1. 롱폼 검색 기능
2. 쇼츠 만들기 기능
3. 유튜브 영상 다운받기 기능


조금만 기다려주세요.
[[purple: 모든 기능은 무료로 운영됩니다.]]

언제나 VIDHUNT 를 이용해주셔서 감사합니다.`,
      category: "General",
      date: "2025-08-18"
    });
  }

  // EN articles
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
    articles.push({
      id: 2,
      title: "YouTube Data\nGet it for free in 10 seconds.",
      excerpt: "All of YouTube's data",
      content: `##What is YouTube Data API v3?

Data API? What is this? Many people are hearing this for the first time, but don't worry!

"Do I have to pay?" → No, [[purple:it's completely free.]]
"Do I need a credit card?" → [[purple:You don't need it at all.]]
"Is it difficult?" → [[purple:Even a 10-year-old child can do it.]]

YouTube Data API v3 is a free service provided by Google.

For example, if you create an \`ABC@gmail.com\` account,
Google provides that account with "permission to view YouTube data."
[[purple:Simply put, it's one of the free services provided by Google!]]

[IMAGE:02_image_1.png]

ㅤ
## It's really simple - just 7 clicks and you're done!
I personally issued a new API and found that you can get a free API key with just 7 clicks.
So let's follow along!


## 📹 Want to watch the video?

[YOUTUBE:https://youtu.be/0ZYlKw4x7W0]
ㅤ
ㅤ
---
ㅤ
## 📝 Step-by-step text guide
For those who have difficulty watching the video, I'll explain in detail with images.


## Step 1: Access Google Cloud Console

Search for [[purple:"google console"]] on Google.
Click on the first Google official website that appears.
[IMAGE:02_image_2.png]
ㅤㅤ
ㅤㅤ
## Step 2: Sign up

When the signup popup appears, check the terms and proceed with signup.
⚠️ **Caution**: Depending on each country, there may be cases where they offer $300 credits upon signup and encourage premium signup.
In this case, click the "back" button. [[purple:We only plan to use free APIs]]!

[IMAGE:02_image_3.png]
ㅤㅤ
ㅤㅤ
## Step 3: Search YouTube Data API

Once signup is complete, type [[purple:"youtube"]] in the search bar at the top.
Click on [[purple:"YouTube Data API v3"]] that appears first in the search results.
[IMAGE:02_image_4.png]
ㅤㅤ
ㅤㅤ
## Step 4: Enable API

Click this blue button.
Then you'll be taken to the YouTube Data API management screen.

[IMAGE:02_image_5.png]
ㅤㅤ
ㅤㅤ
## Step 5: Create API Key

Click the 3rd tab, then press the [[purple:"+ plus button"]].
Really simple, right?

[IMAGE:02_image_6.png]
[IMAGE:02_image_7.png]
ㅤㅤ
ㅤㅤ
ㅤㅤ
## 💡 Useful tip!

Don't worry if you forget your API key.
You can check it anytime in Google Cloud Console,
and if needed, you can delete it and issue a new one.

[IMAGE:02_image_8.png]
ㅤㅤ
ㅤㅤ
## Now utilize Google's powerful services!

Congratulations!
Now you can fully utilize
various data services provided by Google through YouTube Data API v3.

[IMAGE:03_image_1.png]


If you have more detailed usage methods or questions, please leave a comment anytime.
I'll respond quickly!`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 3,
      title: "Google Gemini API Key\nGet it for free in 10 seconds!",
      excerpt: "Google's powerful AI in my hands!",
      content: `##What is Google Gemini API v3?

Google API? What is this? Many people are hearing this for the first time, but don't worry!

"Do I have to pay?" → No, [[purple:it's completely free.]]
"Do I need a credit card?" → [[purple:You don't need it at all.]]
"Is it difficult?" → [[purple:Even a 10-year-old child can do it.]]

Google Gemini API is a free service provided by Google.

For example, if you create an \`ABC@gmail.com\` account,
Google provides that account with "free AI functionality."
[[purple:Simply put, it's one of the free AI services provided by Google!]]

[IMAGE:03_image_1.png]


It's really simple - just 6 clicks and you're done!
I personally issued a new API and found that
you can get an API key really quickly with just 6 clicks.
So let's follow along!

##📹 Want to watch the video?

[YOUTUBE:https://youtu.be/JmQe-AIYh3w]
ㅤ
---
ㅤ
##📝 Step-by-step guide
For those who have difficulty watching the video, I'll explain in detail with images.
ㅤ
ㅤ
##Step 1: Access Google AI Studio

Search for [[purple:"ai studio"]] on Google.
Click on the first Google AI Studio official website that appears.

[IMAGE:03_image_3.png]
ㅤ
ㅤ
##Step 2: Start

Click the "Get Started" button in the upper right corner.

[IMAGE:03_image_4.png]
ㅤ
ㅤ
## Step 3: Agree to Terms

When the agreement screen appears, check the checkbox and click the "OK" button.

[IMAGE:03_image_5.png]
ㅤ
ㅤ
##Step 4: Start API Key Creation

Click the blue "Get API Key" button at the top of the screen.

[IMAGE:03_image_6.png]
ㅤ
ㅤ
##Step 5: Create API Key

The API key setting window appears.
Of course, there's no key yet. Click the "Create new API key" button.

[IMAGE:03_image_7.png]
ㅤ
ㅤ
## Step 6: Complete!

Click the "Generate API key" button and you're done!
Congratulations! Your API key has been successfully created.

[IMAGE:03_image_8.png]
ㅤ
ㅤ
## 💡 Useful tips!
[[purple:* Forgot your key? Don't worry.]]
You can check it again anytime by clicking the "View API key" button.
[[purple:* Want to delete the key?]]
You can delete existing keys and create new ones. New keys are completely different unique keys from previous ones.
ㅤ
Congratulations!
Now you can fully utilize Google's cutting-edge AI functionality through Google Gemini API.
Try various AI features like text generation, image analysis, and coding help for free!
ㅤ
ㅤ
---
If you have more detailed usage methods or questions, please leave a comment anytime. I'll respond quickly!`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 4,
      title: "When you suddenly encounter an error message!",
      excerpt: "The solution? It's very simple.",
      content: `After reading this entire article, you can solve the problem very easily.

[IMAGE:04_image_1.png]
ㅤ
## How to solve "quota exceeded" error
ㅤ
Did you suddenly see an error message saying [[purple:"quota exceeded"]] while using the API?
Don't panic.
This is a very common problem, and there's a perfect solution.
ㅤ
## Understanding the current situation
Currently, your API key is in a 24-hour standby state. But you don't need to just wait!
ㅤ
[IMAGE:04_image_2.png]

## Solution 1.
ㅤ
This is the simplest and most effective method.
Google doesn't have major restrictions on membership registration.
Therefore, you can [[purple: create multiple Google accounts and get API keys for each]].

ㅤ
## Practical application.
1. Usually [[purple: get API keys with 3-5 Google accounts]] in advance
2. [[purple:When the first key reaches its limit, switch to the second key]]
3. Use a rotation system for circular usage
ㅤ
## First, secure as many APIs as possible.
ㅤ
API Key 1 (main.account@gmail.com) - ABCDEFG...
API Key 2 (backup.account@gmail.com) - ABCDEFG...
API Key 3 (extra.account@gmail.com) - ABCDEFG...
Save the keys like this and rotate them.

[IMAGE:04_image_3.png]

This way, you can use them unlimitedly.
As shown in the image below, write them down in notepad and rotate them.
The more APIs you have, the better.

[IMAGE:04_image_4.png]
ㅤ
---
ㅤ
## Solution 2.

Adjusting API quotas is also an important strategy.
Just by reducing the search scope, you can greatly save quotas.

[IMAGE:04_image_5.png]
ㅤ
[[purple:Inefficient methods (to avoid)]]
- Searching across all countries
- Setting unnecessarily wide ranges
- Requesting too much data at once
ㅤ
[[purple:Efficient methods (recommended)]]
- Select only necessary countries (only target countries like Korea, USA, Japan)
- Sequential search by region
- Request only essential data`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 5,
      title: "When errors occur despite having API quota left!?",
      excerpt: "API quota exceeded error! How to solve it?",
      content: `Oh my. I only searched once..?

[IMAGE:05_image_1.png]

I only searched once!
Did you see an API quota exceeded error message?
Let me tell you why.

[[purple: APIs use more quota as the number of search countries increases]].
If you selected all countries when searching,
you'll be sending API requests to a total of 82 countries, consuming considerable quota.

Therefore, try reducing the number of countries to search.

---

[IMAGE:05_image_2.png]

## There's plenty of quota left in Google Console, but I got an error.

This is a very frequently occurring problem.
Because API quota usage is not reflected in real-time,
[[purple:the screen you see in Google Console is likely still showing usage that hasn't been updated with the latest information]].

---

## The most reliable solution
## is to use a new API key.

To find effective viral Shorts,
[[purple: you must prepare multiple API keys in advance]].

[IMAGE:04_image_4.png]

Google allows unlimited creation of Gmail accounts,
and you can get individual API keys for each Gmail account.
This means you can [[purple: secure as many API keys as needed]].

Right now, get API keys with multiple Gmail accounts and organize them in notepad.`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 6,
      title: "A chance to steal viral content from competing channels!",
      excerpt: "Just use favorite channels.",
      content: `Did you see [[purple:'Favorite Channels' in advanced options?]]

Every YouTube creator probably has [[purple:role model channels or competing channels]].
What if you could analyze the viral elements of these channels?

[IMAGE:06_image_1.png]

## Use 'Favorite Channels' in advanced options.

By registering channels of interest in the 'Favorite Channels' of advanced options,
you can gain the following insights:

- [[purple:🎯 Viral Shorts Analysis]]: The viral elements of this channel
- [[purple: 📊 Performance Metrics Check]]: Subscriber-to-view ratio and growth rate
- [[purple:📈 Trend Analysis]]: Latest content trends from competing channels

---

[IMAGE:06_image_2.png]

## It's annoying to write channel names every time.

If you have many competing channels and want to see various groups of competitors,
use [[purple:text files]].

1. Organize a list of channels of interest in a text file
2. Upload the file.

Once the file is uploaded, channels are automatically entered like this.
Now, click search to analyze competing channels!
[IMAGE:06_image_3.png]`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 7,
      title: "Customer API Key Processing Information",
      excerpt: "Information about API key security",
      content: `##API Key Security Information
We inform you about the security policy of our service.

##🔒 Our Service's Security Principles

[[purple: API Key Non-Storage Principle]]
* Your API keys are not transmitted to or stored on servers.
* API keys are used temporarily only in browser memory and are deleted when the page is refreshed or the tab is closed.
* We do not collect or store personal identification information on servers as there is no membership registration/login.

[[purple: No Server-Side Storage & Browser Storage Information]]
* We do not use server-side databases/sessions/server caches.
* Only non-sensitive information for service convenience (e.g., language settings, viewing status) is stored in browser local storage and is maintained until the browser is deleted.
* Sensitive information such as API keys is not stored in local/session storage or cookies.

[[purple: 💡 Browser Autocomplete Information]]
API keys may appear to be auto-completed or saved, which may be due to your browser's autocomplete/password manager settings.

[[purple: Solutions]]
1. Disable autocomplete/save features in browser settings
2. Clear browser storage (localStorage/cache/cookies)
3. Use incognito mode (private browsing mode)

We strive to protect your information by applying appropriate security measures.
API keys are used only for request processing purposes and are not used for other purposes as a principle.`,
      category: "General",
      date: "2025-08-19"
    });
    articles.push({
      id: 8,
      title: "User who uses this service well - Mr. A.",
      excerpt: "Making 100 million Shorts in 3 days.",
      content: `How do power users of this service use it?

---

There's a common trait among those who make the most of our service.
It's systematic preparation.

## Preparation for efficient utilization

📁 Just prepare 2 essential files
[[purple: 1. api_keys.txt]]
ㄴ* Gemini API keys
ㄴ* YouTube Data API keys (10+ recommended)


[[purple: 2. favorite_channels.txt]]
* List of competitor channels (@channel_name format)

[IMAGE:08_image_1.png]
---`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 9,
      title: "Precautions when uploading English Shorts.",
      excerpt: "You have high advertising costs",
      content: `##If you're creating English Shorts, you must use a VPN.

If you upload Shorts from a country other than the United States,
your Shorts may be targeted to countries with low RPM.

As a concrete example, [[purple:even with 8 million views, you might only earn about $500]].
When targeting the United States, make sure to set your VPN to the US before uploading.

##Top 10 countries with highest RPM rates as of 2025:

United States 🇺🇸 ($11.95)
Australia 🇦🇺 ($8.93)
Norway 🇳🇴 ($8.19)
Switzerland 🇨🇭 ($8.02)
United Kingdom 🇬🇧 ($7.60)
Denmark 🇩🇰 ($7.43)
New Zealand 🇳🇿 ($6.72)
Canada 🇨🇦 ($6.65)
Belgium 🇧🇪 ($6.52)
Netherlands 🇳🇱 ($6.44)

Please actively use VPN when targeting these countries.`,
      category: "General",
      date: "2025-08-18"
    });
    articles.push({
      id: 10,
      title: "VIDHUNT's Roadmap",
      excerpt: "We'll tell you about the features to come.",
      content: `# VIDHUNT's Roadmap

We inform you about our upcoming roadmap.
Although it may change depending on circumstances, [[purple:we'll do our best to improve the quality of free services]].

1. Long-form search feature
2. Shorts creation feature
3. YouTube video download feature


Please wait a little.
[[purple: All features will be operated for free.]]

Thank you for always using VIDHUNT.`,
      category: "General",
      date: "2025-08-18"
    });
  }

  // JA articles  
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
    for (let i = 2; i <= 10; i++) {
      articles.push({
        id: i,
        title: `記事 ${i}`,
        excerpt: `記事 ${i} の抜粋`,
        content: `記事 ${i} のコンテンツ`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // ZH articles
  if (pageNumber === 1 && language === 'zh') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `文章 ${i}`,
        excerpt: `文章 ${i} 的摘要`,
        content: `文章 ${i} 的内容`,
        category: "General", 
        date: "2025-08-18"
      });
    }
  }

  // ES articles
  if (pageNumber === 1 && language === 'es') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Artículo ${i}`,
        excerpt: `Resumen del artículo ${i}`,
        content: `Contenido del artículo ${i}`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // FR articles
  if (pageNumber === 1 && language === 'fr') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Article ${i}`,
        excerpt: `Résumé de l'article ${i}`,
        content: `Contenu de l'article ${i}`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // DE articles
  if (pageNumber === 1 && language === 'de') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Artikel ${i}`,
        excerpt: `Zusammenfassung von Artikel ${i}`,
        content: `Inhalt von Artikel ${i}`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // NL articles  
  if (pageNumber === 1 && language === 'nl') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Artikel ${i}`,
        excerpt: `Samenvatting van artikel ${i}`,
        content: `Inhoud van artikel ${i}`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // PT articles
  if (pageNumber === 1 && language === 'pt') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Artigo ${i}`,
        excerpt: `Resumo do artigo ${i}`,
        content: `Conteúdo do artigo ${i}`,
        category: "General",
        date: "2025-08-18"
      });
    }
  }

  // RU articles
  if (pageNumber === 1 && language === 'ru') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `Статья ${i}`,
        excerpt: `Краткое содержание статьи ${i}`,
        content: `Содержание статьи ${i}`,
        category: "General", 
        date: "2025-08-18"
      });
    }
  }

  // HI articles
  if (pageNumber === 1 && language === 'hi') {
    for (let i = 1; i <= 10; i++) {
      articles.push({
        id: i,
        title: `लेख ${i}`,
        excerpt: `लेख ${i} का सारांश`,
        content: `लेख ${i} की सामग्री`,
        category: "General",
        date: "2025-08-18"
      });
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