/**
 * Gemini Speech-to-Text API 호출 관련 함수들
 * 인라인 데이터 방식으로 오디오를 전달하여 정확한 SRT 자막 생성
 */

import { GoogleGenAI } from "@google/genai";

export interface STTRequest {
  audioBuffer: ArrayBuffer;
  apiKey: string;
  wordsPerSubtitle: number;
  ///// 오디오 길이(초) 추가
  audioDuration?: number;
}

export interface STTResponse {
  success: boolean;
  srtContent?: string;
  error?: string;
}

/**
 * ArrayBuffer를 Base64 문자열로 변환
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

///// WAV 헤더에서 오디오 길이 계산
function getAudioDurationFromBuffer(buffer: ArrayBuffer): number {
  try {
    const view = new DataView(buffer);
    // WAV 파일 검증
    if (view.getUint32(0, false) !== 0x52494646) { // "RIFF"
      console.log('⚠️ RIFF 헤더를 찾을 수 없어서 기본 길이 사용');
      return 30; // 기본값
    }
    
    // 샘플 레이트 (44번째 바이트부터 4바이트)
    const sampleRate = view.getUint32(24, true);
    // 전체 데이터 크기
    const dataSize = view.getUint32(4, true) - 36;
    // 채널 수
    const channels = view.getUint16(22, true);
    // 비트 뎁스
    const bitsPerSample = view.getUint16(34, true);
    
    const duration = dataSize / (sampleRate * channels * (bitsPerSample / 8));
    console.log('🎵 오디오 정보:', { sampleRate, channels, bitsPerSample, dataSize, duration });
    
    return Math.round(duration * 10) / 10; // 소수점 1자리로 반올림
  } catch (error) {
    console.log('⚠️ 오디오 길이 계산 실패, 기본값 사용:', error);
    return 30; // 기본값
  }
}

/**
 * Gemini STT API를 사용하여 오디오에서 정확한 SRT 자막 생성 (인라인 데이터 방식)
 */
