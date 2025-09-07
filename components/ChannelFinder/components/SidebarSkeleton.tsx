import React from 'react';
import styles from '../../../styles/ChannelFinder.module.css';

const SidebarSkeleton: React.FC = () => (
  <div className={styles.sidebarOverlay}>
    <div className={`${styles.sidebar} ${styles.skeletonSidebarContent}`}>
      <div className={styles.sidebarHeader}>
        <h3>
          <button className={`${styles.backBtn} ${styles.skeletonBackBtn}`}>←</button>
          <div className={styles.skeletonTitle}></div>
        </h3>
        <button className={`${styles.youtubeVisitBtn} ${styles.skeletonYoutubeBtn}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 0}}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <div className={styles.skeletonBtnText}></div>
        </button>
      </div>
      
      <div className={styles.sidebarContent}>
        <div className={styles.channelInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>채널명:</span>
            <div className={styles.skeletonInfoValue} style={{width: '120px', height: '18px'}}></div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>카테고리:</span>
            <div className={styles.skeletonInfoValue} style={{width: '80px', height: '18px'}}></div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>구독자수:</span>
            <div className={styles.skeletonInfoValue} style={{width: '100px', height: '18px'}}></div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>국가:</span>
            <div className={styles.skeletonInfoValue} style={{width: '50px', height: '18px'}}></div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>운영기간:</span>
            <div className={styles.skeletonInfoValue} style={{width: '90px', height: '18px'}}></div>
          </div>
        </div>
        
        <div className={styles.chartSection}>
          <h4 className={styles.subtitle}>구독자 성장 추이</h4>
          <div className={styles.chartPlaceholder}>
            <div className={styles.lineChart}>
              <div className={styles.skeletonChart}></div>
            </div>
            <div className={styles.chartLabels}>
              <span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span>
            </div>
          </div>
        </div>
        
        <div className={styles.rpmSection}>
          <h4 className={styles.subtitle}>수익계산</h4>
          <div className={styles.rpmCard}>
            <div className={styles.contentTabs}>
              <button className={`${styles.tab} ${styles.active}`}>숏폼</button>
              <button className={styles.tab}>롱폼</button>
            </div>
            <div className={styles.rpmHeader}>
              <span>RPM</span>
              <span>총 조회수</span>
            </div>
            <div className={styles.rpmControls}>
              <button className={`${styles.rpmBtn} ${styles.minus}`}>-</button>
              <div className={styles.skeletonRpmValue}></div>
              <button className={`${styles.rpmBtn} ${styles.plus}`}>+</button>
              <div className={styles.skeletonPeriodValue}></div>
            </div>
            
            <div className={styles.revenueGrid}>
              <div className={styles.revenueCard}>
                <div className={styles.revenueLabel}>최근 영상 수익</div>
                <div className={styles.skeletonRevenueValue}></div>
              </div>
              <div className={styles.revenueCard}>
                <div className={styles.revenueLabel}>채널 총 수익</div>
                <div className={styles.skeletonRevenueValue}></div>
              </div>
            </div>
            
            <div className={styles.totalRevenueCard}>
              <div className={styles.totalRevenueLabel}>쇼폼 + 롱폼 총수익</div>
              <div className={styles.skeletonTotalRevenue}></div>
            </div>
          </div>
        </div>
        
        <h4 className={styles.subtitle}>디테일 정보</h4>
        <div className={styles.statsGrid}>
          {[
            '총 조회수', '평균 조회수', '총 영상수', '업로드 빈도',
            '월간증가', '년간증가', '구독자 대비 조회수', '구독 전환율'
          ].map((label, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statLabel}>{label}</div>
              <div className={styles.skeletonStatValue}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SidebarSkeleton;