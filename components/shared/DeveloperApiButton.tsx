import React, { useState } from 'react';

interface DeveloperApiButtonProps {
  onApiKeySet: (apiKey: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

const DeveloperApiButton: React.FC<DeveloperApiButtonProps> = ({
  onApiKeySet,
  buttonText = "개발자 API 키 사용하기",
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // API 키 복호화 함수 (럭키서치와 동일한 로직)
  const decryptApiKey = (encryptedKey: string): string => {
    if (encryptedKey.length < 1) return encryptedKey;
    const front1 = encryptedKey.substring(0, 1);
    const rest = encryptedKey.substring(1);
    const decrypted = rest + front1;
    console.log(`🔑 Decrypting: ${encryptedKey} → ${decrypted}`);
    return decrypted;
  };

  // Gemini API 키 테스트 함수 (럭키서치와 동일한 로직)
  const testGeminiApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'test' }]
          }]
        })
      });
      return response.status !== 401 && response.status !== 403 && response.status !== 429;
    } catch (error) {
      console.error('Gemini API key test failed:', error);
      return false;
    }
  };

  // 작동하는 Gemini API 키 찾기 (럭키서치와 동일한 로직)
  const findWorkingGeminiKey = async (apiKeys: string[]): Promise<string | null> => {
    for (const key of apiKeys) {
      console.log(`🔍 Testing Gemini key: ${key.substring(0, 10)}...`);
      if (await testGeminiApiKey(key)) {
        console.log(`✅ Working Gemini key found: ${key.substring(0, 10)}...`);
        return key;
      }
      console.log(`❌ Gemini key failed: ${key.substring(0, 10)}...`);
    }
    return null;
  };

  // 개발자 API 키 가져오기 (럭키서치와 동일한 로직, keys1.txt 사용)
  const getDeveloperApiKey = async (): Promise<string | null> => {
    try {
      setIsLoading(true);

      // keys1.txt 파일에서 API 키들을 읽어오기 (캐시 방지를 위한 timestamp 추가)
      const timestamp = Date.now();
      const apiKeysResponse = await fetch(`/keys1.txt?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!apiKeysResponse.ok) {
        throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      }

      const apiKeysText = await apiKeysResponse.text();
      const lines = apiKeysText.split('\n').filter(line => line.trim());

      let geminiApiKeys: string[] = [];

      for (const line of lines) {
        if (line.startsWith('GEMINI_API_KEYS=')) {
          const encryptedKeys = line.split('=')[1].split(',').map(key => key.trim().replace(/"/g, ''));
          geminiApiKeys = encryptedKeys.map(key => decryptApiKey(key));
        }
      }

      if (geminiApiKeys.length === 0) {
        throw new Error('사용 가능한 Gemini API 키가 없습니다.');
      }

      // 작동하는 키 찾기 (키 로테이션)
      const workingKey = await findWorkingGeminiKey(geminiApiKeys);

      if (!workingKey) {
        throw new Error('아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.');
      }

      return workingKey;

    } catch (error: any) {
      console.error('Failed to get developer API key:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    try {
      const apiKey = await getDeveloperApiKey();
      if (apiKey) {
        // 실제 복호화된 키를 직접 전달
        console.log('🔑 실제 API 키 전달:', apiKey);
        onApiKeySet(apiKey);
        setIsSuccess(true);
      }
    } catch (error: any) {
      alert(error.message || '개발자 API 키를 가져오는데 실패했습니다.');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || isSuccess}
      style={{
        backgroundColor: isSuccess ? '#059669' : isLoading ? '#6b7280' : '#10b981',
        border: 'none',
        borderRadius: '12px',
        padding: '8px 16px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: disabled || isLoading || isSuccess ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading && !isSuccess) {
          e.currentTarget.style.backgroundColor = '#059669';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading && !isSuccess) {
          e.currentTarget.style.backgroundColor = '#10b981';
        }
      }}
    >
      {isLoading && (
        <div style={{
          width: '14px',
          height: '14px',
          border: '2px solid transparent',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {isLoading ? '키 확인 중...' : isSuccess ? 'API 키 입력완료' : buttonText}
    </button>
  );
};

export default DeveloperApiButton;