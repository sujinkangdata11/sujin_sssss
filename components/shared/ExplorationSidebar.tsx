import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DropdownOptions from '../DropdownOptions';
import { Language } from '../../types';
import { ChannelData } from '../ChannelFinder/types';
import { getChannelFinderTranslation, channelFinderI18n } from '../../i18n/channelFinderI18n';
import { formatRevenue, calculateViewsPerSubscriber, calculateSubscriptionRate, formatLocalizedNumber } from '../ChannelFinder/utils';
import { calculateExplorationMonthlyRevenue } from '../../utils/explorationRpmUtils';
import countryRpmDefaults from '../../data/countryRpmDefaults.json';
import styles from '../../styles/ChannelFinder.module.css';

interface ExplorationSidebarProps {
  selectedChannel: ChannelData;
  language: Language;
  onClose: () => void;
  formatSubscribers: (count: number) => string;
  formatOperatingPeriod: (period: number) => string;
  formatGrowth: (growth: number) => string;
  getCountryDisplayName: (language: Language, country: string) => string;
  chartData: Array<{ x: number; y: number; value: string; month: string }>;
  growthTooltips: Array<{ message: string[] }>;
  hoveredPoint: number | null;
  hoveredStat: string | null;
  setHoveredStat: (stat: string | null) => void;
  shortsPercentage: number;
  longPercentage: number;
  shortsRpm: number;
  longRpm: number;
  exchangeRate: number;
  currentCountry: string;
  dropdownState: { isOpen: boolean; type: string | null };
  openDropdown: (type: string, e: React.MouseEvent) => void;
  countryOptions: Array<{ value: string; label: string }>;
  onCountrySelect: (value: string) => void;
  adjustShortsRpm: (isIncrease: boolean) => void;
  adjustLongRpm: (isIncrease: boolean) => void;
  calculateTotalRevenue: () => string;
  calculateLocalCurrencyRevenue: () => string;
  openExchangeRateModal: () => void;
  setExchangeRate: (rate: number) => void;
  formatViews: (views: number) => string;
  formatVideosCount: (count: number) => string;
  formatUploadFrequency: (frequency: number, language?: Language) => string;
  currencyExchangeData: Record<string, { currency: string; rate: number }>;
  cf: (key: string) => string;
  setYoutubeUrlInput: (value: string) => void;
}

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h4 className={styles.subtitle}>{children}</h4>;
};

