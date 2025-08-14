import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { YouTubeShort, SortOption, Language } from './types';
import { COUNTRIES, getDateRanges, SUPPORTED_LANGUAGES } from './constants';
import { translateKeywordForCountries } from './services/geminiService';
import { searchYouTubeShorts, resolveChannelUrlsToIds } from './services/youtubeService';
import { translations } from './i18n/translations';
import CountrySelector from './components/CountrySelector';
import ShortsCard from './components/ShortsCard';
import LanguageSelector from './components/LanguageSelector';

const App: React.FC = () => {
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US']);
  const [dateRange, setDateRange] = useState<string>('7');
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('viewCount');
  const [language, setLanguage] = useState<Language>('en');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [favoriteChannels, setFavoriteChannels] = useState<string[]>(['']);
  const [showTxtExample, setShowTxtExample] = useState(false);
  
  const exampleRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];
  
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
                    }
                    if (!searchError) {
                        searchError = `${t('errorDuringSearch')}: ${reasonString}. ${t('someResultsMissing')}`;
                    }
                }
            }
        }
        
        if (searchError) setError(searchError);
        const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
        setShorts(uniqueShorts);
        
    } catch (e: any) {
        const reasonString = e instanceof Error ? e.message : String(e);
        if (reasonString.toLowerCase().includes('quota')) {
           setError(t('errorQuotaExceeded'));
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
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [shorts, sortBy]);
  
  const currentLanguageName = useMemo(() => {
      return SUPPORTED_LANGUAGES.find(lang => lang.code === language)?.nativeName || 'Language';
  }, [language]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-container">
            <h1 className="header-title">
                <span className="header-title-accent">{t('headerTitle')}</span> {t('headerSubtitle')}
            </h1>
            <button onClick={() => setIsLangModalOpen(true)} className="language-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="language-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.874 6 7.5 6h5c.626 0 .988-.27 1.256-.579a6.012 6.012 0 011.912 2.706C15.988 8.27 15.626 8.5 15 8.5h-1a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h1c.626 0 .988.23 1.256.579a6.012 6.012 0 01-1.912 2.706C13.488 14.27 13.126 14 12.5 14h-5c-.626 0-.988.27-1.256.579a6.012 6.012 0 01-1.912-2.706C4.012 11.73 4.374 11.5 5 11.5h1a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H5c-.626 0-.988-.23-1.256-.579z" clipRule="evenodd" /></svg>
                <span>{currentLanguageName}</span>
            </button>
        </div>
      </header>
      
      <LanguageSelector isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} onSelect={setLanguage} currentLanguage={language} />
      
      <main className="main-container">
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group-span-2">
              <label htmlFor="youtubeApiKey" className="form-label">{t('youtubeApiKeyLabel')}</label>
              <input id="youtubeApiKey" type="password" value={youtubeApiKey} onChange={(e) => setYoutubeApiKey(e.target.value)} placeholder={t('youtubeApiKeyPlaceholder')} className="form-input" />
              <p className="form-notice">{t('youtubeApiNotice')}</p>
            </div>
            <div className="form-group-span-2">
              <label htmlFor="geminiApiKey" className="form-label">{t('geminiApiKeyLabel')}</label>
              <input id="geminiApiKey" type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} placeholder={t('geminiApiKeyPlaceholder')} className="form-input" />
               <p className="form-notice">{t('geminiApiNotice')}</p>
            </div>
            <div className="form-group-span-1 form-group-self-end">
               <button onClick={handleSearch} disabled={isLoading} className="btn-primary">
                {isLoading ? <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : t('searchButton')}
              </button>
            </div>
            <div className="form-group-span-2">
              <label htmlFor="keyword" className="form-label">{t('keywordLabel')}</label>
              <input id="keyword" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t('keywordPlaceholder')} className="form-input" />
            </div>
            <div className={`form-group-span-2 ${nonEmptyFavoriteChannels.length > 0 ? 'opacity-disabled' : ''}`}>
              <label htmlFor="countries" className="form-label">{t('countriesLabel')}</label>
              <CountrySelector selectedCountries={selectedCountries} onChange={setSelectedCountries} language={language} />
            </div>
            <div>
              <label htmlFor="dateRange" className="form-label">{t('dateRangeLabel')}</label>
              <select id="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-input">
                {getDateRanges(language).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110 2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
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
          {error && <p className="error-message">{error}</p>}
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
              </div>
            </div>
            <div className="results-grid">
              {sortedShorts.map(short => <ShortsCard key={short.id} short={short} language={language} />)}
            </div>
          </>
        ) : (
          !error && !isLoading && <div className="no-results">
            <p className="no-results-text">{t('noShortsMessage')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;