import React, { useState } from 'react';

export interface RankingData {
  rank: number;
  change: string;
  title: string;
  tags: string[];
  date: string;
  views: string;
  channel: {
    name: string;
    subs: string;
    avatar: string;
  };
}

export interface RankingTableProps {
  data: RankingData[];
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const RankingTable: React.FC<RankingTableProps> = ({
  data,
  currentPage,
  onPageChange,
  totalPages
}) => {
  // 데이터를 두 그룹으로 나누기 (1-5위, 6-10위)
  const leftData = data.slice(0, 5);
  const rightData = data.slice(5, 10);

  const renderTableBlock = (blockData: RankingData[], blockTitle: string) => (
    <div style={{ border: '1px solid rgb(229, 231, 235)', borderRadius: '8px', padding: '12px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.1fr 1fr 0.7fr 0.7fr 1fr',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid #d1d5db',
        fontSize: '15px',
        fontWeight: '600',
        color: '#374151'
      }}>
        <div></div>
        <div style={{ textAlign: 'center', marginLeft: '-20px' }}>채널</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>구독자수</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>조회수</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>제목</div>
      </div>

      {/* 데이터 행들 */}
      {blockData.map((item, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '0.1fr 1fr 0.7fr 0.7fr 1fr',
          gap: '8px',
          padding: '8px 0',
          borderBottom: i < 4 ? '1px solid #e5e7eb' : 'none',
          alignItems: 'center'
        }}>
          {/* 순위 */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.rank}</span>
          </div>

          {/* 채널 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '6px',
              color: '#6b7280',
              overflow: 'hidden'
            }}>
              {item.channel.avatar && item.channel.avatar !== '👤' ? (
                <img
                  src={item.channel.avatar}
                  alt={item.channel.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#111827',
                textAlign: 'center'
              }}>
                {item.channel.name}
              </div>
            </div>
          </div>

          {/* 구독자수 */}
          <div style={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            {item.channel.subs}
          </div>

          {/* 조회수 */}
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            {item.views}
          </div>

          {/* 제목 */}
          <div>
            {/* 썸네일 */}
            <div style={{
              width: '180px',
              height: '100px',
              backgroundColor: '#d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#6b7280',
              marginBottom: '4px'
            }}>
              썸네일
            </div>

            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '2px',
                lineHeight: '1.3'
              }}>
                {item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: '400',
                color: '#9ca3af'
              }}>
                {item.date}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      {/* 2열 그리드로 테이블 배치 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }}>
        {/* 왼쪽 블럭: 1-5위 */}
        {renderTableBlock(leftData, '1-5위')}

        {/* 오른쪽 블럭: 6-10위 */}
        {renderTableBlock(rightData, '6-10위')}
      </div>
    </div>
  );
};

export default RankingTable;