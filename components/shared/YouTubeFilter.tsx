import React, { useState, useEffect, useMemo } from 'react';
import { getCountryDisplayList, getCountryCodeByDisplayName } from '../../utils/listupCountry';
import { Language } from '../../types';
import { useExplorationTranslation, explorationTranslations } from '../../i18n/explorationI18n';

export interface YouTubeFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  channelList?: string[];
  availableDates?: {
    daily: string[];
    weekly: { label: string; range: string }[];
    monthly: string[];
  };
  language: Language;
}

export interface FilterState {
  selectedCategory: string;
  selectedCriteria: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedDate: string; // 실제 날짜 값 (예: "2025-09-14")
  selectedChannel?: string;
}

const YouTubeFilter: React.FC<YouTubeFilterProps> = ({ onFilterChange, channelList, availableDates, language }) => {
  // 🌍 다국어 번역 함수
  const et = useExplorationTranslation(language);

  // 🎯 번역 키 기반 초기값 설정 (언어 변경에 독립적)
  const [selectedCategory, setSelectedCategory] = useState('filterAll');
  const [selectedCriteria, setSelectedCriteria] = useState('filterViews');
  const [selectedCountry, setSelectedCountry] = useState('filterWorldwide');
  const [selectedPeriod, setSelectedPeriod] = useState('filterMonthly'); // 디폴트: 월간
  const [selectedDate, setSelectedDate] = useState('2025-09'); // 디폴트: 9월
  const [selectedChannel, setSelectedChannel] = useState('filterAll');

  // 🌍 필터 옵션 정의 (번역 키 기반)
  const periodOptions = [
    { key: 'filterDaily', value: et('filterDaily') },
    { key: 'filterWeekly', value: et('filterWeekly') },
    { key: 'filterMonthly', value: et('filterMonthly') },
    { key: 'filterYearly', value: et('filterYearly') }
  ];

  const criteriaOptions = [
    { key: 'filterViews', value: et('filterViews') },
    { key: 'filterSubscribers', value: et('filterSubscribers') }
  ];

  // 📅 월별 매핑 (번역 키 기반)
  const monthMapping = {
    1: et('monthJanuary'), 2: et('monthFebruary'), 3: et('monthMarch'),
    4: et('monthApril'), 5: et('monthMay'), 6: et('monthJune'),
    7: et('monthJuly'), 8: et('monthAugust'), 9: et('monthSeptember'),
    10: et('monthOctober'), 11: et('monthNovember'), 12: et('monthDecember')
  };

  // 🗓 요일 매핑 (번역 키 기반)
  const weekdayMapping = [
    et('weekdaySunday'), et('weekdayMonday'), et('weekdayTuesday'),
    et('weekdayWednesday'), et('weekdayThursday'), et('weekdayFriday'), et('weekdaySaturday')
  ];

  // 📊 주차 매핑 (번역 키 기반)
  const weekMapping = {
    1: et('weekFirst'), 2: et('weekSecond'), 3: et('weekThird'), 4: et('weekFourth')
  };

  // 기간 선택이 변경될 때 날짜 선택 리셋
  useEffect(() => {
    if (selectedPeriod === 'filterMonthly') {
      setSelectedDate('2025-09'); // 월간일 때는 9월로 설정
    } else if (selectedPeriod === 'filterWeekly') {
      const firstWeek = availableDates?.weekly?.[0];
      if (firstWeek) {
        setSelectedDate(firstWeek.range);
      } else {
        setSelectedDate('');
      }
    } else {
      setSelectedDate(''); // 다른 기간은 빈 문자열로 리셋
    }
  }, [selectedPeriod, availableDates]);

  // 번역된 값들을 메모이제이션 (언어가 변경될 때만 재계산)
  const translatedValues = useMemo(() => ({
    filterAll: et('filterAll'),
    filterViews: et('filterViews'),
    filterSubscribers: et('filterSubscribers'),
    filterWorldwide: et('filterWorldwide'),
    // 기간별 번역도 미리 계산
    filterDaily: et('filterDaily'),
    filterWeekly: et('filterWeekly'),
    filterMonthly: et('filterMonthly'),
    filterYearly: et('filterYearly')
  }), [language]);

  // 필터 변경 시 부모 컴포넌트에 알림 (et 함수 의존성 완전 제거)
  useEffect(() => {
    if (onFilterChange) {
      const periodTranslation = translatedValues[selectedPeriod as keyof typeof translatedValues] || translatedValues.filterMonthly;

      onFilterChange({
        selectedCategory: selectedCategory === 'filterAll' ? translatedValues.filterAll : selectedCategory,
        selectedCriteria: selectedCriteria === 'filterViews' ? translatedValues.filterViews : translatedValues.filterSubscribers,
        selectedCountry: selectedCountry === 'filterWorldwide' ? translatedValues.filterWorldwide : selectedCountry,
        selectedPeriod: periodTranslation,
        selectedDate,
        selectedChannel: selectedChannel === 'filterAll' ? translatedValues.filterAll : selectedChannel
      });
    }
  }, [selectedCategory, selectedCriteria, selectedCountry, selectedPeriod, selectedDate, selectedChannel, onFilterChange, translatedValues]);

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
{et('filterChannel')}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {(channelList ? ['filterAll', ...Array.from(new Set(channelList))] : [
              'filterAll',
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
                  if (channelList && channelList.includes(category) && category !== 'filterAll') {
                    setSelectedChannel(category);
                  } else {
                    setSelectedChannel('filterAll');
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
                {category === 'filterAll' ? et('filterAll') : category}
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
{et('filterCriteria')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {criteriaOptions.map((criteria) => (
              <div
                key={criteria.key}
                onClick={() => setSelectedCriteria(criteria.key)}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedCriteria === criteria.key ? '600' : '400',
                  backgroundColor: selectedCriteria === criteria.key ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedCriteria === criteria.key ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {et(criteria.key)}
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
{et('filterCountry')}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {getCountryDisplayList().map((country, index) => {
              const isWorldwide = index === 0; // 첫 번째가 '🌍 전세계'
              const countryKey = isWorldwide ? 'filterWorldwide' : country;

              return (
                <div
                  key={country}
                  onClick={() => setSelectedCountry(countryKey)}
                  style={{
                    height: '40px',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: selectedCountry === countryKey ? '600' : '400',
                    backgroundColor: selectedCountry === countryKey ? 'rgba(124, 58, 237, 0.1)' : 'white',
                    color: selectedCountry === countryKey ? 'rgb(124, 58, 237)' : '#333',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  {isWorldwide ? et('filterWorldwide') : country}
                </div>
              );
            })}
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
{et('filterPeriod')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {periodOptions.map((period) => (
              <div
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: selectedPeriod === period.key ? '600' : '400',
                  backgroundColor: selectedPeriod === period.key ? 'rgba(124, 58, 237, 0.1)' : 'white',
                  color: selectedPeriod === period.key ? 'rgb(124, 58, 237)' : '#333',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {period.value}
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
{et('filterDate')}
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

              if (selectedPeriod === 'filterDaily') {
                // 일간: 실제 데이터가 있는 날짜들만 표시
                const dailyDates = availableDates?.daily || [];
                const weekdays = weekdayMapping;

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
              } else if (selectedPeriod === 'filterWeekly') {
                const weeklyDates = availableDates?.weekly || [];

                weeklyDates.forEach((week, i) => {
                  dates.push(
                    <div key={`${week.label}-${i}`} onClick={() => setSelectedDate(week.range)} style={{
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
              } else if (selectedPeriod === 'filterMonthly') {
                // 월간: 9월만 표시
                const months = [
                  { label: et('monthSeptember'), range: '2025-09' }
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
              } else if (selectedPeriod === 'filterYearly') {
                // 연간: 2025년만 표시
                const years = [et('year2025')];

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
