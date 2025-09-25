/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {FunctionDeclaration, GoogleGenAI} from '@google/genai';

const systemInstruction = `When given a video and a query, call the relevant \
function only once with the appropriate timecodes and text for the video`;

async function generateContent(
  text: string,
  functionDeclarations: FunctionDeclaration[],
  youtubeUrl: string,
  apiKey: string,
  modelName: string = 'models/gemini-2.5-flash',
  maxRetries: number = 3,
) {
  // API 키 정리 및 검증
  const cleanApiKey = apiKey.trim().replace(/[^\x00-\x7F]/g, ""); // ASCII 문자만 유지
  console.log('API 호출 시작:', cleanApiKey ? 'API 키 있음' : 'API 키 없음');
  
  if (!cleanApiKey) {
    throw new Error('API 키가 올바르지 않습니다. 영문과 숫자만 포함된 올바른 API 키를 입력해주세요.');
  }
  
  const ai = new GoogleGenAI({apiKey: cleanApiKey});
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const parts = youtubeUrl
        ? [
            {
              fileData: {
                fileUri: youtubeUrl,
              },
            },
            {
              text,
            },
          ]
        : [
            {
              text,
            },
          ];

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{
          parts,
        }],
        config: {
          systemInstruction,
          temperature: 0.5,
          tools: functionDeclarations.length > 0 ? [{functionDeclarations}] : undefined,
        },
      });
      
      console.log(`API 응답 받음 (시도 ${attempt}/${maxRetries}):`, response);
      return response;
    } catch (error: any) {
      console.error(`API 호출 에러 (시도 ${attempt}/${maxRetries}):`, error);
      
      // 503 (서버 과부하) 또는 429 (Too Many Requests) 에러인 경우에만 재시도
      if (attempt < maxRetries && (error?.status === 503 || error?.status === 429 || 
          error?.message?.includes('overloaded') || error?.message?.includes('UNAVAILABLE'))) {
        const waitTime = Math.pow(2, attempt) * 1000; // 지수백오프: 2초, 4초, 8초
        console.log(`${waitTime/1000}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // 특별한 에러 메시지 처리
      if (error?.message?.includes('overloaded') || error?.status === 503) {
        throw new Error('🤖 Gemini AI 서버가 현재 과부하 상태입니다.\n잠시 후 다시 시도해주세요. (보통 1-2분 후 정상화됩니다)');
      }
      
      if (error?.status === 429) {
        throw new Error('🚫 API 호출 한도를 초과했습니다.\n잠시 후 다시 시도해주세요.');
      }
      
      // 다른 모든 에러는 그대로 throw
      throw error;
    }
  }
}

export {generateContent};
