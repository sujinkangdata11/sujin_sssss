import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { YouTubeShort, SortOption, Language } from '../types';
import { COUNTRIES, getDateRanges, SUPPORTED_LANGUAGES } from '../constants';
import { translateKeywordForCountries } from '../services/geminiService';
import { searchYouTubeShorts, resolveChannelUrlsToIds, enhanceVideosWithSubscriberData } from '../services/youtubeService';
import { translations } from '../i18n/translations';
import CountrySelector from '../components/CountrySelector';
import ShortsCard from '../components/ShortsCard';
import ApiKeyUpload from '../components/ApiKeyUpload';

interface HomeProps {
  language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>('');
  const [youtubeApiKeys, setYoutubeApiKeys] = useState<string[]>([]);
  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(0);
  const [isApiKeyUploadOpen, setIsApiKeyUploadOpen] = useState<boolean>(false);
  const [keyFailureReasons, setKeyFailureReasons] = useState<{[key: number]: string}>({});
  const [isHandleSearchRunning, setIsHandleSearchRunning] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US']);
  const [dateRange, setDateRange] = useState<string>('7');
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('viewCount');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [favoriteChannels, setFavoriteChannels] = useState<string[]>(['']);
  const [showTxtExample, setShowTxtExample] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoVisible, setVideoVisible] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{current: number; total: number} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const exampleRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const heroTitles = [t('heroTitle'), t('heroTitleAlt'), t('heroTitleAlt2')];
  
  // Video visibility observer for lazy loading
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !videoVisible) {
            setVideoVisible(true);
            // Start loading video only when visible
            if (!videoLoaded) {
              videoElement.load();
            }
          }
        });
      },
      { 
        threshold: 0.25, // Start loading when 25% visible
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(videoElement);
    
    return () => observer.disconnect();
  }, [videoVisible, videoLoaded]);

  // Typing animation effect
  useEffect(() => {
    const currentTitle = heroTitles[currentTitleIndex];
    let timeoutId: NodeJS.Timeout;
    
    if (isTyping) {
      // Typing effect - add characters
      if (displayedText.length < currentTitle.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentTitle.slice(0, displayedText.length + 1));
        }, 50); // Typing speed (50ms per character)
      } else {
        // Finished typing, wait 5 seconds then start deleting
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 5000);
      }
    } else {
      // Deleting effect - remove characters faster
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 20); // Deleting speed (20ms per character - faster)
      } else {
        // Finished deleting, move to next title and start typing
        setCurrentTitleIndex((prev) => (prev + 1) % heroTitles.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isTyping, currentTitleIndex, heroTitles]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exampleRef.current && !exampleRef.current.contains(event.target as Node)) {
            setShowTxtExample(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-dismiss error after 1 minute
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 60000); // 60 seconds (1 minute)
      
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    if (newChannels.length === 0) {
        setFavoriteChannels(['']); // Always keep at least one input
    } else {
        setFavoriteChannels(newChannels);
    }
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
        } else {
          setFavoriteChannels(['']); // Reset if file is empty
        }
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const nonEmptyFavoriteChannels = useMemo(() => favoriteChannels.filter(c => c.trim() !== ''), [favoriteChannels]);
  
  // Get the current active API key (either single key or from array)
  const getCurrentApiKey = useCallback(() => {
    if (youtubeApiKeys.length > 0) {
      return youtubeApiKeys[currentKeyIndex] || youtubeApiKeys[0];
    }
    return youtubeApiKey;
  }, [youtubeApiKey, youtubeApiKeys, currentKeyIndex]);

  // Handle API key upload
  const handleApiKeysUpload = useCallback((keys: string[]) => {
    // Complete reset when uploading new API keys
    setYoutubeApiKeys(keys);
    setCurrentKeyIndex(0);
    setKeyFailureReasons({});
    setIsHandleSearchRunning(false);
    setError(null);
    setShorts([]);
    console.log('🔄 New API keys uploaded, complete reset performed');
  }, []);

  // Generate summary message for all failed keys
  const generateFailureSummary = useCallback((currentKeyFailureReason?: string, keyIndex?: number) => {
    const quotaFailedKeys: number[] = [];
    const invalidKeys: number[] = [];
    const disabledKeys: number[] = [];
    
    // Include current key failure if provided
    const allReasons = { ...keyFailureReasons };
    if (currentKeyFailureReason) {
      const targetIndex = keyIndex !== undefined ? keyIndex : currentKeyIndex;
      allReasons[targetIndex] = currentKeyFailureReason;
    }
    
    console.log('🔍 generateFailureSummary - keyFailureReasons:', keyFailureReasons);
    console.log('🔍 generateFailureSummary - allReasons:', allReasons);
    
    // Filter out failure reasons for non-existent keys (from previous uploads)
    const validReasons: {[key: number]: string} = {};
    Object.entries(allReasons).forEach(([index, reason]) => {
      const keyIndex = parseInt(index);
      if (keyIndex < youtubeApiKeys.length && typeof reason === 'string') {
        validReasons[keyIndex] = reason;
      }
    });
    
    // Determine the actual current key index (use provided keyIndex if available)
    const actualCurrentIndex = keyIndex !== undefined ? keyIndex : currentKeyIndex;
    
    // If we're at the last key and there are no previous failure records,
    // assume all previous keys failed due to quota exceeded
    if (actualCurrentIndex === youtubeApiKeys.length - 1 && Object.keys(validReasons).length <= 1) {
      console.log(`🔍 Inferring previous key failures based on actual current index: ${actualCurrentIndex}`);
      // All keys (including current) must have failed with quota exceeded
      for (let i = 0; i <= actualCurrentIndex; i++) {
        if (!validReasons[i]) {
          validReasons[i] = 'quota';
          console.log(`🔍 Inferred key ${i}: quota exceeded`);
        }
      }
    }
    
    // Use filtered valid reasons instead of allReasons
    const finalReasons = validReasons;
    
    Object.entries(finalReasons).forEach(([index, reason]) => {
      const keyIndex = parseInt(index);
      if (reason === 'quota') {
        quotaFailedKeys.push(keyIndex);
      } else if (reason === 'invalid') {
        invalidKeys.push(keyIndex);
      } else if (reason === 'disabled') {
        disabledKeys.push(keyIndex);
      }
    });
    
    console.log('🔍 Final processed reasons:', finalReasons);
    console.log('🔍 Quota failed keys:', quotaFailedKeys);
    console.log('🔍 Invalid keys:', invalidKeys);
    console.log('🔍 Disabled keys:', disabledKeys);
    
    let summary = "";
    
    if (quotaFailedKeys.length > 0) {
      summary += t('errorMultipleKeysQuotaExceeded').replace('{keys}', quotaFailedKeys.map(i => i + 1).join(', ')) + '\n';
    }
    if (invalidKeys.length > 0) {
      summary += t('errorKeyInvalid').replace('{key}', invalidKeys.map(i => i + 1).join(', ')) + '\n';
    }
    if (disabledKeys.length > 0) {
      summary += t('errorKeyDisabled').replace('{key}', disabledKeys.map(i => i + 1).join(', ')) + '\n';
    }
    
    // The retry message is already included in errorMultipleKeysQuotaExceeded
    
    return summary;
  }, [keyFailureReasons, currentKeyIndex, youtubeApiKeys]);

  // Record API key failure but don't switch immediately - continue to end
  const recordKeyFailure = useCallback((failureReason: string, failedKeyIndex?: number) => {
    const actualFailedIndex = failedKeyIndex !== undefined ? failedKeyIndex : currentKeyIndex;
    console.log(`📝 Recording API key failure: Index ${actualFailedIndex} failed (${failureReason})`);
    
    // Record failure reason for the actual failed key
    const newFailureReasons = {
      ...keyFailureReasons,
      [actualFailedIndex]: failureReason
    };
    console.log('🔍 Saving failure reasons:', newFailureReasons);
    setKeyFailureReasons(newFailureReasons);
    
    return newFailureReasons;
  }, [currentKeyIndex, youtubeApiKeys, keyFailureReasons]);

  // Switch to next API key - simple sequential progression, no cycling back
  const switchToNextApiKey = useCallback((failureReason: string, failedKeyIndex?: number) => {
    const actualFailedIndex = failedKeyIndex !== undefined ? failedKeyIndex : currentKeyIndex;
    console.log(`🔄 Switching API key: Index ${actualFailedIndex} failed (${failureReason})`);
    
    // Record failure reason for the actual failed key
    recordKeyFailure(failureReason, actualFailedIndex);
    
    // Simply move to next key sequentially: 1→2→3→end
    const nextIndex = actualFailedIndex + 1;
    if (nextIndex < youtubeApiKeys.length) {
      console.log(`✅ Switching to key index ${nextIndex} (${youtubeApiKeys[nextIndex]?.substring(0, 8)}****)`);
      setCurrentKeyIndex(nextIndex);
      return nextIndex;
    }
    
    console.log(`❌ No more keys available. Total keys: ${youtubeApiKeys.length}`);
    // No more keys available
    return false;
  }, [currentKeyIndex, youtubeApiKeys, recordKeyFailure]);

  
  const handleSearch = useCallback(async (forceKeyIndex?: number) => {
    // Prevent multiple simultaneous executions
    if (isHandleSearchRunning) {
      console.log('handleSearch already running, skipping...');
      return;
    }
    setIsHandleSearchRunning(true);
    
    // Use forced key index if provided and is a valid number, otherwise use current
    const keyIndex = (typeof forceKeyIndex === 'number') ? forceKeyIndex : currentKeyIndex;
    const currentApiKey = youtubeApiKeys.length > 0 ? youtubeApiKeys[keyIndex] || youtubeApiKeys[0] : youtubeApiKey;
    console.log(`🔑 Using API key index ${keyIndex}: ${currentApiKey?.substring(0, 8)}****`);
    
    if (!currentApiKey) {
      setError(t('errorYoutubeKey'));
      setIsHandleSearchRunning(false);
      return;
    }

    const hasFavoriteChannels = nonEmptyFavoriteChannels.length > 0;

    if (!hasFavoriteChannels) {
        if (!geminiApiKey) {
            setError(t('errorGeminiKey'));
            setIsHandleSearchRunning(false);
            return;
        }
        if (!keyword) {
            setError(t('errorKeyword'));
            setIsHandleSearchRunning(false);
            return;
        }
        if (selectedCountries.length === 0) {
            setError(t('errorCountry'));
            setIsHandleSearchRunning(false);
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setShorts([]);
    
    // Reset failure tracking only for truly new search (not forced key index)
    if (forceKeyIndex === undefined) {
      // Clear failure data for new search
      setKeyFailureReasons({});
      console.log('🔄 Starting new search, cleared all failure data');
    } else {
      console.log(`🔄 Retrying with forced key index ${forceKeyIndex}, keeping previous failure data`);
    }

    const publishedAfterDate = new Date();
    publishedAfterDate.setDate(publishedAfterDate.getDate() - parseInt(dateRange, 10));
    const publishedAfter = publishedAfterDate.toISOString();

    try {
        let allShorts: YouTubeShort[] = [];
        let searchError: string | null = null;
        
        if (hasFavoriteChannels) {
            // Logic for favorite channels search
            const channelIds = await resolveChannelUrlsToIds(currentApiKey, nonEmptyFavoriteChannels);
            if(channelIds.length === 0) {
                setError(t('errorChannelNotFound'));
                setIsLoading(false);
                setIsHandleSearchRunning(false);
                return;
            }

            const promises = channelIds.map(id => searchYouTubeShorts(currentApiKey, keyword, { channelId: id, publishedAfter }));
            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    allShorts.push(...result.value);
                } else {
                    console.error(`Error searching in a favorite channel:`, result.reason);
                    const reasonString = result.reason instanceof Error ? result.reason.message : String(result.reason);
                    
                    if (reasonString.toLowerCase().includes('quota')) {
                        // Handle single key mode vs multi-key mode differently
                        if (youtubeApiKeys.length === 0) {
                            // Single key mode - throw error to be handled by main catch block
                            throw result.reason;
                        }
                        
                        // Multi-key mode - record quota failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('quota', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Quota exceeded for key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} quota exceeded, recording failure and will show summary`);
                          recordKeyFailure('quota', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    } else if (reasonString.toLowerCase().includes('api key not valid') || reasonString.toLowerCase().includes('invalid api key')) {
                        // Record invalid key failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('invalid', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Invalid key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} invalid, recording failure and will show summary`);
                          recordKeyFailure('invalid', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
                        // Record disabled key failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('disabled', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Disabled key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} disabled, recording failure and will show summary`);
                          recordKeyFailure('disabled', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    } else if (!searchError) {
                        searchError = `${t('errorDuringSearch')}: ${reasonString}. ${t('someResultsMissing')}`;
                    }
                }
            }
        } else {
            // Original logic for country-based search
            const targetCountries = COUNTRIES.filter(c => selectedCountries.includes(c.code));
            let translatedKeywords;
            
            try {
                translatedKeywords = await translateKeywordForCountries(keyword, targetCountries, geminiApiKey);
            } catch (geminiError: any) {
                const geminiErrorString = geminiError instanceof Error ? geminiError.message : String(geminiError);
                
                if (geminiErrorString.toLowerCase().includes('quota') || geminiErrorString.toLowerCase().includes('resource_exhausted')) {
                    setError(t('errorGeminiQuotaExceeded'));
                } else if (geminiErrorString.toLowerCase().includes('api key not valid') || geminiErrorString.toLowerCase().includes('invalid')) {
                    setError(t('errorGeminiInvalidKey'));
                } else {
                    setError(`Gemini API 오류: ${geminiErrorString}`);
                }
                setIsLoading(false);
                setIsHandleSearchRunning(false);
                return;
            }
            const promises = targetCountries.map(country => {
                const query = translatedKeywords[country.code] || keyword;
                return searchYouTubeShorts(currentApiKey, query, { regionCode: country.code, publishedAfter });
            });
            
            const results = await Promise.allSettled(promises);

            for (const [index, result] of results.entries()) {
                if (result.status === 'fulfilled') {
                    allShorts.push(...result.value);
                } else {
                    const reasonString = result.reason instanceof Error ? result.reason.message : String(result.reason);
                    console.error(`Error searching in ${targetCountries[index].name}:`, result.reason);

                    if (reasonString.toLowerCase().includes('quota')) {
                        // Handle single key mode vs multi-key mode differently
                        if (youtubeApiKeys.length === 0) {
                            // Single key mode - throw error to be handled by main catch block
                            throw result.reason;
                        }
                        
                        // Multi-key mode - record quota failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('quota', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Quota exceeded for key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} quota exceeded, recording failure and will show summary`);
                          recordKeyFailure('quota', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    } else if (reasonString.toLowerCase().includes('api key not valid') || reasonString.toLowerCase().includes('invalid api key')) {
                        // Record invalid key failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('invalid', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Invalid key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} invalid, recording failure and will show summary`);
                          recordKeyFailure('invalid', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
                        // Record disabled key failure but continue to next key
                        const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
                        recordKeyFailure('disabled', actualKeyIndex);
                        
                        // Try next key if available
                        const nextIndex = actualKeyIndex + 1;
                        if (nextIndex < youtubeApiKeys.length) {
                          console.log(`🔄 Disabled key ${actualKeyIndex}, trying next key ${nextIndex}`);
                          setCurrentKeyIndex(nextIndex);
                          setIsHandleSearchRunning(false);
                          setTimeout(() => handleSearch(nextIndex), 0);
                          return;
                        } else {
                          // This was the last key - record failure and show summary at the end
                          console.log(`🔄 Last key ${actualKeyIndex} disabled, recording failure and will show summary`);
                          recordKeyFailure('disabled', actualKeyIndex);
                          searchError = 'FINAL_SUMMARY'; // Special marker for final summary
                          break;
                        }
                    }
                    if (!searchError) {
                        searchError = `${t('errorDuringSearch')}: ${reasonString}. ${t('someResultsMissing')}`;
                    }
                }
            }
        }
        
        // Handle final summary display after all keys have been tried
        if (searchError === 'FINAL_SUMMARY') {
          // The last key failure has already been recorded above
          // Generate summary including all keys (0 to actualKeyIndex)
          const actualKeyIndex = forceKeyIndex !== undefined ? forceKeyIndex : currentKeyIndex;
          const finalSummary = generateFailureSummary('', actualKeyIndex);
          setError(finalSummary);
        } else if (searchError) {
          setError(searchError);
        }
        
        const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
        
        // Enhance videos with subscriber data
        const enhancementResult = await enhanceVideosWithSubscriberData(
          currentApiKey, 
          uniqueShorts, 
          (current, total) => setBatchProgress({ current, total })
        );
        setBatchProgress(null); // Clear progress when done
        setShorts(enhancementResult.videos);
        
        // Show warning if subscriber data couldn't be fetched
        if (enhancementResult.hasSubscriberDataError && enhancementResult.videos.length > 0) {
          setError((prevError) => {
            const newWarning = t('errorSubscriberDataFailed');
            return prevError ? `${prevError}\n\n${newWarning}` : newWarning;
          });
        }
        
    } catch (e: any) {
        const reasonString = e instanceof Error ? e.message : String(e);
        if (reasonString.toLowerCase().includes('quota')) {
           setError(youtubeApiKeys.length > 0 ? t('errorAllKeysQuotaExceeded') : t('errorQuotaExceeded'));
        } else if (reasonString.toLowerCase().includes('api key not found') || reasonString.toLowerCase().includes('pass a valid api key')) {
           setError(t('errorApiKeyInvalid'));
        } else if (reasonString.toLowerCase().includes('api key not valid') || reasonString.toLowerCase().includes('invalid api key')) {
           const keyNumber = currentKeyIndex + 1;
           const keyPreview = youtubeApiKeys.length > 0 ? youtubeApiKeys[currentKeyIndex]?.substring(0, 8) + '****' : 'Unknown';
           setError(`적용된 ${keyNumber}번째 "${keyPreview}" API 키가 잘못되었습니다. 확인해주세요.`);
        } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
           setError(t('errorApiDisabled'));
        } else {
           setError(e.message || 'An unexpected error occurred.');
        }
    } finally {
        setIsLoading(false);
        setIsHandleSearchRunning(false);
    }
  }, [getCurrentApiKey, geminiApiKey, keyword, selectedCountries, dateRange, language, nonEmptyFavoriteChannels, currentKeyIndex, youtubeApiKeys, youtubeApiKey, keyFailureReasons, t, recordKeyFailure, generateFailureSummary]);

  const sortedShorts = useMemo(() => {
    return [...shorts].sort((a, b) => {
      if (sortBy === 'viewCount') {
        return b.viewCount - a.viewCount;
      } else if (sortBy === 'viewsPerSubscriber') {
        // Sort by views per subscriber (higher percentage first)
        const aRatio = a.viewsPerSubscriber || 0;
        const bRatio = b.viewsPerSubscriber || 0;
        return bRatio - aRatio;
      } else if (sortBy === 'videoCount') {
        // Sort by video count (fewer videos first - better quality)
        const aCount = a.videoCount || Number.MAX_SAFE_INTEGER;
        const bCount = b.videoCount || Number.MAX_SAFE_INTEGER;
        return aCount - bCount;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [shorts, sortBy]);

  return (
    <>
      <div className="hero-section">
        <div className="hero-content">
          <img src="/vidhunt_logo.svg" alt="VidHunt Logo" className="hero-logo" />
          <h2 className="hero-title typing-title" lang={language} style={{whiteSpace: 'pre-line'}}>
            {displayedText}
            <span className="typing-cursor">|</span>
          </h2>
          <p className="hero-subtitle" lang={language} style={{whiteSpace: 'pre-line'}}>
            {t('heroSubtitle')}
          </p>
          <div className="hero-buttons">
            <button 
              onClick={() => {
                const searchSection = document.querySelector('.main-container');
                searchSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hero-quick-start-button"
            >
              {t('quickStartButton')}
              <svg className="hero-quick-start-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <Link to="/news/article/8" className="hero-guide-button">
              {t('viewGuideButton')}
              <svg className="hero-guide-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="hero-video">
          <video 
            ref={videoRef}
            autoPlay={videoVisible}
            loop 
            muted 
            playsInline
            preload="none"
            className="hero-video-player"
            poster="/mainvideo-poster.jpg"
            onLoadStart={() => {
              console.log('Video loading started');
            }}
            onCanPlay={() => {
              console.log('Video ready to play');
              setVideoLoaded(true);
            }}
            onLoadedData={() => {
              // Video fully loaded, can play smoothly
              setVideoLoaded(true);
            }}
            style={{
              opacity: videoLoaded ? 1 : 0.8,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {videoVisible && <source src="/mainvideo.mp4" type="video/mp4" />}
            {!videoVisible && (
              <div className="video-placeholder" style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                Loading video...
              </div>
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      
      <main className="main-container">
        <div className="form-section-header">
          <h2 className="form-section-title" lang={language} style={{whiteSpace: 'pre-line'}}>{t('formSectionTitle')}</h2>
        </div>
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group-span-2">
              <label htmlFor="youtubeApiKey" className="form-label">
                <div className="label-with-badge">
                  <span className="youtube-api-label">
                    <span className="youtube-part">YouTube </span>
                    <span className="data-api-part">
                      Data API Key
                      <Link to="/news/article/2" className="free-badge inline-badge">
                        {t('getFreeKey')}
                        <svg className="free-badge-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </span>
                  </span>
                </div>
              </label>
              <input 
                id="youtubeApiKey" 
                type="password" 
                value={youtubeApiKey} 
                onChange={(e) => setYoutubeApiKey(e.target.value)} 
                placeholder={t('youtubeApiKeyPlaceholder')} 
                className={`form-input ${youtubeApiKeys.length > 0 ? 'opacity-disabled' : ''}`}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <button 
                  className="api-key-upload-btn"
                  onClick={() => setIsApiKeyUploadOpen(true)}
                >
                  📁 {t('uploadTxtButton')}
                </button>
                
                {youtubeApiKeys.length > 0 && (
                  <span style={{ fontSize: '16px', color: '#166534', transform: 'translateY(3px)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {t('apiKeyCount')} {youtubeApiKeys.length}{t('apiKeyCountSuffix')}
                    <button 
                      onClick={() => {
                        setYoutubeApiKeys([]);
                        setCurrentKeyIndex(0);
                        setKeyFailureReasons({});
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove API keys"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              
              <p className="form-notice-success">
                {youtubeApiKeys.length > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="19" height="19" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span 
                  data-api-key-status={youtubeApiKeys.length > 0 ? "true" : undefined}
                  data-text={youtubeApiKeys.length > 0 ? 
                    `${t('apiKeyApplied')} | ${t('apiKeyInUse')}${t('apiKeyInUse') ? ' ' : ''}${currentKeyIndex + 1}${t('apiKeyInUseSuffix') ? ' ' : ''}${t('apiKeyInUseSuffix')}`
                    : t('youtubeApiNotice')}
                >
                  {youtubeApiKeys.length > 0 ? 
                    `${t('apiKeyApplied')} | ${t('apiKeyInUse')}${t('apiKeyInUse') ? ' ' : ''}${currentKeyIndex + 1}${t('apiKeyInUseSuffix') ? ' ' : ''}${t('apiKeyInUseSuffix')}`
                    : t('youtubeApiNotice')}
                </span>
              </p>
            </div>
            <div className="form-group-span-2">
              <label htmlFor="geminiApiKey" className="form-label">
                <div className="label-with-badge">
                  <span>{t('geminiApiKeyLabel')}</span>
                  <Link to="/news/article/3" className="free-badge">
                    {t('getFreeKey')}
                    <svg className="free-badge-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </label>
              <input id="geminiApiKey" type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} placeholder={t('geminiApiKeyPlaceholder')} className="form-input" />
               <p className="form-notice-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t('geminiApiNotice')}
              </p>
            </div>
            <div>
              <label htmlFor="dateRange" className="form-label">
                {t('dateRangeLabel')}
              </label>
              <select id="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-input">
                {getDateRanges(language).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="form-group-span-2">
              <label htmlFor="keyword" className="form-label">{t('keywordLabel')}</label>
              <input id="keyword" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t('keywordPlaceholder')} className="form-input" />
            </div>
            <div className={`form-group-span-2 ${nonEmptyFavoriteChannels.length > 0 ? 'opacity-disabled' : ''}`}>
              <label htmlFor="countries" className="form-label">{t('countriesLabel')}</label>
              <CountrySelector selectedCountries={selectedCountries} onChange={setSelectedCountries} language={language} />
            </div>
            <div className="form-group-span-1 form-group-self-end search-button-container">
               <button onClick={() => handleSearch()} disabled={isLoading} className="btn-primary">
                {isLoading ? <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : t('searchButton')}
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

                      <div ref={exampleRef} className="file-upload-container">
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
          <div className="error-message">
            <p style={{whiteSpace: 'pre-line'}}>{error}</p>
            <Link to="/news/article/5" className="free-badge" style={{marginTop: '12px'}}>
              {t('getNewKey')}
              <svg className="free-badge-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="loading-text">
              {batchProgress ? (
                `${t('loadingMessage')} (${batchProgress.current}/${batchProgress.total} ${t('batchProgress')})`
              ) : (
                t('loadingMessage')
              )}
            </p>
          </div>
        ) : sortedShorts.length > 0 ? (
          <>
            <div className="results-header">
                <p className="results-count">
                    {t('foundMessage') && <span className="mr-1">{t('foundMessage')}</span>}
                    <span className="results-count-number">{sortedShorts.length}</span>
                    <span className="ml-1">{t('uniqueShortsMessage')}</span>
                </p>
              <div className="sort-toggle-group">
                <button onClick={() => setSortBy('viewCount')} className={`sort-toggle-btn ${sortBy === 'viewCount' ? 'active' : 'inactive'}`}>{t('sortMostViews')}</button>
                <button onClick={() => setSortBy('date')} className={`sort-toggle-btn ${sortBy === 'date' ? 'active' : 'inactive'}`}>{t('sortNewest')}</button>
                <button onClick={() => setSortBy('viewsPerSubscriber')} className={`sort-toggle-btn ${sortBy === 'viewsPerSubscriber' ? 'active' : 'inactive'}`}>{t('sortViewsPerSubscriber')}</button>
                <button onClick={() => setSortBy('videoCount')} className={`sort-toggle-btn ${sortBy === 'videoCount' ? 'active' : 'inactive'}`}>{t('sortFewestVideos')}</button>
              </div>
            </div>
            <div className="results-grid">
              {sortedShorts.map(short => <ShortsCard key={short.id} short={short} language={language} />)}
            </div>
          </>
        ) : (
          !error && !isLoading && <div className="no-results">
            <p className="no-results-text" lang={language} style={{whiteSpace: 'pre-line'}}>{t('heroSubtitle')}</p>
          </div>
        )}
      </main>

      {/* API Key Upload Modal */}
      <ApiKeyUpload
        language={language}
        isOpen={isApiKeyUploadOpen}
        onClose={() => setIsApiKeyUploadOpen(false)}
        onUpload={handleApiKeysUpload}
      />

    </>
  );
};

export default Home;