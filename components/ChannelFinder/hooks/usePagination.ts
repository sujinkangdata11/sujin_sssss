import { useState, useMemo } from 'react';
import { ChannelData } from '../types';

export const usePagination = (channels: ChannelData[], itemsPerPage: number = 40) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 현재 페이지의 채널들 계산
  const currentPageChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return channels.slice(startIndex, endIndex);
  }, [channels, currentPage, itemsPerPage]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(channels.length / itemsPerPage);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentPage,
    setCurrentPage,
    currentPageChannels,
    totalPages,
    handlePageChange
  };
};