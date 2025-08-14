
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
    // Try to provide a more specific error message if available
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to translate keywords. Please check the Gemini API key and configuration. Details: ${errorMessage}`);
  }
};
