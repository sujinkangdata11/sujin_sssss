import React, { useState, useEffect, useMemo } from 'react';
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [favoriteChannels, setFavoriteChannels] = useState<string[]>(['']);
  const [showTxtExample, setShowTxtExample] = useState<boolean>(false);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  const handleFavoriteChannelChange = (index: number, value: string) => {
    const newChannels = [...favoriteChannels];
    newChannels[index] = value;
    setFavoriteChannels(newChannels);
  };

  const addFavoriteChannel = () => {
    setFavoriteChannels([...favoriteChannels, '']);
  };

  const removeFavoriteChannel = (index: number) => {
    const newChannels = favoriteChannels.filter((_, i) => i !== index);
    setFavoriteChannels(newChannels.length > 0 ? newChannels : ['']);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const channels = text
          .split(/[\n,;]+/) // Split by newline, comma, or semicolon
          .map(channel => channel.trim())
          .filter(channel => channel !== ''); // Remove empty entries

        if (channels.length > 0) {
          setFavoriteChannels(channels);
          // 즐겨찾는 채널이 업로드되면 키워드 텍스트 자동 초기화
          setKeyword('');
        } else {
          setFavoriteChannels(['']); // Reset if file is empty
        }
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const nonEmptyFavoriteChannels = useMemo(() => favoriteChannels.filter(c => c.trim() !== ''), [favoriteChannels]);

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
    const hasFavoriteChannels = nonEmptyFavoriteChannels.length > 0;
    
    if (!hasFavoriteChannels && !keyword.trim()) {
      setError('키워드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShorts([]);
    onResults([], true, null);
    
    try {
      // keys.txt 파일에서 API 키들을 읽어오기 (캐시 방지를 위한 timestamp 추가)
      const timestamp = Date.now();
      const apiKeysResponse = await fetch(`/keys.txt?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
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
      const { searchYouTubeShorts, enhanceVideosWithSubscriberData, resolveChannelUrlsToIds } = await import('../services/youtubeService');
      const { translateKeywordForCountries } = await import('../services/geminiService');
      
      const hasFavoriteChannels = nonEmptyFavoriteChannels.length > 0;
      const publishedAfter = getPublishedAfter(dateRange);
      const allShorts = [];
      const errors = [];
      let searchError: string | null = null;

      if (hasFavoriteChannels) {
        // Logic for favorite channels search
        const workingYouTubeKey = await findWorkingYouTubeKey(youtubeApiKeys);
        if (!workingYouTubeKey) {
          throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
        }

        const channelIds = await resolveChannelUrlsToIds(workingYouTubeKey, nonEmptyFavoriteChannels);
        if (channelIds.length === 0) {
          throw new Error('유효한 채널을 찾을 수 없습니다.');
        }

        const searchKeyword = keyword.trim() || '';
        const promises = channelIds.map(id => searchYouTubeShorts(workingYouTubeKey, searchKeyword, { channelId: id, publishedAfter }));
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allShorts.push(...result.value);
          } else {
            console.error(`❌ Channel search failed for channel ${index}:`, result.reason);
            errors.push(`Channel ${index + 1}`);
          }
        });
      } else {
        // Logic for country-based search with Gemini translation
        if (geminiApiKeys.length === 0) {
          throw new Error('Gemini API 키가 필요합니다.');
        }

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
        let currentYouTubeKeyIndex = 0;

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
      }

      // Remove duplicates
      const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
      
      // Enhance videos with subscriber data using first working YouTube key
      const workingYouTubeKey = await findWorkingYouTubeKey(youtubeApiKeys);
      const { videos: enhancedVideos } = workingYouTubeKey ? 
        await enhanceVideosWithSubscriberData(workingYouTubeKey, uniqueShorts) : 
        { videos: uniqueShorts, hasSubscriberDataError: true };

      setShorts(enhancedVideos);
      
      if (errors.length > 0 && enhancedVideos.length === 0) {
        // 모든 지역에서 실패하고 결과가 없는 경우 - 할당량 소진 메시지
        setError('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
        onResults([], false, '아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      } else if (errors.length > 0) {
        // 일부 지역에서 실패했지만 결과는 있는 경우 - 지역 실패 메시지
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
          
          <div className={`${nonEmptyFavoriteChannels.length > 0 ? 'opacity-disabled' : ''}`}>
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
        
        <div className="mt-6">
            <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="advanced-toggle">
                <span>{t('advancedSettings')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`advanced-icon ${isAdvancedOpen ? 'rotated' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isAdvancedOpen && (
                <div className="advanced-panel">
                    <h3 className="advanced-title">{t('favoriteChannels')}</h3>
                    <p className="advanced-desc">{t('favoriteChannelsDesc')}</p>
                    <div className="space-y-3">
                        {favoriteChannels.map((channel, index) => (
                            <div key={index} className="channel-input-group">
                                <input 
                                  type="text"
                                  value={channel}
                                  onChange={(e) => handleFavoriteChannelChange(index, e.target.value)}
                                  placeholder={t('channelUrlPlaceholder')}
                                  className="channel-input"
                                />
                                <button onClick={() => removeFavoriteChannel(index)} className="channel-remove-btn">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                      <button onClick={addFavoriteChannel} className="channel-add-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>{t('addChannelButton')}</span>
                      </button>
                    </div>
                    <p className="form-notice" style={{whiteSpace: 'pre-wrap', marginTop: 'var(--spacing-2)'}}>{t('quotaWarning')}</p>
                    
                    <div className="divider-container">
                      <div className="divider-line"></div>
                      <span className="divider-text">{t('orDivider')}</span>
                      <div className="divider-line"></div>
                    </div>

                    <div className="file-upload-container">
                      <div className="file-upload-group">
                          <label className="file-upload-label">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                              <span>{t('uploadTxtButton')}</span>
                              <input type="file" accept=".txt" className="file-input-hidden" onChange={handleFileUpload} />
                          </label>
                          <button 
                              onClick={() => setShowTxtExample(prev => !prev)} 
                              className="example-btn"
                              aria-haspopup="true"
                              aria-expanded={showTxtExample}
                          >
                              {t('exampleButton')}
                          </button>
                      </div>
                      
                      {showTxtExample && (
                          <div className="example-tooltip">
                               <p className="example-tooltip-title">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                  <span>{t('txtExampleTitle')}</span>
                               </p>
                              <div className="example-tooltip-content">
                                  <pre className="example-tooltip-pre">{t('txtExampleContent')}</pre>
                              </div>
                          </div>
                      )}
                    </div>
                </div>
            )}
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