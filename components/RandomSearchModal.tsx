import React, { useState } from 'react';
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

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

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
      const response = await fetch('/api/random-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          dateRange,
          selectedCountries,
          language
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '검색 중 오류가 발생했습니다.');
      }

      setShorts(data.shorts || []);
      
      if (data.errors && data.errors.length > 0) {
        setError(`일부 지역에서 검색 실패: ${data.errors.join(', ')}`);
        onResults(data.shorts || [], false, `일부 지역에서 검색 실패: ${data.errors.join(', ')}`);
      } else if (!data.shorts || data.shorts.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드를 시도해보세요.');
        onResults([], false, '검색 결과가 없습니다. 다른 키워드를 시도해보세요.');
      } else {
        onResults(data.shorts, false, null);
      }

    } catch (err: any) {
      console.error('Random search error:', err);
      setError(err.message || '검색 중 오류가 발생했습니다.');
      onResults([], false, err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
          <p style={{ margin: '0', padding: '0', color: '#6b7280' }}>{t('luckySearchLoading')}</p>
        </div>
      )}
      
    </div>
  );
};

export default RandomSearchModal;