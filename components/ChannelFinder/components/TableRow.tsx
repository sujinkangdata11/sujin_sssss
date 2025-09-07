import React from 'react';
import { Language } from '../../../types';
import { ChannelData } from '../types';
import { formatUploadFrequency } from '../utils';

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
  return (
    <tr 
      key={channel.rank}
      className="channel-row"
      onClick={() => onChannelClick(channel)}
    >
      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td className="channel-name">
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
      <td>{channel.category}</td>
      <td className="subscribers">{formatSubscribers(channel.subscribers)}</td>
      <td className="growth positive">{formatGrowth(channel.yearlyGrowth)}</td>
      <td className="growth positive">{formatGrowth(channel.monthlyGrowth)}</td>
      <td className="growth positive">{formatGrowth(channel.dailyGrowth)}</td>
      <td>{formatNumber(channel.subscribersPerVideo)}</td>
      <td className="period">{formatOperatingPeriod(channel.operatingPeriod)}</td>
      <td className="total-views">{formatViews(channel.totalViews)}</td>
      <td className="avg-views">{formatViews(channel.avgViews)}</td>
      <td>{formatVideosCount(channel.videosCount)}</td>
      <td className="upload-frequency">{formatUploadFrequency(channel.uploadFrequency, language)}</td>
      <td className="country">{getCountryDisplayName(language, channel.country)}</td>
    </tr>
  );
};

export default TableRow;