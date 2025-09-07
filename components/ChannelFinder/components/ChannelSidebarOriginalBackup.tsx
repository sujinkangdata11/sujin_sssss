// 원본 사이드바 백업 - 리팩토링 전 완전한 기능을 보존
// 백업 날짜: 2025-09-07
// 용도: 리팩토링 시 원본 기능 참조용

// 이 파일은 1252-1563 줄까지의 원본 사이드바 코드를 보존합니다.
// 모든 기능 (차트, 수익 계산기, 툴팁 등)이 포함되어 있습니다.

import React from 'react';

const OriginalSidebarJSX = `
<div className="sidebar-overlay">
  <div className="sidebar">
    <div className="sidebar-header">
      <h3>
        <button onClick={closeSidebar} className="back-btn">←</button>
        @{selectedChannel.channelName}
      </h3>
      <button 
        className="youtube-visit-btn"
        onClick={() => {
          const channelUrl = selectedChannel.channelName === 'MrBeast' 
            ? 'https://www.youtube.com/@MrBeast'
            : 'https://www.youtube.com/@tseries';
          window.open(channelUrl, '_blank');
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        이동
      </button>
    </div>
    
    <div className="sidebar-content">
      <div className="channel-info">
        <div className="info-item">
          <span className="label">채널명</span>
          <span className="value">{selectedChannel.channelName}</span>
        </div>
        <div className="info-item">
          <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.category')}</span>
          <span className="value">{selectedChannel.category}</span>
        </div>
        <div className="info-item">
          <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscribers')}</span>
          <span className="value">{formatSubscribers(selectedChannel.subscribers)}</span>
        </div>
        <div className="info-item">
          <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.country')}</span>
          <span className="value">{getCountryDisplayName(language, selectedChannel.country)}</span>
        </div>
        <div className="info-item">
          <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.operatingPeriod')}</span>
          <span className="value">{formatOperatingPeriod(selectedChannel.operatingPeriod)}</span>
        </div>
      </div>

      {/* 구독자 성장 추이는 최소 3개월 데이터가 있을 때만 표시 */}
      {selectedChannel?.subscriberHistory && selectedChannel.subscriberHistory.length >= 3 && (
        <div className="chart-section" style={{position: 'relative'}}>
          <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.subscriberGrowth')}</SubTitle>
        <div className="chart-placeholder">
          <div className="line-chart">
            {chartData.length > 0 ? (
              <svg width="100%" height="100" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#4fc3f7', stopOpacity: 0.3}} />
                    <stop offset="100%" style={{stopColor: '#4fc3f7', stopOpacity: 0.05}} />
                  </linearGradient>
                </defs>
                
                {/* 동적으로 생성되는 선 그래프와 포인트 */}
                {chartData.length > 1 && (
                  <>
                    {/* 그라데이션 영역 */}
                    <path 
                      d={\`M \${chartData[0].x} \${chartData[0].y} \${chartData.slice(1).map(point => \`L \${point.x} \${point.y}\`).join(' ')} L \${chartData[chartData.length-1].x} 100 L \${chartData[0].x} 100 Z\`}
                      fill="url(#areaGradient)"
                    />
                    {/* 선 그래프 */}
                    <path 
                      d={\`M \${chartData[0].x} \${chartData[0].y} \${chartData.slice(1).map(point => \`L \${point.x} \${point.y}\`).join(' ')}\`}
                      stroke="#4fc3f7" 
                      strokeWidth="3" 
                      fill="none"
                      className="growth-line"
                    />
                  </>
                )}
                
                {/* 데이터 포인트와 라벨 */}
                {chartData.map((point, index) => (
                  <g key={index}>
                    <circle cx={point.x} cy={point.y} r="4" fill="#4fc3f7" />
                    <text x={point.x} y={point.y - 8} textAnchor="middle" className="growth-percentage">
                      {point.value}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="no-data-message">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.noSubscriberData')}</div>
            )}
          </div>
          <div className="chart-labels" style={{ position: 'relative', height: '20px', width: '100%' }}>
            {chartData.map((point, index) => {
              const leftPercentage = ((point.x + 20) / 300) * 100;
              return (
                <span 
                  key={index} 
                  style={{ 
                    position: 'absolute', 
                    left: \`\${leftPercentage}%\`,
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
        
        {/* HTML 말풍선 툴팁 - chart-section 레벨에서 절대 위치 */}
        {hoveredPoint !== null && (() => {
          const tooltipPositions = [20, 40, 60, 80];
          const tooltipX = tooltipPositions[hoveredPoint];
          
          return (
            <div 
              className="html-tooltip"
              style={{
                position: 'absolute',
                left: \`\${tooltipX}%\`,
                top: '170px',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                pointerEvents: 'none'
              }}
            >
              <div className="tooltip-bubble">
                <div className="tooltip-arrow"></div>
                <div className="tooltip-content">
                  <div>{growthTooltips[hoveredPoint].message[0]}</div>
                  <div>{growthTooltips[hoveredPoint].message[1]}</div>
                </div>
              </div>
            </div>
          );
        })()}
        </div>
      )}

      <div className="rpm-section">
        <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.revenueCalculation')}</SubTitle>
        
        <div className="unified-revenue-section">
          <div className="total-views-simple">
            <span className="total-views-label">{cf('totalViewsLabel')}</span>
            <span className="total-views-value">{selectedChannel ? formatViews(selectedChannel.totalViews) : '0'}</span>
          </div>
          
          <div className="country-selector">
            <label className="country-label">{cf('countryRpmLabel')}</label>
            <button 
              className="country-select-button"
              onClick={(e) => openDropdown('sidebar', e)}
            >
              <span>{getCountryDisplayName(language, currentCountry)}</span>
              <svg className={\`dropdown-arrow \${dropdownState.isOpen && dropdownState.type === 'sidebar' ? 'open' : ''}\`} width="16" height="16" viewBox="0 0 20 20">
                <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
              </svg>
            </button>
          </div>
          
          {/* 환율 입력 섹션 (미국이 아닐 때만 표시) */}
          {currentCountry !== 'United States' && (
            <div className="exchange-rate-section">
              <div className="country-selector">
                <label className="country-label">{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</label>
                <div className="exchange-rate-input-wrapper">
                  <input
                    type="number"
                    className="exchange-rate-input"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    placeholder={getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRatePlaceholder')}
                    min="0"
                    step="0.01"
                  />
                  <span className="currency-unit">
                    {(() => {
                      const currencyCode = currencyExchangeData[currentCountry as keyof typeof currencyExchangeData]?.currency || 'USD';
                      return getChannelFinderTranslation(channelFinderI18n, language, \`currencies.\${currencyCode}\`) || '달러';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="revenue-cards-container">
            {/* 숏폼 카드 */}
            <div className="content-revenue-card">
              <div className="content-header">
                <span className="content-title">{cf('shortsRpmLabel')}</span>
                <span className="content-percentage">{shortsPercentage}%</span>
              </div>
              
              <div className="rpm-controller">
                <button onClick={() => adjustShortsRpm(false)} className="rpm-btn">-</button>
                <span className="rpm-value">{shortsRpm.toFixed(2)}</span>
                <button onClick={() => adjustShortsRpm(true)} className="rpm-btn">+</button>
              </div>
              
              <div className="revenue-result">
                <div className="revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalShortsRevenue')}</div>
                <div className="revenue-value">
                  {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm * exchangeRate)) : formatRevenue(0)}
                </div>
              </div>
            </div>
            
            {/* 롱폼 카드 */}
            <div className="content-revenue-card">
              <div className="content-header">
                <span className="content-title">{cf('longRpmLabel')}</span>
                <span className="content-percentage">{longPercentage}%</span>
              </div>
              
              <div className="rpm-controller">
                <button onClick={() => adjustLongRpm(false)} className="rpm-btn">-</button>
                <span className="rpm-value">{longRpm.toFixed(2)}</span>
                <button onClick={() => adjustLongRpm(true)} className="rpm-btn">+</button>
              </div>
              
              <div className="revenue-result">
                <div className="revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalLongRevenue')}</div>
                <div className="revenue-value">
                  {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm * exchangeRate)) : formatRevenue(0)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="total-revenue-card">
            <div className="total-revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalRevenue')}</div>
            <div className="total-revenue-value">{calculateTotalRevenue()}</div>
          </div>
          
          {language !== 'en' && (
            <div 
              className="total-revenue-card korean-currency-hover"
              onClick={openExchangeRateModal}
            >
              <div className="total-revenue-label">
                {getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.localCurrencyText')}
              </div>
              <div className="total-revenue-value">{calculateLocalCurrencyRevenue()}</div>
            </div>
          )}
        </div>
      </div>

      <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.detailInfo')}</SubTitle>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalViews')}</div>
          <div className="stat-value">{formatViews(selectedChannel.totalViews)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.avgViews')}</div>
          <div className="stat-value">{formatViews(selectedChannel.avgViews)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalVideos')}</div>
          <div className="stat-value">{formatVideosCount(selectedChannel.videosCount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.uploadFrequency')}</div>
          <div className="stat-value">{formatUploadFrequency(selectedChannel.uploadFrequency)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.monthlyGrowth')}</div>
          <div className="stat-value growth-value">{formatGrowth(selectedChannel.monthlyGrowth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.yearlyGrowth')}</div>
          <div className="stat-value growth-value">{formatGrowth(selectedChannel.yearlyGrowth)}</div>
        </div>
        <div 
          className="stat-card tooltip-container"
          onMouseEnter={() => setHoveredStat('views-per-subscriber')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.viewsPerSubscriber')}</div>
          <div className="stat-value">{calculateViewsPerSubscriber(selectedChannel)}</div>
          {hoveredStat === 'views-per-subscriber' && (
            <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.viewsPerSubscriber')}} />
          )}
        </div>
        <div 
          className="stat-card tooltip-container"
          onMouseEnter={() => setHoveredStat('subscription-rate')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscriptionRate')}</div>
          <div className="stat-value">{calculateSubscriptionRate(selectedChannel)}</div>
          {hoveredStat === 'subscription-rate' && (
            <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.subscriptionRate')}} />
          )}
        </div>
      </div>
    </div>
  </div>
</div>
`;

export default OriginalSidebarJSX;