import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface HelpButtonProps {
  helpContent?: React.ReactNode;
  title?: string;
  stepName?: string;
  checklistTitle?: React.ReactNode;
  checklistContent?: React.ReactNode;
  contactMessage?: React.ReactNode;
}

const HelpButton: React.FC<HelpButtonProps> = ({
  helpContent,
  title = "도움이 필요하신가요?",
  stepName = "영상분석",
  checklistTitle = "영상 분석이 가능한 경우",
  checklistContent,
  contactMessage
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Help Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 20,
        cursor: 'pointer',
        fontSize: '16px',
        padding: '0',
        borderRadius: '12px',
        width: '70px',
        height: '70px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid red',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onClick={() => setShowModal(true)}
      >
        <span style={{ fontSize: '25px' }}>❓</span>
        <span style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>help</span>
      </div>

      {/* Help Modal */}
      {showModal && createPortal(
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
        }}
        onClick={() => setShowModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
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
                {title}
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

            <div>
              {/* Green block with checklist */}
              <div style={{
                backgroundColor: '#EBFAF5',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '20px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  color: '#2DAB84',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  ✅ {checklistTitle}
                </div>
                <div style={{
                  color: '#2DAB84',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {checklistContent || (
                    <>
                      1. Chrome 브라우저<br />
                      <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>
                        <img
                          src="https://www.google.com/chrome/static/images/chrome-logo.svg"
                          alt="Chrome Browser"
                          style={{
                            width: '32px',
                            height: '32px'
                          }}
                        />
                      </div>
                      2. 60초 이하 쇼츠 유튜브 동영상<br />
                      3. 양호한 인터넷 상태<br />
                      4. 콘텐츠를 위반하지 않은 쇼츠
                    </>
                  )}
                </div>
              </div>

              {/* Custom content block */}
              {helpContent && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '1rem',
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                  marginBottom: '1rem'
                }}>
                  {helpContent}
                </div>
              )}

              {/* Third block */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '1rem',
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  {contactMessage || (
                    <>
                      위 내용을 지켰음에도<br />분석하기가 안된다면, 스크린샷(선택사항)과 오류 내용을 보내주세요.
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  onClick={() => {
                    const emailBody = `이 내용은 지우지말아주세요. 현재 오류가 난 곳은 쇼츠메이커 "${stepName}" 단계입니다.

오류 내용:
[여기에 오류 내용을 적어주세요]

스크린샷:
[선택사항 - 스크린샷이 있으시면 첨부해주세요]`;

                    const mailtoLink = `mailto:help.vidhunt@gmail.com?subject=${encodeURIComponent(`${stepName} 단계 문의`)}&body=${encodeURIComponent(emailBody)}`;
                    window.open(mailtoLink, '_blank');
                  }}
                  >
                    help center 에 이메일 보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default HelpButton;