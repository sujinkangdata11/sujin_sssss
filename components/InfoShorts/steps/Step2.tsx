import React from 'react';
import HelpButton from '../../shared/HelpButton';
import DeveloperApiButton from '../../shared/DeveloperApiButton';

interface Step2Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Step2: React.FC<Step2Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  apiKey,
  setApiKey
}) => {
  return (
    <div className="step-card" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      width: '100%',
      height: 'fit-content',
      opacity: currentStep === 2 ? 1 : 0,
      visibility: currentStep === 2 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 2 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 2;
        if (currentStep === stepNumber) return 'translateX(0)';
        if (navigationDirection) {
          if (previousStep === stepNumber) {
            return navigationDirection === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
          }
          if (currentStep === stepNumber) {
            return navigationDirection === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
          }
        }
        return stepNumber > (currentStep || 1) ? 'translateX(100%)' : 'translateX(-100%)';
      })(),
      transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }}>
      <HelpButton
        stepName="Gemini 키 입력"
        checklistTitle={
          <>
            Gemini API 키 를 얻는 것이 어려울 경우,<br />
            아래 개발자가 미리 등록한 API를 쓰세요
          </>
        }
        checklistContent={
          <>
            1. 주의 ㅣ 동시에 여러명이 사용할 경우 동작이 안될 수 있음<br />
            2. 주의 ㅣ API 할당량이 소요되면 동작이 안될 수 있음<br />
            <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <DeveloperApiButton
                onApiKeySet={(apiKey) => setApiKey(apiKey)}
                buttonText="개발자 API 키 사용하기"
              />
            </div>
          </>
        }
        contactMessage={
          <>
            Gemini 키 관련 궁금하신 것이 있거나 오류가 있다면,<br />
            스크린샷(선택사항)과 오류내용을 보내주세요.
          </>
        }
      />

      {/* Gemini API Key 입력 섹션 */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          border: '0.5px solid rgb(209, 213, 219)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          width: '800px'
        }}>
          <h2 style={{
            fontWeight: 'bold', 
            color: '#333d4b', 
            fontSize: '18px',
            margin: 0,
            textAlign: 'center'
          }}>
            Gemini API Key를 입력해주세요.
          </h2>
          
          {/* 보안 안내 메시지 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#EBFAF5',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '340px',
            margin: '4px auto 0 auto',
            opacity: '0.8',
            fontSize: '16px',
            color: '#2DAB84'
          }}>
            <svg className="inline mr-2" width="20" height="16" viewBox="0 0 24 24" fill="#10b981" style={{ transform: 'translateY(4px)', flexShrink: 0, marginTop: '2px' }}>
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" transform="scale(1.2, 1) translate(0, -1)"/>
            </svg>
            <span>
              보안을 위해 이 API 키를 저장하지 않습니다.<br/>새로고침하면 키 값이 사라집니다.
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            width: '100%'
          }}>
            <input
              id="apiKey2"
              type={apiKey === 'DEVELOPER_API_KEY_ACTIVE' ? 'text' : 'password'}
              readOnly={apiKey === 'DEVELOPER_API_KEY_ACTIVE'}
              placeholder="Enter your Gemini API key..."
              value={apiKey === 'DEVELOPER_API_KEY_ACTIVE' ? '개발자 api키를 입력완료' : apiKey}
              onChange={(e) => {
                // 개발자 키 사용 상태가 아닐 때만 변경 허용
                if (apiKey !== 'DEVELOPER_API_KEY_ACTIVE') {
                  setApiKey(e.target.value);
                }
              }}
              style={{
                width: '340px',
                backgroundColor: apiKey === 'DEVELOPER_API_KEY_ACTIVE' ? '#f0f9ff' : 'rgb(249, 250, 251)',
                border: apiKey === 'DEVELOPER_API_KEY_ACTIVE' ? '1px solid #10b981' : '0.5px solid rgb(124, 58, 237)',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-sm)',
                padding: '0.875rem var(--spacing-4)',
                color: '#000000',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
                textAlign: 'center',
                height: '48px'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #7c3aed';
                e.target.style.outline = 'none';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.border = '0.5px solid #d1d5db';
                e.target.style.background = 'white';
              }}
              onMouseEnter={(e) => {
                if (e.target.style.border.includes('#7c3aed')) return;
                e.target.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                if (e.target.style.border.includes('#7c3aed')) return;
                e.target.style.background = 'white';
              }}
            />
          </div>
        </div>
      </div>

      {/* 사용방법 안내 섹션 */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          border: '0.5px solid rgb(209, 213, 219)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          width: '800px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            justifyContent: 'center'
          }}>
            <h2 style={{
              fontWeight: 'bold', 
              color: '#333d4b', 
              fontSize: '18px',
              margin: 0,
              textAlign: 'center'
            }}>
              사용방법 안내
            </h2>
            
            <button
              onClick={() => window.open('https://aistudio.google.com/apikey', '_blank')}
              style={{
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
              }}
            >
              API키 바로얻기
              <svg className="free-badge-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '12px', height: '12px', strokeWidth: 2, marginLeft: '4px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
          
          {/* YouTube 동영상 임베드 */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/JmQe-AIYh3w?si=VGrKb044BE-6CG1a&autoplay=1&mute=1&loop=1"
              title="API 키 사용방법 안내"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: '12px',
                maxWidth: '100%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;