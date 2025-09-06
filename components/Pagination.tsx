import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // 이전 버튼
  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 3L4.5 6l3 3"/>
        </svg>
      </button>
    );
  }
  
  // 페이지 번호들
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 첫 페이지 근처에 있을 때 조정
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }
  
  // 다음 버튼
  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3l3 3-3 3"/>
        </svg>
      </button>
    );
  }

  return <div className="pagination">{pages}</div>;
};

export default Pagination;