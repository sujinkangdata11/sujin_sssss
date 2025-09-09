import React from 'react';
import { Language } from '../../../types';
import { ChannelData } from '../types';
import { formatUploadFrequency } from '../utils';
import { RESPONSIVE_COLUMN_CONFIG } from '../constants';
import styles from '../../../styles/ChannelFinder.module.css';

interface TableRowProps {
  channel: ChannelData;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  language: Language;
  onChannelClick: (channel: ChannelData) => void;
  formatSubscribers: (count: number) => string;
  formatGrowth: (growth: number) => string;
  formatNumber: (num: number) => string;
  formatOperatingPeriod: (period: number) => string;
  formatViews: (views: number) => string;
  formatVideosCount: (count: number) => string;
  getCountryDisplayName: (language: Language, country: string) => string;
}

const TableRow: React.FC<TableRowProps> = ({
  channel,
  index,
  currentPage,
  itemsPerPage,
  language,
  onChannelClick,
  formatSubscribers,
  formatGrowth,
  formatNumber,
  formatOperatingPeriod,
  formatViews,
  formatVideosCount,
  getCountryDisplayName
}) => {
  // 우선순위 클래스 생성 헬퍼 함수
  const getPriorityClass = (columnKey: keyof typeof RESPONSIVE_COLUMN_CONFIG.COLUMN_PRIORITIES) => {
    const priority = RESPONSIVE_COLUMN_CONFIG.COLUMN_PRIORITIES[columnKey];
    return styles[`priority${priority}`];
  };

  return (
    <tr 
      key={channel.rank}
      className="channel-row"
      onClick={() => onChannelClick(channel)}
    >
      <td className={getPriorityClass('rank')}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td className={`channel-name ${getPriorityClass('channelName')}`}>
        <span className="rank-badge">
          {channel.thumbnailUrl && (
            <img 
              src={channel.thumbnailUrl} 
              alt={channel.channelName}
              className="rank-badge-img"
            />
          )}
        </span>
        <span className="name">{channel.channelName}</span>
      </td>
      <td className={getPriorityClass('category')}>{channel.category}</td>
      <td className={`subscribers ${getPriorityClass('subscribers')}`}>{formatSubscribers(channel.subscribers)}</td>
      <td className={`monthly-revenue ${getPriorityClass('monthlyRevenue')}`}>{getTableMonthlyRevenue(channel)}</td>
      <td className={`growth positive ${getPriorityClass('monthlyGrowth')}`}>{formatGrowth(channel.monthlyGrowth)}</td>
      <td className={`growth positive ${getPriorityClass('dailyGrowth')}`}>{formatGrowth(channel.dailyGrowth)}</td>
      <td className={getPriorityClass('subsPerVideo')}>{formatNumber(channel.subscribersPerVideo)}</td>
      <td className={`period ${getPriorityClass('operatingPeriod')}`}>{formatOperatingPeriod(channel.operatingPeriod)}</td>
      <td className={`total-views ${getPriorityClass('totalViews')}`}>{formatViews(channel.totalViews)}</td>
      <td className={`avg-views ${getPriorityClass('avgViews')}`}>{formatViews(channel.avgViews)}</td>
      <td className={getPriorityClass('videoCount')}>{formatVideosCount(channel.videosCount)}</td>
      <td className={`upload-frequency ${getPriorityClass('uploadFreq')}`}>{formatUploadFrequency(channel.uploadFrequency, language)}</td>
      <td className={`country ${getPriorityClass('country')}`}>{getCountryDisplayName(language, channel.country)}</td>
    </tr>
  );
};

export default TableRow;