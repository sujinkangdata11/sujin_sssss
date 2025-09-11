// 채널 핸들명 수집 및 이메일 전송 서비스
// 검색 결과에서 채널 핸들명(@username)을 수집하여 이메일로 전송

import { YouTubeShort } from '../types';

interface EmailData {
  to: string;
  subject: string;
  text: string;
}

// 검색 결과에서 모든 채널명 수집 (중복 제거하고 @붙이기)
const collectUniqueHandles = (videos: YouTubeShort[]): string[] => {
  const handles = new Set<string>();
  let processedCount = 0;
  let channelTitleFoundCount = 0;
  
  videos.forEach((video, index) => {
    processedCount++;
    console.log(`🔍 [채널수집] 영상 ${index + 1}/${videos.length} 처리중: ${video.title || '제목없음'}`);
    
    if (video.channelTitle) {
      channelTitleFoundCount++;
      handles.add(`@${video.channelTitle}`);
      console.log(`✅ [채널수집] 채널명 발견: ${video.channelTitle}`);
    } else {
      console.log(`❌ [채널수집] 채널명 없음`);
    }
  });
  
  console.log(`📊 [채널수집] 처리 완료 - 총 영상: ${processedCount}개, 채널명 있는 영상: ${channelTitleFoundCount}개, 유니크 채널: ${handles.size}개`);
  
  return Array.from(handles);
};

// UTC 시간으로 이메일 제목 생성
const generateEmailSubject = (): string => {
  const now = new Date();
  const utcString = now.toISOString().replace(/[-T:.Z]/g, '');
  return utcString;
};

// Cloudflare Worker로 데이터 전송 (조용히 실패 처리)
const sendToCloudflare = async (timestamp: string, handles: string): Promise<void> => {
  try {
    console.log('☁️ [채널수집] Cloudflare Worker로 데이터 전송 시작');
    console.log(`☁️ [채널수집] 타임스탬프: ${timestamp}`);
    console.log(`☁️ [채널수집] 핸들 개수: ${handles.split(', ').length}개`);
    console.log(`☁️ [채널수집] 핸들 목록: ${handles}`);
    
    const response = await fetch('https://vidhunt-email.anime-toon-7923.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: timestamp,
        handles: handles
      })
    });
    
    if (response.ok) {
      console.log('✅ [채널수집] Cloudflare KV 저장 완료!');
    } else {
      console.error('❌ [채널수집] Cloudflare 응답 에러:', response.status);
    }
    
  } catch (error) {
    // 조용히 실패 처리 - 사용자에게 표시하지 않음
    console.error('❌ [채널수집] Cloudflare 전송 실패 (조용히 처리):', error);
  }
};

// 메인 함수: 핸들명 수집 및 이메일 전송
export const collectAndSendHandles = async (videos: YouTubeShort[]): Promise<void> => {
  try {
    console.log(`🔍 [채널수집] 검색 결과 분석 시작 - 총 ${videos.length}개 영상`);
    
    // 1. 핸들명 수집 및 중복 제거
    const uniqueHandles = collectUniqueHandles(videos);
    
    console.log(`🎯 [채널수집] 핸들명 수집 완료 - ${uniqueHandles.length}개 발견`);
    
    // 2. 핸들명이 없으면 전송하지 않음
    if (uniqueHandles.length === 0) {
      console.log('⚠️ [채널수집] 핸들명이 없어서 이메일 전송 안함');
      return;
    }
    
    // 3. Cloudflare 전송 데이터 준비
    const timestamp = generateEmailSubject();
    const handlesText = uniqueHandles.join(', ');
    
    // 4. Cloudflare Worker로 데이터 전송
    await sendToCloudflare(timestamp, handlesText);
    
  } catch (error) {
    // 조용히 실패 처리
    console.error('채널 핸들명 수집 실패 (조용히 처리):', error);
  }
};

// 검색 완료 5초 후 자동 실행하는 래퍼 함수
export const scheduleHandleCollection = (videos: YouTubeShort[]): void => {
  console.log('⏰ [채널수집] 5초 후 채널 핸들명 수집 예약됨');
  setTimeout(() => {
    console.log('🚀 [채널수집] 5초 경과 - 채널 핸들명 수집 시작!');
    collectAndSendHandles(videos);
  }, 5000);
};