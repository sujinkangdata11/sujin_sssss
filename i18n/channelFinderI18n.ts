import { Language } from '../types';

export const channelFinderI18n: Record<Language, Record<string, any>> = {
  en: {
    header: {
      mainTitle: "Global YouTube Channel Data",
      searchPlaceholder: "Search channels...",
      loadingMessage: "Loading channel data..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Channel Name",
        category: "Category", 
        subscribers: "Subscribers",
        yearlyGrowth: "Yearly Growth", // 🔄 OLD: 매년증가 컬럼 (삭제 예정)
        monthlyRevenue: "Monthly Revenue", // 🆕 NEW: 월 수익 컬럼
        monthlyGrowth: "Monthly Growth",
        dailyGrowth: "Daily Growth",
        subscriptionRate: "Subscription Rate",
        operatingPeriod: "Operating Period",
        totalViews: "Total Views",
        avgViews: "Average Views",
        totalVideos: "Total Videos",
        uploadFrequency: "Upload Frequency"
      },
      sortOptions: {
        highToLow: "High to Low",
        lowToHigh: "Low to High"
      }
    },
    sidebar: {
      labels: {
        category: "Category",
        subscribers: "Subscribers",
        country: "Country",
        operatingPeriod: "Operating Period",
        totalViews: "Total Views",
        avgViews: "Average Views",
        totalVideos: "Total Videos",
        uploadFrequency: "Upload Frequency",
        monthlyGrowth: "Monthly Growth",
        yearlyGrowth: "Yearly Growth",
        viewsPerSubscriber: "Views per Subscriber",
        subscriptionRate: "Subscription Rate"
      },
      subscriberGrowth: "Subscriber Growth Trend",
      revenueCalculation: "Revenue Calculation",
      totalShortsRevenue: "Total Shorts Revenue",
      totalLongRevenue: "Total Long Revenue",
      totalRevenue: "Shorts + Long Total Revenue (USD)",
      monthlyUsdRevenue: "Monthly USD Revenue",
      localCurrencyText: "This amount in USD is",
      detailInfo: "Detail Information",
      noSubscriberData: "No subscriber data available"
    },
    units: {
      subscribers: "subscribers",
      views: "views", 
      videos: "videos",
      months: "months",
      perWeek: "weekly",
      perDay: "per day",
      years: "years",
      people: "", // 영어는 subscribers로 표시
      items: "", // 영어는 videos로 표시
      times: "times",
      others: "Others",
      exchangeRate: "Exchange Rate",
      exchangeRatePlaceholder: "Enter exchange rate"
    },
    buttons: {
      cancel: "Cancel",
      confirm: "Confirm"
    },
    currencies: {
      USD: "Dollar",
      KRW: "Won", 
      JPY: "Yen",
      CNY: "Yuan",
      INR: "Rupee",
      GBP: "Pound",
      EUR: "Euro",
      CAD: "Canadian Dollar",
      AUD: "Australian Dollar",
      BRL: "Real",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "thousand",
      million: "million",
      billion: "billion",
      trillion: "trillion"
    },
    tooltips: {
      viewsPerSubscriber: "This metric shows high view counts relative to subscribers. It means your content is being exposed to many users beyond your own subscribers.",
      subscriptionRate: "This metric shows the rate of people who subscribe after watching videos. An average of 3% is considered very high.",
      monthlyRevenue: "Average monthly revenue calculated by dividing total revenue by operating period",
      exchangeRateChange: "Click to change exchange rate (Current: {rate} {symbol})"
    }
  },
  ko: {
    header: {
      mainTitle: "전세계 유튜브 채널 데이터",
      searchPlaceholder: "채널 검색...",
      loadingMessage: "채널 데이터 로딩 중..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "채널명",
        category: "카테고리", 
        subscribers: "구독자수",
        yearlyGrowth: "매년증가", // 🔄 OLD: 매년증가 컬럼 (삭제 예정)
        monthlyRevenue: "월 수익", // 🆕 NEW: 월 수익 컬럼
        monthlyGrowth: "월간 증가",
        dailyGrowth: "일일증가",
        subscriptionRate: "구독 전환율",
        operatingPeriod: "운영기간",
        totalViews: "총조회수",
        avgViews: "평균조회수",
        totalVideos: "총영상수",
        uploadFrequency: "업로드 빈도"
      },
      sortOptions: {
        highToLow: "수치 높은 순",
        lowToHigh: "수치 낮은 순"
      }
    },
    sidebar: {
      labels: {
        category: "카테고리",
        subscribers: "구독자수",
        country: "국가",
        operatingPeriod: "운영기간",
        totalViews: "총 조회수",
        avgViews: "평균 조회수",
        totalVideos: "총 영상수",
        uploadFrequency: "업로드 빈도",
        monthlyGrowth: "월간증가",
        yearlyGrowth: "년간증가",
        viewsPerSubscriber: "구독자 대비 조회수",
        subscriptionRate: "구독 전환율"
      },
      subscriberGrowth: "구독자 성장 추이",
      revenueCalculation: "수익계산",
      totalShortsRevenue: "총 숏폼 수익",
      totalLongRevenue: "총 롱폼 수익",
      totalRevenue: "숏폼 + 롱폼 총 수익(USD)",
      monthlyUsdRevenue: "USD 월 수익",
      localCurrencyText: "이 금액은 한국 돈으로 보면",
      detailInfo: "디테일 정보",
      noSubscriberData: "구독자 데이터가 없습니다"
    },
    units: {
      subscribers: "구독자",
      views: "조회수", 
      videos: "개 영상",
      months: "개월",
      perWeek: "/주",
      perDay: "일",
      years: "년",
      people: "명",
      items: "개",
      times: "회",
      others: "기타",
      exchangeRate: "환율",
      exchangeRatePlaceholder: "환율을 입력하세요"
    },
    buttons: {
      cancel: "취소",
      confirm: "확인"
    },
    currencies: {
      USD: "달러",
      KRW: "원", 
      JPY: "엔",
      CNY: "위안",
      INR: "루피",
      GBP: "파운드",
      EUR: "유로",
      CAD: "캐나다달러",
      AUD: "호주달러",
      BRL: "레알",
      MXN: "페소"
    },
    numberFormat: {
      thousand: "천",
      tenThousand: "만",
      hundredMillion: "억",
      trillion: "조"
    },
    tooltips: {
      viewsPerSubscriber: "이 지표는 구독자 대비 높은 조회수를 나타냅니다. 본인의 구독자를 넘어 많은 사용자들에게 콘텐츠가 노출되고 있음을 의미합니다.",
      subscriptionRate: "이 지표는 영상을 본 후 구독하는 사람들의 비율을 나타냅니다. 평균 3%는 매우 높은 수치로 간주됩니다.",
      monthlyRevenue: "총 수익을 운영기간으로 나눈 월평균 수익",
      exchangeRateChange: "클릭하여 환율을 변경할 수 있습니다 (현재: {rate}{symbol})"
    }
  },
  ja: {
    header: {
      mainTitle: "世界のYouTubeチャンネルデータ",
      searchPlaceholder: "チャンネル検索...",
      loadingMessage: "チャンネルデータ読み込み中..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "チャンネル名",
        category: "カテゴリ", 
        subscribers: "登録者数",
        yearlyGrowth: "年間成長", // 🔄 OLD: 年間成長 컬럼 (삭제 예정)
        monthlyRevenue: "月収益", // 🆕 NEW: 月収益 컬럼
        monthlyGrowth: "月間成長",
        dailyGrowth: "日間成長",
        subscriptionRate: "登録転換率",
        operatingPeriod: "運営期間",
        totalViews: "総再生数",
        avgViews: "平均再生数",
        totalVideos: "総動画数",
        uploadFrequency: "アップロード頻度"
      },
      sortOptions: {
        highToLow: "高い順",
        lowToHigh: "低い順"
      }
    },
    sidebar: {
      labels: {
        category: "カテゴリ",
        subscribers: "登録者数",
        country: "国",
        operatingPeriod: "運営期間",
        totalViews: "総再生数",
        avgViews: "平均再生数",
        totalVideos: "総動画数",
        uploadFrequency: "アップロード頻度",
        monthlyGrowth: "月間成長",
        yearlyGrowth: "年間成長",
        viewsPerSubscriber: "登録者対比再生数",
        subscriptionRate: "登録転換率"
      },
      subscriberGrowth: "登録者数成長推移",
      revenueCalculation: "収益計算",
      totalShortsRevenue: "総ショート収益",
      totalLongRevenue: "総ロング収益",
      totalRevenue: "ショート + ロング総収益 (USD)",
      monthlyUsdRevenue: "月間USD収益",
      localCurrencyText: "この金額は日本円で見ると",
      detailInfo: "詳細情報",
      noSubscriberData: "登録者データがありません"
    },
    units: {
      subscribers: "登録者",
      views: "再生数", 
      videos: "本の動画",
      months: "ヶ月",
      perWeek: "/週",
      perDay: "日",
      years: "年",
      people: "人",
      items: "本",
      times: "回",
      others: "その他",
      exchangeRate: "為替レート",
      exchangeRatePlaceholder: "為替レートを入力してください"
    },
    buttons: {
      cancel: "キャンセル",
      confirm: "確認"
    },
    currencies: {
      USD: "ドル",
      KRW: "ウォン", 
      JPY: "円",
      CNY: "元",
      INR: "ルピー",
      GBP: "ポンド",
      EUR: "ユーロ",
      CAD: "カナダドル",
      AUD: "オーストラリアドル",
      BRL: "レアル",
      MXN: "ペソ"
    },
    numberFormat: {
      thousand: "千",
      tenThousand: "万",
      hundredMillion: "億",
      trillion: "兆"
    },
    tooltips: {
      viewsPerSubscriber: "この指標は登録者に対する高い再生数を示します。自分の登録者を超えて多くのユーザーにコンテンツが露出されていることを意味します。",
      subscriptionRate: "この指標は動画を見た後に登録する人の割合を示します。平均3%は非常に高い数値とされます。",
      monthlyRevenue: "総収益を運営期間で割った月平均収益",
      exchangeRateChange: "クリックして為替レートを変更 (現在: {rate}{symbol})"
    }
  },
  zh: {
    header: {
      mainTitle: "全球YouTube频道数据",
      searchPlaceholder: "搜索频道...",
      loadingMessage: "正在加载频道数据..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "频道名称",
        category: "类别", 
        subscribers: "订阅者",
        yearlyGrowth: "年增长率", // 🔄 OLD: 年增长率 컬럼 (삭제 예정)
        monthlyRevenue: "月收入", // 🆕 NEW: 月收入 컬럼
        monthlyGrowth: "月增长率",
        dailyGrowth: "日增长率",
        subscriptionRate: "订阅转换率",
        operatingPeriod: "运营期间",
        totalViews: "总观看量",
        avgViews: "平均观看量",
        totalVideos: "总视频数",
        uploadFrequency: "上传频率"
      },
      sortOptions: {
        highToLow: "从高到低",
        lowToHigh: "从低到高"
      }
    },
    sidebar: {
      labels: {
        category: "类别",
        subscribers: "订阅者",
        country: "国家",
        operatingPeriod: "运营期间",
        totalViews: "总观看量",
        avgViews: "平均观看量",
        totalVideos: "总视频数",
        uploadFrequency: "上传频率",
        monthlyGrowth: "月增长",
        yearlyGrowth: "年增长",
        viewsPerSubscriber: "订阅者对比观看量",
        subscriptionRate: "订阅转换率"
      },
      subscriberGrowth: "订阅者增长趋势",
      revenueCalculation: "收益计算",
      totalShortsRevenue: "短视频总收益",
      totalLongRevenue: "长视频总收益",
      totalRevenue: "短视频 + 长视频总收益 (USD)",
      monthlyUsdRevenue: "月度美元收益",
      localCurrencyText: "这个金额换成人民币是",
      detailInfo: "详细信息",
      noSubscriberData: "没有订阅者数据"
    },
    units: {
      subscribers: "订阅者",
      views: "观看量", 
      videos: "个视频",
      months: "个月",
      perWeek: "/周",
      perDay: "每日",
      years: "年",
      people: "人",
      items: "个",
      times: "次",
      others: "其他",
      exchangeRate: "汇率",
      exchangeRatePlaceholder: "请输入汇率"
    },
    buttons: {
      cancel: "取消",
      confirm: "确认"
    },
    currencies: {
      USD: "美元",
      KRW: "韩元", 
      JPY: "日元",
      CNY: "人民币",
      INR: "卢比",
      GBP: "英镑",
      EUR: "欧元",
      CAD: "加元",
      AUD: "澳元",
      BRL: "雷亚尔",
      MXN: "比索"
    },
    numberFormat: {
      thousand: "千",
      tenThousand: "万",
      hundredMillion: "亿",
      trillion: "万亿"
    },
    tooltips: {
      viewsPerSubscriber: "这个指标显示相对于订阅者的高观看量。意味着您的内容正在向超出自己订阅者范围的许多用户展示。",
      subscriptionRate: "这个指标显示观看视频后订阅的人的比例。平均3%被认为是非常高的数值。",
      monthlyRevenue: "用总收益除以运营期间的月平均收益",
      exchangeRateChange: "点击更改汇率 (当前: {rate}{symbol})"
    }
  },
  hi: {
    header: {
      mainTitle: "वैश्विक YouTube चैनल डेटा",
      searchPlaceholder: "चैनल खोजें...",
      loadingMessage: "चैनल डेटा लोड हो रहा है..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "चैनल नाम",
        category: "श्रेणी", 
        subscribers: "सब्सक्राइबर",
        yearlyGrowth: "वार्षिक विकास", // 🔄 OLD: वार्षिक विकास 컬럼 (삭제 예정)
        monthlyRevenue: "मासिक आय", // 🆕 NEW: मासिक आय 컬럼
        monthlyGrowth: "मासिक विकास",
        dailyGrowth: "दैनिक विकास",
        subscriptionRate: "सब्सक्रिप्शन दर",
        operatingPeriod: "संचालन अवधि",
        totalViews: "कुल व्यू",
        avgViews: "औसत व्यू",
        totalVideos: "कुल वीडियो",
        uploadFrequency: "अपलोड आवृत्ति"
      },
      sortOptions: {
        highToLow: "उच्च से नीचे",
        lowToHigh: "नीचे से उच्च"
      }
    },
    sidebar: {
      labels: {
        category: "श्रेणी",
        subscribers: "सब्सक्राइबर",
        country: "देश",
        operatingPeriod: "संचालन अवधि",
        totalViews: "कुल व्यू",
        avgViews: "औसत व्यू",
        totalVideos: "कुल वीडियो",
        uploadFrequency: "अपलोड आवृत्ति",
        monthlyGrowth: "मासिक विकास",
        yearlyGrowth: "वार्षिक विकास",
        viewsPerSubscriber: "सब्सक्राइबर प्रति व्यू",
        subscriptionRate: "सब्सक्रिप्शन दर"
      },
      subscriberGrowth: "सब्सक्राइबर विकास रुझान",
      revenueCalculation: "राजस्व गणना",
      totalShortsRevenue: "कुल शॉर्ट्स राजस्व",
      totalLongRevenue: "कुल लॉन्ग राजस्व",
      totalRevenue: "शॉर्ट्स + लॉन्ग कुल राजस्व (USD)",
      monthlyUsdRevenue: "मासिक USD आय",
      localCurrencyText: "यह राशि भारतीय रुपए में है",
      detailInfo: "विस्तृत जानकारी",
      noSubscriberData: "सब्सक्राइबर डेटा उपलब्ध नहीं"
    },
    units: {
      subscribers: "सब्सक्राइबर",
      views: "व्यू", 
      videos: "वीडियो",
      months: "महीने",
      perWeek: "/सप्ताह",
      perDay: "प्रति दिन",
      years: "वर्ष",
      people: "लोग",
      items: "आइटम",
      times: "बार",
      others: "अन्य",
      exchangeRate: "विनिमय दर",
      exchangeRatePlaceholder: "विनिमय दर दर्ज करें"
    },
    buttons: {
      cancel: "रद्द करें",
      confirm: "पुष्टि करें"
    },
    currencies: {
      USD: "डॉलर",
      KRW: "वॉन", 
      JPY: "येन",
      CNY: "युआन",
      INR: "रुपया",
      GBP: "पाउंड",
      EUR: "यूरो",
      CAD: "कैनेडियन डॉलर",
      AUD: "ऑस्ट्रेलियाई डॉलर",
      BRL: "रियल",
      MXN: "पेसो"
    },
    numberFormat: {
      thousand: "हजार",
      lakh: "लाख",
      crore: "करोड़",
      arabPati: "अरब"
    },
    tooltips: {
      viewsPerSubscriber: "यह मेट्रिक सब्सक्राइबर्स की तुलना में उच्च व्यू दर्शाता है। इसका मतलब है कि आपका कंटेंट आपके सब्सक्राइबर्स से कहीं अधिक उपयोगकर्ताओं तक पहुंच रहा है।",
      subscriptionRate: "यह मेट्रिक वीडियो देखने के बाद सब्सक्राइब करने वाले लोगों का अनुपात दर्शाता है। औसत 3% को बहुत उच्च माना जाता है।",
      monthlyRevenue: "कुल राजस्व को संचालन अवधि से विभाजित करके निकाली गई मासिक औसत आय",
      exchangeRateChange: "विनिमय दर बदलने के लिए क्लिक करें (वर्तमान: {rate}{symbol})"
    }
  },
  es: {
    header: {
      mainTitle: "Datos Globales de Canales de YouTube",
      searchPlaceholder: "Buscar canales...",
      loadingMessage: "Cargando datos del canal..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Nombre del Canal",
        category: "Categoría", 
        subscribers: "Suscriptores",
        yearlyGrowth: "Crecimiento Anual", // 🔄 OLD: Crecimiento Anual 컬럼 (삭제 예정)
        monthlyRevenue: "Ingresos Mensuales", // 🆕 NEW: Ingresos Mensuales 컬럼
        monthlyGrowth: "Crecimiento Mensual",
        dailyGrowth: "Crecimiento Diario",
        subscriptionRate: "Tasa de Suscripción",
        operatingPeriod: "Período de Operación",
        totalViews: "Vistas Totales",
        avgViews: "Vistas Promedio",
        totalVideos: "Videos Totales",
        uploadFrequency: "Frecuencia de Subida"
      },
      sortOptions: {
        highToLow: "De alto a bajo",
        lowToHigh: "De bajo a alto"
      }
    },
    sidebar: {
      labels: {
        category: "Categoría",
        subscribers: "Suscriptores",
        country: "País",
        operatingPeriod: "Período de Operación",
        totalViews: "Vistas Totales",
        avgViews: "Vistas Promedio",
        totalVideos: "Videos Totales",
        uploadFrequency: "Frecuencia de Subida",
        monthlyGrowth: "Crecimiento Mensual",
        yearlyGrowth: "Crecimiento Anual",
        viewsPerSubscriber: "Vistas por Suscriptor",
        subscriptionRate: "Tasa de Suscripción"
      },
      subscriberGrowth: "Tendencia de Crecimiento de Suscriptores",
      revenueCalculation: "Cálculo de Ingresos",
      totalShortsRevenue: "Ingresos Totales de Shorts",
      totalLongRevenue: "Ingresos Totales de Videos Largos",
      totalRevenue: "Shorts + Videos Largos Ingresos Totales (USD)",
      monthlyUsdRevenue: "Ingresos Mensuales USD",
      localCurrencyText: "Esta cantidad en euros es",
      detailInfo: "Información Detallada",
      noSubscriberData: "No hay datos de suscriptores disponibles"
    },
    units: {
      subscribers: "suscriptores",
      views: "vistas", 
      videos: "videos",
      months: "meses",
      perWeek: "/semana",
      perDay: "por día",
      years: "años",
      people: "",
      items: "",
      times: "veces",
      others: "Otros",
      exchangeRate: "Tipo de Cambio",
      exchangeRatePlaceholder: "Ingrese tipo de cambio"
    },
    buttons: {
      cancel: "Cancelar",
      confirm: "Confirmar"
    },
    currencies: {
      USD: "Dólar",
      KRW: "Won", 
      JPY: "Yen",
      CNY: "Yuan",
      INR: "Rupia",
      GBP: "Libra",
      EUR: "Euro",
      CAD: "Dólar Canadiense",
      AUD: "Dólar Australiano",
      BRL: "Real",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "mil",
      million: "millón",
      billion: "mil millones",
      trillion: "billón"
    },
    tooltips: {
      viewsPerSubscriber: "Esta métrica muestra altas visualizaciones en relación a los suscriptores. Significa que tu contenido está siendo expuesto a muchos usuarios más allá de tus propios suscriptores.",
      subscriptionRate: "Esta métrica muestra la tasa de personas que se suscriben después de ver videos. Un promedio del 3% se considera muy alto.",
      monthlyRevenue: "Ingresos promedio mensuales calculados dividiendo los ingresos totales por el período operativo",
      exchangeRateChange: "Haz clic para cambiar el tipo de cambio (Actual: {rate}{symbol})"
    }
  },
  fr: {
    header: {
      mainTitle: "Données Mondiales des Chaînes YouTube",
      searchPlaceholder: "Rechercher des chaînes...",
      loadingMessage: "Chargement des données de chaîne..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Nom de la Chaîne",
        category: "Catégorie", 
        subscribers: "Abonnés",
        yearlyGrowth: "Croissance Annuelle", // 🔄 OLD: Croissance Annuelle 컬럼 (삭제 예정)
        monthlyRevenue: "Revenus Mensuels", // 🆕 NEW: Revenus Mensuels 컬럼
        monthlyGrowth: "Croissance Mensuelle",
        dailyGrowth: "Croissance Quotidienne",
        subscriptionRate: "Taux d'Abonnement",
        operatingPeriod: "Période d'Exploitation",
        totalViews: "Vues Totales",
        avgViews: "Vues Moyennes",
        totalVideos: "Vidéos Totales",
        uploadFrequency: "Fréquence de Téléchargement"
      },
      sortOptions: {
        highToLow: "Du haut vers le bas",
        lowToHigh: "Du bas vers le haut"
      }
    },
    sidebar: {
      labels: {
        category: "Catégorie",
        subscribers: "Abonnés",
        country: "Pays",
        operatingPeriod: "Période d'Exploitation",
        totalViews: "Vues Totales",
        avgViews: "Vues Moyennes",
        totalVideos: "Vidéos Totales",
        uploadFrequency: "Fréquence de Téléchargement",
        monthlyGrowth: "Croissance Mensuelle",
        yearlyGrowth: "Croissance Annuelle",
        viewsPerSubscriber: "Vues par Abonné",
        subscriptionRate: "Taux d'Abonnement"
      },
      subscriberGrowth: "Tendance de Croissance des Abonnés",
      revenueCalculation: "Calcul des Revenus",
      totalShortsRevenue: "Revenus Totaux des Shorts",
      totalLongRevenue: "Revenus Totaux des Longs",
      totalRevenue: "Shorts + Longs Revenus Totaux (USD)",
      monthlyUsdRevenue: "Revenus Mensuels USD",
      localCurrencyText: "Ce montant en euros est",
      detailInfo: "Informations Détaillées",
      noSubscriberData: "Aucune donnée d'abonné disponible"
    },
    units: {
      subscribers: "abonnés",
      views: "vues", 
      videos: "vidéos",
      months: "mois",
      perWeek: "/semaine",
      perDay: "par jour",
      years: "ans",
      people: "",
      items: "",
      times: "fois",
      others: "Autres",
      exchangeRate: "Taux de Change",
      exchangeRatePlaceholder: "Saisissez le taux de change"
    },
    buttons: {
      cancel: "Annuler",
      confirm: "Confirmer"
    },
    currencies: {
      USD: "Dollar",
      KRW: "Won", 
      JPY: "Yen",
      CNY: "Yuan",
      INR: "Roupie",
      GBP: "Livre",
      EUR: "Euro",
      CAD: "Dollar Canadien",
      AUD: "Dollar Australien",
      BRL: "Réal",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "mille",
      million: "million",
      billion: "milliard",
      trillion: "billion"
    },
    tooltips: {
      viewsPerSubscriber: "Cette métrique montre un nombre élevé de vues par rapport aux abonnés. Cela signifie que votre contenu est exposé à de nombreux utilisateurs au-delà de vos propres abonnés.",
      subscriptionRate: "Cette métrique montre le taux de personnes qui s'abonnent après avoir regardé des vidéos. Une moyenne de 3% est considérée comme très élevée.",
      monthlyRevenue: "Revenus mensuels moyens calculés en divisant les revenus totaux par la période d'exploitation",
      exchangeRateChange: "Cliquez pour changer le taux de change (Actuel: {rate}{symbol})"
    }
  },
  de: {
    header: {
      mainTitle: "Globale YouTube-Kanaldaten",
      searchPlaceholder: "Kanäle suchen...",
      loadingMessage: "Kanaldaten werden geladen..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Kanalname",
        category: "Kategorie", 
        subscribers: "Abonnenten",
        yearlyGrowth: "Jährliches Wachstum", // 🔄 OLD: Jährliches Wachstum 컬럼 (삭제 예정)
        monthlyRevenue: "Monatlicher Umsatz", // 🆕 NEW: Monatlicher Umsatz 컬럼
        monthlyGrowth: "Monatliches Wachstum",
        dailyGrowth: "Tägliches Wachstum",
        subscriptionRate: "Abonnement-Rate",
        operatingPeriod: "Betriebsdauer",
        totalViews: "Gesamtaufrufe",
        avgViews: "Durchschnittliche Aufrufe",
        totalVideos: "Gesamtvideos",
        uploadFrequency: "Upload-Häufigkeit"
      },
      sortOptions: {
        highToLow: "Hoch zu niedrig",
        lowToHigh: "Niedrig zu hoch"
      }
    },
    sidebar: {
      labels: {
        category: "Kategorie",
        subscribers: "Abonnenten",
        country: "Land",
        operatingPeriod: "Betriebsdauer",
        totalViews: "Gesamtaufrufe",
        avgViews: "Durchschnittliche Aufrufe",
        totalVideos: "Gesamtvideos",
        uploadFrequency: "Upload-Häufigkeit",
        monthlyGrowth: "Monatliches Wachstum",
        yearlyGrowth: "Jährliches Wachstum",
        viewsPerSubscriber: "Aufrufe pro Abonnent",
        subscriptionRate: "Abonnement-Rate"
      },
      subscriberGrowth: "Abonnenten-Wachstumstrend",
      revenueCalculation: "Umsatzberechnung",
      totalShortsRevenue: "Gesamtumsatz Shorts",
      totalLongRevenue: "Gesamtumsatz Lange Videos",
      totalRevenue: "Shorts + Lange Videos Gesamtumsatz (USD)",
      monthlyUsdRevenue: "Monatlicher USD-Umsatz",
      localCurrencyText: "Dieser Betrag in Euro ist",
      detailInfo: "Detaillierte Informationen",
      noSubscriberData: "Keine Abonnentendaten verfügbar"
    },
    units: {
      subscribers: "Abonnenten",
      views: "Aufrufe", 
      videos: "Videos",
      months: "Monate",
      perWeek: "/Woche",
      perDay: "pro Tag",
      years: "Jahre",
      people: "",
      items: "",
      times: "mal",
      others: "Andere",
      exchangeRate: "Wechselkurs",
      exchangeRatePlaceholder: "Wechselkurs eingeben"
    },
    buttons: {
      cancel: "Abbrechen",
      confirm: "Bestätigen"
    },
    currencies: {
      USD: "Dollar",
      KRW: "Won", 
      JPY: "Yen",
      CNY: "Yuan",
      INR: "Rupie",
      GBP: "Pfund",
      EUR: "Euro",
      CAD: "Kanadischer Dollar",
      AUD: "Australischer Dollar",
      BRL: "Real",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "Tausend",
      million: "Million",
      billion: "Milliarde",
      trillion: "Billion"
    },
    tooltips: {
      viewsPerSubscriber: "Diese Metrik zeigt hohe Aufrufzahlen im Verhältnis zu den Abonnenten. Es bedeutet, dass Ihr Inhalt vielen Nutzern über Ihre eigenen Abonnenten hinaus gezeigt wird.",
      subscriptionRate: "Diese Metrik zeigt die Rate der Personen, die nach dem Anschauen von Videos abonnieren. Ein Durchschnitt von 3% gilt als sehr hoch.",
      monthlyRevenue: "Durchschnittliche monatliche Einnahmen berechnet durch Teilung der Gesamteinnahmen durch den Betriebszeitraum",
      exchangeRateChange: "Klicken Sie zum Ändern des Wechselkurses (Aktuell: {rate}{symbol})"
    }
  },
  nl: {
    header: {
      mainTitle: "Wereldwijde YouTube Kanaalgegevens",
      searchPlaceholder: "Zoek kanalen...",
      loadingMessage: "Kanaalgegevens laden..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Kanaalnaam",
        category: "Categorie", 
        subscribers: "Abonnees",
        yearlyGrowth: "Jaarlijkse Groei", // 🔄 OLD: Jaarlijkse Groei 컬럼 (삭제 예정)
        monthlyRevenue: "Maandelijkse Inkomsten", // 🆕 NEW: Maandelijkse Inkomsten 컬럼
        monthlyGrowth: "Maandelijkse Groei",
        dailyGrowth: "Dagelijkse Groei",
        subscriptionRate: "Abonnementstarief",
        operatingPeriod: "Bedrijfsperiode",
        totalViews: "Totale Weergaven",
        avgViews: "Gemiddelde Weergaven",
        totalVideos: "Totale Video's",
        uploadFrequency: "Uploadfrequentie"
      },
      sortOptions: {
        highToLow: "Hoog naar laag",
        lowToHigh: "Laag naar hoog"
      }
    },
    sidebar: {
      labels: {
        category: "Categorie",
        subscribers: "Abonnees",
        country: "Land",
        operatingPeriod: "Bedrijfsperiode",
        totalViews: "Totale Weergaven",
        avgViews: "Gemiddelde Weergaven",
        totalVideos: "Totale Video's",
        uploadFrequency: "Uploadfrequentie",
        monthlyGrowth: "Maandelijkse Groei",
        yearlyGrowth: "Jaarlijkse Groei",
        viewsPerSubscriber: "Weergaven per Abonnee",
        subscriptionRate: "Abonnementstarief"
      },
      subscriberGrowth: "Abonneegroeitrend",
      revenueCalculation: "Inkomstenberekening",
      totalShortsRevenue: "Totale Shorts Inkomsten",
      totalLongRevenue: "Totale Lange Video Inkomsten",
      totalRevenue: "Shorts + Lange Videos Totale Inkomsten (USD)",
      monthlyUsdRevenue: "Maandelijkse USD-inkomsten",
      localCurrencyText: "Dit bedrag in euro's is",
      detailInfo: "Gedetailleerde Informatie",
      noSubscriberData: "Geen abonneegegevens beschikbaar"
    },
    units: {
      subscribers: "abonnees",
      views: "weergaven", 
      videos: "video's",
      months: "maanden",
      perWeek: "weekly",
      perDay: "per dag",
      years: "jaar",
      people: "",
      items: "",
      times: "keer",
      others: "Anderen",
      exchangeRate: "Wisselkoers",
      exchangeRatePlaceholder: "Voer wisselkoers in"
    },
    buttons: {
      cancel: "Annuleren",
      confirm: "Bevestigen"
    },
    currencies: {
      USD: "Dollar",
      KRW: "Won", 
      JPY: "Yen",
      CNY: "Yuan",
      INR: "Roepie",
      GBP: "Pond",
      EUR: "Euro",
      CAD: "Canadese Dollar",
      AUD: "Australische Dollar",
      BRL: "Real",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "duizend",
      million: "miljoen",
      billion: "miljard",
      trillion: "biljoen"
    },
    tooltips: {
      viewsPerSubscriber: "Deze metriek toont hoge weergaven ten opzichte van abonnees. Het betekent dat uw content wordt blootgesteld aan veel gebruikers buiten uw eigen abonnees.",
      subscriptionRate: "Deze metriek toont het percentage mensen dat zich abonneert na het bekijken van video's. Een gemiddelde van 3% wordt als zeer hoog beschouwd.",
      monthlyRevenue: "Gemiddelde maandelijkse inkomsten berekend door totale inkomsten te delen door de operatieperiode",
      exchangeRateChange: "Klik om wisselkoers te wijzigen (Huidig: {rate}{symbol})"
    }
  },
  pt: {
    header: {
      mainTitle: "Dados Globais de Canais do YouTube",
      searchPlaceholder: "Pesquisar canais...",
      loadingMessage: "Carregando dados do canal..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Nome do Canal",
        category: "Categoria", 
        subscribers: "Inscritos",
        yearlyGrowth: "Crescimento Anual", // 🔄 OLD: Crescimento Anual 컬럼 (삭제 예정)
        monthlyRevenue: "Receita Mensal", // 🆕 NEW: Receita Mensal 컬럼
        monthlyGrowth: "Crescimento Mensal",
        dailyGrowth: "Crescimento Diário",
        subscriptionRate: "Taxa de Inscrição",
        operatingPeriod: "Período de Operação",
        totalViews: "Visualizações Totais",
        avgViews: "Visualizações Médias",
        totalVideos: "Total de Vídeos",
        uploadFrequency: "Frequência de Upload"
      },
      sortOptions: {
        highToLow: "Do alto ao baixo",
        lowToHigh: "Do baixo ao alto"
      }
    },
    sidebar: {
      labels: {
        category: "Categoria",
        subscribers: "Inscritos",
        country: "País",
        operatingPeriod: "Período de Operação",
        totalViews: "Visualizações Totais",
        avgViews: "Visualizações Médias",
        totalVideos: "Total de Vídeos",
        uploadFrequency: "Frequência de Upload",
        monthlyGrowth: "Crescimento Mensal",
        yearlyGrowth: "Crescimento Anual",
        viewsPerSubscriber: "Visualizações por Inscrito",
        subscriptionRate: "Taxa de Inscrição"
      },
      subscriberGrowth: "Tendência de Crescimento de Inscritos",
      revenueCalculation: "Cálculo de Receita",
      totalShortsRevenue: "Receita Total de Shorts",
      totalLongRevenue: "Receita Total de Vídeos Longos",
      totalRevenue: "Shorts + Vídeos Longos Receita Total (USD)",
      monthlyUsdRevenue: "Receita Mensal USD",
      localCurrencyText: "Este valor em euros é",
      detailInfo: "Informações Detalhadas",
      noSubscriberData: "Dados de inscritos não disponíveis"
    },
    units: {
      subscribers: "inscritos",
      views: "visualizações", 
      videos: "vídeos",
      months: "meses",
      perWeek: "/semana",
      perDay: "por dia",
      years: "anos",
      people: "",
      items: "",
      times: "vezes",
      others: "Outros",
      exchangeRate: "Taxa de Câmbio",
      exchangeRatePlaceholder: "Digite a taxa de câmbio"
    },
    buttons: {
      cancel: "Cancelar",
      confirm: "Confirmar"
    },
    currencies: {
      USD: "Dólar",
      KRW: "Won", 
      JPY: "Iene",
      CNY: "Yuan",
      INR: "Rúpia",
      GBP: "Libra",
      EUR: "Euro",
      CAD: "Dólar Canadense",
      AUD: "Dólar Australiano",
      BRL: "Real",
      MXN: "Peso"
    },
    numberFormat: {
      thousand: "mil",
      million: "milhão",
      billion: "bilhão",
      trillion: "trilhão"
    },
    tooltips: {
      viewsPerSubscriber: "Esta métrica mostra altas visualizações em relação aos inscritos. Significa que seu conteúdo está sendo exposto a muitos usuários além de seus próprios inscritos.",
      subscriptionRate: "Esta métrica mostra a taxa de pessoas que se inscrevem depois de assistir vídeos. Uma média de 3% é considerada muito alta.",
      monthlyRevenue: "Receita média mensal calculada dividindo a receita total pelo período operacional",
      exchangeRateChange: "Clique para alterar a taxa de câmbio (Atual: {rate}{symbol})"
    }
  },
  ru: {
    header: {
      mainTitle: "Глобальные данные YouTube каналов",
      searchPlaceholder: "Поиск каналов...",
      loadingMessage: "Загрузка данных канала..."
    },
    table: {
      headers: {
        no: "No",
        channelName: "Название канала",
        category: "Категория", 
        subscribers: "Подписчики",
        yearlyGrowth: "Годовой рост", // 🔄 OLD: Годовой рост 컬럼 (삭제 예정)
        monthlyRevenue: "Месячный доход", // 🆕 NEW: Месячный доход 컬럼
        monthlyGrowth: "Месячный рост",
        dailyGrowth: "Ежедневный рост",
        subscriptionRate: "Коэффициент подписки",
        operatingPeriod: "Период работы",
        totalViews: "Всего просмотров",
        avgViews: "Средние просмотры",
        totalVideos: "Всего видео",
        uploadFrequency: "Частота загрузки"
      },
      sortOptions: {
        highToLow: "От высокого к низкому",
        lowToHigh: "От низкого к высокому"
      }
    },
    sidebar: {
      labels: {
        category: "Категория",
        subscribers: "Подписчики",
        country: "Страна",
        operatingPeriod: "Период работы",
        totalViews: "Всего просмотров",
        avgViews: "Средние просмотры",
        totalVideos: "Всего видео",
        uploadFrequency: "Частота загрузки",
        monthlyGrowth: "Месячный рост",
        yearlyGrowth: "Годовой рост",
        viewsPerSubscriber: "Просмотры на подписчика",
        subscriptionRate: "Коэффициент подписки"
      },
      subscriberGrowth: "Тренд роста подписчиков",
      revenueCalculation: "Расчет дохода",
      totalShortsRevenue: "Общий доход от Shorts",
      totalLongRevenue: "Общий доход от длинных видео",
      totalRevenue: "Shorts + длинные общий доход (USD)",
      monthlyUsdRevenue: "Ежемесячный доход USD",
      localCurrencyText: "Эта сумма в рублях составляет",
      detailInfo: "Детальная информация",
      noSubscriberData: "Данные о подписчиках недоступны"
    },
    units: {
      subscribers: "подписчиков",
      views: "просмотров", 
      videos: "видео",
      months: "месяцев",
      perWeek: "/неделя",
      perDay: "в день",
      years: "лет",
      people: "человек",
      items: "шт",
      times: "раз",
      others: "Прочие",
      exchangeRate: "Обменный курс",
      exchangeRatePlaceholder: "Введите обменный курс"
    },
    buttons: {
      cancel: "Отмена",
      confirm: "Подтвердить"
    },
    currencies: {
      USD: "доллар",
      KRW: "вон", 
      JPY: "йена",
      CNY: "юань",
      INR: "рупия",
      GBP: "фунт",
      EUR: "евро",
      CAD: "канадский доллар",
      AUD: "австралийский доллар",
      BRL: "реал",
      MXN: "песо"
    },
    numberFormat: {
      thousand: "тысяча",
      million: "миллион",
      billion: "миллиард",
      trillion: "триллион"
    },
    tooltips: {
      viewsPerSubscriber: "Эта метрика показывает высокое количество просмотров относительно подписчиков. Это означает, что ваш контент показывается многим пользователям помимо ваших собственных подписчиков.",
      subscriptionRate: "Эта метрика показывает долю людей, которые подписываются после просмотра видео. Средний показатель 3% считается очень высоким.",
      monthlyRevenue: "Средний месячный доход, рассчитанный путем деления общего дохода на период работы",
      exchangeRateChange: "Нажмите для изменения курса обмена (Текущий: {rate}{symbol})"
    }
  }
};

