import { Language } from '../types';

export const channelFinderTranslations: Record<Language, Record<string, string>> = {
  en: {
    // Main title
    mainTitle: "Global YouTube Channel Data",
    
    // Stat tooltips
    viewsPerSubscriberTooltip: "This metric shows high view counts relative to subscribers. It means your content is being exposed to many users beyond your own subscribers.",
    subscriptionRateTooltip: "This metric shows the rate of people who subscribe after watching videos. An average of 3% is considered very high. Even if only 3 out of 100 viewers subscribe, it's an excellent metric.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["From May to June", "3% growth"],
    growthTooltip_6to7: ["From June to July", "4% growth"],
    growthTooltip_7to8: ["From July to August", "7.3% growth"],
    growthTooltip_8to9: ["From August to September", "10% growth"],
    
    // RPM section
    countryRpmLabel: "Country RPM:",
    totalViewsLabel: "Total Views",
    shortsRpmLabel: "Shorts RPM",
    longRpmLabel: "Long RPM",
    totalRevenueLabel: "Total Revenue",
    
    // Detail info labels
    totalViewsDetailLabel: "Total Views",
    avgViewsLabel: "Average Views",
    totalVideosLabel: "Total Videos",
    uploadFrequencyLabel: "Upload Frequency",
    monthlyGrowthLabel: "Monthly Growth",
    yearlyGrowthLabel: "Yearly Growth",
    viewsPerSubscriberLabel: "Views per Subscriber", 
    subscriptionRateLabel: "Subscription Rate",
    
    // Filter Tags
    filterTag_videoRevenue: "Under {videoCount} videos\\nEarning {revenue} or more monthly",
    filterTag_periodRevenue: "Active under {period}\\nEarning {revenue} or more monthly", 
    filterTag_videoSubscribers: "Under {videoCount} videos\\n{subscribers} or more subscribers",
    filterTag_monthlyRevenue: "Monthly revenue {revenue} or more",
    filterTag_avgViews: "Average views {views} or more",
    
    // Revenue Options
    revenue_76923: "$100K",
    revenue_38461: "$50K", 
    revenue_23077: "$30K",
    revenue_7692: "$10K",
    revenue_3846: "$5K",
    revenue_2308: "$3K", 
    revenue_769: "$1K",
    revenue_385: "$500",
    revenue_77: "$100",
    
    // Views Options
    views_100000000: "100M",
    views_50000000: "50M",
    views_30000000: "30M",
    views_10000000: "10M",
    views_5000000: "5M",
    views_1000000: "1M",
    views_500000: "500K",
    views_100000: "100K",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "100M",
    subscribers_50000000: "50M",
    subscribers_30000000: "30M",
    subscribers_10000000: "10M",
    subscribers_5000000: "5M",
    subscribers_1000000: "1M",
    subscribers_500000: "500K",
    subscribers_100000: "100K",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 years",
    period_10: "10 years",
    period_5: "5 years",
    period_3: "3 years",
    period_1: "1 year",
    "period_0.5": "6 months",
    "period_0.25": "3 months",
    
    // VideoCount Options
    videoCount_1000: "1000",
    videoCount_500: "500",
    videoCount_100: "100",
    videoCount_50: "50",
    videoCount_30: "30",
    videoCount_10: "10"
  },
  
  ko: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "이 수치는 구독자 대비하여 조회수가 높게 나오는 것입니다.<br/>즉, 내 구독자 외에 더 많은 사용자에게 영상을 노출해주고 있다는 뜻입니다.",
    subscriptionRateTooltip: "영상을 보고 구독으로 전환하는 사람들의 수치입니다. 평균적으로 3%로만 되어도 굉장히 높습니다.<br/>즉 영상을 본 100명중 3명만 구독을 하더라도 굉장히 좋은 수치라고 할 수 있습니다.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["5월에서 6월에", "3% 성장했어요"],
    growthTooltip_6to7: ["6월에서 7월에", "4% 성장했어요"],
    growthTooltip_7to8: ["7월에서 8월에", "7.3% 성장했어요"],
    growthTooltip_8to9: ["8월에서 9월에", "10% 성장했어요"],
    
    // RPM section
    countryRpmLabel: "국가별 RPM:",
    totalViewsLabel: "총 조회수",
    shortsRpmLabel: "숏폼 RPM",
    longRpmLabel: "롱폼 RPM", 
    totalRevenueLabel: "총 수익",
    
    // Detail info labels
    totalViewsDetailLabel: "총 조회수",
    avgViewsLabel: "평균 조회수",
    totalVideosLabel: "총 영상수",
    uploadFrequencyLabel: "업로드 빈도",
    monthlyGrowthLabel: "월간증가",
    yearlyGrowthLabel: "년간증가",
    viewsPerSubscriberLabel: "구독자 대비 조회수",
    subscriptionRateLabel: "구독 전환율",
    
    // Filter Tags
    filterTag_videoRevenue: "영상 개수 {videoCount} 이하\\n매월 {revenue}원 이상 버는 채널",
    filterTag_periodRevenue: "개설 {period} 이하\\n매월 {revenue}원 이상 버는 채널", 
    filterTag_videoSubscribers: "영상 개수 {videoCount} 이하\\n구독자 {subscribers} 이상 채널",
    filterTag_monthlyRevenue: "평균 월 {revenue}원 이상 버는 채널",
    filterTag_avgViews: "평균 조회수 {views} 이상 채널",
    
    // Revenue Options
    revenue_76923: "1억",
    revenue_38461: "5천만", 
    revenue_23077: "3천만",
    revenue_7692: "1천만",
    revenue_3846: "500만",
    revenue_2308: "300만", 
    revenue_769: "100만",
    revenue_385: "50만",
    revenue_77: "10만",
    
    // Views Options
    views_100000000: "1억",
    views_50000000: "5천만",
    views_30000000: "3천만",
    views_10000000: "1천만",
    views_5000000: "500만",
    views_1000000: "100만",
    views_500000: "50만",
    views_100000: "10만",
    views_50000: "5만",
    views_10000: "1만",
    
    // Subscribers Options
    subscribers_100000000: "1억",
    subscribers_50000000: "5천만",
    subscribers_30000000: "3천만",
    subscribers_10000000: "1천만",
    subscribers_5000000: "500만",
    subscribers_1000000: "100만",
    subscribers_500000: "50만",
    subscribers_100000: "10만",
    subscribers_50000: "5만",
    subscribers_10000: "1만",
    
    // Period Options
    period_20: "20년",
    period_10: "10년",
    period_5: "5년",
    period_3: "3년",
    period_1: "1년",
    "period_0.5": "6개월",
    "period_0.25": "3개월",

    // VideoCount Options
    videoCount_1000: "1000개",
    videoCount_500: "500개",
    videoCount_100: "100개",
    videoCount_50: "50개",
    videoCount_30: "30개",
    videoCount_10: "10개"
  },
  
  ja: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "この数値は購読者に対して再生回数が高く出ることを示します。<br/>つまり、自分の購読者以外により多くのユーザーに動画が露出されているという意味です。",
    subscriptionRateTooltip: "動画を見て購読に転換する人々の数値です。平均的に3%でも非常に高い数値です。<br/>つまり動画を見た100人中3人だけ購読しても非常に良い数値と言えます。",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["5月から6月に", "3%成長しました"],
    growthTooltip_6to7: ["6月から7月に", "4%成長しました"],
    growthTooltip_7to8: ["7月から8月に", "7.3%成長しました"],
    growthTooltip_8to9: ["8月から9月に", "10%成長しました"],
    
    // RPM section
    countryRpmLabel: "国別RPM:",
    totalViewsLabel: "総再生回数",
    shortsRpmLabel: "ショートRPM",
    longRpmLabel: "ロングRPM",
    totalRevenueLabel: "総収益",
    
    // Detail info labels
    totalViewsDetailLabel: "総再生回数",
    avgViewsLabel: "平均再生回数", 
    totalVideosLabel: "総動画数",
    uploadFrequencyLabel: "アップロード頻度",
    monthlyGrowthLabel: "月間増加",
    yearlyGrowthLabel: "年間増加",
    viewsPerSubscriberLabel: "購読者対比再生回数",
    subscriptionRateLabel: "購読転換率",
    
    // Filter Tags
    filterTag_videoRevenue: "動画{videoCount}本以下\\n月収{revenue}以上",
    filterTag_periodRevenue: "開設{period}以下\\n月収{revenue}以上",
    filterTag_videoSubscribers: "動画{videoCount}本以下\\n登録者{subscribers}人以上",
    filterTag_monthlyRevenue: "月収{revenue}以上",
    filterTag_avgViews: "平均再生{views}回以上",
    
    // Revenue Options
    revenue_76923: "1000万",
    revenue_38461: "500万", 
    revenue_23077: "300万",
    revenue_7692: "100万",
    revenue_3846: "50万",
    revenue_2308: "30万", 
    revenue_769: "10万",
    revenue_385: "5万",
    revenue_77: "1万",
    
    // Views Options
    views_100000000: "1億",
    views_50000000: "5000万",
    views_30000000: "3000万",
    views_10000000: "1000万",
    views_5000000: "500万",
    views_1000000: "100万",
    views_500000: "50万",
    views_100000: "10万",
    views_50000: "5万",
    views_10000: "1万",
    
    // Subscribers Options
    subscribers_100000000: "1億",
    subscribers_50000000: "5000万",
    subscribers_30000000: "3000万",
    subscribers_10000000: "1000万",
    subscribers_5000000: "500万",
    subscribers_1000000: "100万",
    subscribers_500000: "50万",
    subscribers_100000: "10万",
    subscribers_50000: "5万",
    subscribers_10000: "1万",
    
    // Period Options
    period_20: "20年",
    period_10: "10年",
    period_5: "5年",
    period_3: "3年",
    period_1: "1年",
    "period_0.5": "6か月",
    "period_0.25": "3か月",

    // VideoCount Options
    videoCount_1000: "1000本",
    videoCount_500: "500本",
    videoCount_100: "100本",
    videoCount_50: "50本",
    videoCount_30: "30本",
    videoCount_10: "10本"
  },
  
  ru: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "Этот показатель показывает высокое количество просмотров относительно подписчиков.<br/>Это означает, что ваш контент показывается многим пользователям помимо ваших собственных подписчиков.",
    subscriptionRateTooltip: "Этот показатель показывает долю людей, которые подписываются после просмотра видео. Среднее значение 3% считается очень высоким.<br/>Даже если только 3 из 100 зрителей подпишутся, это отличный показатель.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["С мая по июнь", "Рост на 3%"],
    growthTooltip_6to7: ["С июня по июль", "Рост на 4%"],
    growthTooltip_7to8: ["С июля по август", "Рост на 7.3%"],
    growthTooltip_8to9: ["С августа по сентябрь", "Рост на 10%"],
    
    // RPM section
    countryRpmLabel: "RPM по странам:",
    totalViewsLabel: "Общие просмотры",
    shortsRpmLabel: "RPM шортсов",
    longRpmLabel: "RPM длинных видео",
    totalRevenueLabel: "Общий доход",
    
    // Detail info labels
    totalViewsDetailLabel: "Общие просмотры",
    avgViewsLabel: "Средние просмотры",
    totalVideosLabel: "Общее количество видео",
    uploadFrequencyLabel: "Частота загрузки",
    monthlyGrowthLabel: "Месячный рост",
    yearlyGrowthLabel: "Годовой рост",
    viewsPerSubscriberLabel: "Просмотры на подписчика",
    subscriptionRateLabel: "Коэффициент подписки",
    
    // Filter Tags
    filterTag_videoRevenue: "До {videoCount} видео\\nДоход от {revenue} в месяц",
    filterTag_periodRevenue: "Активен до {period}\\nДоход от {revenue} в месяц",
    filterTag_videoSubscribers: "До {videoCount} видео\\nОт {subscribers} подписчиков",
    filterTag_monthlyRevenue: "Доход от {revenue} в месяц",
    filterTag_avgViews: "Средние просмотры от {views}",
    
    // Revenue Options
    revenue_76923: "₽5M",
    revenue_38461: "₽2.5M", 
    revenue_23077: "₽1.5M",
    revenue_7692: "₽500K",
    revenue_3846: "₽250K",
    revenue_2308: "₽150K", 
    revenue_769: "₽50K",
    revenue_385: "₽25K",
    revenue_77: "₽5K",
    
    // Views Options
    views_100000000: "100 млн",
    views_50000000: "50 млн",
    views_30000000: "30 млн",
    views_10000000: "10 млн",
    views_5000000: "5 млн",
    views_1000000: "1 млн",
    views_500000: "500 тыс",
    views_100000: "100 тыс",
    views_50000: "50 тыс",
    views_10000: "10 тыс",
    
    // Subscribers Options
    subscribers_100000000: "100 млн",
    subscribers_50000000: "50 млн",
    subscribers_30000000: "30 млн",
    subscribers_10000000: "10 млн",
    subscribers_5000000: "5 млн",
    subscribers_1000000: "1 млн",
    subscribers_500000: "500 тыс",
    subscribers_100000: "100 тыс",
    subscribers_50000: "50 тыс",
    subscribers_10000: "10 тыс",
    
    // Period Options
    period_20: "20 лет",
    period_10: "10 лет",
    period_5: "5 лет",
    period_3: "3 лет",
    period_1: "1 год",
    "period_0.5": "6 месяцев",
    "period_0.25": "3 месяца"
  },
  
  nl: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "Deze metriek toont hoge kijkcijfers in verhouding tot abonnees. Het betekent dat je content wordt getoond aan veel gebruikers naast je eigen abonnees.",
    subscriptionRateTooltip: "Deze metriek toont het percentage mensen dat zich abonneert na het bekijken van video's. Een gemiddelde van 3% wordt als zeer hoog beschouwd. Zelfs als slechts 3 van de 100 kijkers zich abonneert, is dat een uitstekende metriek.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["Van mei naar juni", "3% groei"],
    growthTooltip_6to7: ["Van juni naar juli", "4% groei"],
    growthTooltip_7to8: ["Van juli naar augustus", "7.3% groei"],
    growthTooltip_8to9: ["Van augustus naar september", "10% groei"],
    
    // RPM section
    countryRpmLabel: "Land RPM:",
    totalViewsLabel: "Totale weergaven",
    shortsRpmLabel: "Shorts RPM",
    longRpmLabel: "Lange RPM",
    totalRevenueLabel: "Totale inkomsten",
    
    // Detail info labels
    totalViewsDetailLabel: "Totale weergaven",
    avgViewsLabel: "Gemiddelde weergaven",
    totalVideosLabel: "Totaal video's",
    uploadFrequencyLabel: "Upload frequentie",
    monthlyGrowthLabel: "Maandelijkse groei",
    yearlyGrowthLabel: "Jaarlijkse groei",
    viewsPerSubscriberLabel: "Weergaven per abonnee",
    subscriptionRateLabel: "Abonnementspercentage",
    
    // Filter Tags
    filterTag_videoRevenue: "Onder {videoCount} video's\\nVerdienen {revenue} of meer per maand",
    filterTag_periodRevenue: "Actief onder {period}\\nVerdienen {revenue} of meer per maand",
    filterTag_videoSubscribers: "Onder {videoCount} video's\\n{subscribers} of meer abonnees",
    filterTag_monthlyRevenue: "Maandelijks inkomen {revenue} of meer",
    filterTag_avgViews: "Gemiddelde weergaven {views} of meer",
    
    // Revenue Options
    revenue_76923: "€75K",
    revenue_38461: "€37K", 
    revenue_23077: "€22K",
    revenue_7692: "€7.5K",
    revenue_3846: "€3.7K",
    revenue_2308: "€2.2K", 
    revenue_769: "€750",
    revenue_385: "€375",
    revenue_77: "€75",
    
    // Views Options
    views_100000000: "100 mln",
    views_50000000: "50 mln",
    views_30000000: "30 mln",
    views_10000000: "10 mln",
    views_5000000: "5 mln",
    views_1000000: "1 mln",
    views_500000: "500K",
    views_100000: "100K",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "100 mln",
    subscribers_50000000: "50 mln",
    subscribers_30000000: "30 mln",
    subscribers_10000000: "10 mln",
    subscribers_5000000: "5 mln",
    subscribers_1000000: "1 mln",
    subscribers_500000: "500K",
    subscribers_100000: "100K",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 jaar",
    period_10: "10 jaar",
    period_5: "5 jaar",
    period_3: "3 jaar",
    period_1: "1 jaar",
    "period_0.5": "6 maanden",
    "period_0.25": "3 maanden"
  },
  
  pt: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "Esta métrica mostra alta contagem de visualizações em relação aos inscritos. Significa que seu conteúdo está sendo exposto a muitos usuários além de seus próprios inscritos.",
    subscriptionRateTooltip: "Esta métrica mostra a taxa de pessoas que se inscrevem após assistir vídeos. Uma média de 3% é considerada muito alta. Mesmo que apenas 3 em cada 100 espectadores se inscrevam, é uma métrica excelente.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["De maio a junho", "Crescimento de 3%"],
    growthTooltip_6to7: ["De junho a julho", "Crescimento de 4%"],
    growthTooltip_7to8: ["De julho a agosto", "Crescimento de 7.3%"],
    growthTooltip_8to9: ["De agosto a setembro", "Crescimento de 10%"],
    
    // RPM section
    countryRpmLabel: "RPM do país:",
    totalViewsLabel: "Visualizações totais",
    shortsRpmLabel: "RPM de Shorts",
    longRpmLabel: "RPM de vídeos longos",
    totalRevenueLabel: "Receita total",
    
    // Detail info labels
    totalViewsDetailLabel: "Visualizações totais",
    avgViewsLabel: "Visualizações médias",
    totalVideosLabel: "Total de vídeos",
    uploadFrequencyLabel: "Frequência de upload",
    monthlyGrowthLabel: "Crescimento mensal",
    yearlyGrowthLabel: "Crescimento anual",
    viewsPerSubscriberLabel: "Visualizações por inscrito",
    subscriptionRateLabel: "Taxa de inscrição",
    
    // Filter Tags
    filterTag_videoRevenue: "Abaixo de {videoCount} vídeos\\nGanhando {revenue} ou mais mensalmente",
    filterTag_periodRevenue: "Ativo há menos de {period}\\nGanhando {revenue} ou mais mensalmente",
    filterTag_videoSubscribers: "Abaixo de {videoCount} vídeos\\n{subscribers} ou mais inscritos",
    filterTag_monthlyRevenue: "Receita mensal de {revenue} ou mais",
    filterTag_avgViews: "Visualizações médias de {views} ou mais",
    
    // Revenue Options
    revenue_76923: "€75K",
    revenue_38461: "€37K", 
    revenue_23077: "€22K",
    revenue_7692: "€7.5K",
    revenue_3846: "€3.7K",
    revenue_2308: "€2.2K", 
    revenue_769: "€750",
    revenue_385: "€375",
    revenue_77: "€75",
    
    // Views Options
    views_100000000: "100 mi",
    views_50000000: "50 mi",
    views_30000000: "30 mi",
    views_10000000: "10 mi",
    views_5000000: "5 mi",
    views_1000000: "1 mi",
    views_500000: "500 mil",
    views_100000: "100 mil",
    views_50000: "50 mil",
    views_10000: "10 mil",
    
    // Subscribers Options
    subscribers_100000000: "100 mi",
    subscribers_50000000: "50 mi",
    subscribers_30000000: "30 mi",
    subscribers_10000000: "10 mi",
    subscribers_5000000: "5 mi",
    subscribers_1000000: "1 mi",
    subscribers_500000: "500 mil",
    subscribers_100000: "100 mil",
    subscribers_50000: "50 mil",
    subscribers_10000: "10 mil",
    
    // Period Options
    period_20: "20 anos",
    period_10: "10 anos",
    period_5: "5 anos",
    period_3: "3 anos",
    period_1: "1 ano",
    "period_0.5": "6 meses",
    "period_0.25": "3 meses"
  },
  
  zh: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "这个指标显示相对于订阅者的高观看次数。这意味着您的内容正在向您自己的订阅者之外的许多用户展示。",
    subscriptionRateTooltip: "这个指标显示观看视频后订阅的人数比例。平均3%被认为是非常高的。即使100个观看者中只有3个订阅，这也是一个出色的指标。",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["从5月到6月", "增长3%"],
    growthTooltip_6to7: ["从6月到7月", "增长4%"],
    growthTooltip_7to8: ["从7月到8月", "增长7.3%"],
    growthTooltip_8to9: ["从8月到9月", "增长10%"],
    
    // RPM section
    countryRpmLabel: "国家RPM：",
    totalViewsLabel: "总观看次数",
    shortsRpmLabel: "短视频RPM",
    longRpmLabel: "长视频RPM",
    totalRevenueLabel: "总收入",
    
    // Detail info labels
    totalViewsDetailLabel: "总观看次数",
    avgViewsLabel: "平均观看次数",
    totalVideosLabel: "总视频数",
    uploadFrequencyLabel: "上传频率",
    monthlyGrowthLabel: "月增长",
    yearlyGrowthLabel: "年增长",
    viewsPerSubscriberLabel: "每订阅者观看次数",
    subscriptionRateLabel: "订阅率",
    
    // Filter Tags
    filterTag_videoRevenue: "{videoCount}个视频以下\\n月收入{revenue}以上",
    filterTag_periodRevenue: "活跃{period}以下\\n月收入{revenue}以上",
    filterTag_videoSubscribers: "{videoCount}个视频以下\\n{subscribers}以上订阅者",
    filterTag_monthlyRevenue: "月收入{revenue}以上",
    filterTag_avgViews: "平均观看{views}以上",
    
    // Revenue Options
    revenue_76923: "¥70万",
    revenue_38461: "¥35万", 
    revenue_23077: "¥20万",
    revenue_7692: "¥7万",
    revenue_3846: "¥3.5万",
    revenue_2308: "¥2万", 
    revenue_769: "¥7000",
    revenue_385: "¥3500",
    revenue_77: "¥700",
    
    // Views Options
    views_100000000: "1亿",
    views_50000000: "5000万",
    views_30000000: "3000万",
    views_10000000: "1000万",
    views_5000000: "500万",
    views_1000000: "100万",
    views_500000: "50万",
    views_100000: "10万",
    views_50000: "5万",
    views_10000: "1万",
    
    // Subscribers Options
    subscribers_100000000: "1亿",
    subscribers_50000000: "5000万",
    subscribers_30000000: "3000万",
    subscribers_10000000: "1000万",
    subscribers_5000000: "500万",
    subscribers_1000000: "100万",
    subscribers_500000: "50万",
    subscribers_100000: "10万",
    subscribers_50000: "5万",
    subscribers_10000: "1万",
    
    // Period Options
    period_20: "20年",
    period_10: "10年",
    period_5: "5年",
    period_3: "3年",
    period_1: "1年",
    "period_0.5": "6个月",
    "period_0.25": "3个月",

    // VideoCount Options
    videoCount_1000: "1000个",
    videoCount_500: "500个",
    videoCount_100: "100个",
    videoCount_50: "50个",
    videoCount_30: "30个",
    videoCount_10: "10个"
  },
  
  hi: {
    // Stat tooltips
    viewsPerSubscriberTooltip: "यह मेट्रिक सब्सक्राइबर्स के अनुपात में उच्च व्यू काउंट दिखाता है। इसका मतलब है कि आपका कंटेंट आपके अपने सब्सक्राइबर्स के अलावा कई अन्य यूज़र्स को दिखाया जा रहा है।",
    subscriptionRateTooltip: "यह मेट्रिक वीडियो देखने के बाद सब्सक्राइब करने वाले लोगों की दर दिखाता है। औसतन 3% को बहुत अधिक माना जाता है। यदि 100 व्यूअर्स में से केवल 3 सब्सक्राइब करते हैं तो भी यह उत्कृष्ट मेट्रिक है।",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["मई से जून तक", "3% वृद्धि"],
    growthTooltip_6to7: ["जून से जुलाई तक", "4% वृद्धि"],
    growthTooltip_7to8: ["जुलाई से अगस्त तक", "7.3% वृद्धि"],
    growthTooltip_8to9: ["अगस्त से सितंबर तक", "10% वृद्धि"],
    
    // RPM section
    countryRpmLabel: "देश RPM:",
    totalViewsLabel: "कुल व्यूज़",
    shortsRpmLabel: "शॉर्ट्स RPM",
    longRpmLabel: "लॉन्ग RPM",
    totalRevenueLabel: "कुल आय",
    
    // Detail info labels
    totalViewsDetailLabel: "कुल व्यूज़",
    avgViewsLabel: "औसत व्यूज़",
    totalVideosLabel: "कुल वीडियो",
    uploadFrequencyLabel: "अपलोड फ्रीक्वेंसी",
    monthlyGrowthLabel: "मासिक वृद्धि",
    yearlyGrowthLabel: "वार्षिक वृद्धि",
    viewsPerSubscriberLabel: "प्रति सब्सक्राइबर व्यूज़",
    subscriptionRateLabel: "सब्सक्रिप्शन दर",
    
    // Filter Tags
    filterTag_videoRevenue: "{videoCount} वीडियो से कम\\nमासिक {revenue} या अधिक कमाई",
    filterTag_periodRevenue: "{period} से कम सक्रिय\\nमासिक {revenue} या अधिक कमाई",
    filterTag_videoSubscribers: "{videoCount} वीडियो से कम\\n{subscribers} या अधिक सब्सक्राइबर्स",
    filterTag_monthlyRevenue: "मासिक आय {revenue} या अधिक",
    filterTag_avgViews: "औसत व्यूज़ {views} या अधिक",
    
    // Revenue Options
    revenue_76923: "₹60 Lakh",
    revenue_38461: "₹30 Lakh", 
    revenue_23077: "₹18 Lakh",
    revenue_7692: "₹6 Lakh",
    revenue_3846: "₹3 Lakh",
    revenue_2308: "₹1.8 Lakh", 
    revenue_769: "₹60K",
    revenue_385: "₹30K",
    revenue_77: "₹6K",
    
    // Views Options
    views_100000000: "10 Cr",
    views_50000000: "5 Cr",
    views_30000000: "3 Cr",
    views_10000000: "1 Cr",
    views_5000000: "50 Lakh",
    views_1000000: "10 Lakh",
    views_500000: "5 Lakh",
    views_100000: "1 Lakh",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "10 Cr",
    subscribers_50000000: "5 Cr",
    subscribers_30000000: "3 Cr",
    subscribers_10000000: "1 Cr",
    subscribers_5000000: "50 Lakh",
    subscribers_1000000: "10 Lakh",
    subscribers_500000: "5 Lakh",
    subscribers_100000: "1 Lakh",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 साल",
    period_10: "10 साल",
    period_5: "5 साल",
    period_3: "3 साल",
    period_1: "1 साल",
    "period_0.5": "6 महीने",
    "period_0.25": "3 महीने"
  },
  
  es: {
    // Revenue Options
    revenue_76923: "$100K",
    revenue_38461: "$50K", 
    revenue_23077: "$30K",
    revenue_7692: "$10K",
    revenue_3846: "$5K",
    revenue_2308: "$3K", 
    revenue_769: "$1K",
    revenue_385: "$500",
    revenue_77: "$100",
    
    // Views Options
    views_100000000: "100M",
    views_50000000: "50M",
    views_30000000: "30M",
    views_10000000: "10M",
    views_5000000: "5M",
    views_1000000: "1M",
    views_500000: "500K",
    views_100000: "100K",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "100M",
    subscribers_50000000: "50M",
    subscribers_30000000: "30M",
    subscribers_10000000: "10M",
    subscribers_5000000: "5M",
    subscribers_1000000: "1M",
    subscribers_500000: "500K",
    subscribers_100000: "100K",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 años",
    period_10: "10 años",
    period_5: "5 años",
    period_3: "3 años",
    period_1: "1 año",
    "period_0.5": "6 meses",
    "period_0.25": "3 meses",
    
    // Stat tooltips
    viewsPerSubscriberTooltip: "Esta métrica muestra un alto número de visualizaciones en relación con los suscriptores. Significa que tu contenido se está mostrando a muchos usuarios además de tus propios suscriptores.",
    subscriptionRateTooltip: "Esta métrica muestra la tasa de personas que se suscriben después de ver videos. Un promedio del 3% se considera muy alto. Incluso si solo 3 de cada 100 espectadores se suscriben, es una métrica excelente.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["De mayo a junio", "3% de crecimiento"],
    growthTooltip_6to7: ["De junio a julio", "4% de crecimiento"],
    growthTooltip_7to8: ["De julio a agosto", "7.3% de crecimiento"],
    growthTooltip_8to9: ["De agosto a septiembre", "10% de crecimiento"],
    
    // RPM section
    countryRpmLabel: "RPM por país:",
    totalViewsLabel: "Visualizaciones totales",
    shortsRpmLabel: "RPM de Shorts",
    longRpmLabel: "RPM de videos largos",
    totalRevenueLabel: "Ingresos totales",
    
    // Detail info labels
    totalViewsDetailLabel: "Visualizaciones totales",
    avgViewsLabel: "Visualizaciones promedio",
    totalVideosLabel: "Total de videos",
    uploadFrequencyLabel: "Frecuencia de subida",
    monthlyGrowthLabel: "Crecimiento mensual",
    yearlyGrowthLabel: "Crecimiento anual",
    viewsPerSubscriberLabel: "Visualizaciones por suscriptor",
    subscriptionRateLabel: "Tasa de suscripción",
    
    // Filter Tags
    filterTag_videoRevenue: "Menos de {videoCount} videos\\nGanando {revenue} o más mensualmente",
    filterTag_periodRevenue: "Activo menos de {period}\\nGanando {revenue} o más mensualmente",
    filterTag_videoSubscribers: "Menos de {videoCount} videos\\n{subscribers} o más suscriptores",
    filterTag_monthlyRevenue: "Ingresos mensuales de {revenue} o más",
    filterTag_avgViews: "Visualizaciones promedio de {views} o más"
  },
  
  fr: {
    // Revenue Options
    revenue_76923: "€75K",
    revenue_38461: "€37K", 
    revenue_23077: "€22K",
    revenue_7692: "€7K",
    revenue_3846: "€4K",
    revenue_2308: "€2K", 
    revenue_769: "€700",
    revenue_385: "€350",
    revenue_77: "€70",
    
    // Views Options
    views_100000000: "100M",
    views_50000000: "50M",
    views_30000000: "30M",
    views_10000000: "10M",
    views_5000000: "5M",
    views_1000000: "1M",
    views_500000: "500K",
    views_100000: "100K",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "100M",
    subscribers_50000000: "50M",
    subscribers_30000000: "30M",
    subscribers_10000000: "10M",
    subscribers_5000000: "5M",
    subscribers_1000000: "1M",
    subscribers_500000: "500K",
    subscribers_100000: "100K",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 ans",
    period_10: "10 ans",
    period_5: "5 ans",
    period_3: "3 ans",
    period_1: "1 an",
    "period_0.5": "6 mois",
    "period_0.25": "3 mois",
    
    // Stat tooltips
    viewsPerSubscriberTooltip: "Cette métrique montre un nombre élevé de vues par rapport aux abonnés. Cela signifie que votre contenu est exposé à de nombreux utilisateurs au-delà de vos propres abonnés.",
    subscriptionRateTooltip: "Cette métrique montre le taux de personnes qui s'abonnent après avoir regardé des vidéos. Une moyenne de 3% est considérée comme très élevée. Même si seulement 3 spectateurs sur 100 s'abonnent, c'est une excellente métrique.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["De mai à juin", "3% de croissance"],
    growthTooltip_6to7: ["De juin à juillet", "4% de croissance"],
    growthTooltip_7to8: ["De juillet à août", "7.3% de croissance"],
    growthTooltip_8to9: ["D'août à septembre", "10% de croissance"],
    
    // RPM section
    countryRpmLabel: "RPM par pays:",
    totalViewsLabel: "Vues totales",
    shortsRpmLabel: "RPM Shorts",
    longRpmLabel: "RPM vidéos longues",
    totalRevenueLabel: "Revenus totaux",
    
    // Detail info labels
    totalViewsDetailLabel: "Vues totales",
    avgViewsLabel: "Vues moyennes",
    totalVideosLabel: "Total des vidéos",
    uploadFrequencyLabel: "Fréquence de téléchargement",
    monthlyGrowthLabel: "Croissance mensuelle",
    yearlyGrowthLabel: "Croissance annuelle",
    viewsPerSubscriberLabel: "Vues par abonné",
    subscriptionRateLabel: "Taux d'abonnement",
    
    // Filter Tags
    filterTag_videoRevenue: "Moins de {videoCount} vidéos\\nGagnant {revenue} ou plus par mois",
    filterTag_periodRevenue: "Actif moins de {period}\\nGagnant {revenue} ou plus par mois",
    filterTag_videoSubscribers: "Moins de {videoCount} vidéos\\n{subscribers} abonnés ou plus",
    filterTag_monthlyRevenue: "Revenus mensuels de {revenue} ou plus",
    filterTag_avgViews: "Vues moyennes de {views} ou plus"
  },
  
  de: {
    // Revenue Options
    revenue_76923: "€75K",
    revenue_38461: "€37K", 
    revenue_23077: "€22K",
    revenue_7692: "€7K",
    revenue_3846: "€4K",
    revenue_2308: "€2K", 
    revenue_769: "€700",
    revenue_385: "€350",
    revenue_77: "€70",
    
    // Views Options
    views_100000000: "100 Mio",
    views_50000000: "50 Mio",
    views_30000000: "30 Mio",
    views_10000000: "10 Mio",
    views_5000000: "5 Mio",
    views_1000000: "1 Mio",
    views_500000: "500K",
    views_100000: "100K",
    views_50000: "50K",
    views_10000: "10K",
    
    // Subscribers Options
    subscribers_100000000: "100 Mio",
    subscribers_50000000: "50 Mio",
    subscribers_30000000: "30 Mio",
    subscribers_10000000: "10 Mio",
    subscribers_5000000: "5 Mio",
    subscribers_1000000: "1 Mio",
    subscribers_500000: "500K",
    subscribers_100000: "100K",
    subscribers_50000: "50K",
    subscribers_10000: "10K",
    
    // Period Options
    period_20: "20 Jahre",
    period_10: "10 Jahre",
    period_5: "5 Jahre",
    period_3: "3 Jahre",
    period_1: "1 Jahr",
    "period_0.5": "6 Monate",
    "period_0.25": "3 Monate",
    
    // Stat tooltips
    viewsPerSubscriberTooltip: "Diese Metrik zeigt hohe Aufrufzahlen im Verhältnis zu Abonnenten. Es bedeutet, dass dein Content vielen Nutzern über deine eigenen Abonnenten hinaus gezeigt wird.",
    subscriptionRateTooltip: "Diese Metrik zeigt die Rate der Personen, die nach dem Ansehen von Videos abonnieren. Ein Durchschnitt von 3% gilt als sehr hoch. Selbst wenn nur 3 von 100 Zuschauern abonnieren, ist das eine hervorragende Metrik.",
    
    // Growth chart tooltips
    growthTooltip_5to6: ["Von Mai bis Juni", "3% Wachstum"],
    growthTooltip_6to7: ["Von Juni bis Juli", "4% Wachstum"],
    growthTooltip_7to8: ["Von Juli bis August", "7.3% Wachstum"],
    growthTooltip_8to9: ["Von August bis September", "10% Wachstum"],
    
    // RPM section
    countryRpmLabel: "Länder-RPM:",
    totalViewsLabel: "Gesamtaufrufe",
    shortsRpmLabel: "Shorts RPM",
    longRpmLabel: "Lange Videos RPM",
    totalRevenueLabel: "Gesamteinnahmen",
    
    // Detail info labels
    totalViewsDetailLabel: "Gesamtaufrufe",
    avgViewsLabel: "Durchschnittliche Aufrufe",
    totalVideosLabel: "Gesamte Videos",
    uploadFrequencyLabel: "Upload-Häufigkeit",
    monthlyGrowthLabel: "Monatliches Wachstum",
    yearlyGrowthLabel: "Jährliches Wachstum",
    viewsPerSubscriberLabel: "Aufrufe pro Abonnent",
    subscriptionRateLabel: "Abonnement-Rate",
    
    // Filter Tags
    filterTag_videoRevenue: "Unter {videoCount} Videos\\nVerdient {revenue} oder mehr monatlich",
    filterTag_periodRevenue: "Aktiv unter {period}\\nVerdient {revenue} oder mehr monatlich",
    filterTag_videoSubscribers: "Unter {videoCount} Videos\\n{subscribers} oder mehr Abonnenten",
    filterTag_monthlyRevenue: "Monatliche Einnahmen von {revenue} oder mehr",
    filterTag_avgViews: "Durchschnittliche Aufrufe von {views} oder mehr"
  }
};