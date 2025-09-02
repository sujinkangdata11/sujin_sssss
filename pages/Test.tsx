import React, { useState } from 'react';
import { Language, YouTubeShort } from '../types';
import RandomSearchModal from '../components/RandomSearchModal';
import ShortsCardNew from '../components/ShortsCardNew';

interface TestProps {
  language: Language;
}

const Test: React.FC<TestProps> = ({ language }) => {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchResults = (results: YouTubeShort[], searching: boolean, error: string | null) => {
    setShorts(results);
    setIsSearching(searching);
    if (!searching) {
      setIsModalOpen(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 ShortsCard New Design Test</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        테스트용 페이지입니다. 새로운 쇼츠 카드 디자인을 실제 데이터로 테스트합니다.
      </p>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '30px',
          fontSize: '16px'
        }}
      >
        🔍 럭키서치로 테스트 데이터 가져오기
      </button>

      {shorts.length > 0 && (
        <div>
          <h2>📊 테스트 결과 ({shorts.length}개)</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px',
            marginTop: '20px'
          }}>
            {shorts.map((short, index) => (
              <ShortsCardNew
                key={short.id}
                short={short}
                language={language}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      <RandomSearchModal
        language={language}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResults={handleSearchResults}
      />
    </div>
  );
};

export default Test;