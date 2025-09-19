import React from 'react';

interface HeartIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  size = 24,
  className = '',
  style = {}
}) => {
  const defaultStyle: React.CSSProperties = {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    animation: 'heartPulse 2s ease-in-out infinite',
    ...style
  };

  return (
    <>
      <style>{`
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .heart-icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div
        className={`heart-icon-container ${className}`}
        style={defaultStyle}
        title="이 채널은 채널파인더에 등록되어 있습니다"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 하트 배경 (흰색 테두리) */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="white"
            stroke="#e91e63"
            strokeWidth="1"
          />
          {/* 하트 메인 */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#e91e63"
          />
          {/* 하트 하이라이트 */}
          <path
            d="M8.5 5c1.4 0 2.7.6 3.5 1.5.8-.9 2.1-1.5 3.5-1.5 2.2 0 4 1.8 4 4 0 2.8-2.5 5.2-6.8 9.2L12 18l-.7-.8C6.5 13.2 4.5 10.8 4.5 9c0-2.2 1.8-4 4-4z"
            fill="#ff4081"
            opacity="0.8"
          />
          {/* 하트 글로우 효과 */}
          <circle
            cx="9"
            cy="7"
            r="1.5"
            fill="rgba(255, 255, 255, 0.6)"
            opacity="0.7"
          />
        </svg>
      </div>
    </>
  );
};

export default HeartIcon;