const ExplorationSidebar: React.FC<ExplorationSidebarProps> = ({
  selectedChannel,
  language,
  onClose,
  formatSubscribers,
  formatOperatingPeriod,
  formatGrowth,
  getCountryDisplayName,
  chartData,
  growthTooltips,
  hoveredPoint,
  hoveredStat,
  setHoveredStat,
  shortsPercentage,
  longPercentage,
  shortsRpm,
  longRpm,
  exchangeRate,
  currentCountry,
  dropdownState,
  openDropdown,
  countryOptions,
  onCountrySelect,
  adjustShortsRpm,
  adjustLongRpm,
  calculateTotalRevenue,
  calculateLocalCurrencyRevenue,
  openExchangeRateModal,
  setExchangeRate,
  formatViews,
  formatVideosCount,
  formatUploadFrequency,
  currencyExchangeData,
  cf,
  setYoutubeUrlInput
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 로컬 드롭다운 상태
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);


  // 드롭다운 핸들러
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalDropdownOpen(!localDropdownOpen);
  };

  const handleDropdownClose = () => {
    setLocalDropdownOpen(false);
  };

  const handleDropdownSelect = (value: string) => {
    onCountrySelect(value);
    setLocalDropdownOpen(false);
  };

  // 안전장치: 필수 props 확인
  if (!selectedChannel || !language) {
    console.error('ExplorationSidebar: Missing required props', { selectedChannel, language });
    return null;
  }

  // 모든 디바이스에서 뒷배경 클릭 시 사이드바 닫기 (애니메이션 포함)
  const handleOverlayClick = (e: React.MouseEvent) => {
    setIsClosing(true);

    // 애니메이션 완료 후 실제로 닫기
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // 💰 채널파인더와 완전 동일한 USD 기준 월 수익 계산
  const calculateMonthlyRevenue = () => {
    const dollarText = getChannelFinderTranslation(channelFinderI18n, language, 'currencies.USD') || '달러';
    if (!selectedChannel.operatingPeriod || selectedChannel.operatingPeriod <= 0) return '$0';

    // 채널파인더와 동일한 계산: 사용자가 설정한 비율과 RPM 사용
    const totalRevenueUSD = (selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm +
                           (selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm;
    const monthlyRevenueUSD = totalRevenueUSD / selectedChannel.operatingPeriod;

    const amount = Math.round(monthlyRevenueUSD);
    return formatLocalizedNumber(amount, language, dollarText);
  };

  // 🌍 다국가 환율 설정 - 모든 나라가 exchangeRate 상태값 사용
  const EXCHANGE_RATES = {
    ko: { rate: exchangeRate, symbol: '원', label: '← 이 금액을 한국 돈으로 보면' },
    ja: { rate: exchangeRate, symbol: '円', label: '← この金額を日本円で見ると' }, // 일본엔
    zh: { rate: exchangeRate, symbol: '元', label: '← 这个金额用人民币来看' },   // 중국위안
    hi: { rate: exchangeRate, symbol: '₹', label: '← यह राशि भारतीय रुपये में' },  // 인도루피
    es: { rate: exchangeRate, symbol: '€', label: '← Esta cantidad en euros' },  // 스페인유로
    fr: { rate: exchangeRate, symbol: '€', label: '← Ce montant en euros' },     // 프랑스유로
    de: { rate: exchangeRate, symbol: '€', label: '← Dieser Betrag in Euro' },   // 독일유로
    nl: { rate: exchangeRate, symbol: '€', label: '← Dit bedrag in euro' },      // 네덜란드유로
    pt: { rate: exchangeRate, symbol: 'R$', label: '← Este valor em reais' },     // 브라질헤알
    ru: { rate: exchangeRate, symbol: '₽', label: '← Эта сумма в рублях' }         // 러시아루블
  };

  // 🇰🇷 채널파인더와 완전 동일한 한국 원화 월 수익 계산
  const calculateMonthlyRevenueKRW = () => {
    if (!selectedChannel.operatingPeriod || selectedChannel.operatingPeriod <= 0) return '0원';

    // 채널파인더와 동일한 USD 계산: 사용자가 설정한 비율과 RPM 사용
    const totalRevenueUSD = (selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm +
                           (selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm;
    const monthlyRevenueUSD = totalRevenueUSD / selectedChannel.operatingPeriod;

    // 사용자가 설정한 환율 적용
    const monthlyRevenueKRW = monthlyRevenueUSD * exchangeRate;
    const amount = Math.round(monthlyRevenueKRW);

    // 한국 원화 포맷팅 (채널파인더와 동일)
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const remainder = amount % 100000000;
      const man = Math.floor(remainder / 10000);
      if (man > 0) {
        return `${eok}억 ${man}만원`;
      } else {
        return `${eok}억원`;
      }
    } else if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      const remainder = amount % 10000;
      if (remainder > 0) {
        return `${man}만 ${remainder.toLocaleString()}원`;
      } else {
        return `${man}만원`;
      }
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  // 🌍 채널파인더와 완전 동일한 범용 현지 통화 월 수익 계산
  const calculateMonthlyRevenueLocal = (currentLanguage: Language) => {
    if (!EXCHANGE_RATES[currentLanguage]) return '0'; // 지원하지 않는 언어
    if (!selectedChannel.operatingPeriod || selectedChannel.operatingPeriod <= 0) return '0';

    // 채널파인더와 동일한 USD 계산: 사용자가 설정한 비율과 RPM 사용
    const totalRevenueUSD = (selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm +
                           (selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm;
    const monthlyRevenueUSD = totalRevenueUSD / selectedChannel.operatingPeriod;

    // 사용자가 설정한 환율 적용
    const exchangeConfig = EXCHANGE_RATES[currentLanguage];
    const monthlyRevenueLocal = monthlyRevenueUSD * exchangeConfig.rate;
    const amount = Math.round(monthlyRevenueLocal);

    // formatLocalizedNumber 사용해서 각 언어에 맞게 포맷팅
    return formatLocalizedNumber(amount, currentLanguage, exchangeConfig.symbol);
  };

  // Portal을 사용해서 document.body에 직접 렌더링
  if (typeof window === 'undefined') return null;

  try {
    return createPortal(
      // FADE IN/OUT: 오버레이에도 mobile-closing 클래스 추가 (주의: 이상하면 이 부분만 되돌리기)
      <div className={`${styles.sidebarOverlay} ${isClosing ? styles.mobileClosing : ''}`} onClick={handleOverlayClick}>
        <div
          className={`${styles.sidebar} ${isClosing ? styles.mobileClosing : ''}`}
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
        <div className={styles.sidebarHeader}>
          <h3>
            <button onClick={onClose} className={styles.backBtn}>←</button>
            @{selectedChannel.channelName}
          </h3>
          <button
            className={styles.youtubeVisitBtn}
            onClick={() => {
              let channelUrl = selectedChannel.youtubeUrl;

              if (!channelUrl) {
                if (selectedChannel.customUrl) {
                  // customUrl이 있으면 @형태로 사용 (예: @briannamizura)
                  channelUrl = `https://www.youtube.com/${selectedChannel.customUrl}`;
                } else if (selectedChannel.channelId) {
                  // channelId가 있으면 channel/ID 형태로 사용
                  channelUrl = `https://www.youtube.com/channel/${selectedChannel.channelId}`;
                } else if (selectedChannel.id) {
                  // 백업으로 id 사용
                  channelUrl = `https://www.youtube.com/channel/${selectedChannel.id}`;
                } else {
                  // 최후의 수단으로 채널명 검색
                  channelUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedChannel.channelName)}`;
                }
              }

              window.open(channelUrl, '_blank');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" style={{marginLeft: '4px'}}>
              <path d="M1 6H19M19 6L14 1M19 6L14 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {/* 첫 번째 블럭: YouTube 비디오 임베드 */}
          <div className={styles.channelInfo}>
            <div className={styles.infoItem} style={{ display: 'block', width: '100%' }}>
              {selectedChannel.videoUrl && (() => {
                // YouTube URL에서 video ID 추출
                const getYouTubeVideoId = (url: string) => {
                  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
                  const match = url.match(regex);
                  return match ? match[1] : null;
                };

                const videoId = getYouTubeVideoId(selectedChannel.videoUrl);

                if (videoId) {
                  return (
                    <div style={{
                      width: '100%',
                      position: 'relative',
                      paddingBottom: 'calc(177.78% - 100px)', // 9:16 비율에서 100px 줄임
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '8px'
                    }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                        allowFullScreen
                        title="YouTube video player"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      color: '#666'
                    }}>
                      비디오를 불러올 수 없습니다
                    </div>
                  );
                }
              })()}

              {/* 영상링크 복사하기 버튼 */}
              {selectedChannel.videoUrl && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedChannel.videoUrl!).then(() => {
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000); // 2초 후 원래 텍스트로 복원
                      }).catch(() => {
                        alert('링크 복사에 실패했습니다.');
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isCopied ? '#EBFAF5' : 'rgb(124, 58, 237)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: isCopied ? '#2DAB84' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isCopied) {
                        e.currentTarget.style.backgroundColor = 'rgb(109, 40, 217)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isCopied) {
                        e.currentTarget.style.backgroundColor = 'rgb(124, 58, 237)';
                      }
                    }}
                  >
                    {isCopied ? '✅ 영상링크 복사완료' : '📋 영상링크 복사하기'}
                  </button>

                  <button
                    onClick={() => {
                      // 1. 브라우저 최상단으로 스크롤
                      window.scrollTo({ top: 0, behavior: 'smooth' });

                      // 2. 사이드바 닫기
                      onClose();

                      // 3. 입력칸에 영상 링크 입력 (약간의 지연 후)
                      setTimeout(() => {
                        if (selectedChannel.videoUrl) {
                          // YouTube URL을 Shorts URL로 변환
                          const convertToShortsUrl = (url: string) => {
                            // YouTube 영상 ID 추출
                            const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                            if (videoIdMatch) {
                              const videoId = videoIdMatch[1];
                              return `https://www.youtube.com/shorts/${videoId}`;
                            }
                            return url; // 변환 실패시 원본 반환
                          };

                          const shortsUrl = convertToShortsUrl(selectedChannel.videoUrl);
                          console.log('🔄 원본 URL:', selectedChannel.videoUrl);
                          console.log('🔄 변환된 Shorts URL:', shortsUrl);

                          // 전역 이벤트로 URL 전달
                          window.dispatchEvent(new CustomEvent('setYoutubeUrl', {
                            detail: { url: shortsUrl }
                          }));

                          console.log('✅ 전역 이벤트로 URL 전달 완료:', shortsUrl);
                        }
                      }, 200);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: 'rgb(124, 58, 237)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                    }}
                  >
                    🚀 이 영상으로 시작하기
                  </button>
                </div>
              )}

              {!selectedChannel.videoUrl && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#666'
                }}>
                  선택된 비디오가 없습니다
                </div>
              )}
            </div>
          </div>

          <div className={styles.channelInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.channelName')}</span>
              <span className={styles.value}>{selectedChannel.channelName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.category')}</span>
              <span className={styles.value}>{selectedChannel.category}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscribers')}</span>
              <span className={styles.value}>{formatSubscribers(selectedChannel.subscribers)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.country')}</span>
              <span className={styles.value}>{getCountryDisplayName(language, selectedChannel.country)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.operatingPeriod')}</span>
              <span className={styles.value}>{formatOperatingPeriod(selectedChannel.operatingPeriod)}</span>
            </div>
          </div>

          {/* 구독자 성장 추이는 최소 3개월 데이터가 있을 때만 표시 */}
          {selectedChannel?.subscriberHistory && selectedChannel.subscriberHistory.length >= 3 && (
            <div className={styles.chartSection} style={{position: 'relative'}}>
              <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.subscriberGrowth')}</SubTitle>
              <div className={styles.chartPlaceholder}>
                <div className={styles.lineChart}>
                  {chartData.length > 0 ? (
                    <svg width="100%" height="100" viewBox="0 0 300 100">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor: '#4fc3f7', stopOpacity: 0.3}} />
                          <stop offset="100%" style={{stopColor: '#4fc3f7', stopOpacity: 0.05}} />
                        </linearGradient>
                      </defs>

                      {chartData.length > 1 && (
                        <>
                          <path
                            d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')} L ${chartData[chartData.length-1].x} 100 L ${chartData[0].x} 100 Z`}
                            fill="url(#areaGradient)"
                          />
                          <path
                            d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}`}
                            stroke="#4fc3f7"
                            strokeWidth="3"
                            fill="none"
                            className={styles.growthLine}
                          />
                        </>
                      )}

                      {chartData.map((point, index) => (
                        <g key={index}>
                          <circle cx={point.x} cy={point.y} r="4" fill="#4fc3f7" />
                          <text x={point.x} y={point.y - 8} textAnchor="middle" className={styles.growthPercentage}>
                            {point.value}
                          </text>
                        </g>
                      ))}
                    </svg>
                  ) : (
                    <div className={styles.noDataMessage}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.noSubscriberData')}</div>
                  )}
                </div>
                <div className={styles.chartLabels} style={{ position: 'relative', height: '20px', width: '100%' }}>
                  {chartData.map((point, index) => {
                    const leftPercentage = ((point.x + 20) / 300) * 100;
                    return (
                      <span
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${leftPercentage}%`,
                          transform: 'translateX(-50%)',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}
                      >
                        {point.month}
                      </span>
                    );
                  })}
                </div>
              </div>

              {hoveredPoint !== null && (() => {
                const tooltipPositions = [20, 40, 60, 80];
                const tooltipX = tooltipPositions[hoveredPoint];

                return (
                  <div
                    className={styles.htmlTooltip}
                    style={{
                      position: 'absolute',
                      left: `${tooltipX}%`,
                      top: '170px',
                      transform: 'translateX(-50%)',
                      zIndex: 9999,
                      pointerEvents: 'none'
                    }}
                  >
                    <div className={styles.tooltipBubble}>
                      <div className={styles.tooltipArrow}></div>
                      <div className={styles.tooltipContent}>
                        <div>{growthTooltips[hoveredPoint].message[0]}</div>
                        <div>{growthTooltips[hoveredPoint].message[1]}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className={styles.rpmSection}>
            <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.revenueCalculation')}</SubTitle>

            <div className={styles.unifiedRevenueSection}>
              <div className={styles.totalViewsSimple}>
                <span className={styles.totalViewsLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalViews')}</span>
                <span className={styles.totalViewsValue}>{selectedChannel ? formatViews(selectedChannel.totalViews) : '0'}</span>
              </div>

              <div className={styles.countrySelector} style={{ position: 'relative' }}>
                <label className={styles.countryLabel}>국가 RPM</label>
                <button
                  className={styles.countrySelectButton}
                  onClick={handleDropdownToggle}
                >
                  <span>{getCountryDisplayName(language, currentCountry)}</span>
                  <svg className={`${styles.dropdownArrow} ${localDropdownOpen ? styles.open : ''}`} width="16" height="16" viewBox="0 0 20 20">
                    <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                  </svg>
                </button>
                {localDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10000 }}>
                    <DropdownOptions
                      options={countryOptions}
                      onSelect={handleDropdownSelect}
                      isOpen={localDropdownOpen}
                      onClose={handleDropdownClose}
                      selectedValue={currentCountry}
                      maxHeight="250px"
                      showSearch={true}
                    />
                  </div>
                )}
              </div>


              <div className={styles.revenueCardsContainer}>
                <div className={styles.contentRevenueCard}>
                  <div className={styles.contentHeader}>
                    <span className={styles.contentTitle}>Shorts<br/>RPM</span>
                    <span className={styles.contentPercentage}>{shortsPercentage}%</span>
                  </div>

                  <div className={styles.rpmController}>
                    <button onClick={() => adjustShortsRpm(false)} className={styles.rpmBtn}>-</button>
                    <span className={styles.rpmValue}>{shortsRpm.toFixed(2)}</span>
                    <button onClick={() => adjustShortsRpm(true)} className={styles.rpmBtn}>+</button>
                  </div>

                  <div className={styles.revenueResult}>
                    <div className={styles.revenueLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalShortsRevenue')}</div>
                    <div className={styles.revenueValue}>
                      {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm), language, '기타') : formatRevenue(0, language, '기타')}
                    </div>
                  </div>
                </div>

                <div className={styles.contentRevenueCard}>
                  <div className={styles.contentHeader}>
                    <span className={styles.contentTitle}>Long<br/>RPM</span>
                    <span className={styles.contentPercentage}>{longPercentage}%</span>
                  </div>

                  <div className={styles.rpmController}>
                    <button onClick={() => adjustLongRpm(false)} className={styles.rpmBtn}>-</button>
                    <span className={styles.rpmValue}>{longRpm.toFixed(2)}</span>
                    <button onClick={() => adjustLongRpm(true)} className={styles.rpmBtn}>+</button>
                  </div>

                  <div className={styles.revenueResult}>
                    <div className={styles.revenueLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalLongRevenue')}</div>
                    <div className={styles.revenueValue}>
                      {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm), language, '기타') : formatRevenue(0, language, '기타')}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.totalRevenueCard}>
                <div className={styles.totalRevenueLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalRevenue')}</div>
                <div className={styles.totalRevenueValue}>{calculateTotalRevenue(shortsPercentage, longPercentage, shortsRpm, longRpm)}</div>
              </div>

              {language !== 'en' && (
                <div
                  className={`${styles.totalRevenueCard} ${styles.koreanCurrencyHover}`}
                  onClick={openExchangeRateModal}
                >
                  <div className={styles.totalRevenueLabel}>
                    {getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.localCurrencyText')}
                  </div>
                  <div className={styles.totalRevenueValue}>{calculateLocalCurrencyRevenue()}</div>
                </div>
              )}
            </div>
          </div>

          <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.detailInfo')}</SubTitle>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalViews')}</div>
              <div className={styles.statValue}>{formatViews(selectedChannel.totalViews)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.avgViews')}</div>
              <div className={styles.statValue}>{formatViews(selectedChannel.avgViews)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalVideos')}</div>
              <div className={styles.statValue}>{formatVideosCount(selectedChannel.videosCount)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.uploadFrequency')}</div>
              <div className={styles.statValue}>{formatUploadFrequency(selectedChannel.uploadFrequency, language)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.monthlyGrowth')}</div>
              <div className={`${styles.statValue} ${styles.growthValue}`}>{formatGrowth(selectedChannel.monthlyGrowth)}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.yearlyGrowth')}</div>
              <div className={`${styles.statValue} ${styles.growthValue}`}>{formatGrowth(selectedChannel.yearlyGrowth)}</div>
            </div>
            <div
              className={`${styles.statCard} ${styles.tooltipContainer}`}
              onMouseEnter={() => setHoveredStat('views-per-subscriber')}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.viewsPerSubscriber')}</div>
              <div className={styles.statValue}>{calculateViewsPerSubscriber(selectedChannel)}</div>
              {hoveredStat === 'views-per-subscriber' && (
                <div className={styles.statTooltip} dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.viewsPerSubscriber') || ''}} />
              )}
            </div>
            <div
              className={`${styles.statCard} ${styles.tooltipContainer}`}
              onMouseEnter={() => setHoveredStat('subscription-rate')}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscriptionRate')}</div>
              <div className={styles.statValue}>{calculateSubscriptionRate(selectedChannel)}</div>
              {hoveredStat === 'subscription-rate' && (
                <div className={styles.statTooltip} dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.subscriptionRate') || ''}} />
              )}
            </div>
            <div
              className={`${styles.statCard} ${styles.tooltipContainer}`}
              onMouseEnter={() => setHoveredStat('monthly-revenue')}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className={styles.statLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.monthlyUsdRevenue')}</div>
              <div className={`${styles.statValue} ${styles.revenueValue}`}>{calculateMonthlyRevenue()}</div>
              {hoveredStat === 'monthly-revenue' && (
                <div className={styles.statTooltip}>{getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.monthlyRevenue')}</div>
              )}
            </div>
            {/* 🌍 미국이 아닌 경우에만 현지 통화 변환 블럭 표시 */}
            {language !== 'en' && EXCHANGE_RATES[language] && (
              <div
                className={`${styles.statCard} ${styles.tooltipContainer}`}
                onMouseEnter={() => setHoveredStat('monthly-revenue-local')}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={openExchangeRateModal}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.statLabel}>{EXCHANGE_RATES[language].label}</div>
                <div className={`${styles.statValue} ${styles.revenueValue}`}>
                  {language === 'ko' ? calculateMonthlyRevenueKRW() : calculateMonthlyRevenueLocal(language)}
                </div>
                {hoveredStat === 'monthly-revenue-local' && (
                  <div className={styles.statTooltip}>
                    {getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.exchangeRateChange', {
                      rate: exchangeRate,
                      symbol: EXCHANGE_RATES[language].symbol
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>,
    document.body
    );
  } catch (error) {
    console.error('ExplorationSidebar render error:', error);
    return createPortal(
      <div className={styles.sidebarOverlay}>
        <div className={styles.sidebar} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <div className={styles.sidebarHeader}>
            <button onClick={onClose} className={styles.backBtn}>←</button>
            <span>Error loading sidebar for language: {language}</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }
};

export default ExplorationSidebar;