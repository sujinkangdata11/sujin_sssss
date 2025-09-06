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
    subscriptionRateLabel: "Subscription Rate"
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
    subscriptionRateLabel: "구독 전환율"
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
    subscriptionRateLabel: "購読転換率"
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
    subscriptionRateLabel: "Коэффициент подписки"
  }
};