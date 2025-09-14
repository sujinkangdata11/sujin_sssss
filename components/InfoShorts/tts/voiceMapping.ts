/**
 * 음성 설정 인터페이스
 * 각 음성마다 Gemini 음성 이름과 프롬프트를 정의
 */
export interface VoiceConfig {
  voiceName: string;    // Gemini TTS 음성 이름
  voicePrompt: string;  // 음성 캐릭터 프롬프트
}

/**
 * 음성별 설정 매핑
 * 각 음성의 보이스 이름과 보이스 프롬프트를 정의
 */
export const VOICE_CONFIGS: { [key: string]: VoiceConfig } = {
  // 남성 음성들
  'youngsu': {
    voiceName: 'Puck',
    voicePrompt: 'You\'re the company\'s official voice, but speak conversationally—like you\'re walking a friend through it. Early-30s male, warm and intelligent. Use contractions, natural phrasing, and short, breathable lines. Pace is slightly fast. Sprinkle gentle reassurance and one light joke if it fits. Avoid salesy hype and \'radio voice.\' End with a clear, helpful next step, tone:'
  },
  'changhee': {
    voiceName: 'Algenib', 
    voicePrompt: 'You\'re the company\'s official voice, but speak conversationally—like you\'re walking a friend through it. Early-30s male, warm and intelligent. Use contractions, natural phrasing, and short, breathable lines. Pace is slightly fast. Sprinkle gentle reassurance and one light joke if it fits. Avoid salesy hype and \'radio voice.\' End with a clear, helpful next step, tone: '
  },
  'minjun': {
    voiceName: 'Schedar',
    voicePrompt: 'You are a seasoned C-suite executive addressing your team. Mid-40s, authoritative yet approachable. Use measured pacing with strategic pauses. Clear articulation, confident tone. Avoid jargon—speak plainly but with gravitas. End with decisive action items Tone:'
  },
  'jihun': {
    voiceName: 'Zubenelgenubi',
    voicePrompt: 'You are the local expert everyone trusts—like a skilled mechanic or experienced teacher. Warm, patient, slightly folksy. Use simple analogies. Speed pace, natural pauses. Genuine care for helping people understand Tone:'
  },
  'yejun': {
    voiceName: 'Enceladus',
    voicePrompt: 'High energy, reactive commentary. Quick wit, meme references, internet slang. Variable pacing—slow for strategy, fast for action. Inclusive language:  End with community engagement Tone:'
  },
  'hunyoung': {
    voiceName: 'Fenrir',
    voicePrompt: 'Enthusiastic teacher vibes that make learning addictive. Use hooks before big reveals. Break down complex topics with analogies. Moderate pace with emphasis on key points. End with engagement call-to-action Tone : '
  },
  
  // 여성 음성들
  'jimin': {
    voiceName: 'Achernar',
    voicePrompt: 'You\'re the company\'s official voice, but speak conversationally—like you\'re walking a friend through it. Early-30s male, warm and intelligent. Use contractions, natural phrasing, and short, breathable lines. Pace is slightly fast. Sprinkle gentle reassurance and one light joke if it fits. Avoid salesy hype and \'radio voice.\' End with a clear, helpful next step, tone: '
  },
  'sujin': {
    voiceName: 'Sulafat',
    voicePrompt: 'You are a passionate entrepreneur in your late 20s. Energetic but not manic. Quick delivery with genuine excitement about solutions. Use modern language, occasional tech terms. Optimistic undertone. End with inspiring next steps Tone:'
  },
  'yena': {
    voiceName: 'Laomedeia',
    voicePrompt: 'You are a favorite professor who makes complex topics fascinating. Thoughtful pacing with dramatic moments. Use vivid examples, Slightly theatrical but genuine. End with thought-provoking questions Tone :'
  },
  'eunji': {
    voiceName: 'Despina',
    voicePrompt: 'cute energy—excited but credible. Fast-paced intro, slow down for important specs. Build anticipation: End with subscriber call-to-action :'
  },
  'yejin': {
    voiceName: 'Pulcherrima',
    voicePrompt: 'You are the clever friend who makes everything easier. Quick wit, casual language, playful energy. Use contractions, pop culture references, light teasing. Fast-paced but clear. End with energy Tone : '
  },
  'minjin': {
    voiceName: 'Aoede',
    voicePrompt: 'Build relationships over time. Speed and Quickly intro, deeper storytelling. Reference previous content. Create inside jokes with community. End with teaser for next episode Tone:'
  },
  'jihyun': {
    voiceName: 'Leda',
    voicePrompt: 'Rapid-fire delivery, punchy transitions. Visual language emphasis. Quick payoff, instant gratification. End with trending energy.'
  },
  'eunsu': {
    voiceName: 'Zephyr',
    voicePrompt: 'Inspiring but authentic—not fake positivity. Personal storytelling, vulnerable moments. Building energy throughout. Direct, honest language. End with empowering call-to-action Tone:'
  },
  'yedam': {
    voiceName: 'Charon',
    voicePrompt: 'Timing is everything—know when to pause for effect. Self-deprecating humor, unexpected turns. Conversational delivery with comedic beats. Use callbacks to earlier jokes. End with something memorable Tone:'
  }
};

/**
 * 사용자 선택 음성의 설정을 가져오기
 */
export function getVoiceConfig(userVoice: string): VoiceConfig {
  return VOICE_CONFIGS[userVoice] || {
    voiceName: 'Kore',
    voicePrompt: '자연스럽게 말해줘'
  };
}

/**
 * 사용자 선택 음성을 Gemini TTS 음성으로 변환 (하위 호환성)
 */
export function getGeminiVoiceName(userVoice: string): string {
  return getVoiceConfig(userVoice).voiceName;
}

/**
 * 최종 텍스트 생성 (보이스 프롬프트 + 대사)
 */
export function createTTSText(userVoice: string, script: string): string {
  // TTS에서는 프롬프트 없이 대사만 사용
  return script;
}

/**
 * 지원되는 모든 Gemini 음성 목록
 */
export const AVAILABLE_GEMINI_VOICES = [
  'Kore',    // 여성
  'Aoede',   // 여성
  'Charon',  // 남성
  'Fenrir',  // 남성
  'Puck'     // 남성
];

/*
==========================================
음성별 설정 예시 (curl 테스트용)
==========================================

youngsu → Charon + "너는 에너지 넘치는 젊은 남성이다. 활발하고 밝게 말해줘 : [대사]"
changhee → Fenrir + "너는 차분하고 신뢰감 있는 남성이다. 안정적이고 따뜻하게 말해줘 : [대사]"
jimin → Kore + "너는 밝고 발랄한 여성이다. 상큼하고 활기차게 말해줘 : [대사]"
sujin → Aoede + "너는 친근하고 따뜻한 여성이다. 부드럽고 다정하게 말해줘 : [대사]"
minjun → Puck + "너는 학생이다. 활기차고 친근하게 말해줘 : [대사]"

테스트 curl 명령어:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "contents": [{
          "parts":[{
            "text": "너는 에너지 넘치는 젊은 남성이다. 활발하고 밝게 말해줘 : 안녕하세요!"
          }]
        }],
        "generationConfig": {
          "responseModalities": ["AUDIO"],
          "speechConfig": {
            "voiceConfig": {
              "prebuiltVoiceConfig": {
                "voiceName": "Charon"
              }
            }
          }
        }
    }' | jq -r '.candidates[0].content.parts[0].inlineData.data' | base64 --decode >out.pcm
ffmpeg -f s16le -ar 24000 -ac 1 -i out.pcm out.wav

*/