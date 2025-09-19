import React from 'react';
import styles from '../InfoShorts.module.css';

interface Step7Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  sixthColumnRef: React.RefObject<HTMLDivElement>;
  handleKeywordExtraction: () => void;
  apiKey: string;
  youtubeVideoId: string;
  isExtractingKeywords: boolean;
  extractedKeywords: string;
  scrollToColumn: (columnRef: React.RefObject<HTMLDivElement>) => void;
  keywordExtractionError: string;
}

const Step7: React.FC<Step7Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  sixthColumnRef,
  handleKeywordExtraction,
  apiKey,
  youtubeVideoId,
  isExtractingKeywords,
  extractedKeywords,
  scrollToColumn,
  keywordExtractionError
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
      opacity: currentStep === 7 ? 1 : 0,
      visibility: currentStep === 7 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 7 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 7;
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
      
      <div className="sixth-column" ref={sixthColumnRef} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        minWidth: '800px',
        maxWidth: '800px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#333', fontSize: '18px', margin: 0 }}>관련 영상 더 찾기</h3>
        </div>
        
        <div style={{ 
          marginBottom: '15px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <button
            className="button generateButton"
            onClick={handleKeywordExtraction}
            disabled={!apiKey.trim() || !youtubeVideoId || isExtractingKeywords}
            style={{ 
              width: '170px', 
              marginBottom: '10px', 
              fontSize: '15px', 
              border: 'none',
              backgroundColor: 'rgb(124, 58, 237)',
              color: 'white',
              borderRadius: '12px'
            }}
          >
            {isExtractingKeywords ? '키워드 추출 중...' : '영상 키워드 추출'}
          </button>
          
          {keywordExtractionError && (
            <div style={{
              color: 'red',
              fontSize: '15px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {keywordExtractionError}
            </div>
          )}
          
          <div style={{
            marginTop: '10px',
            marginBottom: '15px',
            padding: '15px',
            background: extractedKeywords ? '#f8f9fa' : '#fafafa',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            color: '#333',
            width: '400px'
          }}>
            <h4 style={{ 
              marginBottom: '10px', 
              color: 'rgb(153, 153, 153)', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              키워드 리스트
            </h4>
            <div style={{ 
              minHeight: '80px'
            }}>
              {extractedKeywords ? (
                extractedKeywords.split('\n').filter(keyword => keyword.trim()).map((keyword, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '6px 0',
                    fontSize: '16px',
                    color: '#333'
                  }}>
                    <span style={{ flex: 1 }}>
                      {keyword.trim()}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(keyword.trim());
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '✅';
                        setTimeout(() => {
                          btn.innerHTML = originalText;
                        }, 1000);
                      }}
                      style={{
                        marginLeft: '8px',
                        padding: '4px 6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#666'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="키워드 복사"
                    >
                      📋 복사
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ 
                  color: 'rgb(153, 153, 153)',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  키워드 추출 버튼을 눌러서 영상의 키워드를 추출해보세요.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#856404',
          lineHeight: '1.5',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '400px'
        }}>
          <div style={{ marginBottom: '15px', fontSize: '15px' }}>
            ⚠️ 페이지를 이동하면 이곳의 내용이 전부 새로고침됩니다.<br/>중요한 정보는 다운로드와 복사해놓으세요
          </div>
          <button
            className="button generateButton"
            onClick={() => {
              window.open('/', '_blank');
            }}
            style={{ 
              fontSize: '15px', 
              width: '200px',
              backgroundColor: 'rgb(241, 223, 167)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            쇼츠 파인더에서 영상찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7;