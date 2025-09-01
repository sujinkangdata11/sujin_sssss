import React, { useState, useEffect } from 'react';
import { Language, YouTubeShort } from '../types';
import { COUNTRIES, getDateRanges } from '../constants';
import { translations } from '../i18n/translations';
import CountrySelector from './CountrySelector';
import ShortsCard from './ShortsCard';

interface RandomSearchModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onResults: (results: YouTubeShort[], isLoading: boolean, error: string | null) => void;
}

const RandomSearchModal: React.FC<RandomSearchModalProps> = ({ language, isOpen, onClose, onResults }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US']);
  const [dateRange, setDateRange] = useState<string>('7');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState<number>(0);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  // Dynamic loading message rotation
  useEffect(() => {
    if (!isLoading) return;

    const loadingMessages = t('loadingMessages') as string[];
    if (!loadingMessages || !Array.isArray(loadingMessages)) return;

    const interval = setInterval(() => {
      setCurrentLoadingMessageIndex((prevIndex) => 
        (prevIndex + 1) % loadingMessages.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, language]);

  const handleRandomSearch = async () => {
    if (!keyword.trim()) {
      setError('키워드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShorts([]);
    onResults([], true, null);
    
    try {
      // api.txt 파일에서 API 키들을 읽어오기
      const apiKeysResponse = await fetch('/api.txt');
      if (!apiKeysResponse.ok) {
        throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      }
      
      const apiKeysText = await apiKeysResponse.text();
      const lines = apiKeysText.split('\n').filter(line => line.trim());
      
      let youtubeApiKeys: string[] = [];
      let geminiApiKeys: string[] = [];
      
      // API 키 복호화 함수 (앞 1자리를 뒤로 이동)
      const decryptApiKey = (encryptedKey: string): string => {
        if (encryptedKey.length < 1) return encryptedKey;
        const front1 = encryptedKey.substring(0, 1);
        const rest = encryptedKey.substring(1);
        const decrypted = rest + front1;
        console.log(`🔑 Decrypting: ${encryptedKey} → ${decrypted}`);
        return decrypted;
      };

      for (const line of lines) {
        if (line.startsWith('YOUTUBE_API_KEYS=')) {
          const encryptedKeys = line.split('=')[1].split(',').map(key => key.trim().replace(/"/g, ''));
          youtubeApiKeys = encryptedKeys.map(key => decryptApiKey(key));
        } else if (line.startsWith('GEMINI_API_KEYS=')) {
          const encryptedKeys = line.split('=')[1].split(',').map(key => key.trim().replace(/"/g, ''));
          geminiApiKeys = encryptedKeys.map(key => decryptApiKey(key));
        }
      }
      
      if (youtubeApiKeys.length === 0) {
        throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      }
      
      if (geminiApiKeys.length === 0) {
        throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      }

      // Import services dynamically
      const { searchYouTubeShorts, enhanceVideosWithSubscriberData } = await import('../services/youtubeService');
      const { translateKeywordForCountries } = await import('../services/geminiService');
      
      // Get countries data
      const targetCountries = COUNTRIES.filter(c => selectedCountries.includes(c.code));
      
      // 1단계: Gemini로 키워드 번역 (키 로테이션 적용)
      let translatedKeywords;
      try {
        translatedKeywords = await translateWithGeminiRotation(
          keyword.trim(), 
          targetCountries, 
          geminiApiKeys
        );
      } catch (geminiError: any) {
        throw new Error('Gemini 번역에 실패했어요.');
      }

      // 2단계: YouTube API로 각 국가별 검색 (키 로테이션 적용)
      const allShorts = [];
      const errors = [];
      const publishedAfter = getPublishedAfter(dateRange);
      let currentYouTubeKeyIndex = 0;
      let searchError: string | null = null;

      for (const countryCode of selectedCountries) {
        const translatedKeyword = translatedKeywords[countryCode] || keyword.trim();
        let searchSuccessful = false;
        let keyTried = 0;

        // YouTube 키 로테이션으로 각 국가 검색 시도
        while (!searchSuccessful && keyTried < youtubeApiKeys.length) {
          const currentYouTubeKey = youtubeApiKeys[(currentYouTubeKeyIndex + keyTried) % youtubeApiKeys.length];
          
          try {
            console.log(`🔍 Searching ${countryCode} with YouTube key ${(currentYouTubeKeyIndex + keyTried) % youtubeApiKeys.length}: ${currentYouTubeKey?.substring(0, 8)}****`);
            
            const searchResults = await searchYouTubeShorts(currentYouTubeKey, translatedKeyword, {
              regionCode: countryCode,
              publishedAfter
            });
            
            allShorts.push(...searchResults);
            searchSuccessful = true;
            console.log(`✅ Successfully searched ${countryCode} with ${searchResults.length} results`);
            
          } catch (error: any) {
            const errorString = error instanceof Error ? error.message : String(error);
            console.error(`❌ YouTube search failed for ${countryCode} with key ${(currentYouTubeKeyIndex + keyTried) % youtubeApiKeys.length}:`, errorString);
            
            // Always try next key until all keys are exhausted
            keyTried++;
            console.log(`🔄 Trying next YouTube key for ${countryCode}...`);
          }
        }

        if (!searchSuccessful && keyTried >= youtubeApiKeys.length) {
          console.log(`❌ All YouTube keys failed for ${countryCode}`);
          errors.push(countryCode);
        }
      }

      // Remove duplicates
      const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
      
      // Enhance videos with subscriber data using first working YouTube key
      const workingYouTubeKey = await findWorkingYouTubeKey(youtubeApiKeys);
      const { videos: enhancedVideos } = workingYouTubeKey ? 
        await enhanceVideosWithSubscriberData(workingYouTubeKey, uniqueShorts) : 
        { videos: uniqueShorts, hasSubscriberDataError: true };

      setShorts(enhancedVideos);
      
      if (errors.length > 0) {
        setError(`일부 지역에서 검색 실패: ${errors.join(', ')}`);
        onResults(enhancedVideos, false, `일부 지역에서 검색 실패: ${errors.join(', ')}`);
      } else if (enhancedVideos.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드를 시도해보세요.');
        onResults([], false, '검색 결과가 없습니다. 다른 키워드를 시도해보세요.');
      } else {
        onResults(enhancedVideos, false, null);
      }

    } catch (err: any) {
      console.error('Random search error:', err);
      setError(err.message || '검색 중 오류가 발생했습니다.');
      onResults([], false, err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find working YouTube API key
  const findWorkingYouTubeKey = async (apiKeys: string[]): Promise<string | null> => {
    for (const key of apiKeys) {
      if (await testYouTubeApiKey(key)) {
        return key;
      }
    }
    return null;
  };

  // Test if YouTube API key is working
  const testYouTubeApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=1&q=test&key=${apiKey}`;
      const response = await fetch(testUrl);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Translate with Gemini key rotation - try each key until success
  const translateWithGeminiRotation = async (
    keyword: string,
    countries: any[],
    geminiApiKeys: string[]
  ): Promise<Record<string, string>> => {
    const { translateKeywordForCountries } = await import('../services/geminiService');
    
    for (const geminiKey of geminiApiKeys) {
      try {
        console.log(`🔍 Trying Gemini key: ${geminiKey.substring(0, 10)}...`);
        const result = await translateKeywordForCountries(keyword, countries, geminiKey);
        console.log(`✅ Gemini key successful: ${geminiKey.substring(0, 10)}...`);
        return result;
      } catch (error: any) {
        const errorString = error instanceof Error ? error.message : String(error);
        console.error(`❌ Gemini key failed: ${geminiKey.substring(0, 10)}... - ${errorString}`);
        
        // Always try next key until all keys are exhausted
        console.log(`🔄 Trying next Gemini key...`);
        continue;
      }
    }
    
    // If all keys failed, throw error
    throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
  };

  // Get published after date based on range
  const getPublishedAfter = (dateRange: string): string => {
    const now = new Date();
    const days = parseInt(dateRange);
    const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return pastDate.toISOString();
  };

  if (!isOpen) return null;

  return (
    <div className="form-card">
      <div className="random-search-header">
        <h2 className="random-search-title">
          {t('luckySearchMainTitle')}
          <div className="random-search-subtitle">{t('luckySearchSubtitle')}</div>
        </h2>
      </div>
      
      <div className="random-search-form">
        <div className="random-form-grid">
          <div>
            <label htmlFor="random-dateRange" className="form-label">
              {t('dateRangeLabel')}
            </label>
            <select 
              id="random-dateRange" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)} 
              className="form-input"
            >
              {getDateRanges(language).map(option => 
                <option key={option.value} value={option.value}>{option.label}</option>
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="random-keyword" className="form-label">{t('keywordLabel')}</label>
            <input 
              id="random-keyword" 
              type="text" 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder={language === 'ko' ? "예: 'AI 도구'" : "e.g., 'AI tools'"} 
              className="form-input" 
            />
          </div>
          
          <div>
            <label htmlFor="random-countries" className="form-label">{t('countriesLabel')}</label>
            <CountrySelector 
              selectedCountries={selectedCountries} 
              onChange={setSelectedCountries} 
              language={language}
              hideSelectAll={true}
            />
          </div>
          
          <div className="random-search-button-container">
            <button 
              onClick={handleRandomSearch} 
              disabled={isLoading} 
              className="btn-primary"
            >
              {isLoading ? <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : t('luckySearchButton')}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="random-loading-container" style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ margin: '0', padding: '0', color: '#6b7280' }}>
            {(() => {
              const loadingMessages = t('loadingMessages') as string[];
              if (loadingMessages && Array.isArray(loadingMessages) && loadingMessages.length > 0) {
                return loadingMessages[currentLoadingMessageIndex];
              }
              return t('luckySearchLoading');
            })()}
          </p>
        </div>
      )}
      
    </div>
  );
};

export default RandomSearchModal;