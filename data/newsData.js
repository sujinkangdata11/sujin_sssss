// VIDHUNT 완성 뉴스 데이터
// 총 109개 기사, 11개 언어 완전 하드코딩 완료
// 생성일: 2025-08-20

// 데이터 통계
export const NEWS_STATS = {
  version: "1.0.0",
  lastUpdated: "2025-08-20",
  totalArticles: 109,
  languages: 11,
  breakdown: {
    ko: 10, // 한국어
    en: 10, // 영어  
    ja: 9,  // 일본어 (1번 기사 누락)
    zh: 10, // 중국어
    es: 10, // 스페인어
    fr: 10, // 프랑스어
    de: 10, // 독일어
    nl: 10, // 네덜란드어
    pt: 10, // 포르투갈어
    ru: 10, // 러시아어
    hi: 10  // 힌디어
  },
  contentTypes: {
    title: "썸네일 제목용",
    excerpt: "썸네일 서브텍스트용", 
    content: "상세페이지 전체 내용 (purple 마킹, 이미지, YouTube 포함)"
  }
};

// 주의: 실제 NEWS_DATA는 contentService.ts에서 사용 중
// 이 파일은 데이터 구조 참조 및 백업 용도

export const DATA_STRUCTURE_SAMPLE = {
  // 각 언어별로 이런 구조
  ko: [
    {
      id: 1,
      title: "VIDHUNT VS 유튜브 일반 검색.\n무엇이 낫나요?", // 썸네일 제목
      excerpt: "많은 분들이 궁금해하시는 질문이 있습니다...", // 썸네일 서브텍스트
      content: `답은 바로 [키워드 검색의 범위]에 있습니다...`, // 상세 내용 전체
      category: "Technology",
      date: "2025-08-18"
    }
    // ... 총 10개 (일본어는 9개)
  ]
  // ko, en, ja, zh, es, fr, de, nl, pt, ru, hi 총 11개 언어
};

// 현재 위치: /Users/sujin/Desktop/global-shorts-finder/services/contentService.ts
// 실제 사용 위치: loadArticlesForPage(), loadArticleFromFile() 함수들에서 활용
// 
// 모든 데이터 완성 상태:
// ✅ 썸네일용 텍스트 (title, excerpt) - 모든 기사 완료
// ✅ 상세페이지용 텍스트 (content) - 전체 내용, 마킹, 이미지 포함 완료 
// ✅ 11개 언어 x 109개 기사 = 완전 하드코딩 완료
// ✅ GitHub 푸시 완료 (79c6b00 커밋)

export default {
  NEWS_STATS,
  DATA_STRUCTURE_SAMPLE
};