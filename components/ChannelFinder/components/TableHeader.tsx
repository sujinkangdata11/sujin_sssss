import React from 'react';
import { Language } from '../../../types';
import { getChannelFinderTranslation } from '../../../i18n/channelFinderI18n';
import { channelFinderI18n } from '../../../i18n/channelFinderI18n';

interface TableHeaderProps {
  language: Language;
  columnWidths: { [key: number]: string };
  sortMenuOpen: string | null;
  youtubeCategories: string[];
  selectedCountry: string;
  dropdownState: { isOpen: boolean; type: string | null };
  onMouseDown: (columnIndex: number, event: React.MouseEvent) => void;
  onHeaderClick: (columnType: string) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onCategoryFilter: (category: string) => void;
  openDropdown: (type: string, event: React.MouseEvent) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  language,
  columnWidths,
  sortMenuOpen,
  youtubeCategories,
  selectedCountry,
  dropdownState,
  onMouseDown,
  onHeaderClick,
  onSort,
  onCategoryFilter,
  openDropdown
}) => {
  return (
    <thead>
      <tr>
        {/* 리사이즈 핸들러 추가 - No 컬럼 */}
        <th className="category-header-resizable" style={{ width: columnWidths[0] }}>
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(0, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.no')}
        </th>
        {/* 리사이즈 핸들러 추가 - 채널명 컬럼 */}
        <th className="category-header-resizable" style={{ width: columnWidths[1] }}>
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(1, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.channelName')}
        </th>
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('category')}
          style={{ width: columnWidths[2] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(2, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.category')}
          
          {sortMenuOpen === 'category' && (
            <div className="sort-menu category-menu">
              <div className="category-grid">
                {youtubeCategories.map((category) => (
                  <div key={category} onClick={() => onCategoryFilter(category)} className="category-item">
                    {category}
                  </div>
                ))}
              </div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 구독자 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('subscribers')}
          style={{ width: columnWidths[3] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(3, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscribers')}
          {sortMenuOpen === 'subscribers' && (
            <div className="sort-menu">
              <div onClick={() => onSort('subscribers', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('subscribers', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 연간성장 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('yearlyGrowth')}
          style={{ width: columnWidths[4] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(4, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.yearlyGrowth')}
          {sortMenuOpen === 'yearlyGrowth' && (
            <div className="sort-menu">
              <div onClick={() => onSort('yearlyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('yearlyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 월간성장 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('monthlyGrowth')}
          style={{ width: columnWidths[5] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(5, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.monthlyGrowth')}
          {sortMenuOpen === 'monthlyGrowth' && (
            <div className="sort-menu">
              <div onClick={() => onSort('monthlyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('monthlyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 일간성장 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('dailyGrowth')}
          style={{ width: columnWidths[6] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(6, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.dailyGrowth')}
          {sortMenuOpen === 'dailyGrowth' && (
            <div className="sort-menu">
              <div onClick={() => onSort('dailyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('dailyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 구독전환율 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('subscribersPerVideo')}
          style={{ width: columnWidths[7] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(7, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscriptionRate')}
          {sortMenuOpen === 'subscribersPerVideo' && (
            <div className="sort-menu">
              <div onClick={() => onSort('subscribersPerVideo', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('subscribersPerVideo', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 운영기간 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('operatingPeriod')}
          style={{ width: columnWidths[8] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(8, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.operatingPeriod')}
          {sortMenuOpen === 'operatingPeriod' && (
            <div className="sort-menu">
              <div onClick={() => onSort('operatingPeriod', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('operatingPeriod', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 총조회수 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('totalViews')}
          style={{ width: columnWidths[9] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(9, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalViews')}
          {sortMenuOpen === 'totalViews' && (
            <div className="sort-menu">
              <div onClick={() => onSort('totalViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('totalViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        {/* 리사이즈 핸들러 추가 - 평균조회수 컬럼 */}
        <th 
          className="sortable-header category-header-resizable"
          onClick={() => onHeaderClick('avgViews')}
          style={{ width: columnWidths[10] }}
        >
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => onMouseDown(10, e)}></div>
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.avgViews')}
          {sortMenuOpen === 'avgViews' && (
            <div className="sort-menu">
              <div onClick={() => onSort('avgViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('avgViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        <th className="sortable-header"
          onClick={() => onHeaderClick('videosCount')}
        >
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalVideos')}
          {sortMenuOpen === 'videosCount' && (
            <div className="sort-menu">
              <div onClick={() => onSort('videosCount', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('videosCount', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        <th 
          className="sortable-header"
          onClick={() => onHeaderClick('uploadFrequency')}
        >
          {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.uploadFrequency')}
          {sortMenuOpen === 'uploadFrequency' && (
            <div className="sort-menu">
              <div onClick={() => onSort('uploadFrequency', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
              <div onClick={() => onSort('uploadFrequency', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
            </div>
          )}
        </th>
        <th className="sortable-header country-header">
          <button 
            className="country-select-button main-country-button"
            onClick={(e) => openDropdown('main', e)}
          >
            <span>{selectedCountry || '🌍'}</span>
            <svg className={`dropdown-arrow ${dropdownState.isOpen && dropdownState.type === 'main' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 20 20">
              <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
            </svg>
          </button>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;