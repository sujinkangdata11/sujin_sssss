import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { YouTubeShort, SortOption, Language } from '../types';
import { COUNTRIES, getDateRanges, SUPPORTED_LANGUAGES } from '../constants';
import { translateKeywordForCountries } from '../services/geminiService';
import { searchYouTubeShorts, resolveChannelUrlsToIds, enhanceVideosWithSubscriberData } from '../services/youtubeService';
import { translations } from '../i18n/translations';
import CountrySelector from '../components/CountrySelector';
import ShortsCard from '../components/ShortsCard';

interface HomeProps {
  language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>('');
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
  
  const handleSearch = useCallback(async () => {
    if (!youtubeApiKey) {
      setError(t('errorYoutubeKey'));
      return;
    }

    const hasFavoriteChannels = nonEmptyFavoriteChannels.length > 0;

    if (!hasFavoriteChannels) {
        if (!geminiApiKey) {
            setError(t('errorGeminiKey'));
            return;
        }
        if (!keyword) {
            setError(t('errorKeyword'));
            return;
        }
        if (selectedCountries.length === 0) {
            setError(t('errorCountry'));
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setShorts([]);

    const publishedAfterDate = new Date();
    publishedAfterDate.setDate(publishedAfterDate.getDate() - parseInt(dateRange, 10));
    const publishedAfter = publishedAfterDate.toISOString();

    try {
        let allShorts: YouTubeShort[] = [];
        let searchError: string | null = null;
        
        if (hasFavoriteChannels) {
            // Logic for favorite channels search
            const channelIds = await resolveChannelUrlsToIds(youtubeApiKey, nonEmptyFavoriteChannels);
            if(channelIds.length === 0) {
                setError(t('errorChannelNotFound'));
                setIsLoading(false);
                return;
            }

            const promises = channelIds.map(id => searchYouTubeShorts(youtubeApiKey, keyword, { channelId: id, publishedAfter }));
            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    allShorts.push(...result.value);
                } else {
                    console.error(`Error searching in a favorite channel:`, result.reason);
                     const reasonString = result.reason instanceof Error ? result.reason.message : String(result.reason);
                     if (reasonString.toLowerCase().includes('quota')) {
                        searchError = t('errorQuotaExceeded');
                        break;
                     } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
                        searchError = t('errorApiDisabled');
                        break;
                     } else if (!searchError) {
                        searchError = `${t('errorDuringSearch')}: ${reasonString}. ${t('someResultsMissing')}`;
                     }
                }
            }
        } else {
            // Original logic for country-based search
            const targetCountries = COUNTRIES.filter(c => selectedCountries.includes(c.code));
            const translatedKeywords = await translateKeywordForCountries(keyword, targetCountries, geminiApiKey);
            const promises = targetCountries.map(country => {
                const query = translatedKeywords[country.code] || keyword;
                return searchYouTubeShorts(youtubeApiKey, query, { regionCode: country.code, publishedAfter });
            });
            
            const results = await Promise.allSettled(promises);

            for (const [index, result] of results.entries()) {
                if (result.status === 'fulfilled') {
                    allShorts.push(...result.value);
                } else {
                    const reasonString = result.reason instanceof Error ? result.reason.message : String(result.reason);
                    console.error(`Error searching in ${targetCountries[index].name}:`, result.reason);

                    if (reasonString.toLowerCase().includes('quota')) {
                        searchError = t('errorQuotaExceeded');
                        break; 
                    } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
                        searchError = t('errorApiDisabled');
                        break;
                    }
                    if (!searchError) {
                        searchError = `${t('errorDuringSearch')}: ${reasonString}. ${t('someResultsMissing')}`;
                    }
                }
            }
        }
        
        if (searchError) setError(searchError);
        const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
        
        // Enhance videos with subscriber data
        const enhancedShorts = await enhanceVideosWithSubscriberData(youtubeApiKey, uniqueShorts);
        setShorts(enhancedShorts);
        
    } catch (e: any) {
        const reasonString = e instanceof Error ? e.message : String(e);
        if (reasonString.toLowerCase().includes('quota')) {
           setError(t('errorQuotaExceeded'));
        } else if (reasonString.toLowerCase().includes('has not been used') || reasonString.toLowerCase().includes('is disabled')) {
           setError(t('errorApiDisabled'));
        } else {
           setError(e.message || 'An unexpected error occurred.');
        }
    } finally {
        setIsLoading(false);
    }
  }, [youtubeApiKey, geminiApiKey, keyword, selectedCountries, dateRange, language, nonEmptyFavoriteChannels]);

  const sortedShorts = useMemo(() => {
    return [...shorts].sort((a, b) => {
      if (sortBy === 'viewCount') {
        return b.viewCount - a.viewCount;
      } else if (sortBy === 'viewsPerSubscriber') {
        // Sort by views per subscriber (higher percentage first)
        const aRatio = a.viewsPerSubscriber || 0;
        const bRatio = b.viewsPerSubscriber || 0;
        return bRatio - aRatio;
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
              <input id="youtubeApiKey" type="password" value={youtubeApiKey} onChange={(e) => setYoutubeApiKey(e.target.value)} placeholder={t('youtubeApiKeyPlaceholder')} className="form-input" />
              <p className="form-notice-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t('youtubeApiNotice')}
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
               <button onClick={handleSearch} disabled={isLoading} className="btn-primary">
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
            <p className="loading-text">{t('loadingMessage')}</p>
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
    </>
  );
};

export default Home;