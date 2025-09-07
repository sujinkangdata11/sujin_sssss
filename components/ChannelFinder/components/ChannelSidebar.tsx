import React from 'react';
import { Language } from '../../../types';
import { ChannelData } from '../types';
import { getChannelFinderTranslation, channelFinderI18n } from '../../../i18n/channelFinderI18n';
import { formatRevenue, calculateViewsPerSubscriber, calculateSubscriptionRate } from '../utils';
import styles from '../../../styles/ChannelFinder.module.css';

interface ChannelSidebarProps {
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
}

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h4 className={styles.subtitle}>{children}</h4>;
};

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
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
  cf
}) => {
  // 안전장치: 필수 props 확인
  if (!selectedChannel || !language) {
    console.error('ChannelSidebar: Missing required props', { selectedChannel, language });
    return null;
  }

  try {
    return (
      <div className={styles.sidebarOverlay}>
      <div className={styles.sidebar}>
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
              
              <div className={styles.countrySelector}>
                <label className={styles.countryLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</label>
                <button 
                  className={styles.countrySelectButton}
                  onClick={(e) => openDropdown('sidebar', e)}
                >
                  <span>{getCountryDisplayName(language, currentCountry)}</span>
                  <svg className={`${styles.dropdownArrow} ${dropdownState.isOpen && dropdownState.type === 'sidebar' ? styles.open : ''}`} width="16" height="16" viewBox="0 0 20 20">
                    <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                  </svg>
                </button>
              </div>
              
              {currentCountry !== 'United States' && (
                <div className={styles.exchangeRateSection}>
                  <div className={styles.countrySelector}>
                    <label className={styles.countryLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</label>
                    <div className={styles.exchangeRateInputWrapper}>
                      <input
                        type="number"
                        className={styles.exchangeRateInput}
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(Number(e.target.value))}
                        placeholder={getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRatePlaceholder')}
                        min="0"
                        step="0.01"
                      />
                      <span className={styles.currencyUnit}>
                        {(() => {
                          const currencyCode = currencyExchangeData[currentCountry as keyof typeof currencyExchangeData]?.currency || 'USD';
                          return getChannelFinderTranslation(channelFinderI18n, language, `currencies.${currencyCode}`) || '달러';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={styles.revenueCardsContainer}>
                <div className={styles.contentRevenueCard}>
                  <div className={styles.contentHeader}>
                    <span className={styles.contentTitle}>Shorts RPM</span>
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
                      {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm * exchangeRate), language, '기타') : formatRevenue(0, language, '기타')}
                    </div>
                  </div>
                </div>
                
                <div className={styles.contentRevenueCard}>
                  <div className={styles.contentHeader}>
                    <span className={styles.contentTitle}>Long RPM</span>
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
                      {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm * exchangeRate), language, '기타') : formatRevenue(0, language, '기타')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.totalRevenueCard}>
                <div className={styles.totalRevenueLabel}>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalRevenue')}</div>
                <div className={styles.totalRevenueValue}>{calculateTotalRevenue()}</div>
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
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('ChannelSidebar render error:', error);
    return (
      <div className={styles.sidebarOverlay}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button onClick={onClose} className={styles.backBtn}>←</button>
            <span>Error loading sidebar for language: {language}</span>
          </div>
        </div>
      </div>
    );
  }
};

export default ChannelSidebar;