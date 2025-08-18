interface RequiredFile {
  filename: string;
  type: 'text' | 'image' | 'thumbnail';
  articleId: number;
  pageNumber: number;
  language: string;
}

interface SyncResult {
  copied: RequiredFile[];
  missing: RequiredFile[];
  totalFound: number;
  totalMissing: number;
}

/**
 * localStorage에서 발행된 뉴스들을 확인하고 필요한 파일 목록을 생성
 */
export const getRequiredFilesFromNews = (): RequiredFile[] => {
  const requiredFiles: RequiredFile[] = [];
  
  try {
    // localStorage에서 발행된 기사들 가져오기
    const publishedArticles = JSON.parse(localStorage.getItem('published_articles') || '[]');
    console.log('📊 발행된 기사 수:', publishedArticles.length);
    
    publishedArticles.forEach((article: any) => {
      const { id: articleId, pageNumber, language, content } = article;
      
      // 1. 텍스트 파일 (page1_article1_ko.txt 형식)
      const textFile: RequiredFile = {
        filename: `page${pageNumber}_article${articleId}_${language}.txt`,
        type: 'text',
        articleId,
        pageNumber,
        language
      };
      requiredFiles.push(textFile);
      
      // 2. 썸네일 파일 (page1_article1_ko_thumbnail.png 형식)
      const thumbnailFile: RequiredFile = {
        filename: `page${pageNumber}_article${articleId}_${language}_thumbnail.png`,
        type: 'thumbnail',
        articleId,
        pageNumber,
        language
      };
      requiredFiles.push(thumbnailFile);
      
      // 3. 컨텐츠 이미지 파일들 ([IMAGE:filename] 형식에서 추출)
      if (content && typeof content === 'string') {
        const imageMatches = content.match(/\[IMAGE:([^\]]+)\]/g);
        if (imageMatches) {
          imageMatches.forEach((match: string) => {
            const filename = match.replace(/\[IMAGE:|\]/g, '');
            const imageFile: RequiredFile = {
              filename,
              type: 'image',
              articleId,
              pageNumber,
              language
            };
            requiredFiles.push(imageFile);
          });
        }
      }
    });
    
    console.log('📋 필요한 파일 수:', requiredFiles.length);
    console.log('📋 파일 목록:', requiredFiles.map(f => f.filename));
    
  } catch (error) {
    console.error('❌ localStorage에서 뉴스 데이터 읽기 실패:', error);
  }
  
  return requiredFiles;
};

/**
 * contents/01/ 폴더에서 필요한 파일들이 있는지 확인하고 매칭 결과 반환
 */
export const checkAvailableFiles = async (requiredFiles: RequiredFile[]): Promise<SyncResult> => {
  const copied: RequiredFile[] = [];
  const missing: RequiredFile[] = [];
  
  for (const file of requiredFiles) {
    // 파일 존재 여부는 실제로는 bash 명령어로 확인해야 하므로
    // 여기서는 파일 목록만 준비하고, 실제 복사는 bash에서 수행
    console.log(`🔍 확인 대상: ${file.filename}`);
  }
  
  return {
    copied,
    missing,
    totalFound: copied.length,
    totalMissing: missing.length
  };
};

/**
 * 필요한 bash 명령어들을 생성하여 반환
 */
export const generateCopyCommands = (requiredFiles: RequiredFile[]): string[] => {
  const commands: string[] = [];
  const contentsPath = '/Users/sujin/Desktop/global-shorts-finder/contents/01';
  const publicPath = '/Users/sujin/Desktop/global-shorts-finder/public/contents/01';
  
  requiredFiles.forEach(file => {
    const sourcePath = `${contentsPath}/${file.filename}`;
    const destPath = `${publicPath}/${file.filename}`;
    
    // 파일 존재 확인 후 복사하는 bash 명령어
    const command = `if [ -f "${sourcePath}" ]; then cp "${sourcePath}" "${destPath}" && echo "✅ 복사 완료: ${file.filename}"; else echo "❌ 파일 없음: ${file.filename}"; fi`;
    commands.push(command);
  });
  
  return commands;
};

/**
 * 컨텐츠 동기화 메인 함수
 */
export const syncContent = async (): Promise<{commands: string[], summary: string}> => {
  console.log('🔄 컨텐츠 동기화 시작...');
  
  // 1. localStorage에서 필요한 파일 목록 추출
  const requiredFiles = getRequiredFilesFromNews();
  
  if (requiredFiles.length === 0) {
    return {
      commands: [],
      summary: '⚠️ 발행된 뉴스가 없어서 동기화할 파일이 없습니다.'
    };
  }
  
  // 2. bash 명령어 생성
  const commands = generateCopyCommands(requiredFiles);
  
  // 3. 요약 정보 생성
  const textFiles = requiredFiles.filter(f => f.type === 'text').length;
  const imageFiles = requiredFiles.filter(f => f.type === 'image').length;
  const thumbnailFiles = requiredFiles.filter(f => f.type === 'thumbnail').length;
  
  const summary = `📊 동기화 대상: 텍스트 ${textFiles}개, 이미지 ${imageFiles}개, 썸네일 ${thumbnailFiles}개 (총 ${requiredFiles.length}개)`;
  
  return {
    commands,
    summary
  };
};