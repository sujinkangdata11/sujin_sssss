import { Article, Language } from '../types';
import { CACHE_BUSTER } from '../src/cacheBuster';

// 하드코딩된 뉴스 데이터 - v1.0.0
const NEWS_DATA: Record<Language, Article[]> = {
  // 한국어 - 10개
  ko: [
    {
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
    },
    {
      id: 2,
      title: "YouTube Data\n10초 만에 무료 발급받기.",
      excerpt: "YouTube의 모든 데이터를\n무료로 뜯기!",
      content: "YouTube Data API v3 발급 가이드 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 3,
      title: "Google Gemini API 키 \n10초만에 무료 발급받기!",
      excerpt: "구글의 강력한 AI를 내 손안에!\n무료입니다.",
      content: "Google Gemini API 발급 가이드 내용",
      category: "General", 
      date: "2025-08-18"
    },
    {
      id: 4,
      title: "갑자기 오류 메세지를 마주했을 때!",
      excerpt: "해결 방법? 아주 간단해요.",
      content: "API 오류 해결 가이드 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 5,
      title: "API 할당량이 남았는데\n에러가 발생할 때!?",
      excerpt: "API 할당량 초과 에러! 어떻게 해결하죠?",
      content: "API 할당량 문제 해결 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 6,
      title: "경쟁 채널의 바이럴을\n뺏어올 수 있는 기회!",
      excerpt: "바로 즐겨찾기 채널을 사용하세요.",
      content: "즐겨찾기 채널 활용법 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 7,
      title: "고객님의 API 키 처리 안내",
      excerpt: "API 키 보안에 대한 안내",
      content: "API 키 보안 정책 안내 내용",
      category: "General",
      date: "2025-08-19"
    },
    {
      id: 8,
      title: "이 서비스를 잘 이용하는 유저 - A씨.",
      excerpt: "3일만에 1억 쇼츠 만들기.",
      content: "파워 유저 활용법 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 9,
      title: "영어 쇼츠를 올릴 때\n주의사항.",
      excerpt: "당신이 광고비용이 높은",
      content: "영어 쇼츠 VPN 사용법 내용",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 10,
      title: "VIDHUNT의 로드맵",
      excerpt: "앞으로 나올 기능들을 알려드립니다.",
      content: "VIDHUNT 로드맵 내용",
      category: "General",
      date: "2025-08-18"
    }
  ],

  // 영어 - 10개
  en: [
    {
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
    },
    {
      id: 2,
      title: "YouTube Data\nGet it for free in 10 seconds.",
      excerpt: "All of YouTube's data\nfor free!",
      content: "YouTube Data API v3 guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 3,
      title: "Google Gemini API Key\nGet it for free in 10 seconds!",
      excerpt: "Google's powerful AI in your hands!\nIt's free.",
      content: "Google Gemini API guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 4,
      title: "When you suddenly encounter an error message!",
      excerpt: "How to fix it? Super simple.",
      content: "API error resolution guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 5,
      title: "When you still have API quota left\nbut an error occurs!?",
      excerpt: "API quota exceeded error! How do we fix it?",
      content: "API quota issue resolution content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 6,
      title: "A chance to steal\nyour competitor's virality!",
      excerpt: "Use Favorite Channels right away.",
      content: "Favorite channels usage guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 7,
      title: "Notice on Processing of Your API Key",
      excerpt: "Notice Regarding API Key Security",
      content: "API key security policy notice content",
      category: "General",
      date: "2025-08-19"
    },
    {
      id: 8,
      title: "A user who uses this service well - User A.",
      excerpt: "Create a 100M-view Short in just 3 days.",
      content: "Power user guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 9,
      title: "When uploading English Shorts\nImportant notes.",
      excerpt: "When you target the United States,\nwhere ad costs are high.",
      content: "English Shorts VPN usage guide content",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 10,
      title: "VIDHUNT Roadmap",
      excerpt: "We'll tell you about the features coming next.",
      content: "VIDHUNT roadmap content",
      category: "General",
      date: "2025-08-18"
    }
  ],

  // 일본어 - 9개
  ja: [
    {
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
    },
    {
      id: 2,
      title: "YouTube Data\n10秒で無料発行。",
      excerpt: "YouTubeのすべてのデータを\n無料で活用！",
      content: "YouTube Data API v3ガイド内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 3,
      title: "Google Gemini API キー \n10秒で無料発行！",
      excerpt: "Googleの強力なAIをあなたの手に！\n無料です。",
      content: "Google Gemini APIガイド内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 4,
      title: "突然エラーメッセージに出会ったとき！",
      excerpt: "解決方法？ とても簡単です。",
      content: "APIエラー解決ガイド内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 5,
      title: "API の割り当て量が残っているのに\nエラーが発生するとき!?",
      excerpt: "API の割り当て量超過エラー！ どう解決しますか？",
      content: "API割り当て量問題解決内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 6,
      title: "競合チャンネルのバイラルを\n奪い取るチャンス！",
      excerpt: "今すぐ「お気に入りチャンネル」を使いましょう。",
      content: "お気に入りチャンネル活用法内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 7,
      title: "お客様の API キーの取り扱いに関するご案内",
      excerpt: "API キーのセキュリティに関するご案内",
      content: "APIキーセキュリティポリシー案内内容",
      category: "General",
      date: "2025-08-19"
    },
    {
      id: 8,
      title: "このサービスを上手に使うユーザー - Aさん。",
      excerpt: "3日で1億再生のショートを作る。",
      content: "パワーユーザーガイド内容",
      category: "General",
      date: "2025-08-18"
    },
    {
      id: 9,
      title: "英語のショートを投稿するとき\n注意事項。",
      excerpt: "広告費が高い\nアメリカをターゲットにする場合。",
      content: "英語ショーツVPN使用法ガイド内容",
      category: "General",
      date: "2025-08-18"
    }
  ],

  // 중국어 - 10개
  zh: [
    { id: 1, title: "VIDHUNT VS YouTube 普通搜索。\n哪个更好？", excerpt: "很多人都会问：\"用 VIDHUNT 寻找热门 Shorts 和在 YouTube 上直接搜索视频，有什么区别？\"", content: "中文内容 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\n10秒内免费获取。", excerpt: "将 YouTube 的所有数据\n免费拿下！", content: "中文内容 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Google Gemini API 密钥 \n10秒内免费获取！", excerpt: "把 Google 的强大 AI 掌握在你手中！\n免费使用。", content: "中文内容 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "当你突然遇到错误信息时！", excerpt: "解决方法？ 非常简单。", content: "中文内容 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "配额还没用完\n却出现了错误!?", excerpt: "API 配额超限错误！ 怎么解决？", content: "中文内容 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "夺取竞争频道\n的爆款机会！", excerpt: "马上使用\"收藏频道\"功能。", content: "中文内容 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "您的 API 密钥是安全的", excerpt: "关于 API 密钥安全性的说明", content: "中文内容 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "善于使用本服务的用户——A 先生/女士。", excerpt: "3 天做出 1 亿播放的 Shorts。", content: "中文内容 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "发布英文 Shorts 时\n注意事项。", excerpt: "当你将高广告成本的\n美国作为目标时。", content: "中文内容 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "VIDHUNT 路线图", excerpt: "为你介绍即将上线的功能。", content: "中文内容 10", category: "General", date: "2025-08-18" }
  ],

  // 스페인어 - 10개
  es: [
    { id: 1, title: "VIDHUNT VS búsqueda general en YouTube.\n¿Cuál es mejor?", excerpt: "Muchas personas se preguntan: \"¿Cuál es la diferencia entre encontrar Shorts populares con VIDHUNT y buscar videos directamente en YouTube?\"", content: "Contenido español 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nConsíguelo gratis en 10 segundos.", excerpt: "Todos los datos de YouTube\n¡gratis!", content: "Contenido español 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Google Gemini API Key\n¡Consíguelo gratis en 10 segundos!", excerpt: "¡El poderoso AI de Google en tus manos!\nEs gratuito.", content: "Contenido español 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "¡Cuando te encuentras de repente con un mensaje de error!", excerpt: "¿Solución? Muy simple.", content: "Contenido español 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Cuando aún te queda cuota de API\npero ocurre un error!?", excerpt: "¡Error de cuota API excedida! ¿Cómo lo solucionamos?", content: "Contenido español 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "¡Una oportunidad de robar\nla viralidad de la competencia!", excerpt: "Utiliza inmediatamente los Canales Favoritos.", content: "Contenido español 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Aviso sobre el procesamiento de tu clave API", excerpt: "Aviso sobre la seguridad de las claves API", content: "Contenido español 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Usuario que utiliza bien este servicio - Usuario A.", excerpt: "Crear un Short de 100M de visualizaciones en solo 3 días.", content: "Contenido español 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "Al subir Shorts en inglés\nNotas importantes.", excerpt: "Cuando apuntas a Estados Unidos,\ndonde los costos publicitarios son altos.", content: "Contenido español 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "Hoja de ruta de VIDHUNT", excerpt: "Te contaremos sobre las funciones que vendrán próximamente.", content: "Contenido español 10", category: "General", date: "2025-08-18" }
  ],

  // 프랑스어 - 10개  
  fr: [
    { id: 1, title: "VIDHUNT VS recherche YouTube classique.\nLequel est le meilleur ?", excerpt: "Beaucoup de gens se demandent : \"Quelle est la différence entre trouver des Shorts populaires avec VIDHUNT et chercher des vidéos directement sur YouTube ?\"", content: "Contenu français 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nObtenez-le gratuitement en 10 secondes.", excerpt: "Toutes les données de YouTube\ngratuitement !", content: "Contenu français 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Clé API Google Gemini\nObtenez-la gratuitement en 10 secondes !", excerpt: "L'IA puissante de Google entre vos mains !\nC'est gratuit.", content: "Contenu français 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "Quand vous rencontrez soudain un message d'erreur !", excerpt: "Solution ? Très simple.", content: "Contenu français 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Quand il vous reste du quota API\nmais qu'une erreur se produit !?", excerpt: "Erreur de quota API dépassé ! Comment résoudre ?", content: "Contenu français 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "Une chance de voler\nla viralité de vos concurrents !", excerpt: "Utilisez immédiatement les Chaînes Favorites.", content: "Contenu français 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Avis sur le traitement de votre clé API", excerpt: "Avis concernant la sécurité des clés API", content: "Contenu français 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Utilisateur qui utilise bien ce service - Utilisateur A.", excerpt: "Créer un Short de 100M de vues en seulement 3 jours.", content: "Contenu français 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "Lors du téléchargement de Shorts en anglais\nNotes importantes.", excerpt: "Quand vous ciblez les États-Unis,\noù les coûts publicitaires sont élevés.", content: "Contenu français 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "Feuille de route VIDHUNT", excerpt: "Nous vous parlerons des fonctionnalités à venir.", content: "Contenu français 10", category: "General", date: "2025-08-18" }
  ],

  // 독일어 - 10개
  de: [
    { id: 1, title: "VIDHUNT VS normale YouTube-Suche.\nWas ist besser?", excerpt: "Viele Leute fragen sich: \"Was ist der Unterschied zwischen dem Finden beliebter Shorts mit VIDHUNT und der direkten Videosuche auf YouTube?\"", content: "Deutscher Inhalt 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nKostenlos in 10 Sekunden erhalten.", excerpt: "Alle YouTube-Daten\nkostenlos!", content: "Deutscher Inhalt 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Google Gemini API-Schlüssel\nKostenlos in 10 Sekunden erhalten!", excerpt: "Googles mächtige KI in Ihren Händen!\nEs ist kostenlos.", content: "Deutscher Inhalt 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "Wenn Sie plötzlich eine Fehlermeldung sehen!", excerpt: "Lösung? Sehr einfach.", content: "Deutscher Inhalt 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Wenn Sie noch API-Kontingent haben\naber ein Fehler auftritt!?", excerpt: "API-Kontingent überschritten Fehler! Wie lösen wir das?", content: "Deutscher Inhalt 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "Eine Chance, die Viralität\nder Konkurrenz zu stehlen!", excerpt: "Nutzen Sie sofort Favoriten-Kanäle.", content: "Deutscher Inhalt 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Hinweis zur Verarbeitung Ihres API-Schlüssels", excerpt: "Hinweis zur API-Schlüssel-Sicherheit", content: "Deutscher Inhalt 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Benutzer, der diesen Service gut nutzt - Benutzer A.", excerpt: "Erstellen Sie einen 100M-Views Short in nur 3 Tagen.", content: "Deutscher Inhalt 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "Beim Hochladen englischer Shorts\nWichtige Hinweise.", excerpt: "Wenn Sie die USA anvisieren,\nwo die Werbekosten hoch sind.", content: "Deutscher Inhalt 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "VIDHUNT Roadmap", excerpt: "Wir erzählen Ihnen von den kommenden Funktionen.", content: "Deutscher Inhalt 10", category: "General", date: "2025-08-18" }
  ],

  // 네덜란드어 - 10개
  nl: [
    { id: 1, title: "VIDHUNT VS algemene YouTube-zoekopdracht.\nWat is beter?", excerpt: "Veel mensen vragen zich af: \"Wat is het verschil tussen populaire Shorts vinden met VIDHUNT en rechtstreeks video's zoeken op YouTube?\"", content: "Nederlandse inhoud 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nBinnen 10 seconden gratis aanvragen.", excerpt: "Alle YouTube-gegevens\ngratis gebruiken!", content: "Nederlandse inhoud 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Google Gemini API-sleutel\nBinnen 10 seconden gratis aanvragen!", excerpt: "De krachtige AI van Google in jouw handen!\nHet is gratis.", content: "Nederlandse inhoud 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "Wanneer je ineens een foutmelding krijgt!", excerpt: "De oplossing? Heel eenvoudig.", content: "Nederlandse inhoud 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Er is nog API-quota over,\nmaar er treedt een fout op!?", excerpt: "API-quotum overschreden! Hoe los ik dit op?", content: "Nederlandse inhoud 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "Een kans om de viraliteit\nvan concurrentkanalen over te nemen!", excerpt: "Gebruik meteen 'Favoriete kanalen'.", content: "Nederlandse inhoud 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Kennisgeving over de verwerking van uw API-sleutel", excerpt: "Kennisgeving over de beveiliging van de API-sleutel", content: "Nederlandse inhoud 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Een gebruiker die deze service goed benut – gebruiker A.", excerpt: "In slechts 3 dagen een Short met 100 miljoen weergaven maken.", content: "Nederlandse inhoud 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "Bij het uploaden van Engelstalige Shorts\nBelangrijke aandachtspunten.", excerpt: "Wanneer je je richt op\nde Verenigde Staten, waar advertentiekosten hoog zijn.", content: "Nederlandse inhoud 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "VIDHUNT-routekaart", excerpt: "We vertellen je welke functies eraan komen.", content: "Nederlandse inhoud 10", category: "General", date: "2025-08-18" }
  ],

  // 포르투갈어 - 10개
  pt: [
    { id: 1, title: "VIDHUNT VS pesquisa geral no YouTube.\nQual é melhor?", excerpt: "Muitas pessoas têm esta dúvida: \"Qual é a diferença entre encontrar Shorts populares com o VIDHUNT e pesquisar vídeos diretamente no YouTube?\"", content: "Conteúdo português 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nConsiga gratuitamente em 10 segundos.", excerpt: "Todos os dados do YouTube\nuse gratuitamente!", content: "Conteúdo português 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Chave API do Google Gemini\nConsiga gratuitamente em 10 segundos!", excerpt: "A poderosa IA do Google em suas mãos!\nÉ gratuito.", content: "Conteúdo português 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "Quando você se depara com uma mensagem de erro!", excerpt: "A solução? Muito simples.", content: "Conteúdo português 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Ainda há cota de API restante,\nmas ocorre um erro!?", excerpt: "Cota da API excedida! Como resolver isso?", content: "Conteúdo português 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "Uma oportunidade de roubar\na viralidade dos canais concorrentes!", excerpt: "Use imediatamente 'Canais Favoritos'.", content: "Conteúdo português 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Aviso sobre o processamento da sua chave API", excerpt: "Aviso sobre a segurança da chave API", content: "Conteúdo português 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Um usuário que usa bem este serviço – usuário A.", excerpt: "Fazer um Short com 100 milhões de visualizações em apenas 3 dias.", content: "Conteúdo português 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "Ao fazer upload de Shorts em inglês\nPontos importantes de atenção.", excerpt: "Quando você mira\nnos Estados Unidos, onde os custos de publicidade são altos.", content: "Conteúdo português 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "Roteiro do VIDHUNT", excerpt: "Contaremos sobre os recursos que estão por vir.", content: "Conteúdo português 10", category: "General", date: "2025-08-18" }
  ],

  // 러시아어 - 10개
  ru: [
    { id: 1, title: "VIDHUNT VS обычный поиск на YouTube.\nЧто лучше?", excerpt: "Многих интересует вопрос: «В чём разница между поиском популярных шортсов с помощью VIDHUNT и прямым поиском видео на YouTube?»", content: "Русский контент 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\nПолучите бесплатно за 10 секунд.", excerpt: "Все данные YouTube\nиспользуйте бесплатно!", content: "Русский контент 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Ключ API Google Gemini\nПолучите бесплатно за 10 секунд!", excerpt: "Мощный ИИ Google в ваших руках!\nЭто бесплатно.", content: "Русский контент 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "Когда вы внезапно сталкиваетесь с сообщением об ошибке!", excerpt: "Решение? Очень просто.", content: "Русский контент 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "Квота API ещё есть,\nно возникает ошибка!?", excerpt: "Превышена квота API! Как это решить?", content: "Русский контент 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "Шанс украсть вирусность\nу конкурирующих каналов!", excerpt: "Используйте немедленно 'Избранные каналы'.", content: "Русский контент 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "Уведомление об обработке вашего ключа API", excerpt: "Уведомление о безопасности ключа API", content: "Русский контент 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "Пользователь, который хорошо использует этот сервис – пользователь А.", excerpt: "Сделать шортс со 100 миллионами просмотров всего за 3 дня.", content: "Русский контент 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "При загрузке английских шортсов\nВажные моменты.", excerpt: "Когда вы нацеливаетесь\nна США, где высокие расходы на рекламу.", content: "Русский контент 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "Дорожная карта VIDHUNT", excerpt: "Расскажем о функциях, которые появятся.", content: "Русский контент 10", category: "General", date: "2025-08-18" }
  ],

  // 힌디어 - 10개
  hi: [
    { id: 1, title: "VIDHUNT VS YouTube सामान्य खोज.\nक्या बेहतर है?", excerpt: "कई लोग यह प्रश्न करते हैं: \"VIDHUNT से लोकप्रिय शॉर्ट्स ढूँढने और YouTube पर सीधे वीडियो खोजने में, क्या फर्क है?\"", content: "हिंदी सामग्री 1", category: "General", date: "2025-08-18" },
    { id: 2, title: "YouTube Data\n10 सेकंड में मुफ्त प्राप्त करें.", excerpt: "YouTube के सभी डेटा\nमुफ्त उपयोग करें!", content: "हिंदी सामग्री 2", category: "General", date: "2025-08-18" },
    { id: 3, title: "Google Gemini API कुंजी\n10 सेकंड में मुफ्त प्राप्त करें!", excerpt: "Google का शक्तिशाली AI आपके हाथों में!\nयह मुफ्त है.", content: "हिंदी सामग्री 3", category: "General", date: "2025-08-18" },
    { id: 4, title: "जब आप अचानक एरर मैसेज का सामना करते हैं!", excerpt: "समाधान? बहुत सरल.", content: "हिंदी सामग्री 4", category: "General", date: "2025-08-18" },
    { id: 5, title: "API कोटा अभी भी बचा है,\nलेकिन एरर आ रहा है!?", excerpt: "API कोटा पार हो गया! इसे कैसे हल करें?", content: "हिंदी सामग्री 5", category: "General", date: "2025-08-18" },
    { id: 6, title: "प्रतिस्पर्धी चैनलों की वायरैलिटी\nचुराने का मौका!", excerpt: "तुरंत 'पसंदीदा चैनल' का उपयोग करें.", content: "हिंदी सामग्री 6", category: "General", date: "2025-08-18" },
    { id: 7, title: "आपकी API कुंजी प्रसंस्करण सूचना", excerpt: "API कुंजी सुरक्षा सूचना", content: "हिंदी सामग्री 7", category: "General", date: "2025-08-19" },
    { id: 8, title: "इस सेवा का अच्छा उपयोग करने वाला उपयोगकर्ता – उपयोगकर्ता A.", excerpt: "केवल 3 दिनों में 100 मिलियन व्यूज वाला शॉर्ट बनाएं.", content: "हिंदी सामग्री 8", category: "General", date: "2025-08-18" },
    { id: 9, title: "अंग्रेजी शॉर्ट्स अपलोड करते समय\nमहत्वपूर्ण बातें.", excerpt: "जब आप लक्षित करते हैं\nअमेरिका को, जहाँ विज्ञापन लागत अधिक है.", content: "हिंदी सामग्री 9", category: "General", date: "2025-08-18" },
    { id: 10, title: "VIDHUNT रोडमैप", excerpt: "आने वाली सुविधाओं के बारे में बताएंगे.", content: "हिंदी सामग्री 10", category: "General", date: "2025-08-18" }
  ]
};

// 간단한 API 함수들
export const loadArticlesForPage = async (pageNumber: number, language: Language = 'en'): Promise<Article[]> => {
  console.log(`🔍 Loading articles for page ${pageNumber}, language: ${language} [${CACHE_BUSTER}]`);
  
  // 페이지 1만 지원
  if (pageNumber !== 1) {
    return [];
  }
  
  const articles = NEWS_DATA[language] || [];
  console.log(`✅ Found ${articles.length} articles for ${language}`);
  
  return articles;
};

export const loadArticleFromFile = async (pageNumber: number, articleId: number, language: Language = 'en'): Promise<Article | null> => {
  console.log(`🔍 Loading single article: page ${pageNumber}, article ${articleId}, language: ${language}`);
  
  const articles = await loadArticlesForPage(pageNumber, language);
  const article = articles.find(a => a.id === articleId);
  
  if (article) {
    console.log(`✅ Found article: ${article.title}`);
    return article;
  }
  
  console.log(`❌ Article not found`);
  return null;
};

// 이미지 관련 헬퍼 함수들
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
  return content.replace(/\[IMAGE:([^\]]+)\]/g, (match, filename) => {
    return `[IMAGE:${getImagePath(pageNumber, filename)}]`;
  });
};