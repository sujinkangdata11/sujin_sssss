import React, { useState } from 'react';

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
      <div className="dropdown-backdrop" onClick={handleBackdropClick} />
      <div className="dropdown-options">
        {showSearch && (
          <div className="dropdown-search-section">
            <div className="search-input-container">
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16">
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
                className="dropdown-search-input"
                autoFocus
              />
            </div>
          </div>
        )}
        <div className="dropdown-options-content" style={{ maxHeight }}>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${selectedValue === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
          {filteredOptions.length === 0 && showSearch && (
            <div className="no-results">검색 결과가 없습니다</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dropdown-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          background: transparent;
        }

        .dropdown-options {
          position: absolute;
          top: 100%;
          right: 0;
          width: 200px;
          z-index: 1000;
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-top: 4px;
          animation: fadeIn 0.15s ease-out;
        }

        .dropdown-options-content {
          overflow-y: auto;
          border-radius: 12px;
        }

        .dropdown-option {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .dropdown-option:last-child {
          border-bottom: none;
        }

        .dropdown-option:hover {
          background: #f8f9fa;
        }

        .dropdown-option.selected {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 600;
        }

        .dropdown-option:first-child {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }

        .dropdown-option:last-child {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 스크롤바 스타일링 */
        .dropdown-options-content::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-options-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dropdown-options-content::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }

        .dropdown-options-content::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }

        .dropdown-search-section {
          padding: 8px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }

        .search-input-container {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
          z-index: 2;
        }

        .dropdown-search-input {
          width: 100%;
          padding: 6px 8px 6px 32px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #333;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .dropdown-search-input:focus {
          border-color: #7c4dff;
          box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
        }

        .dropdown-search-input::placeholder {
          color: #999;
        }

        .no-results {
          padding: 12px 16px;
          text-align: center;
          color: #999;
          font-size: 14px;
          font-style: italic;
        }
      `}</style>
    </>
  );
};

export default DropdownOptions;