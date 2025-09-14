import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../InfoShorts.module.css';

interface Step3Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  whiteColumnRef: React.RefObject<HTMLDivElement>;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  ChevronDown: ({ isOpen }: { isOpen: boolean }) => JSX.Element;
  analysisTypes: Record<string, string>;
  expandedAnalysis: string;
  setExpandedAnalysis: (type: string) => void;
  scrollToColumn: (columnRef: React.RefObject<HTMLDivElement>) => void;
  c: (...args: any[]) => string;
  customAnalysisPrompt: string;
  setCustomAnalysisPrompt: (prompt: string) => void;
  handleAnalyzeContent: (type: string) => void;
  apiKey: string;
  isLoadingAnalysis: boolean;
  LoadingMessage: ({ type }: { type?: 'default' | 'voice' | 'srt' }) => JSX.Element;
  analysisResult: string;
  selectedAnalysisType: string;
  DownloadCopyButtons: ({ content, filename }: { content: string; filename: string }) => JSX.Element;
}

const Step3: React.FC<Step3Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  whiteColumnRef,
  selectedLanguage,
  setSelectedLanguage,
  ChevronDown,
  analysisTypes,
  expandedAnalysis,
  setExpandedAnalysis,
  scrollToColumn,
  c,
  customAnalysisPrompt,
  setCustomAnalysisPrompt,
  handleAnalyzeContent,
  apiKey,
  isLoadingAnalysis,
  LoadingMessage,
  analysisResult,
  selectedAnalysisType,
  DownloadCopyButtons
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ type: string; prompt: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('과학적 관점');
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
      opacity: currentStep === 3 ? 1 : 0,
      visibility: currentStep === 3 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 3 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 3;
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

      {/* 상단: 분석 옵션 선택 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div className="button-column-step3" ref={whiteColumnRef} style={{
          background: '#eaedf1',
          borderRadius: '20px',
          padding: '2rem',
          width: '800px',
          height: '550px',
          overflow: 'hidden'
        }}>
          <div className="modeSelector">
            <div>
              <h2 style={{ fontWeight: 'bold', color: '#333d4b', fontSize: '18px', textAlign: 'center', marginBottom: '1.5rem' }}>관점 분석 유형을 선택하세요</h2>

              <div className="modeList">
                {Object.entries(analysisTypes).map(([type, prompt]) => (
                  <div key={type}>
                    <button
                      className={c('button', {
                        active: type === selectedMode,
                      })}
                      onClick={() => {
                        setSelectedMode(type);
                        setModalContent({ type, prompt });
                        setShowModal(true);
                      }}
                      style={{width: '200px', height: '200px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="emoji" style={{ fontSize: '35px', marginBottom: '8px' }}>
                          {type === '커스텀' ? '🔧' : type === '역사적 관점' ? '🏛️' : type === '과학적 관점' ? '🧪' : type === '바이럴 쇼츠용' ? '🔥' : '📝'}
                        </span>
                        <span>{type}</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 분석하기 버튼 */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <button
          className="button generateButton"
          onClick={() => {
            if (selectedMode) {
              handleAnalyzeContent(selectedMode);
            } else {
              alert('분석 타입을 선택해주세요.');
            }
          }}
          disabled={!selectedMode || (selectedMode === '커스텀' && !customAnalysisPrompt.trim())}
          style={{
            borderRadius: '12px',
            background: '#7c3aed',
            transition: 'all 0.2s ease',
            width: '120px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isLoadingAnalysis ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '분석하기'
          )}
        </button>
      </div>

      {/* 로딩 메시지 */}
      {isLoadingAnalysis && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginBottom: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <LoadingMessage />
          </div>
        </div>
      )}

      {/* 결과 출력 영역 */}
      {analysisResult && (
        <div style={{ 
          width: '100%',
          marginTop: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <DownloadCopyButtons 
              content={analysisResult}
              filename={`분석결과_${selectedAnalysisType}`}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="output-box-step3">
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.7',
              fontSize: '15px',
              color: '#333'
            }}>
              {analysisResult.replace(/\\n/g, '\n')}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal via Portal */}
      {showModal && modalContent && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#333d4b', 
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {modalContent.type} 분석
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}>
              {modalContent.type === '커스텀' ? (
                <div>
                  <textarea
                    placeholder="커스텀 분석을 위한 프롬포트를 입력하세요..."
                    value={customAnalysisPrompt}
                    onChange={(e) => setCustomAnalysisPrompt(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: '1.5'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '1rem' 
                  }}>
                    <button
                      onClick={() => {
                        if (customAnalysisPrompt.trim()) {
                          setShowModal(false);
                        }
                      }}
                      disabled={!customAnalysisPrompt.trim()}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: customAnalysisPrompt.trim() ? '#7c3aed' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: customAnalysisPrompt.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {modalContent.prompt.replace(/\\n/g, '\n')}
                </div>
              )}
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step3;