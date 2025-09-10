import React, { useState, useEffect, useRef } from 'react';
import FilterTag from './FilterTag';
import { FILTER_TAG_CONFIG } from '../constants';
import { Language } from '../../../types';
import styles from '../filters/FilterTags.module.css';

// 🎛️ 필터 태그 섹션 - 완전 설정 기반 시스템
interface FilterTagsSectionProps {
  language: Language;
  onFilterApply: (filters: FilterState) => void;
}

export interface FilterState {
  [tagId: string]: Record<string, number>;
}

const FilterTagsSection: React.FC<FilterTagsSectionProps> = ({ language, onFilterApply }) => {
  // 각 태그의 현재 값들을 관리
  const [filterValues, setFilterValues] = useState<FilterState>(() => {
    const initialState: FilterState = {};
    FILTER_TAG_CONFIG.TAGS.forEach(tag => {
      initialState[tag.id] = { ...tag.defaultValues };
    });
    return initialState;
  });

  // 🔄 SINGLE FILTER: 단일 필터만 선택 가능하도록 변경
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // 모바일 감지
  const [isMobile, setIsMobile] = useState(false);
  
  // Lottie 애니메이션 중복 생성 방지용 ref
  const lottieCreated = useRef(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 개별 드롭다운 값 변경
  const handleValueChange = (tagId: string, placeholder: string, value: number) => {
    setFilterValues(prev => ({
      ...prev,
      [tagId]: {
        ...prev[tagId],
        [placeholder]: value
      }
    }));
  };

  // 🔄 SINGLE FILTER: 라디오 버튼처럼 단일 필터만 선택
  const handleTagApply = (tagId: string) => {
    if (activeFilter === tagId) {
      // 이미 선택된 필터 클릭 시 비활성화
      setActiveFilter(null);
      onFilterApply({});
    } else {
      // 새 필터 선택 시 기존 필터 자동 해제하고 새 필터 활성화
      setActiveFilter(tagId);
      onFilterApply({ [tagId]: filterValues[tagId] });
    }
  };

  return (
    <div className={styles.filterTagsSection}>
      <div className={styles.filterTagsContainer}>
        {FILTER_TAG_CONFIG.TAGS.map((tagConfig, index) => (
          <React.Fragment key={tagConfig.id}>
            {/* 4,5번 필터만 특별한 div로 감싸기 */}
            {isMobile && index === 3 ? (
              <div className={styles.mobileFilter4}>
                <FilterTag
                  tagConfig={tagConfig}
                  language={language}
                  currentValues={filterValues[tagConfig.id]}
                  isActive={activeFilter === tagConfig.id}
                  onValueChange={(placeholder, value) => 
                    handleValueChange(tagConfig.id, placeholder, value)
                  }
                  onApply={() => handleTagApply(tagConfig.id)}
                />
              </div>
            ) : isMobile && index === 4 ? (
              <div className={styles.mobileFilter5}>
                <FilterTag
                  tagConfig={tagConfig}
                  language={language}
                  currentValues={filterValues[tagConfig.id]}
                  isActive={activeFilter === tagConfig.id}
                  onValueChange={(placeholder, value) => 
                    handleValueChange(tagConfig.id, placeholder, value)
                  }
                  onApply={() => handleTagApply(tagConfig.id)}
                />
              </div>
            ) : (
              <FilterTag
                tagConfig={tagConfig}
                language={language}
                currentValues={filterValues[tagConfig.id]}
                isActive={activeFilter === tagConfig.id}
                onValueChange={(placeholder, value) => 
                  handleValueChange(tagConfig.id, placeholder, value)
                }
                onApply={() => handleTagApply(tagConfig.id)}
              />
            )}
            
            {/* 모바일에서 3번째 필터(index 2) 옆에 Lottie 추가 */}
            {index === 2 && isMobile && (
              <div className={styles.mobileArrowLottie}>
                <div 
                  ref={(el) => {
                    if (el && typeof window !== 'undefined' && !lottieCreated.current) {
                      lottieCreated.current = true;
                      
                      // 기존 내용 완전히 제거
                      el.innerHTML = '';
                      
                      // Lottie Web을 동적으로 로드하고 애니메이션 실행
                      import('lottie-web').then(lottie => {
                        // Arrow 애니메이션 로드
                        fetch('/lottie/Arrow.json')
                          .then(response => response.json())
                          .then(animationData => {
                            lottie.default.loadAnimation({
                              container: el,
                              renderer: 'svg',
                              loop: true,
                              autoplay: true,
                              animationData: animationData
                            });
                          })
                          .catch(console.error);
                      }).catch(console.error);
                    }
                  }}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transform: 'rotate(-90deg)' // -90도 회전: > → ↑
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FilterTagsSection;