export async function generateSRTWithGeminiSTT(request: STTRequest): Promise<STTResponse> {
  console.log('🎙️ Gemini STT API 호출 시작 (인라인 방식):', {
    audioBufferSize: request.audioBuffer.byteLength,
    wordsPerSubtitle: request.wordsPerSubtitle,
    hasApiKey: !!request.apiKey
  });

  try {
    // Google GenAI 클라이언트 초기화
    const ai = new GoogleGenAI({
      apiKey: request.apiKey
    });

    // ArrayBuffer를 Base64로 변환
    console.log('🔄 오디오 데이터 Base64 변환 중...');
    const base64AudioData = arrayBufferToBase64(request.audioBuffer);
    console.log('✅ Base64 변환 완료, 크기:', base64AudioData.length);
    
    ///// 오디오 길이 계산
    const audioDuration = request.audioDuration || getAudioDurationFromBuffer(request.audioBuffer);
    console.log('🎵 계산된 오디오 길이:', audioDuration, '초');

    ///// 단어 수에 따른 동적 설명 생성
    const generateTimingDescriptionByWordCount = (wordCount: number): string => {
      const descriptions = {
        1: "각 자막이 한 단어를 포함하며, 그 단어의 실제 발음 시간에 맞춰서",
        2: "각 자막이 두 단어를 포함하며, 그 두 단어의 실제 발음 시간에 맞춰서",
        3: "각 자막이 세 단어를 포함하며, 그 세 단어의 실제 발음 시간에 맞춰서",
        4: "각 자막이 네 단어를 포함하며, 그 네 단어의 실제 발음 시간에 맞춰서"
      };
      
      return descriptions[wordCount as keyof typeof descriptions] || descriptions[1];
    };

    ///// 단어 수에 따른 동적 예시 생성
    const generateExampleByWordCount = (wordCount: number): string => {
      const examples = {
        1: `    1
    00:00:00,100 --> 00:00:00,600
    안녕

    2
    00:00:00,601 --> 00:00:01,100
    하세요

    3
    00:00:01,101 --> 00:00:01,800
    반갑습니다`,
        2: `    1
    00:00:00,100 --> 00:00:00,800
    안녕 하세요

    2
    00:00:00,801 --> 00:00:01,500
    반갑습니다 오늘은

    3
    00:00:01,501 --> 00:00:02,200
    좋은 날씨네요`,
        3: `    1
    00:00:00,100 --> 00:00:01,000
    안녕 하세요 반갑습니다

    2
    00:00:01,001 --> 00:00:01,900
    오늘은 좋은 날씨네요

    3
    00:00:01,901 --> 00:00:02,800
    함께 즐거운 시간을`,
        4: `    1
    00:00:00,100 --> 00:00:01,100
    안녕 하세요 반갑습니다 오늘은

    2
    00:00:01,101 --> 00:00:02,100
    좋은 날씨네요 함께 즐거운

    3
    00:00:02,101 --> 00:00:03,100
    시간을 보내도록 하겠습니다`
      };
      
      return examples[wordCount as keyof typeof examples] || examples[1];
    };

    // SRT 생성 프롬프트
    const prompt = `다음 음성을 정확한 SRT 자막 형식으로 변환해주세요. 

    SRT 형식 규칙을 정확히 따라주세요:
    1. 자막 번호
    2. 시작시간 --> 끝시간 (HH:MM:SS,MMM 형식, 콤마 사용)
    3. 자막 텍스트
    4. 빈 줄

    **중요한 타이밍 규칙:**
    - ${generateTimingDescriptionByWordCount(request.wordsPerSubtitle)} 발음이 시작되는 시점부터 끝나는 시점까지만 표시
    - 자막 시간대가 절대 겹치지 않도록 연속적으로 배치
    - 이전 자막이 끝나는 시간과 다음 자막이 시작하는 시간이 최대한 가깝게 (빈 구간 최소화)

    올바른 예시 (${request.wordsPerSubtitle}단어 기준, 겹치지 않고 연속적으로 이어지는 형태):
${generateExampleByWordCount(request.wordsPerSubtitle)}

    한 자막당 최대 ${request.wordsPerSubtitle}개의 단어로 제한해주세요.
    각 단어의 실제 발음 시간에 정확히 맞춰 타이밍을 설정해주세요.
    **매우 중요: 이 오디오는 정확히 ${audioDuration}초 길이입니다. 
    마지막 자막이 반드시 ${audioDuration}초 근처에서 끝나야 합니다.
    자막 시간이 ${audioDuration}초를 넘지 않도록 해주세요.**`;
    
    console.log('🤖 Gemini에게 SRT 생성 요청 중...');
    console.log('📝 프롬프트:', prompt);

    // API 호출
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "audio/wav",
            data: base64AudioData,
          },
        },
      ],
    });

    const srtContent = response.text;
    
    console.log('✅ Gemini STT 성공적으로 완료');
    console.log('📄 생성된 SRT 내용 (첫 300자):', srtContent.substring(0, 300));

    return {
      success: true,
      srtContent
    };

  } catch (error) {
    console.error('❌ Gemini STT API 호출 실패:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * SRT 내용 검증 및 정리
 */
export function validateAndCleanSRT(srtContent: string): string {
  console.log('🔧 SRT 내용 검증 및 정리 중...');
  
  ///// 첫 번째 자막 번호 "1" 앞의 모든 내용 제거
  const lines = srtContent.split('\n');
  let startIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '1') {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex === -1) {
    throw new Error('SRT 형식을 찾을 수 없습니다. 자막 번호 1이 없습니다.');
  }
  
  ///// "1"부터 시작하는 순수 SRT 내용만 추출
  const cleanedContent = lines.slice(startIndex).join('\n').trim();
  
  console.log('✅ SRT 검증 완료');
  return cleanedContent;
}