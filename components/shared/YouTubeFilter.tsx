import React, { useState, useEffect } from 'react';

export interface YouTubeFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  channelList?: string[];
}

export interface FilterState {
  selectedCategory: string;
  selectedCriteria: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedDate: number;
}

const YouTubeFilter: React.FC<YouTubeFilterProps> = ({ onFilterChange, channelList }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedCriteria, setSelectedCriteria] = useState('조회수');
  const [selectedCountry, setSelectedCountry] = useState('🌍 전세계');
  const [selectedPeriod, setSelectedPeriod] = useState('일간');
  const [selectedDate, setSelectedDate] = useState(0);

  // 기간 선택이 변경될 때 날짜 선택 리셋
  useEffect(() => {
    setSelectedDate(0);
  }, [selectedPeriod]);

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        selectedCategory,
        selectedCriteria,
        selectedCountry,
        selectedPeriod,
        selectedDate
      });
    }
  }, [selectedCategory, selectedCriteria, selectedCountry, selectedPeriod, selectedDate, onFilterChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 5개 컬럼 가로 배치 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        gap: '6px',
        marginBottom: '16px'
      }}>
        {/* 카테고리 컬럼 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 'normal',
            color: '#333',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            채널명
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {(channelList ? ['전체', ...channelList] : [
              '전체',
              'Film & Animation',
              'Autos & Vehicles',
              'Music',
              'Pets & Animals',
              'Sports',
              'Travel & Events',
              'Gaming',
              'People & Blogs',
              'Comedy',
              'Entertainment',
              'News & Politics',
              'Howto & Style',
              'Education',
              'Science & Technology',
              'Nonprofits & Activism'
            ]).map((category) => (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  height: '40px',
                  minHeight: '40px',
                  maxHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedCategory === category ? '600' : '400',
                  backgroundColor: selectedCategory === category ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedCategory === category ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* 기준 컬럼 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 'normal',
            color: '#333',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            기준
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['조회수', '구독자수'].map((criteria) => (
              <div
                key={criteria}
                onClick={() => setSelectedCriteria(criteria)}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedCriteria === criteria ? '600' : '400',
                  backgroundColor: selectedCriteria === criteria ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedCriteria === criteria ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {criteria}
              </div>
            ))}
          </div>
        </div>

        {/* 국가 컬럼 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 'normal',
            color: '#333',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            국가
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {[
              '🌍 전세계',
              '🇰🇷 한국',
              '🇺🇸 미국',
              '🇯🇵 일본',
              '🇮🇳 인도',
              '🇧🇷 브라질',
              '🇩🇪 독일',
              '🇫🇷 프랑스',
              '🇬🇧 영국',
              '🇨🇦 캐나다',
              '🇦🇺 호주',
              '🇷🇺 러시아',
              '🇮🇩 인도네시아',
              '🇲🇽 멕시코',
              '🇮🇹 이탈리아',
              '🇪🇸 스페인'
            ].map((country) => (
              <div
                key={country}
                onClick={() => setSelectedCountry(country)}
                style={{
                  height: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedCountry === country ? '600' : '400',
                  backgroundColor: selectedCountry === country ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedCountry === country ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {country}
              </div>
            ))}
          </div>
        </div>

        {/* 기간 컬럼 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 'normal',
            color: '#333',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            기간
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['일간', '주간', '월간', '연간'].map((period) => (
              <div
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedPeriod === period ? '600' : '400',
                  backgroundColor: selectedPeriod === period ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedPeriod === period ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {period}
              </div>
            ))}
          </div>
        </div>

        {/* 날짜 컬럼 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 'normal',
            color: '#333',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            날짜
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {(() => {
              const dates = [];
              const today = new Date();

              if (selectedPeriod === '일간') {
                // 일간: 날짜별 표시
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                for (let i = 0; i < 7; i++) {
                  const date = new Date(today);
                  date.setDate(today.getDate() - i);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const weekday = weekdays[date.getDay()];
                  const dateString = `${year}.${month}.${day}.(${weekday})`;

                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(i)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === i ? '600' : '400',
                      backgroundColor: selectedDate === i ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === i ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {dateString}
                    </div>
                  );
                }
              } else if (selectedPeriod === '주간') {
                // 주간: 주별 표시 (최대 4개)
                const currentMonth = today.getMonth() + 1;
                const weeks = [
                  `${currentMonth}월 2주`,
                  `${currentMonth}월 1주`,
                  `${currentMonth - 1}월 4주`,
                  `${currentMonth - 1}월 3주`
                ];

                weeks.forEach((week, i) => {
                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(i)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === i ? '600' : '400',
                      backgroundColor: selectedDate === i ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === i ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {week}
                    </div>
                  );
                });
              } else if (selectedPeriod === '월간') {
                // 월간: 월별 표시 (최대 5개)
                const months = ['9월', '8월', '7월', '6월', '5월'];

                months.forEach((month, i) => {
                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(i)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === i ? '600' : '400',
                      backgroundColor: selectedDate === i ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === i ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {month}
                    </div>
                  );
                });
              } else if (selectedPeriod === '연간') {
                // 연간: 연도별 표시 (최대 4개)
                const years = ['2025년', '2024년', '2023년', '2022년'];

                years.forEach((year, i) => {
                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(i)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === i ? '600' : '400',
                      backgroundColor: selectedDate === i ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === i ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {year}
                    </div>
                  );
                });
              }

              return dates;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeFilter;