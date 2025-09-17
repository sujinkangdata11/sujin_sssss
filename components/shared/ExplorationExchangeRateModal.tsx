import React from 'react';
import { createPortal } from 'react-dom';
import { Language } from '../../types';
import { getChannelFinderTranslation, channelFinderI18n } from '../../i18n/channelFinderI18n';

interface ExplorationExchangeRateModalProps {
  isOpen: boolean;
  tempExchangeRate: number;
  onTempRateChange: (rate: number) => void;
  onClose: () => void;
  onApply: () => void;
  language: Language;
  currencySymbol: string;
}

const ExplorationExchangeRateModal: React.FC<ExplorationExchangeRateModalProps> = ({
  isOpen,
  tempExchangeRate,
  onTempRateChange,
  onClose,
  onApply,
  language,
  currencySymbol
}) => {
  if (!isOpen) return null;

  // 채널파인더와 완전 동일한 모달 스타일 (CSS에서 복사)
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11000
  };

  const modalStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    width: '400px',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    padding: '20px 24px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const headerTitleStyle: React.CSSProperties = {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid transparent',
    fontSize: '28px',
    color: '#666',
    cursor: 'pointer',
    padding: '0',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    textAlign: 'center' as const,
    boxShadow: 'none'
  };

  const exchangeDisplayStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '20px',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '20px',
    width: '120px',
    textAlign: 'center' as const,
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 24px 24px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '10px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: '#f8f9fa',
    color: '#666',
    border: '1px solid #e9ecef'
  };

  const confirmButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: '#7c4dff',
    color: 'white'
  };

  return createPortal(
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={headerTitleStyle}>{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</h3>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={contentStyle}>
          <div style={exchangeDisplayStyle}>
            <span>$ 1 = </span>
            <input
              type="number"
              value={tempExchangeRate}
              onChange={(e) => onTempRateChange(Number(e.target.value))}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#7c4dff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
            <span>{currencySymbol}</span>
          </div>
        </div>

        <div style={footerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
          >
            {getChannelFinderTranslation(channelFinderI18n, language, 'buttons.cancel')}
          </button>
          <button
            style={confirmButtonStyle}
            onClick={onApply}
            onMouseEnter={(e) => e.currentTarget.style.background = '#6a3de8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#7c4dff'}
          >
            {getChannelFinderTranslation(channelFinderI18n, language, 'buttons.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExplorationExchangeRateModal;