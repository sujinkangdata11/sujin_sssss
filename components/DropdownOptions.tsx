import React, { useState } from 'react';
import styles from '../styles/DropdownOptions.module.css';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownOptionsProps {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedValue?: string;
  maxHeight?: string;
  showSearch?: boolean;
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({
  options,
  onSelect,
  isOpen,
  onClose,
  selectedValue,
  maxHeight = "300px",
  showSearch = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 검색 필터링된 옵션들
  const filteredOptions = showSearch
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
    setSearchTerm(''); // 검색어 초기화
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 드롭다운이 닫힐 때 검색어 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.dropdownBackdrop} onClick={handleBackdropClick} />
      <div className={styles.dropdownOptions}>
        {showSearch && (
          <div className={styles.dropdownSearchSection}>
            <div className={styles.searchInputContainer}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" width="16" height="16">
                <path d="M21 20l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearchTerm(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={styles.dropdownSearchInput}
                autoFocus
              />
            </div>
          </div>
        )}
        <div className={styles.dropdownOptionsContent} style={{ maxHeight }}>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`${styles.dropdownOption} ${selectedValue === option.value ? styles.selected : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
          {filteredOptions.length === 0 && showSearch && (
            <div className={styles.noResults}>검색 결과가 없습니다</div>
          )}
        </div>
      </div>
    </>
  );
};

export default DropdownOptions;