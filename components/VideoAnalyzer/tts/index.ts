/**
 * TTS 모듈의 메인 인터페이스
 * 모든 TTS 관련 기능을 통합하여 간편하게 사용할 수 있도록 함
 */

import { getVoiceConfig, createTTSText, AVAILABLE_GEMINI_VOICES } from './voiceMapping';
import { callGeminiTTS, convertBase64ToPCM, extractAudioData, TTSRequest } from './geminiTTS';
import { createWAVFile, playAudioBuffer, downloadAudioFile } from './audioUtils';

export interface GenerateVoiceOptions {
  text: string;
  userVoice: string;  // 사용자가 선택한 음성 이름 (예: 'youngsu', 'sujin')
  apiKey: string;
}

export interface GenerateVoiceResult {
  success: boolean;
  audioBuffer?: ArrayBuffer;
  error?: string;
}

/**
 * 메인 TTS 생성 함수
 * 텍스트와 음성을 받아서 완전한 오디오 파일을 생성
 */
export async function generateVoice(options: GenerateVoiceOptions): Promise<GenerateVoiceResult> {
  try {
    console.log('🎵 음성 생성 시작:', {
      userVoice: options.userVoice,
      textLength: options.text.length
    });

    // 1. 사용자 음성 설정 가져오기
    const voiceConfig = getVoiceConfig(options.userVoice);
    console.log(`📝 음성 설정: ${options.userVoice} → ${voiceConfig.voiceName}`);
    console.log(`🎭 보이스 프롬프트: ${voiceConfig.voicePrompt}`);

    // 2. 보이스 프롬프트 + 대사 결합
    const finalText = createTTSText(options.userVoice, options.text);
    console.log(`💬 최종 텍스트: ${finalText}`);

    // 3. Gemini TTS API 호출
    const ttsRequest: TTSRequest = {
      text: finalText,
      voiceName: voiceConfig.voiceName,
      apiKey: options.apiKey
    };

    const ttsResponse = await callGeminiTTS(ttsRequest);

    // 4. 오디오 데이터 추출
    const base64AudioData = extractAudioData(ttsResponse);
    if (!base64AudioData) {
      throw new Error('TTS 응답에서 오디오 데이터를 찾을 수 없습니다.');
    }

    // 5. Base64 → PCM → WAV 변환
    const pcmData = convertBase64ToPCM(base64AudioData);
    const wavBuffer = createWAVFile(pcmData, 24000, 1, 16);

    console.log('✅ 음성 생성 완료');
    
    return {
      success: true,
      audioBuffer: wavBuffer
    };

  } catch (error) {
    console.error('❌ 음성 생성 실패:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * 음성 생성 후 바로 재생
 */
export async function generateAndPlayVoice(options: GenerateVoiceOptions): Promise<boolean> {
  const result = await generateVoice(options);
  
  if (result.success && result.audioBuffer) {
    try {
      await playAudioBuffer(result.audioBuffer);
      return true;
    } catch (error) {
      console.error('❌ 오디오 재생 실패:', error);
      return false;
    }
  }
  
  return false;
}

// 다른 모듈에서 사용할 수 있도록 re-export
export { 
  getVoiceConfig,
  createTTSText,
  AVAILABLE_GEMINI_VOICES,
  playAudioBuffer,
  downloadAudioFile,
  createWAVFile
};