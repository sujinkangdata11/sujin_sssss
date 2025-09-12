/**
 * Gemini TTS API 호출 관련 함수들
 * REST API 방식으로 Gemini TTS를 호출하고 오디오 데이터를 처리
 */

export interface TTSRequest {
  text: string;
  voiceName: string;
  apiKey: string;
}

export interface TTSResponse {
  candidates: Array<{
    content?: {
      parts: Array<{
        inlineData?: {
          data: string; // Base64 encoded PCM data
        };
        data?: string; // Alternative path for audio data
      }>
    };
    finishReason?: string; // Add finishReason field
    index?: number;
  }>
}

/**
 * Gemini TTS API를 호출하여 음성 생성
 */
export async function callGeminiTTS(request: TTSRequest): Promise<TTSResponse> {
  console.log('🎵 Gemini TTS API 호출 시작:', {
    text: '"' + request.text.substring(0, 50) + '..."',
    voiceName: request.voiceName,
    hasApiKey: !!request.apiKey
  });

  const requestBody = {
    contents: [{
      parts: [{
        text: request.text // 사용자가 입력한 대사 (이미 voiceMapping에서 따옴표 처리됨)
      }]
    }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: request.voiceName // 매핑된 Gemini 음성 이름
          }
        }
      }
    }
  };

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': request.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TTS API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
        apiKeyLength: request.apiKey ? request.apiKey.length : 0,
        hasApiKey: !!request.apiKey
      });
      
      if (response.status === 403) {
        throw new Error(`API 키 인증 실패: ${response.status}. API 키가 유효한지, TTS 권한이 있는지 확인해주세요. 에러 세부사항: ${errorText}`);
      }
      
      throw new Error(`TTS API 에러: ${response.status} ${response.statusText}. 세부사항: ${errorText}`);
    }

    const data: TTSResponse = await response.json();
    console.log('✅ TTS API 성공적으로 응답 받음');
    console.log('🔍 TTS 응답 구조 확인:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ TTS API 호출 실패:', error);
    throw error;
  }
}

/**
 * Base64 PCM 데이터를 바이너리로 변환
 */
export function convertBase64ToPCM(base64Data: string): Uint8Array {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  return new Uint8Array(byteNumbers);
}

/**
 * TTS 응답에서 오디오 데이터 추출
 */
export function extractAudioData(ttsResponse: TTSResponse): string | null {
  console.log('🔍 오디오 데이터 추출 시도:', JSON.stringify(ttsResponse, null, 2));
  
  // 다양한 경로 시도
  const candidate = ttsResponse.candidates?.[0];
  if (!candidate) {
    console.error('❌ candidates가 없습니다');
    return null;
  }
  
  console.log('🔍 candidate 구조:', JSON.stringify(candidate, null, 2));
  
  if (candidate.finishReason === 'OTHER') {
    console.error('❌ finishReason이 OTHER입니다. API 요청에 문제가 있을 수 있습니다.');
    return null;
  }
  
  // 일반적인 경로
  const audioData = candidate.content?.parts?.[0]?.inlineData?.data;
  if (audioData) {
    console.log('✅ 오디오 데이터 찾음 (일반 경로)');
    return audioData;
  }
  
  // 다른 가능한 경로들
  const altAudioData = candidate.content?.parts?.[0]?.data;
  if (altAudioData) {
    console.log('✅ 오디오 데이터 찾음 (대체 경로)');
    return altAudioData;
  }
  
  console.error('❌ 오디오 데이터를 찾을 수 없습니다');
  return null;
}