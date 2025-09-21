import { Language } from '../types';

// 🌍 탐험하기 전용 다국어 번역 (ShortsCard 패턴 적용)
// 11개 언어 완전 지원: 영어, 한국어, 일본어, 중국어, 힌디어, 스페인어, 프랑스어, 독일어, 네덜란드어, 포르투갈어, 러시아어
export const explorationTranslations = {
  // 🔍 탐험하기 블럭 (ExplorationBlocks)
  explorationTitle: {
    en: 'Exploration', ko: '탐험하기', ja: '探索', zh: '探索', hi: 'अन्वेषण',
    es: 'Exploración', fr: 'Exploration', de: 'Erkundung', nl: 'Verkenning', pt: 'Exploração', ru: 'Исследование'
  },
  explorationSubtitle: {
    en: 'Discover trending content', ko: '트렌딩 콘텐츠 발견', ja: 'トレンドコンテンツを発見', zh: '发现热门内容', hi: 'ट्रेंडिंग सामग्री खोजें',
    es: 'Descubre contenido en tendencia', fr: 'Découvrez le contenu tendance', de: 'Entdecke Trending-Inhalte', nl: 'Ontdek trending content', pt: 'Descubra conteúdo em alta', ru: 'Откройте трендовый контент'
  },
  loadMore: {
    en: 'Load More', ko: '더 보기', ja: 'もっと見る', zh: '加载更多', hi: 'और देखें',
    es: 'Cargar Más', fr: 'Charger Plus', de: 'Mehr Laden', nl: 'Meer Laden', pt: 'Carregar Mais', ru: 'Загрузить Ещё'
  },
  noData: {
    en: 'No data available', ko: '데이터가 없습니다', ja: 'データがありません', zh: '暂无数据', hi: 'कोई डेटा उपलब्ध नहीं',
    es: 'No hay datos disponibles', fr: 'Aucune donnée disponible', de: 'Keine Daten verfügbar', nl: 'Geen gegevens beschikbaar', pt: 'Nenhum dado disponível', ru: 'Нет доступных данных'
  },

  // 🎛 필터링 (YouTubeFilter)
  filterCategory: {
    en: 'Category', ko: '카테고리', ja: 'カテゴリー', zh: '类别', hi: 'श्रेणी',
    es: 'Categoría', fr: 'Catégorie', de: 'Kategorie', nl: 'Categorie', pt: 'Categoria', ru: 'Категория'
  },
  filterCriteria: {
    en: 'Criteria', ko: '기준', ja: '基準', zh: '标准', hi: 'मापदंड',
    es: 'Criterios', fr: 'Critères', de: 'Kriterien', nl: 'Criteria', pt: 'Critérios', ru: 'Критерии'
  },
  filterCountry: {
    en: 'Country', ko: '국가', ja: '国', zh: '国家', hi: 'देश',
    es: 'País', fr: 'Pays', de: 'Land', nl: 'Land', pt: 'País', ru: 'Страна'
  },
  filterPeriod: {
    en: 'Period', ko: '기간', ja: '期間', zh: '期间', hi: 'अवधि',
    es: 'Período', fr: 'Période', de: 'Zeitraum', nl: 'Periode', pt: 'Período', ru: 'Период'
  },
  filterDate: {
    en: 'Date', ko: '날짜', ja: '日付', zh: '日期', hi: 'तारीख',
    es: 'Fecha', fr: 'Date', de: 'Datum', nl: 'Datum', pt: 'Data', ru: 'Дата'
  },
  filterChannel: {
    en: 'Channel', ko: '채널', ja: 'チャンネル', zh: '频道', hi: 'चैनल',
    es: 'Canal', fr: 'Chaîne', de: 'Kanal', nl: 'Kanaal', pt: 'Canal', ru: 'Канал'
  },
  filterAll: {
    en: 'All', ko: '전체', ja: 'すべて', zh: '全部', hi: 'सभी',
    es: 'Todos', fr: 'Tous', de: 'Alle', nl: 'Alle', pt: 'Todos', ru: 'Все'
  },
  filterViews: {
    en: 'Views', ko: '조회수', ja: '再生回数', zh: '观看次数', hi: 'दृश्य',
    es: 'Vistas', fr: 'Vues', de: 'Aufrufe', nl: 'Weergaven', pt: 'Visualizações', ru: 'Просмотры'
  },
  filterSubscribers: {
    en: 'Subscribers', ko: '구독자', ja: '登録者', zh: '订阅者', hi: 'सब्सक्राइबर',
    es: 'Suscriptores', fr: 'Abonnés', de: 'Abonnenten', nl: 'Abonnees', pt: 'Inscritos', ru: 'Подписчики'
  },
  filterWorldwide: {
    en: '🌍 Worldwide', ko: '🌍 전세계', ja: '🌍 世界中', zh: '🌍 全球', hi: '🌍 विश्वव्यापी',
    es: '🌍 Mundial', fr: '🌍 Mondial', de: '🌍 Weltweit', nl: '🌍 Wereldwijd', pt: '🌍 Mundial', ru: '🌍 По всему миру'
  },
  filterMonthly: {
    en: 'Monthly', ko: '월간', ja: '月間', zh: '月度', hi: 'मासिक',
    es: 'Mensual', fr: 'Mensuel', de: 'Monatlich', nl: 'Maandelijks', pt: 'Mensal', ru: 'Ежемесячно'
  },
  filterWeekly: {
    en: 'Weekly', ko: '주간', ja: '週間', zh: '周度', hi: 'साप्ताहिक',
    es: 'Semanal', fr: 'Hebdomadaire', de: 'Wöchentlich', nl: 'Wekelijks', pt: 'Semanal', ru: 'Еженедельно'
  },
  filterDaily: {
    en: 'Daily', ko: '일간', ja: '日間', zh: '日度', hi: 'दैनिक',
    es: 'Diario', fr: 'Quotidien', de: 'Täglich', nl: 'Dagelijks', pt: 'Diário', ru: 'Ежедневно'
  },
  filterYearly: {
    en: 'Yearly', ko: '연간', ja: '年間', zh: '年度', hi: 'वार्षिक',
    es: 'Anual', fr: 'Annuel', de: 'Jährlich', nl: 'Jaarlijks', pt: 'Anual', ru: 'Ежегодно'
  },

  // 📊 랭킹 테이블 (RankingTable)
  rankingRank: {
    en: 'Rank', ko: '순위', ja: 'ランク', zh: '排名', hi: 'रैंक',
    es: 'Rango', fr: 'Rang', de: 'Rang', nl: 'Rang', pt: 'Classificação', ru: 'Ранг'
  },
  rankingChannel: {
    en: 'Channel', ko: '채널', ja: 'チャンネル', zh: '频道', hi: 'चैनल',
    es: 'Canal', fr: 'Chaîne', de: 'Kanal', nl: 'Kanaal', pt: 'Canal', ru: 'Канал'
  },
  rankingSubscribers: {
    en: 'Subscribers', ko: '구독자', ja: '登録者数', zh: '订阅者数', hi: 'सब्सक्राइबर संख्या',
    es: 'Suscriptores', fr: 'Abonnés', de: 'Abonnenten', nl: 'Abonnees', pt: 'Inscritos', ru: 'Подписчики'
  },
  rankingViews: {
    en: 'Views', ko: '조회수', ja: '再生回数', zh: '观看次数', hi: 'दृश्य',
    es: 'Vistas', fr: 'Vues', de: 'Aufrufe', nl: 'Weergaven', pt: 'Visualizações', ru: 'Просмотры'
  },
  rankingTitle: {
    en: 'Title', ko: '제목', ja: 'タイトル', zh: '标题', hi: 'शीर्षक',
    es: 'Título', fr: 'Titre', de: 'Titel', nl: 'Titel', pt: 'Título', ru: 'Заголовок'
  },
  paginationPage: {
    en: 'Page', ko: '페이지', ja: 'ページ', zh: '页面', hi: 'पृष्ठ',
    es: 'Página', fr: 'Page', de: 'Seite', nl: 'Pagina', pt: 'Página', ru: 'Страница'
  },
  paginationOf: {
    en: 'of', ko: '/', ja: '/', zh: '/', hi: 'का',
    es: 'de', fr: 'de', de: 'von', nl: 'van', pt: 'de', ru: 'из'
  },

  // 📱 사이드바 (ExplorationSidebar)
  sidebarChannelInfo: {
    en: 'Channel Information', ko: '채널 정보', ja: 'チャンネル情報', zh: '频道信息', hi: 'चैनल जानकारी',
    es: 'Información del Canal', fr: 'Informations sur la Chaîne', de: 'Kanal-Informationen', nl: 'Kanaalinformatie', pt: 'Informações do Canal', ru: 'Информация о канале'
  },
  sidebarCategory: {
    en: 'Category', ko: '카테고리', ja: 'カテゴリー', zh: '类别', hi: 'श्रेणी',
    es: 'Categoría', fr: 'Catégorie', de: 'Kategorie', nl: 'Categorie', pt: 'Categoria', ru: 'Категория'
  },
  sidebarSubscribers: {
    en: 'Subscribers', ko: '구독자', ja: '登録者', zh: '订阅者', hi: 'सब्सक्राइबर',
    es: 'Suscriptores', fr: 'Abonnés', de: 'Abonnenten', nl: 'Abonnees', pt: 'Inscritos', ru: 'Подписчики'
  },
  sidebarCountry: {
    en: 'Country', ko: '국가', ja: '国', zh: '国家', hi: 'देश',
    es: 'País', fr: 'Pays', de: 'Land', nl: 'Land', pt: 'País', ru: 'Страна'
  },
  sidebarOperatingPeriod: {
    en: 'Operating Period', ko: '운영기간', ja: '運営期間', zh: '运营期间', hi: 'संचालन अवधि',
    es: 'Período de Operación', fr: 'Période d\'Exploitation', de: 'Betriebszeitraum', nl: 'Bedrijfsperiode', pt: 'Período de Operação', ru: 'Период работы'
  },
  sidebarTotalViews: {
    en: 'Total Views', ko: '총 조회수', ja: '総再生回数', zh: '总观看次数', hi: 'कुल दृश्य',
    es: 'Vistas Totales', fr: 'Vues Totales', de: 'Gesamt Aufrufe', nl: 'Totaal Weergaven', pt: 'Visualizações Totais', ru: 'Всего просмотров'
  },
  sidebarRevenueCalculation: {
    en: 'Revenue Calculation', ko: '수익 계산', ja: '収益計算', zh: '收入计算', hi: 'राजस्व गणना',
    es: 'Cálculo de Ingresos', fr: 'Calcul des Revenus', de: 'Umsatzberechnung', nl: 'Omzetberekening', pt: 'Cálculo de Receita', ru: 'Расчет доходов'
  },
  sidebarShortsRpm: {
    en: 'Shorts RPM', ko: '쇼츠 RPM', ja: 'ショーツRPM', zh: '短视频RPM', hi: 'शॉर्ट्स RPM',
    es: 'RPM de Shorts', fr: 'RPM des Shorts', de: 'Shorts RPM', nl: 'Shorts RPM', pt: 'RPM de Shorts', ru: 'RPM Шортсов'
  },
  sidebarLongformRpm: {
    en: 'Long-form RPM', ko: '롱폼 RPM', ja: 'ロングフォームRPM', zh: '长视频RPM', hi: 'लॉन्ग-फॉर्म RPM',
    es: 'RPM de Formato Largo', fr: 'RPM de Format Long', de: 'Langform RPM', nl: 'Langvorm RPM', pt: 'RPM de Formato Longo', ru: 'RPM Длинных Видео'
  },
  sidebarTotalRevenue: {
    en: 'Total Revenue', ko: '총 수익', ja: '総収益', zh: '总收入', hi: 'कुल राजस्व',
    es: 'Ingresos Totales', fr: 'Revenus Totaux', de: 'Gesamtumsatz', nl: 'Totale Omzet', pt: 'Receita Total', ru: 'Общий доход'
  },
  sidebarExchangeRate: {
    en: 'Exchange Rate', ko: '환율', ja: '為替レート', zh: '汇率', hi: 'विनिमय दर',
    es: 'Tipo de Cambio', fr: 'Taux de Change', de: 'Wechselkurs', nl: 'Wisselkoers', pt: 'Taxa de Câmbio', ru: 'Курс обмена'
  },
  sidebarCountryRpm: {
    en: 'Country RPM', ko: '국가 RPM', ja: '国別RPM', zh: '国家RPM', hi: 'देश RPM',
    es: 'RPM del País', fr: 'RPM du Pays', de: 'Land RPM', nl: 'Land RPM', pt: 'RPM do País', ru: 'RPM Страны'
  },
  sidebarCopyLink: {
    en: 'Copy Link', ko: '링크 복사', ja: 'リンクをコピー', zh: '复制链接', hi: 'लिंक कॉपी करें',
    es: 'Copiar Enlace', fr: 'Copier le Lien', de: 'Link Kopieren', nl: 'Link Kopiëren', pt: 'Copiar Link', ru: 'Скопировать ссылку'
  },
  sidebarViewChannel: {
    en: 'View Channel', ko: '채널 보기', ja: 'チャンネルを見る', zh: '查看频道', hi: 'चैनल देखें',
    es: 'Ver Canal', fr: 'Voir la Chaîne', de: 'Kanal Anzeigen', nl: 'Kanaal Bekijken', pt: 'Ver Canal', ru: 'Просмотреть канал'
  },
  sidebarClose: {
    en: 'Close', ko: '닫기', ja: '閉じる', zh: '关闭', hi: 'बंद करें',
    es: 'Cerrar', fr: 'Fermer', de: 'Schließen', nl: 'Sluiten', pt: 'Fechar', ru: 'Закрыть'
  },

  // 📅 월별 번역 (날짜 필터용)
  monthJanuary: {
    en: 'January', ko: '1월', ja: '1月', zh: '1月', hi: 'जनवरी',
    es: 'Enero', fr: 'Janvier', de: 'Januar', nl: 'Januari', pt: 'Janeiro', ru: 'Январь'
  },
  monthFebruary: {
    en: 'February', ko: '2월', ja: '2月', zh: '2月', hi: 'फरवरी',
    es: 'Febrero', fr: 'Février', de: 'Februar', nl: 'Februari', pt: 'Fevereiro', ru: 'Февраль'
  },
  monthMarch: {
    en: 'March', ko: '3월', ja: '3月', zh: '3月', hi: 'मार्च',
    es: 'Marzo', fr: 'Mars', de: 'März', nl: 'Maart', pt: 'Março', ru: 'Март'
  },
  monthApril: {
    en: 'April', ko: '4월', ja: '4月', zh: '4月', hi: 'अप्रैल',
    es: 'Abril', fr: 'Avril', de: 'April', nl: 'April', pt: 'Abril', ru: 'Апрель'
  },
  monthMay: {
    en: 'May', ko: '5월', ja: '5月', zh: '5月', hi: 'मई',
    es: 'Mayo', fr: 'Mai', de: 'Mai', nl: 'Mei', pt: 'Maio', ru: 'Май'
  },
  monthJune: {
    en: 'June', ko: '6월', ja: '6月', zh: '6月', hi: 'जून',
    es: 'Junio', fr: 'Juin', de: 'Juni', nl: 'Juni', pt: 'Junho', ru: 'Июнь'
  },
  monthJuly: {
    en: 'July', ko: '7월', ja: '7月', zh: '7月', hi: 'जुलाई',
    es: 'Julio', fr: 'Juillet', de: 'Juli', nl: 'Juli', pt: 'Julho', ru: 'Июль'
  },
  monthAugust: {
    en: 'August', ko: '8월', ja: '8月', zh: '8月', hi: 'अगस्त',
    es: 'Agosto', fr: 'Août', de: 'August', nl: 'Augustus', pt: 'Agosto', ru: 'Август'
  },
  monthSeptember: {
    en: 'September', ko: '9월', ja: '9月', zh: '9月', hi: 'सितंबर',
    es: 'Septiembre', fr: 'Septembre', de: 'September', nl: 'September', pt: 'Setembro', ru: 'Сентябрь'
  },
  monthOctober: {
    en: 'October', ko: '10월', ja: '10月', zh: '10月', hi: 'अक्टूबर',
    es: 'Octubre', fr: 'Octobre', de: 'Oktober', nl: 'Oktober', pt: 'Outubro', ru: 'Октябрь'
  },
  monthNovember: {
    en: 'November', ko: '11월', ja: '11月', zh: '11月', hi: 'नवंबर',
    es: 'Noviembre', fr: 'Novembre', de: 'November', nl: 'November', pt: 'Novembro', ru: 'Ноябрь'
  },
  monthDecember: {
    en: 'December', ko: '12월', ja: '12月', zh: '12月', hi: 'दिसंबर',
    es: 'Diciembre', fr: 'Décembre', de: 'Dezember', nl: 'December', pt: 'Dezembro', ru: 'Декабрь'
  },

  // 🗓 요일 번역 (일간 필터용)
  weekdaySunday: {
    en: 'Sun', ko: '일', ja: '日', zh: '日', hi: 'रवि',
    es: 'Dom', fr: 'Dim', de: 'So', nl: 'Zo', pt: 'Dom', ru: 'Вс'
  },
  weekdayMonday: {
    en: 'Mon', ko: '월', ja: '月', zh: '一', hi: 'सोम',
    es: 'Lun', fr: 'Lun', de: 'Mo', nl: 'Ma', pt: 'Seg', ru: 'Пн'
  },
  weekdayTuesday: {
    en: 'Tue', ko: '화', ja: '火', zh: '二', hi: 'मंगल',
    es: 'Mar', fr: 'Mar', de: 'Di', nl: 'Di', pt: 'Ter', ru: 'Вт'
  },
  weekdayWednesday: {
    en: 'Wed', ko: '수', ja: '水', zh: '三', hi: 'बुध',
    es: 'Mié', fr: 'Mer', de: 'Mi', nl: 'Wo', pt: 'Qua', ru: 'Ср'
  },
  weekdayThursday: {
    en: 'Thu', ko: '목', ja: '木', zh: '四', hi: 'गुरु',
    es: 'Jue', fr: 'Jeu', de: 'Do', nl: 'Do', pt: 'Qui', ru: 'Чт'
  },
  weekdayFriday: {
    en: 'Fri', ko: '금', ja: '金', zh: '五', hi: 'शुक्र',
    es: 'Vie', fr: 'Ven', de: 'Fr', nl: 'Vr', pt: 'Sex', ru: 'Пт'
  },
  weekdaySaturday: {
    en: 'Sat', ko: '토', ja: '土', zh: '六', hi: 'शनि',
    es: 'Sáb', fr: 'Sam', de: 'Sa', nl: 'Za', pt: 'Sáb', ru: 'Сб'
  },

  // 📊 주차 번역 (주간 필터용)
  weekFirst: {
    en: '1st week', ko: '1주', ja: '第1週', zh: '第1周', hi: 'पहला सप्ताह',
    es: '1ª semana', fr: '1ère semaine', de: '1. Woche', nl: '1e week', pt: '1ª semana', ru: '1-я неделя'
  },
  weekSecond: {
    en: '2nd week', ko: '2주', ja: '第2週', zh: '第2周', hi: 'दूसरा सप्ताह',
    es: '2ª semana', fr: '2e semaine', de: '2. Woche', nl: '2e week', pt: '2ª semana', ru: '2-я неделя'
  },
  weekThird: {
    en: '3rd week', ko: '3주', ja: '第3週', zh: '第3周', hi: 'तीसरा सप्ताह',
    es: '3ª semana', fr: '3e semaine', de: '3. Woche', nl: '3e week', pt: '3ª semana', ru: '3-я неделя'
  },
  weekFourth: {
    en: '4th week', ko: '4주', ja: '第4週', zh: '第4周', hi: 'चौथा सप्ताह',
    es: '4ª semana', fr: '4e semaine', de: '4. Woche', nl: '4e week', pt: '4ª semana', ru: '4-я неделя'
  },

  // 📅 연도 번역 (연간 필터용)
  year2024: {
    en: '2024', ko: '2024년', ja: '2024年', zh: '2024年', hi: '2024',
    es: '2024', fr: '2024', de: '2024', nl: '2024', pt: '2024', ru: '2024'
  },
  year2025: {
    en: '2025', ko: '2025년', ja: '2025年', zh: '2025年', hi: '2025',
    es: '2025', fr: '2025', de: '2025', nl: '2025', pt: '2025', ru: '2025'
  },

  // 🔄 상태 메시지
  statusLoading: {
    en: 'Loading data...', ko: '데이터 로딩 중...', ja: 'データ読み込み中...', zh: '正在加载数据...', hi: 'डेटा लोड हो रहा है...',
    es: 'Cargando datos...', fr: 'Chargement des données...', de: 'Daten werden geladen...', nl: 'Gegevens laden...', pt: 'Carregando dados...', ru: 'Загрузка данных...'
  },
  statusDataConnected: {
    en: 'data connected', ko: '개 데이터 연동', ja: 'データ連携', zh: '数据连接', hi: 'डेटा कनेक्टेड',
    es: 'datos conectados', fr: 'données connectées', de: 'Daten verbunden', nl: 'data verbonden', pt: 'dados conectados', ru: 'данные подключены'
  },
  statusDummyData: {
    en: '🥶 Connecting to data..', ko: '🥶 데이터 연결 중..', ja: '🥶 データ接続中..', zh: '🥶 数据连接中..', hi: '🥶 डेटा कनेक्ट हो रहा है..',
    es: '🥶 Conectando a datos..', fr: '🥶 Connexion aux données..', de: '🥶 Datenverbindung..', nl: '🥶 Verbinding met data..', pt: '🥶 Conectando dados..', ru: '🥶 Подключение к данным..'
  },
};

// 🛠 번역 함수 (ShortsCard 패턴)
export const getExplorationTranslation = (language: Language, key: keyof typeof explorationTranslations): string => {
  return explorationTranslations[key][language] || explorationTranslations[key].en;
};

// 🎯 편의 Hook (컴포넌트에서 사용)
export const useExplorationTranslation = (language: Language) => {
  return (key: keyof typeof explorationTranslations): string => {
    return getExplorationTranslation(language, key);
  };
};