
import { GoogleGenAI, Type } from "@google/genai";
import { Country } from '../types';

interface TranslationResult {
  language: string;
  translation: string;
}

export const translateKeywordForCountries = async (
  keyword: string,
  countries: Country[],
  apiKey: string,
): Promise<Record<string, string>> => {
  if (!apiKey) {
      throw new Error("Gemini API key is not provided.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const uniqueLanguages = [...new Set(countries.map(c => c.language))];

  const prompt = `Translate the keyword "${keyword}" into the following languages: ${uniqueLanguages.join(', ')}. Return the result as a JSON array of objects, where each object has a "language" key (the English name of the language) and a "translation" key (the translated keyword).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              translation: { type: Type.STRING }
            },
            required: ["language", "translation"]
          }
        }
      }
    });

    const translationArray = JSON.parse(response.text) as TranslationResult[];
    const languageToTranslationMap: Record<string, string> = {};
    translationArray.forEach(item => {
      languageToTranslationMap[item.language] = item.translation;
    });

    const countryToTranslationMap: Record<string, string> = {};
    countries.forEach(country => {
      countryToTranslationMap[country.code] = languageToTranslationMap[country.language] || keyword;
    });

    return countryToTranslationMap;
  } catch (error) {
    console.error("Error translating keywords with Gemini:", error);
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for API disabled/permission denied errors
    if (errorMessage.includes('PERMISSION_DENIED') || 
        errorMessage.includes('SERVICE_DISABLED') || 
        errorMessage.includes('has not been used in project') ||
        errorMessage.includes('is disabled')) {
      throw new Error('이 Gemini Key는 비활성화되었습니다');
    }
    
    // Check for invalid API key errors
    if (errorMessage.includes('API_KEY_INVALID') || 
        errorMessage.includes('Invalid API key') ||
        errorMessage.includes('403') && errorMessage.includes('Forbidden')) {
      throw new Error('Gemini API 키가 유효하지 않습니다');
    }
    
    // Check for quota exceeded errors
    if (errorMessage.includes('QUOTA_EXCEEDED') || 
        errorMessage.includes('quota') ||
        errorMessage.includes('429')) {
      throw new Error('Gemini API 할당량을 초과했습니다');
    }
    
    // Generic error message for other cases
    throw new Error(`Gemini API 오류: Failed to translate keywords. Please check the Gemini API key and configuration. Details: ${errorMessage}`);
  }
};
