import React, { useState, useRef, useEffect } from 'react';
import { FILTER_TAG_CONFIG } from '../constants';
import styles from '../../../styles/ChannelFinder.module.css';

// 🏷️ 태그 필터 컴포넌트 - 완전 재사용 가능한 설계
interface FilterTagProps {
  tagConfig: typeof FILTER_TAG_CONFIG.TAGS[0];
  currentValues: Record<string, number>;
  isActive: boolean;
  onValueChange: (placeholder: string, value: number) => void;
  onApply: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({
  tagConfig,
  currentValues,
  isActive,
  onValueChange,
  onApply
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    let template = tagConfig.template;
    
    return tagConfig.placeholders.map((placeholder, index) => {
      const beforeText = template.split(`{${placeholder}}`)[0];
      template = template.replace(beforeText + `{${placeholder}}`, '');
      
      const currentValue = currentValues[placeholder] || tagConfig.defaultValues[placeholder];
      const option = FILTER_TAG_CONFIG.OPTIONS[placeholder as keyof typeof FILTER_TAG_CONFIG.OPTIONS];
      const selectedOption = option.values.find(v => v.value === currentValue);
      
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
{selectedOption?.label || currentValue}
            {openDropdown === placeholder && (
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
                    {optionValue.label}
                  </div>
                ))}
              </div>
            )}
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
        {tagConfig.template.split(`{${tagConfig.placeholders[tagConfig.placeholders.length - 1]}}`)[1]}
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