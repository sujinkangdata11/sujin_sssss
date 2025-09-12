/**
 * 오디오 처리 유틸리티 함수들
 * PCM to WAV 변환, 오디오 재생 등
 */

/**
 * PCM 데이터를 WAV 파일 형식으로 변환
 * Gemini TTS는 24000Hz, 16bit, mono PCM 데이터를 반환
 */
export function createWAVFile(
  pcmData: Uint8Array, 
  sampleRate: number = 24000, 
  channels: number = 1, 
  bitsPerSample: number = 16
): ArrayBuffer {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  // WAV 파일 헤더 + 데이터를 위한 버퍼 생성
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // 문자열을 바이트로 변환하는 헬퍼 함수
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // WAV 파일 헤더 작성
  writeString(0, 'RIFF');                    // ChunkID
  view.setUint32(4, chunkSize, true);        // ChunkSize
  writeString(8, 'WAVE');                    // Format
  writeString(12, 'fmt ');                   // Subchunk1ID
  view.setUint32(16, 16, true);              // Subchunk1Size (PCM = 16)
  view.setUint16(20, 1, true);               // AudioFormat (PCM = 1)
  view.setUint16(22, channels, true);        // NumChannels
  view.setUint32(24, sampleRate, true);      // SampleRate
  view.setUint32(28, byteRate, true);        // ByteRate
  view.setUint16(32, blockAlign, true);      // BlockAlign
  view.setUint16(34, bitsPerSample, true);   // BitsPerSample
  writeString(36, 'data');                   // Subchunk2ID
  view.setUint32(40, dataSize, true);        // Subchunk2Size

  // PCM 데이터 추가
  const uint8Array = new Uint8Array(buffer, 44);
  uint8Array.set(pcmData);

  return buffer;
}

/**
 * 오디오 버퍼를 브라우저에서 재생
 */
export function playAudioBuffer(wavBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Blob 생성 및 URL 생성
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Audio 객체 생성 및 재생
      const audio = new Audio(audioUrl);
      
      // 이벤트 리스너 등록
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // 메모리 정리
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl); // 메모리 정리
        reject(new Error('오디오 재생 실패'));
      };
      
      // 재생 시작
      audio.play().catch(reject);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 오디오 파일 다운로드
 */
export function downloadAudioFile(wavBuffer: ArrayBuffer, filename: string = 'generated-voice.wav'): void {
  const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(audioBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}