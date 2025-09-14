import React, { useState, useEffect } from 'react';

interface FloatingNavigationProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  youtubeVideoId?: string;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  currentStep,
  setCurrentStep,
  totalSteps,
  youtubeVideoId
}) => {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    if (youtubeVideoId) {
      // 비디오가 로드되면 1초 후에 플로팅 버튼 표시
      const timer = setTimeout(() => {
        setShowFloating(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 비디오가 없으면 플로팅 버튼 숨김
      setShowFloating(false);
    }
  }, [youtubeVideoId]);
  const stepNames = [
    '링크 입력',
    '영상 분석', 
    '관점 분석',
    '대사 쓰기',
    '음성 생성',
    '관련 영상'
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '16px 24px',
      width: '880px',
      height: '70px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '20px',
      zIndex: 1000,
      fontSize: '14px',
      fontWeight: '500',
      opacity: showFloating ? 1 : 0,
      visibility: showFloating ? 'visible' : 'hidden',
      pointerEvents: showFloating ? 'auto' : 'none',
      transform: `translateX(-50%) translateY(${showFloating ? '0' : '50px'})`,
      transition: 'opacity 1s ease-out, transform 1s ease-out, visibility 1s ease-out'
    }}>
      {/* Previous Button */}
      <button
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        style={{
          padding: '8px 16px',
          width: '123px',
          height: '52px',
          background: currentStep === 1 ? '#f3f4f6' : 'rgb(209, 213, 219)',
          color: currentStep === 1 ? '#9ca3af' : 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          if (currentStep !== 1) {
            (e.target as HTMLElement).style.background = 'rgb(156, 163, 175)';
          }
        }}
        onMouseOut={(e) => {
          if (currentStep !== 1) {
            (e.target as HTMLElement).style.background = 'rgb(209, 213, 219)';
          }
        }}
      >
← 이전
      </button>

      {/* Step Indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 16px'
      }}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            onClick={() => setCurrentStep(step)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div 
              style={{
                width: '60px',
                height: '10px',
                borderRadius: '5px',
                background: step === currentStep ? '#7c3aed' : step < currentStep ? '#7c3aed' : '#e5e7eb',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                const currentBg = step === currentStep ? '#7c3aed' : step < currentStep ? '#7c3aed' : '#e5e7eb';
                if (currentBg === '#e5e7eb') {
                  (e.target as HTMLElement).style.background = '#d1d5db';
                } else {
                  (e.target as HTMLElement).style.background = '#6d28d9';
                }
              }}
              onMouseOut={(e) => {
                const originalBg = step === currentStep ? '#7c3aed' : step < currentStep ? '#7c3aed' : '#e5e7eb';
                (e.target as HTMLElement).style.background = originalBg;
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => {
          setCurrentStep(Math.min(totalSteps, currentStep + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentStep === totalSteps}
        style={{
          padding: '8px 16px',
          width: '90px',
          height: '52px',
          background: currentStep === totalSteps ? '#f3f4f6' : '#7c3aed',
          color: currentStep === totalSteps ? '#9ca3af' : 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: currentStep === totalSteps ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          if (currentStep !== totalSteps) {
            (e.target as HTMLElement).style.background = '#6d28d9';
          }
        }}
        onMouseOut={(e) => {
          if (currentStep !== totalSteps) {
            (e.target as HTMLElement).style.background = '#7c3aed';
          }
        }}
      >
다음 →
      </button>
    </div>
  );
};

export default FloatingNavigation;