import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 롤백용: Portal 구현을 위한 추가, 에러시 삭제 가능
import { FILTER_TAG_CONFIG } from '../constants';
import { Language } from '../../../types';
import { channelFinderTranslations } from '../../../i18n/channelFinderTranslations';
import styles from '../filters/FilterTags.module.css';

// 🏷️ 태그 필터 컴포넌트 - 완전 재사용 가능한 설계
interface FilterTagProps {
  tagConfig: typeof FILTER_TAG_CONFIG.TAGS[0];
  language: Language;
  currentValues: Record<string, number>;
  isActive: boolean;
  onValueChange: (placeholder: string, value: number) => void;
  onApply: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({
  tagConfig,
  language,
  currentValues,
  isActive,
  onValueChange,
  onApply
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // 롤백용: 모바일 감지 로직, 에러시 삭제하고 기존 방식으로 복원 가능
  const [isMobile, setIsMobile] = useState(false);
  
  // 롤백용: 모바일 여부 체크 및 리사이즈 감지, 문제시 이 부분 전체 삭제 가능
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 외부 클릭 감지로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdownElement = dropdownRefs.current[openDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // 템플릿에서 플레이스홀더를 실제 값으로 대체
  const renderTemplate = () => {
    const translationKey = `filterTag_${tagConfig.id}` as keyof typeof channelFinderTranslations['ko'];
    let template = (channelFinderTranslations[language]?.[translationKey] || 
                   channelFinderTranslations['en']?.[translationKey] || 
                   tagConfig.template).replace(/\\n/g, '\n');
    
    return tagConfig.placeholders.map((placeholder, index) => {
      const beforeText = template.split(`{${placeholder}}`)[0];
      template = template.replace(beforeText + `{${placeholder}}`, '');
      
      const currentValue = currentValues[placeholder] || tagConfig.defaultValues[placeholder];
      const option = FILTER_TAG_CONFIG.OPTIONS[placeholder as keyof typeof FILTER_TAG_CONFIG.OPTIONS];
      const selectedOption = option.values.find(v => v.value === currentValue);
      
      // 번역된 옵션 값 가져오기 (금액, 조회수, 구독자, 기간, 영상개수)
      const getTranslatedValue = (value: number, placeholder: string) => {
        if (placeholder === 'revenue') {
          const revenueKey = `revenue_${value}` as keyof typeof channelFinderTranslations['ko'];
          return channelFinderTranslations[language]?.[revenueKey] || 
                 channelFinderTranslations['en']?.[revenueKey] || 
                 selectedOption?.label || 
                 value.toString();
        }
        if (placeholder === 'views') {
          const viewsKey = `views_${value}` as keyof typeof channelFinderTranslations['ko'];
          return channelFinderTranslations[language]?.[viewsKey] || 
                 channelFinderTranslations['en']?.[viewsKey] || 
                 selectedOption?.label || 
                 value.toString();
        }
        if (placeholder === 'subscribers') {
          const subscribersKey = `subscribers_${value}` as keyof typeof channelFinderTranslations['ko'];
          return channelFinderTranslations[language]?.[subscribersKey] || 
                 channelFinderTranslations['en']?.[subscribersKey] || 
                 selectedOption?.label || 
                 value.toString();
        }
        if (placeholder === 'period') {
          const periodKey = `period_${value}` as keyof typeof channelFinderTranslations['ko'];
          return channelFinderTranslations[language]?.[periodKey] || 
                 channelFinderTranslations['en']?.[periodKey] || 
                 selectedOption?.label || 
                 value.toString();
        }
        if (placeholder === 'videoCount') {
          const videoCountKey = `videoCount_${value}` as keyof typeof channelFinderTranslations['ko'];
          return channelFinderTranslations[language]?.[videoCountKey] || 
                 channelFinderTranslations['en']?.[videoCountKey] || 
                 selectedOption?.label || 
                 value.toString();
        }
        return selectedOption?.label || value.toString();
      };
      
      return (
        <span key={index}>
          {beforeText}
          <span 
            className={`${styles.filterTagDropdown} ${openDropdown === placeholder ? styles.filterTagDropdownActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === placeholder ? null : placeholder);
            }}
          >
{getTranslatedValue(currentValue, placeholder)}
{/* 롤백용: 기존 드롭다운은 PC에서만, 모바일에서는 Portal 사용 - 문제시 이 조건문만 제거하면 원래대로 복원 */}
            {openDropdown === placeholder && !isMobile && (
              <div 
                className={styles.filterTagMenu}
                ref={el => dropdownRefs.current[placeholder] = el}
              >
                {option.values.map(optionValue => (
                  <div
                    key={optionValue.value}
                    className={styles.filterTagMenuItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      onValueChange(placeholder, optionValue.value);
                      setOpenDropdown(null);
                      // 값 변경 후 바로 필터 적용
                      setTimeout(() => onApply(), 50);
                    }}
                  >
                    {getTranslatedValue(optionValue.value, placeholder)}
                  </div>
                ))}
              </div>
            )}
            
            {/* 롤백용: 모바일 전용 Portal 바텀시트 - 문제시 이 전체 블록을 삭제하고 위의 !isMobile 조건만 제거하면 복원 */}
            {openDropdown === placeholder && isMobile && typeof window !== 'undefined' && 
              createPortal(
                <div 
                  className={styles.filterTagMobileBottomSheet}
                  onClick={() => setOpenDropdown(null)}
                >
                  <div 
                    className={styles.filterTagMobileMenu}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {option.values.map(optionValue => (
                      <div
                        key={optionValue.value}
                        className={styles.filterTagMobileMenuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          onValueChange(placeholder, optionValue.value);
                          setOpenDropdown(null);
                          // 값 변경 후 바로 필터 적용
                          setTimeout(() => onApply(), 50);
                        }}
                      >
                        {getTranslatedValue(optionValue.value, placeholder)}
                      </div>
                    ))}
                  </div>
                </div>,
                document.body
              )
            }
          </span>
        </span>
      );
    });
  };

  return (
    <div 
      className={`${styles.filterTag} ${isActive ? styles.filterTagActive : ''}`}
      onClick={onApply}
    >
      <span className={styles.filterTagContent}>
        {renderTemplate()}
        {/* 남은 텍스트 추가 */}
{(() => {
          const translationKey = `filterTag_${tagConfig.id}` as keyof typeof channelFinderTranslations['ko'];
          const translatedTemplate = (channelFinderTranslations[language]?.[translationKey] || 
                                     channelFinderTranslations['en']?.[translationKey] || 
                                     tagConfig.template).replace(/\\n/g, '\n');
          return translatedTemplate.split(`{${tagConfig.placeholders[tagConfig.placeholders.length - 1]}}`)[1];
        })()}
      </span>
      <button 
        className={styles.filterTagApply}
        onClick={onApply}
        title="필터 적용"
      >
        ✓
      </button>
    </div>
  );
};

export default FilterTag;