// 헬퍼 함수: 중첩된 키로 번역 값 가져오기
export const getChannelFinderTranslation = (i18nObject: Record<Language, Record<string, any>>, language: Language, key: string, params?: Record<string, any>): string => {
  const keys = key.split('.');
  let value: any = i18nObject[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key; // 키를 그대로 반환
    }
  }
  
  if (typeof value === 'string') {
    // 매개변수 치환 (예: "Hello {name}" → "Hello John")
    if (params) {
      return value.replace(/{(\w+)}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    return value;
  }
  
  console.warn(`Translation value is not a string: ${key} for language: ${language}`);
  return key;
};

// 지역화된 숫자 형식 함수
export const formatLocalizedNumber = (num: number, language: Language, currencySymbol: string): string => {
  const formatConfig = channelFinderI18n[language]?.numberFormat;
  if (!formatConfig) return `${num.toLocaleString()} ${currencySymbol}`;

  if (language === 'ko') {
    // 한국어: 만, 억, 조 단위
    if (num >= 1000000000000) { // 조
      const jo = Math.floor(num / 1000000000000);
      const eok = Math.floor((num % 1000000000000) / 100000000);
      if (eok > 0) {
        return `${jo}${formatConfig.trillion} ${eok}${formatConfig.hundredMillion} ${currencySymbol}`;
      }
      return `${jo}${formatConfig.trillion} ${currencySymbol}`;
    } else if (num >= 100000000) { // 억
      const eok = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      if (man > 0) {
        return `${eok}${formatConfig.hundredMillion} ${man}${formatConfig.tenThousand} ${currencySymbol}`;
      }
      return `${eok}${formatConfig.hundredMillion} ${currencySymbol}`;
    } else if (num >= 10000) { // 만
      const man = Math.floor(num / 10000);
      const remainder = num % 10000;
      if (remainder > 0) {
        return `${man}${formatConfig.tenThousand} ${remainder.toLocaleString()} ${currencySymbol}`;
      }
      return `${man}${formatConfig.tenThousand} ${currencySymbol}`;
    }
  } else if (language === 'ja') {
    // 일본어: 万, 億, 兆 단위
    if (num >= 1000000000000) { // 兆
      const cho = Math.floor(num / 1000000000000);
      const oku = Math.floor((num % 1000000000000) / 100000000);
      if (oku > 0) {
        return `${cho}${formatConfig.trillion}${oku}${formatConfig.hundredMillion}${currencySymbol}`;
      }
      return `${cho}${formatConfig.trillion}${currencySymbol}`;
    } else if (num >= 100000000) { // 億
      const oku = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      if (man > 0) {
        return `${oku}${formatConfig.hundredMillion}${man}${formatConfig.tenThousand}${currencySymbol}`;
      }
      return `${oku}${formatConfig.hundredMillion}${currencySymbol}`;
    } else if (num >= 10000) { // 万
      const man = Math.floor(num / 10000);
      const remainder = num % 10000;
      if (remainder > 0) {
        return `${man}${formatConfig.tenThousand}${remainder.toLocaleString()}${currencySymbol}`;
      }
      return `${man}${formatConfig.tenThousand}${currencySymbol}`;
    }
  } else if (language === 'zh') {
    // 중국어: 万, 亿 단위
    if (num >= 100000000) { // 亿
      const yi = Math.floor(num / 100000000);
      const wan = Math.floor((num % 100000000) / 10000);
      if (wan > 0) {
        return `${yi}${formatConfig.hundredMillion} ${wan}${formatConfig.tenThousand} ${currencySymbol}`;
      }
      return `${yi}${formatConfig.hundredMillion} ${currencySymbol}`;
    } else if (num >= 10000) { // 万
      const wan = Math.floor(num / 10000);
      const remainder = num % 10000;
      if (remainder > 0) {
        return `${wan}${formatConfig.tenThousand} ${remainder.toLocaleString()} ${currencySymbol}`;
      }
      return `${wan}${formatConfig.tenThousand} ${currencySymbol}`;
    }
  } else if (language === 'hi') {
    // 힌디어: 하자르, 라크, 크로르, 아랍 단위
    if (num >= 1000000000) { // 아랍 (1 billion)
      const arab = Math.floor(num / 1000000000);
      const crore = Math.floor((num % 1000000000) / 10000000);
      if (crore > 0) {
        return `${arab} ${formatConfig.arabPati} ${crore} ${formatConfig.crore} ${currencySymbol}`;
      }
      return `${arab} ${formatConfig.arabPati} ${currencySymbol}`;
    } else if (num >= 10000000) { // 크로르 (10 million)
      const crore = Math.floor(num / 10000000);
      const lakh = Math.floor((num % 10000000) / 100000);
      if (lakh > 0) {
        return `${crore} ${formatConfig.crore} ${lakh} ${formatConfig.lakh} ${currencySymbol}`;
      }
      return `${crore} ${formatConfig.crore} ${currencySymbol}`;
    } else if (num >= 100000) { // 라크 (100 thousand)
      const lakh = Math.floor(num / 100000);
      const remainder = num % 100000;
      if (remainder >= 1000) {
        const thousand = Math.floor(remainder / 1000);
        return `${lakh} ${formatConfig.lakh} ${thousand} ${formatConfig.thousand} ${currencySymbol}`;
      }
      return `${lakh} ${formatConfig.lakh} ${currencySymbol}`;
    } else if (num >= 1000) {
      const thousand = Math.floor(num / 1000);
      return `${thousand} ${formatConfig.thousand} ${currencySymbol}`;
    }
  } else {
    // 서구 언어들: thousand, million, billion, trillion
    if (num >= 1000000000000) { // trillion
      const trillions = (num / 1000000000000).toFixed(1);
      return `${trillions} ${formatConfig.trillion || 'trillion'} ${currencySymbol}`;
    } else if (num >= 1000000000) { // billion
      const billions = (num / 1000000000).toFixed(1);
      return `${billions} ${formatConfig.billion || 'billion'} ${currencySymbol}`;
    } else if (num >= 1000000) { // million
      const millions = (num / 1000000).toFixed(1);
      return `${millions} ${formatConfig.million || 'million'} ${currencySymbol}`;
    } else if (num >= 1000) { // thousand
      const thousands = (num / 1000).toFixed(1);
      return `${thousands} ${formatConfig.thousand || 'thousand'} ${currencySymbol}`;
    }
  }

  return `${num.toLocaleString()} ${currencySymbol}`;
};