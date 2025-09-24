import React from 'react';
import { createPortal } from 'react-dom';
import { Language } from '../../../types';
import { getChannelFinderTranslation, channelFinderI18n } from '../../../i18n/channelFinderI18n';

interface LoadingModalProps {
  isOpen: boolean;
  language: Language;
  progress: number; // 0-100
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  language,
  progress,
  message
}) => {
  if (!isOpen) return null;

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11000,
    pointerEvents: 'none'
  };

  const modalStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    width: '400px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    pointerEvents: 'auto'
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '40px',
    marginBottom: '16px',
    animation: 'spin 1.5s linear infinite'
  };

  const titleStyle: React.CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#333'
  };

  const messageStyle: React.CSSProperties = {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4'
  };

  const progressContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '16px'
  };

  const progressBarStyle: React.CSSProperties = {
    width: `${progress}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #7c4dff 0%, #9c27b0 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease-out'
  };

  const progressTextStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#7c4dff',
    margin: '0'
  };

  // CSS 애니메이션을 위한 스타일 태그
  const animationCSS = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const defaultMessage = getChannelFinderTranslation(channelFinderI18n, language, 'loading.channelData') || '잠시만 기다려주세요...';

  return createPortal(
    <>
      <style>{animationCSS}</style>
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <div style={iconStyle}>⏳</div>
          <h3 style={titleStyle}>
            {getChannelFinderTranslation(channelFinderI18n, language, 'loading.title') || '데이터 로딩 중'}
          </h3>
          <p style={messageStyle}>
            {message || defaultMessage}
          </p>
          <div style={progressContainerStyle}>
            <div style={progressBarStyle}></div>
          </div>
          <p style={progressTextStyle}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </>,
    document.body
  );
};

export default LoadingModal;