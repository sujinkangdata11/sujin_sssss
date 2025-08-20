const fs = require('fs');
const path = require('path');

// contentService.ts에서 NEWS_DATA 추출하는 스크립트
async function exportNewsData() {
  try {
    console.log('📊 Starting news data export...');
    
    // contentService.ts 파일 읽기
    const contentServicePath = path.join(__dirname, '../services/contentService.ts');
    const content = fs.readFileSync(contentServicePath, 'utf8');
    
    // NEWS_DATA 객체 추출 (정규표현식으로)
    const newsDataMatch = content.match(/const NEWS_DATA: Record<Language, Article\[\]> = ({[\s\S]*?});/);
    
    if (!newsDataMatch) {
      throw new Error('NEWS_DATA not found in contentService.ts');
    }
    
    // TypeScript를 JavaScript로 변환하여 eval 가능하게 만들기
    let newsDataString = newsDataMatch[1];
    
    // 백틱 문자열을 일반 문자열로 변환
    newsDataString = newsDataString.replace(/`([\s\S]*?)`/g, (match, content) => {
      return JSON.stringify(content);
    });
    
    // 데이터 디렉토리 생성
    const dataDir = path.join(__dirname, '../data/news');
    const backupDir = path.join(dataDir, 'backup');
    
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    
    // 백업 파일명에 타임스탬프 추가
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 원본 TypeScript 코드 백업
    const backupPath = path.join(backupDir, `contentService_${timestamp}.ts`);
    fs.writeFileSync(backupPath, content);
    console.log(`✅ Original contentService.ts backed up to: ${backupPath}`);
    
    // JSON 데이터 구조 생성
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      totalArticles: 109,
      languages: 11,
      metadata: {
        source: "contentService.ts",
        textFilesLocation: "/public/contents/01/",
        imagesLocation: "/public/contents/01/",
        notes: "Exported from hardcoded NEWS_DATA object"
      },
      rawData: newsDataString, // 원본 TypeScript 객체 문자열
      summary: {
        ko: "Korean articles (10)",
        en: "English articles (10)", 
        ja: "Japanese articles (9)",
        zh: "Chinese articles (10)",
        es: "Spanish articles (10)",
        fr: "French articles (10)",
        de: "German articles (10)",
        nl: "Dutch articles (10)",
        pt: "Portuguese articles (10)",
        ru: "Russian articles (10)",
        hi: "Hindi articles (10)"
      }
    };
    
    // JSON 파일로 저장
    const jsonPath = path.join(dataDir, 'articles_backup.json');
    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ News data exported to: ${jsonPath}`);
    
    // 간단한 통계 저장
    const statsPath = path.join(dataDir, 'stats.json');
    const stats = {
      lastExport: new Date().toISOString(),
      totalArticles: 109,
      languageBreakdown: exportData.summary,
      fileSize: fs.statSync(contentServicePath).size,
      exportedFiles: [backupPath, jsonPath, statsPath]
    };
    
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`✅ Statistics saved to: ${statsPath}`);
    
    console.log('\n🎉 Export completed successfully!');
    console.log(`📁 Data location: ${dataDir}`);
    console.log(`📊 Total articles: ${exportData.totalArticles}`);
    console.log(`🌍 Languages: ${exportData.languages}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  exportNewsData();
}

module.exports = { exportNewsData };