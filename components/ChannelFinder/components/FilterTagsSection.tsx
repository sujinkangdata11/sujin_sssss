import React, { useState } from 'react';
import FilterTag from './FilterTag';
import { FILTER_TAG_CONFIG } from '../constants';
import styles from '../filters/FilterTags.module.css';

// 🎛️ 필터 태그 섹션 - 완전 설정 기반 시스템
interface FilterTagsSectionProps {
  onFilterApply: (filters: FilterState) => void;
}

export interface FilterState {
  [tagId: string]: Record<string, number>;
}

const FilterTagsSection: React.FC<FilterTagsSectionProps> = ({ onFilterApply }) => {
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
        {FILTER_TAG_CONFIG.TAGS.map(tagConfig => (
          <FilterTag
            key={tagConfig.id}
            tagConfig={tagConfig}
            currentValues={filterValues[tagConfig.id]}
            isActive={activeFilter === tagConfig.id}
            onValueChange={(placeholder, value) => 
              handleValueChange(tagConfig.id, placeholder, value)
            }
            onApply={() => handleTagApply(tagConfig.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterTagsSection;