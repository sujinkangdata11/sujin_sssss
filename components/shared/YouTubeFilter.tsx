import React, { useState, useEffect } from 'react';
import { getCountryDisplayList, getCountryCodeByDisplayName } from '../../utils/listupCountry';

export interface YouTubeFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  channelList?: string[];
  availableDates?: {
    daily: string[];
    weekly: string[];
    monthly: string[];
  };
}

export interface FilterState {
  selectedCategory: string;
  selectedCriteria: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedDate: string; // 실제 날짜 값 (예: "2025-09-14")
  selectedChannel?: string;
}

const YouTubeFilter: React.FC<YouTubeFilterProps> = ({ onFilterChange, channelList, availableDates }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedCriteria, setSelectedCriteria] = useState('조회수');
  const [selectedCountry, setSelectedCountry] = useState('🌍 전세계');
  const [selectedPeriod, setSelectedPeriod] = useState('월간'); // 디폴트: 월간
  const [selectedDate, setSelectedDate] = useState('2025-09'); // 디폴트: 9월
  const [selectedChannel, setSelectedChannel] = useState('전체');

  // 기간 선택이 변경될 때 날짜 선택 리셋
  useEffect(() => {
    if (selectedPeriod === '월간') {
      setSelectedDate('2025-09'); // 월간일 때는 9월로 설정
    } else {
      setSelectedDate(''); // 다른 기간은 빈 문자열로 리셋
    }
  }, [selectedPeriod]);

  // 필터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        selectedCategory,
        selectedCriteria,
        selectedCountry,
        selectedPeriod,
        selectedDate,
        selectedChannel
      });
    }
  }, [selectedCategory, selectedCriteria, selectedCountry, selectedPeriod, selectedDate, selectedChannel, onFilterChange]);

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
            {(channelList ? ['전체', ...Array.from(new Set(channelList))] : [
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
            ]).map((category, index) => (
              <div
                key={`category-${index}-${category}`}
                onClick={() => {
                  setSelectedCategory(category);
                  // 채널 목록에서 선택한 경우 해당 채널로 필터링
                  if (channelList && channelList.includes(category) && category !== '전체') {
                    setSelectedChannel(category);
                  } else {
                    setSelectedChannel('전체');
                  }
                }}
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
            {getCountryDisplayList().map((country) => (
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

              if (selectedPeriod === '일간') {
                // 일간: 실제 데이터가 있는 날짜들만 표시
                const dailyDates = availableDates?.daily || [];
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

                dailyDates.slice(0, 10).forEach((dateStr, i) => { // 최대 10개까지만
                  const date = new Date(dateStr);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const weekday = weekdays[date.getDay()];
                  const displayString = `${year}.${month}.${day}.(${weekday})`;

                  dates.push(
                    <div key={i} onClick={() => {
                      setSelectedDate(dateStr); // 실제 날짜 값 직접 저장
                    }} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === dateStr ? '600' : '400',
                      backgroundColor: selectedDate === dateStr ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === dateStr ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {displayString}
                    </div>
                  );
                });
              } else if (selectedPeriod === '주간') {
                // 주간: 현재 날짜 기준으로 과거 주차만 표시
                const today = new Date();
                const currentDate = today.getDate();
                const currentWeek = Math.ceil(currentDate / 7);

                const allWeeks = [
                  { label: '9월 1주', range: '2025-09-01~2025-09-07', weekNumber: 1 },
                  { label: '9월 2주', range: '2025-09-08~2025-09-15', weekNumber: 2 },
                  { label: '9월 3주', range: '2025-09-16~2025-09-22', weekNumber: 3 },
                  { label: '9월 4주', range: '2025-09-23~2025-09-30', weekNumber: 4 }
                ];

                // 현재 주차까지만 필터링
                const weeks = allWeeks.filter(week => week.weekNumber <= currentWeek);

                weeks.forEach((week, i) => {
                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(week.range)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === week.range ? '600' : '400',
                      backgroundColor: selectedDate === week.range ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === week.range ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {week.label}
                    </div>
                  );
                });
              } else if (selectedPeriod === '월간') {
                // 월간: 9월만 표시
                const months = [
                  { label: '9월', range: '2025-09' }
                ];

                months.forEach((month, i) => {
                  dates.push(
                    <div key={i} onClick={() => setSelectedDate(month.range)} style={{
                      height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: selectedDate === month.range ? '600' : '400',
                      backgroundColor: selectedDate === month.range ? 'rgba(124, 58, 237, 0.1)' : 'white',
                      color: selectedDate === month.range ? 'rgb(124, 58, 237)' : '#333', borderRadius: '10px',
                      cursor: 'pointer', boxSizing: 'border-box'
                    }}>
                      {month.label}
                    </div>
                  );
                });
              } else if (selectedPeriod === '연간') {
                // 연간: 2025년만 표시
                const years = ['2025년'];

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