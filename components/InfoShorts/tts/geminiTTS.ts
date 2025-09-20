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

// 🔑 키 관리 유틸리티 함수들 (InfoShorts.tsx와 동일한 로직)
const isDeveloperKey = (key: string): boolean => {
  return key === 'DEVELOPER_API_KEY_ACTIVE';
};

const getAllDeveloperKeys = async (): Promise<string[]> => {
  try {
    console.log('🔍 [TTS KEY ROTATION] keys1.txt에서 모든 키 가져오기 시작...');

    const timestamp = Date.now();
    const apiKeysResponse = await fetch(`/keys1.txt?t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!apiKeysResponse.ok) {
      throw new Error('keys1.txt 파일을 가져올 수 없습니다.');
    }

    const apiKeysText = await apiKeysResponse.text();
    const lines = apiKeysText.split('\n').filter(line => line.trim());

    let allKeys: string[] = [];

    for (const line of lines) {
      if (line.startsWith('GEMINI_API_KEYS=')) {
        const encryptedKeys = line.split('=')[1].split(',').map(key => key.trim().replace(/"/g, ''));

        // 모든 키 복호화 (첫 1자리를 뒤로 이동)
        const decryptedKeys = encryptedKeys.map(key => {
          if (key.length < 1) return key;
          const front1 = key.substring(0, 1);
          const rest = key.substring(1);
          return rest + front1;
        });

        allKeys = decryptedKeys;
        break;
      }
    }

    console.log(`✅ [TTS KEY ROTATION] 총 ${allKeys.length}개의 키를 발견했습니다.`);
    allKeys.forEach((key, index) => {
      console.log(`🔑 [TTS KEY ROTATION] 키 ${index + 1}: ${key.substring(0, 10)}...${key.slice(-4)}`);
    });

    return allKeys;
  } catch (error) {
    console.error('❌ [TTS KEY ROTATION] getAllDeveloperKeys 실패:', error);
    throw error;
  }
};

/**
 * 단일 키로 TTS API 호출
 */
async function callGeminiTTSWithSingleKey(request: TTSRequest, apiKey: string): Promise<TTSResponse> {
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

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
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
      apiKeyLength: apiKey ? apiKey.length : 0,
      hasApiKey: !!apiKey
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
}

/**
 * Gemini TTS API를 호출하여 음성 생성 (키 로테이션 지원)
 */
export async function callGeminiTTS(request: TTSRequest): Promise<TTSResponse> {
  console.log('🎵 Gemini TTS API 호출 시작:', {
    text: '"' + request.text.substring(0, 50) + '..."',
    voiceName: request.voiceName,
    hasApiKey: !!request.apiKey
  });

  // 개발자 키가 아니면 기존 방식으로 호출
  if (!isDeveloperKey(request.apiKey)) {
    console.log('🔑 [TTS KEY ROTATION] 사용자 수동 입력 키 사용 - 기존 로직 적용');
    return await callGeminiTTSWithSingleKey(request, request.apiKey);
  }

  console.log('🔑 [TTS KEY ROTATION] 개발자 키 감지 - 키 로테이션 로직 적용');

  try {
    // 모든 개발자 키 가져오기
    const allKeys = await getAllDeveloperKeys();

    if (allKeys.length === 0) {
      throw new Error('사용 가능한 개발자 키가 없습니다.');
    }

    // 각 키를 순차적으로 시도
    for (let i = 0; i < allKeys.length; i++) {
      const keyToTry = allKeys[i];
      const isLastKey = i === allKeys.length - 1;

      console.log(`🔄 [TTS KEY ROTATION] ${i + 1}/${allKeys.length} 키 시도 중... (${keyToTry.substring(0, 10)}...${keyToTry.slice(-4)})`);

      try {
        const result = await callGeminiTTSWithSingleKey(request, keyToTry);
        console.log(`✅ [TTS KEY ROTATION] ${i + 1}번째 키로 성공! TTS API 호출 완료`);
        return result;
      } catch (error: any) {
        const errorMessage = error.message || error.toString();
        console.log(`❌ [TTS KEY ROTATION] ${i + 1}번째 키 실패:`, errorMessage);

        if (isLastKey) {
          // 마지막 키까지 실패한 경우 - 사용자에게 에러 메시지 표시
          console.log('💥 [TTS KEY ROTATION] 모든 키 시도 완료 - 사용자에게 에러 메시지 표시');
          throw new Error('이 gemini 키는 할당량이 다 찼어요. 다른 Gemini 키를 입력해주세요');
        } else {
          // 마지막 키가 아니면 어떤 에러든 조용히 다음 키 시도
          console.log(`🔄 [TTS KEY ROTATION] ${i + 1}번째 키 실패 - 다음 키 시도... (에러 종류: ${errorMessage.slice(0, 50)}...)`);
          continue;
        }
      }
    }

    // 이 코드는 실행되지 않아야 함
    throw new Error('예상치 못한 오류가 발생했습니다.');

  } catch (error: any) {
    console.error('💥 [TTS KEY ROTATION] callGeminiTTS 최종 실패:', error);
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