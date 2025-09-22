/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useRef, useState, useEffect } from 'react';
import c from 'classnames';
import './index.css';
import styles from './InfoShorts.module.css';
import {generateContent} from './api';
import {generateVoice, playAudioBuffer} from './tts';
///// Gemini STT import 추가 /////
import { generateSRTWithGeminiSTT, validateAndCleanSRT } from './tts/geminiSTT';
import functions from './functions';
import modes from './modes';
import {timeToSecs} from './utils';
import { processAudioFromArrayBuffer, AudioProcessingResult } from './audioProcessor';
import { Language } from '../../types';

import VideoPlayer from './VideoPlayer';
import { ChevronDown } from './components/ChevronDown';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import Step7 from './steps/Step7';
import FloatingNavigation from './components/FloatingNavigation';

// 텍스트 다운로드 및 복사 버튼 컴포넌트
interface DownloadCopyButtonsProps {
  content: string;
  filename: string;
}

const DownloadCopyButtons: React.FC<DownloadCopyButtonsProps> = ({ content, filename }) => {
  return (
    <>
      <button
        onClick={() => {
          const processedContent = content.replace(/\\n/g, '\n');
          const blob = new Blob([processedContent], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}_${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#7c3aed1a',
          color: '#7c3aed',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: 'normal',
          height: '48px',
          width: '200px'
        }}
      >
        📄 텍스트 다운받기
      </button>
      
      <button
        onClick={() => {
          const processedContent = content.replace(/\\n/g, '\n');
          navigator.clipboard.writeText(processedContent).then(() => {
            // 복사 완료 피드백
            const btn = document.activeElement as HTMLButtonElement;
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ 복사완료';
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 2000);
          });
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#7c3aed1a',
          color: '#7c3aed',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: 'normal',
          height: '48px',
          width: '200px'
        }}
      >
        📋 복사하기
      </button>
    </>
  );
};

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface InfoShortsProps {
  language: Language;
}

const InfoShorts: React.FC<InfoShortsProps> = ({ language }) => {
  // 단계별 진행 상태 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(1);
  const [navigationDirection, setNavigationDirection] = useState<'next' | 'prev' | null>(null);
  
  // 커스텀 setCurrentStep 함수 - 방향 감지
  const handleStepChange = (newStep: number) => {
    if (newStep > currentStep) {
      setNavigationDirection('next');
    } else if (newStep < currentStep) {
      setNavigationDirection('prev');
    }
    setPreviousStep(currentStep);
    setCurrentStep(newStep);
    
    // 애니메이션 후 상태 초기화
    setTimeout(() => {
      setNavigationDirection(null);
      setPreviousStep(newStep);
    }, 800);
  };
  
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);

  // 디버깅: youtubeVideoId 상태 변화 추적
  useEffect(() => {
    console.log('🎯 [HEIGHT DEBUG] youtubeVideoId 변경됨:', youtubeVideoId);
    console.log('🎯 [HEIGHT DEBUG] currentStep:', currentStep);
    console.log('🎯 [HEIGHT DEBUG] 계산된 높이:', (youtubeVideoId && currentStep === 1) ? '250vh' : '200vh');
  }, [youtubeVideoId, currentStep]);

  // 전역 이벤트 리스너 - ExplorationSidebar에서 URL 받기
  useEffect(() => {
    const handleSetYoutubeUrl = (event: CustomEvent) => {
      const url = event.detail?.url;
      if (url) {
        console.log('🎯 전역 이벤트로 URL 받음:', url);
        setYoutubeUrlInput(url);

        // URL 입력 후 자동으로 확인 버튼 클릭
        setTimeout(() => {
          const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton) {
            console.log('🚀 확인 버튼 자동 클릭');
            submitButton.click();
          } else {
            console.log('❌ 확인 버튼을 찾을 수 없습니다');
            // 대안: 텍스트로 찾기
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
              if (btn.textContent?.includes('확인')) {
                console.log('🚀 확인 버튼 (텍스트로) 자동 클릭');
                btn.click();
                break;
              }
            }
          }
        }, 300);
      }
    };

    window.addEventListener('setYoutubeUrl', handleSetYoutubeUrl as EventListener);

    return () => {
      window.removeEventListener('setYoutubeUrl', handleSetYoutubeUrl as EventListener);
    };
  }, []);

  // 입력 필드가 비워지면 비디오 ID도 초기화
  useEffect(() => {
    if (!youtubeUrlInput.trim()) {
      setYoutubeVideoId(null);
      setTimecodeList(null);
      setRequestedTimecode(null);
    }
  }, [youtubeUrlInput]);
  const [timecodeList, setTimecodeList] = useState(null);
  const [requestedTimecode, setRequestedTimecode] = useState(null);
  const [selectedMode, setSelectedMode] = useState(Object.keys(modes)[0]);
  const [activeMode, setActiveMode] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');

  // 🔑 키 관리 유틸리티 함수들
  const isDeveloperKey = (key: string): boolean => {
    return key === 'DEVELOPER_API_KEY_ACTIVE';
  };

  const getAllDeveloperKeys = async (): Promise<string[]> => {
    try {
      console.log('🔍 [KEY ROTATION] keys1.txt에서 모든 키 가져오기 시작...');

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
        throw new Error('keys1.txt 파일을 가져올 수 없습니다.');
      }

      const apiKeysText = await apiKeysResponse.text();
      const lines = apiKeysText.split('\n').filter(line => line.trim());

      let allKeys: string[] = [];

      for (const line of lines) {
        if (line.startsWith('GEMINI_API_KEYS=')) {
          const encryptedKeys = line.split('=')[1].split(',').map(key => key.trim().replace(/"/g, ''));

          // 모든 키 복호화 (첫 1자리를 뒤로 이동)
          const decryptedKeys = encryptedKeys.map(key => {
            if (key.length < 1) return key;
            const front1 = key.substring(0, 1);
            const rest = key.substring(1);
            return rest + front1;
          });

          allKeys = decryptedKeys;
          break;
        }
      }

      console.log(`✅ [KEY ROTATION] 총 ${allKeys.length}개의 키를 발견했습니다.`);
      allKeys.forEach((key, index) => {
        console.log(`🔑 [KEY ROTATION] 키 ${index + 1}: ${key.substring(0, 10)}...${key.slice(-4)}`);
      });

      return allKeys;
    } catch (error) {
      console.error('❌ [KEY ROTATION] getAllDeveloperKeys 실패:', error);
      throw error;
    }
  };

  // 🔄 키 로테이션이 포함된 API 호출 래퍼 함수
  const generateContentWithKeyRotation = async (
    prompt: string,
    functionDeclarations: any[],
    url: string,
    currentApiKey: string
  ) => {
    console.log('🚀 [KEY ROTATION] API 호출 시작...');

    // 개발자 키가 아니면 기존 방식으로 호출
    if (!isDeveloperKey(currentApiKey)) {
      console.log('🔑 [KEY ROTATION] 사용자 수동 입력 키 사용 - 기존 로직 적용');
      return await generateContent(prompt, functionDeclarations, url, currentApiKey);
    }

    console.log('🔑 [KEY ROTATION] 개발자 키 감지 - 키 로테이션 로직 적용');

    try {
      // 모든 개발자 키 가져오기
      const allKeys = await getAllDeveloperKeys();

      if (allKeys.length === 0) {
        throw new Error('사용 가능한 개발자 키가 없습니다.');
      }

      // 각 키를 순차적으로 시도
      for (let i = 0; i < allKeys.length; i++) {
        const keyToTry = allKeys[i];
        const isLastKey = i === allKeys.length - 1;

        console.log(`🔄 [KEY ROTATION] ${i + 1}/${allKeys.length} 키 시도 중... (${keyToTry.substring(0, 10)}...${keyToTry.slice(-4)})`);

        try {
          const result = await generateContent(prompt, functionDeclarations, url, keyToTry);
          console.log(`✅ [KEY ROTATION] ${i + 1}번째 키로 성공! API 호출 완료`);
          return result;
        } catch (error: any) {
          const errorMessage = error.message || error.toString();
          console.log(`❌ [KEY ROTATION] ${i + 1}번째 키 실패:`, errorMessage);

          if (isLastKey) {
            // 마지막 키까지 실패한 경우 - 사용자에게 에러 메시지 표시
            console.log('💥 [KEY ROTATION] 모든 키 시도 완료 - 사용자에게 에러 메시지 표시');
            throw new Error('이 gemini 키는 할당량이 다 찼어요. 다른 Gemini 키를 입력해주세요');
          } else {
            // 마지막 키가 아니면 어떤 에러든 조용히 다음 키 시도
            console.log(`🔄 [KEY ROTATION] ${i + 1}번째 키 실패 - 다음 키 시도... (에러 종류: ${errorMessage.slice(0, 50)}...)`);
            continue;
          }
        }
      }

      // 이 코드는 실행되지 않아야 함
      throw new Error('예상치 못한 오류가 발생했습니다.');

    } catch (error: any) {
      console.error('💥 [KEY ROTATION] generateContentWithKeyRotation 최종 실패:', error);
      throw error;
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState({
    example1: null,
    example2: null,
    example3: null
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ mode: string; prompt: any } | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('한국어');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [rewrittenResult, setRewrittenResult] = useState<string>('');
  const [isLoadingRewrite, setIsLoadingRewrite] = useState<boolean>(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string>('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
  const [customAnalysisPrompt, setCustomAnalysisPrompt] = useState<string>('');
  
  // 4번째 칼럼용 상태
  const [selectedLanguage2, setSelectedLanguage2] = useState<string>('한국어');
  const [analysisResult2, setAnalysisResult2] = useState<string>('');
  const [expandedAnalysis2, setExpandedAnalysis2] = useState<string>('');
  const [selectedAnalysisType2, setSelectedAnalysisType2] = useState<string>('');
  const [customAnalysisPrompt2, setCustomAnalysisPrompt2] = useState<string>('');
  
  // 5번째 칼럼용 상태
  const [selectedLanguage3, setSelectedLanguage3] = useState<string>('한국어');
  const [analysisResult3, setAnalysisResult3] = useState<string>('');
  const [expandedAnalysis3, setExpandedAnalysis3] = useState<string>('');
  const [selectedAnalysisType3, setSelectedAnalysisType3] = useState<string>('');
  const [customAnalysisPrompt3, setCustomAnalysisPrompt3] = useState<string>('');
  
  // 음성 선택 상태
  const voiceOptions = [
    'youngsu', 'changhee', 'jimin', 'sujin', 'minjun',
    'yena', 'jihun', 'eunji', 'yejun', 'hunyoung',
    'yejin', 'minjin', 'jihyun', 'eunsu', 'yedam'
  ];
  const [selectedVoice, setSelectedVoice] = useState<string>('youngsu');
  
  // Step5 음성 생성 관련 상태들
  const [scriptText, setScriptText] = useState<string>('');
  const [ssmlEnabled, setSsmlEnabled] = useState<boolean>(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(0.0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<ArrayBuffer | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [processedAudio, setProcessedAudio] = useState<ArrayBuffer | null>(null);
  const [processedCurrentTime, setProcessedCurrentTime] = useState<number>(0);
  const [processedDuration, setProcessedDuration] = useState<number>(0);
  const [processedAudioPlaying, setProcessedAudioPlaying] = useState<boolean>(false);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(-30);
  const [isProcessingSilence, setIsProcessingSilence] = useState<boolean>(false);
  const [selectedAudioSource, setSelectedAudioSource] = useState<string>('original');
  const [wordsPerSubtitle, setWordsPerSubtitle] = useState<number>(1);
  const [isGeneratingSRT, setIsGeneratingSRT] = useState<boolean>(false);
  const [ttsErrorMessage, setTtsErrorMessage] = useState<string>('');
  const [step2ErrorMessage, setStep2ErrorMessage] = useState<string>('');
  const [srtErrorMessage, setSrtErrorMessage] = useState<string>('');
  
  // 무음제거된 음성이 생성되면 자동으로 선택
  useEffect(() => {
    if (processedAudio) {
      setSelectedAudioSource('processed');
    }
  }, [processedAudio]);
  
  // 오디오 객체 참조
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [processedCurrentAudio, setProcessedCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // Step6 키워드 추출 관련 상태들
  const [isExtractingKeywords, setIsExtractingKeywords] = useState<boolean>(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string>('');
  const [keywordExtractionError, setKeywordExtractionError] = useState<string>('');
  
  // Step2 영상 분석 관련 상태들
  const [isLoadingGenerate, setIsLoadingGenerate] = useState<boolean>(false);
  
  // Step3 관점 분석 관련 상태들
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  
  // Step4 대사 생성 관련 상태들
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
  
  const handleFileUpload = (fileNumber: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileNumber]: { name: file.name, file }
    }));
  };

  const handleFileDelete = (fileNumber: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileNumber]: null
    }));
  };

  const handleRewriteWithExamples = async () => {
    const uploadedExamples = Object.values(uploadedFiles).filter(file => file !== null);
    
    if (uploadedExamples.length === 0) {
      alert('먼저 예시 파일을 업로드해주세요.');
      return;
    }

    if (!analysisResult2) {
      alert('먼저 대사를 생성해주세요.');
      return;
    }

    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    setIsLoadingRewrite(true);

    try {
      // 업로드된 파일들의 내용을 읽기
      const exampleContents = await Promise.all(
        uploadedExamples.map(async (fileData) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log('파일 읽기 성공:', fileData.name, e.target?.result);
              resolve(e.target?.result);
            };
            reader.onerror = (e) => {
              console.error('파일 읽기 실패:', fileData.name, e);
              reject(e);
            };
            reader.readAsText(fileData.file);
          });
        })
      );

      console.log('읽어온 예시들:', exampleContents);
      
      const examplesText = exampleContents.map((content, index) => 
        `-0${index + 1} 예시-\n${content}\n-0${index + 1} 예시 끝-`
      ).join('\n\n');

      const rewritePrompt = `다음은 현재 생성된 대사입니다:

${analysisResult2}

다음은 내가 원하는 스타일의 예시들입니다:

${examplesText}

위 예시들의 스타일을 참고해서 현재 대사를 다시 작성해주세요. 예시들의 톤, 문체, 표현 방식을 분석해서 동일한 스타일로 대사를 재작성해주세요. 각 예시의 분량만큼만 적어주세요. 즉, 공백포함 300자 이내로 적어주세요.`;

      const response = await generateContentWithKeyRotation(
        rewritePrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey.trim(),
      );

      console.log('재작성 응답:', response);
      const rewrittenText = response.candidates?.[0]?.content?.parts?.[0]?.text || '재작성 결과를 가져올 수 없습니다.';
      setRewrittenResult(rewrittenText);
      
    } catch (error) {
      console.error('재작성 에러:', error);
      alert('재작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingRewrite(false);
    }
  };
  const [theme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );
  const scrollRef = useRef<HTMLElement>(null);
  
  // 각 칼럼 ref 추가
  const videoColumnRef = useRef<HTMLDivElement>(null);
  const buttonColumnRef = useRef<HTMLDivElement>(null);
  const whiteColumnRef = useRef<HTMLDivElement>(null);
  const fourthColumnRef = useRef<HTMLDivElement>(null);
  const fifthColumnRef = useRef<HTMLDivElement>(null);
  const sixthColumnRef = useRef<HTMLDivElement>(null);
  const isCustomMode = selectedMode === '커스텀';

  // 시간 포맷 함수 (초 -> MM:SS)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 순환 로딩 메시지 컴포넌트
  const LoadingMessage = ({ type = 'default' }: { type?: 'default' | 'voice' | 'srt' }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    
    const defaultMessages = [
      "조금만 기다려주세요.",
      "작업 중입니다",
      "글을 다듬고 있습니다."
    ];
    
    const voiceMessages = [
      "🔄 음성 생성 중...",
      "조금만 기다려주세요",
      "곧 음성이 나옵니다."
    ];

    const srtMessages = [
      "SRT 작업중...",
      "부정확할 수 있어요.",
      "최대 30초 이상 걸려요."
    ];
    
    const loadingMessages = type === 'srt' ? srtMessages : (type === 'voice' ? voiceMessages : defaultMessages);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 1500);

      return () => clearInterval(interval);
    }, [loadingMessages.length]);

    return (
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        {loadingMessages[currentMessageIndex]}
      </div>
    );
  };

  // 칼럼 중앙 정렬 함수
  const scrollToColumn = (columnRef: React.RefObject<HTMLDivElement>) => {
    if (columnRef.current) {
      columnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const setTimecodes = ({timecodes}) =>
    setTimecodeList(
      timecodes.map((t) => ({...t, text: t.text.replaceAll("\\'", "'")})),
    );

  const onModeSelect = async (mode: string) => {
    try {
      setActiveMode(mode);
      // setSelectedMode는 유지 - 사용자가 선택한 모드 그대로 유지
      setIsLoadingGenerate(true);
      setStep2ErrorMessage(''); // 에러 메시지 초기화

    const functionDeclarations = [
      {
        name: 'set_timecodes',
        description: 'Set the timecodes for the video with associated text',
        parameters: {
          type: 'object',
          properties: {
            timecodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  text: { type: 'string' }
                },
                required: ['time', 'text']
              }
            }
          },
          required: ['timecodes']
        }
      }
    ];

    const resp = await generateContentWithKeyRotation(
      isCustomMode
        ? modes[mode].prompt(customPrompt)
        : modes[mode].prompt,
      functionDeclarations,
      `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      apiKey.trim(),
    );

    console.log('응답 객체:', resp);
    console.log('응답 candidates:', resp.candidates);
    console.log('첫 번째 candidate:', resp.candidates?.[0]);
    console.log('candidate content:', resp.candidates?.[0]?.content);
    console.log('content parts:', resp.candidates?.[0]?.content?.parts);
    console.log('첫 번째 part:', resp.candidates?.[0]?.content?.parts?.[0]);
    
    // 다양한 응답 구조 체크
    console.log('전체 응답 구조:', JSON.stringify(resp, null, 2));
    
    // 모든 함수 호출을 처리
    const parts = resp.candidates?.[0]?.content?.parts || [];
    const functionCalls = parts.filter(part => part.functionCall);
    console.log('함수 호출들:', functionCalls);

    if (functionCalls.length > 0) {
      const firstCall = functionCalls[0].functionCall;
      if (firstCall.name === 'set_timecodes' && firstCall.args.timecodes) {
        // 새로운 형식: timecodes 배열
        setTimecodeList(firstCall.args.timecodes);
      } else {
        // 기존 형식: 개별 함수 호출
        const timecodes = functionCalls.map(part => ({
          time: part.functionCall.args.time,
          text: part.functionCall.args.text
        }));
        setTimecodeList(timecodes);
      }
    } else if (resp.candidates?.[0]?.content?.parts?.[0]?.text) {
      // 함수 호출이 없으면 일반 텍스트 응답을 timecode로 처리
      const responseText = resp.candidates[0].content.parts[0].text;
      setTimecodeList([{
        time: '0:00',
        text: responseText
      }]);
    }

      setIsLoadingGenerate(false);
      scrollRef.current?.scrollTo({top: 0});
    } catch (error: any) {
      console.error('Step2 API 에러:', error);
      setIsLoadingGenerate(false);
      if (error.message && (error.message.includes('API key not valid') || error.message.includes('authentication') || error.message.includes('API key') || error.message.includes('401'))) {
        setStep2ErrorMessage('이 Gemini Key는 올바르지 않아요. 다시 확인해주세요');
      } else {
        setStep2ErrorMessage('텍스트 생성 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLoadVideo = (e) => {
    e.preventDefault();
    const videoId = extractYoutubeId(youtubeUrlInput);
    if (videoId) {
      setYoutubeVideoId(videoId);
      setTimecodeList(null);
      setActiveMode(null);
    } else {
      alert('Invalid YouTube URL. Please enter a valid URL.');
    }
  };

  const analysisTypes = {
    '기본': '이 내용을 한 글자도 빠짐없이 번역해주고, 어떤 상황인지 자연스럽고 디테일하게 전문가처럼 설명해주세요.\\n\\nex) \\n1. 한글번역\\n00:02-00:03 ㅣ 이 기구는 정말 놀랍습니다.\\n00:03-00:06 ㅣ 밖에서 부터 시작되는 사상초유의\\n.\\n.\\n———————————\\n2. 관점에서 설명 시작',
    '역사적 관점': '이 내용을 한 글자도 빠짐없이 번역해주고, 역사적 관점에서 이 상황이 어떤 상황이고, 어느 나라 문화이며, 어떤 내용에 기인되어 이 상황이 생겼는지, 역사적 관점에서 디테일하게 설명해주세요. 역사적 사실에 기반으로 신뢰성있게 설명해주세요.\\n\\nex) \\n1. 한글번역\\n00:02-00:03 ㅣ 이 기구는 정말 놀랍습니다.\\n00:03-00:06 ㅣ 밖에서 부터 시작되는 사상초유의\\n.\\n.\\n———————————\\n2. 관점에서 설명 시작',
    '과학적 관점': '이 내용을 한 글자도 빠짐없이 번역해주고, 과학적 관점에서 이 영상의 현상이나 내용을 분석해주세요. 물리학, 화학, 생물학적 원리나 과학적 근거를 바탕으로 상세히 설명해주세요.\\n\\nex) \\n1. 한글번역\\n00:02-00:03 ㅣ 이 기구는 정말 놀랍습니다.\\n00:03-00:06 ㅣ 밖에서 부터 시작되는 사상초유의\\n.\\n.\\n———————————\\n2. 관점에서 설명 시작',
    '바이럴 쇼츠용': '이 내용을 한 글자도 빠짐없이 번역해주고, 바이럴 쇼츠 제작 관점에서 분석해주세요. 왜 이 영상이 유튜브에 바이럴되고 사람들이 좋아요를 누르거나 댓글이 많이 달리는지 분석해주세요. 또한 가장 흥미로운 순간, 감정적 하이라이트, 짧은 영상에 적합한 클립 포인트를 찾아주세요.\\n\\nex) \\n1. 한글번역\\n00:02-00:03 ㅣ 이 기구는 정말 놀랍습니다.\\n00:03-00:06 ㅣ 밖에서 부터 시작되는 사상초유의\\n.\\n.\\n———————————\\n2. 관점에서 설명 시작',
    '커스텀': ''
  };

  const analysisTypes2 = {
    '기본': '원본 스크립트에 나온 대사와 비슷한 스타일과 느낌, 사람의 감정과 문맥을 그대로 유지하되, 더 후킹되고 시청 지속시간을 유지시킬 수 있는 긴장감과 정보력, 적절한 유머까지 섞어서 대사를 만들어주세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '3초 후킹': '원본 스크립트에 나온 대사의 스타일과 문맥을 유지하되, 대사 앞 3초에서 사람들을 끌어 당기는 강력한 후킹문구가 필요하고, 적절한 재치와 긴장감, 정보력을 간단하고 친절하게 알려주세요. 마지막으로 이 내용을 본 사람들이 토론을 할 수 있도록 의견을 묻는 강력한 한마디가 필요합니다. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '정보력 만렙': '원본 스크립트에 나온 대사의 스타일과 문맥을 유지하되, 강력한 3초 후킹문구가 필요합니다. 사람들이 어? 뭐지? 하고 쇼츠를 멈출수 있도록 강력하게 사람들을 붙잡으세요. 정보 지식을 토대로 이 내용을 본 사람들이 이해하기 쉽고 정보를 얻었다는 만족감을 주어야합니다. 적절한 재치와 유머를 곁들이고 신뢰성 높은 근거를 바탕으로 상세히 써주세요. 반드시 의미있는 정보를 가득 넣어서 정보력 높은 대사를 만드세요. 가장 중요합니다. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '바이럴 대사': '이 정보를 타깃은 누구인지, 이 내용을 궁금하거나 좋아하는사람, 댓글쓰는 사람을 위한 대사를 만드세요. 주어진 정보중에 \'흥미로운 순간\', \'감정적 하이라이트\', \'매력적인 클립포인트\'를 기반으로 정말 당신에게 필요한 이야기라는 것을 한마디로 후킹하세요. 이 내용을 본 사람들이 능동적으로 댓글을 달고, 공유할 만한 내용으로 작성하고 시청자들의 의견대립을 위해 마지막 한,두마디를 적어 댓글을 유도하세요. 단 \'댓글써주세요\'같은 직접적인것이 아닌, 사람들이 이 내용을 보고 댓글을 적고싶도록 만드는 것이 당신이 적은 이 스크립트의 진정한 목적입니다. 흥미롭고, 매력적이고, 강력한 후킹과 신뢰기반의 정보를 바탕으로 대사를 쓰세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '커스텀': ''
  };

  const analysisTypes3 = {
    '기본': '원본 스크립트와 4번째 칼럼 결과를 참고해서 새로운 대사를 만들어주세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '감정적 몰입': '원본 스크립트와 4번째 칼럼 결과를 참고해서 감정적 몰입도가 극대화되는 대사를 만들어주세요. 시청자들이 감정적으로 깊이 빠져들 수 있도록 해주세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '완전 몰입': '원본 스크립트와 4번째 칼럼 결과를 참고해서 완전한 몰입이 가능한 최고의 대사를 만들어주세요. 시청자들이 화면에서 눈을 떼지 못하도록 해주세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '스토리텔링': '원본 스크립트와 4번째 칼럼 결과를 참고해서 스토리텔링이 강화된 대사를 만들어주세요. 이야기의 흐름과 구성이 탁월하도록 해주세요. 대사의 양은 원본 스크립트와 동일합니다.\\n\\nex)\\n-원본 스크립트 글자수 : **. // 숫자만 기입.\\n-원본 스크립트 문장수 : **.\\n-생성된 기본 스크립트 글자수 : **.\\n-생성된 기본 스크립트 문장수 : **.\\n\"대사만 쓰세요.\"',
    '커스텀': ''
  };

  const handleAnalyzeContent = async (type: string) => {
    if (!timecodeList || timecodeList.length === 0) {
      alert('먼저 영상을 분석해주세요. (A/V 캡션, 단락, 주요 순간 등의 버튼을 눌러 생성된 내용이 필요합니다)');
      return;
    }

    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    if (type === '커스텀' && !customAnalysisPrompt.trim()) {
      alert('커스텀 분석을 위한 프롬프트를 입력해주세요.');
      return;
    }

    setIsLoadingAnalysis(true);
    setSelectedAnalysisType(type);

    const allText = timecodeList.map(item => item.text).join('\n');
    const languageMap = {
      '한국어': 'Korean',
      '일본어': 'Japanese',
      '영어': 'English'
    };

    const basePrompt = `다음은 YouTube 영상에서 추출한 내용입니다:

${allText}

요구사항:
- ${selectedLanguage}로만 답변해주세요`;

    const specificPrompt = type === '커스텀' ? customAnalysisPrompt : analysisTypes[type];
    const analysisPrompt = `${basePrompt}
- ${specificPrompt}`;

    try {
      const response = await generateContentWithKeyRotation(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey.trim(),
      );

      console.log('분석 응답:', response);
      const analysisText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
      setAnalysisResult(analysisText);
      
    } catch (error) {
      console.error('분석 에러:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeContent2 = async (type: string) => {
    // 기존 분석 결과 또는 타임코드 결과 확인
    const hasOriginalScript = analysisResult || (timecodeList && timecodeList.length > 0);
    
    if (!hasOriginalScript) {
      alert('먼저 3번째 칼럼에서 분석을 완료하거나, 2번째 칼럼에서 Generate를 실행해주세요. (원본 스크립트가 필요합니다)');
      return;
    }

    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    if (type === '커스텀' && !customAnalysisPrompt2.trim()) {
      alert('커스텀 분석을 위한 프롬프트를 입력해주세요.');
      return;
    }

    setIsLoadingScript(true);
    setSelectedAnalysisType2(type);
    
    // 3번째 칼럼의 분석 결과 전체만 사용
    const referenceContent = analysisResult;
    
    const basePrompt = `다음 내용을 참고하세요:

${referenceContent}

요구사항:
- ${selectedLanguage2}로만 답변해주세요
- 함수 호출이나 코드 형식이 아닌 일반 텍스트로만 답변해주세요
- 대사만 작성해주세요`;

    const specificPrompt = type === '커스텀' ? customAnalysisPrompt2 : analysisTypes2[type];
    const analysisPrompt = `${basePrompt}
- ${specificPrompt}`;

    try {
      const response = await generateContentWithKeyRotation(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey.trim(),
      );

      console.log('분석 응답2:', response);
      const analysisText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
      setAnalysisResult2(analysisText);
      
    } catch (error) {
      console.error('분석 에러2:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingScript(false);
    }
  };

  // 키워드 추출 함수
  const handleKeywordExtraction = async () => {
    // 에러 메시지 초기화
    setKeywordExtractionError('');
    
    // 3번째 칼럼의 분석 결과 확인
    if (!analysisResult && (!timecodeList || timecodeList.length === 0)) {
      setKeywordExtractionError('먼저 3번째 칼럼에서 영상 분석을 실행해주세요.');
      return;
    }

    if (!apiKey.trim()) {
      setKeywordExtractionError('Gemini API 키를 입력해주세요.');
      return;
    }

    setIsExtractingKeywords(true);
    
    // 3번째 칼럼의 분석 결과를 기반으로 키워드 추출
    const analysisContent = analysisResult || (timecodeList ? timecodeList.map(item => item.text).join('\n') : '');
    
    const keywordPrompt = `다음 영상 분석 결과를 바탕으로 핵심 키워드들을 중요도 순으로 추출해주세요:

${analysisContent}

요구사항:
- 분석 결과에서 언급된 구체적인 용어/명칭을 우선적으로 추출하세요
- 전문 용어, 고유명사, 특정 분야/카테고리 명칭을 놓치지 마세요
- 예시: "윙포일", "글라이딩", "항공역학" 등의 구체적 용어
- 일반적이고 모호한 단어보다는 구체적이고 특정한 용어를 우선하세요
- 사람들이 이 주제를 검색할 때 사용할 정확한 용어들로 구성하세요
- 가장 핵심이 되는 주제어를 맨 위에, 그 다음 관련 용어 순으로 배치하세요
- 각 키워드를 새 줄에 하나씩 나열해주세요 (줄바꿈으로 구분)
- 함수 호출이나 코드 형식이 아닌 일반 텍스트로만 답변해주세요
- 한국어로 답변해주세요
- 5-10개 정도의 키워드로 제한해주세요
- 좋은 예: "윙포일", "글라이딩", "항공역학" vs 나쁜 예: "윙", "비행", "바람"`;

    try {
      const response = await generateContentWithKeyRotation(
        keywordPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey.trim(),
      );

      console.log('키워드 추출 응답:', response);
      const keywordsText = response.candidates?.[0]?.content?.parts?.[0]?.text || '키워드를 추출할 수 없습니다.';
      setExtractedKeywords(keywordsText);
      
    } catch (error) {
      console.error('키워드 추출 에러:', error);
      alert('키워드 추출 중 오류가 발생했습니다.');
    } finally {
      setIsExtractingKeywords(false);
    }
  };

  ///// SRT 자막 함수들 - 시작 /////
  // Gemini STT import 추가
  // import { generateSRTWithGeminiSTT, validateAndCleanSRT } from './tts/geminiSTT';
  const generateSRTSubtitles = (text: string, wordsPerSub: number, audioDuration: number): string => {
    //// 더 정확한 단어 분할 (한국어+영어 모두 지원)
    const words = text.trim()
      .split(/\s+/) // 여러 공백을 하나로 처리
      .filter(word => word.trim() !== '')
      .filter(word => word.length > 0);
    
    const totalWords = words.length;
    
    console.log(`🔍 SRT 생성 디버그:`, {
      원본텍스트길이: text.length,
      분할된단어수: totalWords,
      단어당자막수: wordsPerSub,
      오디오길이: audioDuration,
      단어들: words.slice(0, 10) // 처음 10개 단어만 로그
    });
    
    if (totalWords === 0) return '';
    
    const subtitles = [];
    let subtitleIndex = 1;
    
    for (let i = 0; i < totalWords; i += wordsPerSub) {
      //// 정확히 wordsPerSub 개수만큼만 가져오기
      const currentWords = words.slice(i, i + wordsPerSub);
      const wordGroup = currentWords.join(' ');
      
      //// 시간 계산
      const startTime = (i / totalWords) * audioDuration;
      const endTime = Math.min(((i + wordsPerSub) / totalWords) * audioDuration, audioDuration);
      
      //// SRT 시간 포맷
      const formatSRTTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
      };
      
      //// 자막 블록 생성
      subtitles.push(`${subtitleIndex}
${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}
${wordGroup}
`);
      
      console.log(`📝 자막 ${subtitleIndex}:`, {
        단어수: currentWords.length,
        단어들: currentWords,
        자막내용: wordGroup,
        시작시간: formatSRTTime(startTime),
        끝시간: formatSRTTime(endTime)
      });
      
      subtitleIndex++;
    }
    
    console.log(`✅ SRT 생성 완료: ${subtitles.length}개 자막 생성됨`);
    return subtitles.join('\n');
  };

  const handleDownloadSRT = async () => {
    if (!scriptText || (!generatedAudio && !processedAudio)) {
      alert('먼저 음성을 생성해주세요.');
      return;
    }

    //// 선택된 오디오 소스 확인
    if (selectedAudioSource === 'processed' && !processedAudio) {
      alert('무음제거된 음성이 없습니다. 먼저 무음제거를 실행해주세요.');
      return;
    }

    //// API 키 확인 (기존 TTS와 동일한 방식 사용)
    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    setIsGeneratingSRT(true);
    setSrtErrorMessage(''); // 에러 메시지 초기화
    
    try {
      //// 선택된 오디오 소스 결정
      const audioToUse = selectedAudioSource === 'processed' ? processedAudio : generatedAudio;
      const audioTypeLabel = selectedAudioSource === 'processed' ? 'processed' : 'original';
      
      console.log('🎙️ Gemini STT로 정확한 SRT 생성 시작:', {
        audioSource: selectedAudioSource,
        audioSize: audioToUse?.byteLength,
        wordsPerSubtitle
      });

      //// Gemini STT API 호출로 정확한 SRT 생성
      const sttResult = await generateSRTWithGeminiSTT({
        audioBuffer: audioToUse!,
        apiKey: apiKey.trim(),
        wordsPerSubtitle: wordsPerSubtitle
      });

      if (!sttResult.success || !sttResult.srtContent) {
        throw new Error(sttResult.error || 'Gemini STT에서 SRT를 생성하지 못했습니다.');
      }

      //// SRT 내용 검증 및 정리
      const cleanedSRT = validateAndCleanSRT(sttResult.srtContent);
      
      //// SRT 파일 다운로드 (개선된 방식)
      const blob = new Blob([cleanedSRT], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedVoice}-${audioTypeLabel}-subtitles-${wordsPerSubtitle}words-gemini.srt`;
      link.style.display = 'none';
      
      // 사용자 상호작용 컨텍스트에서 실행하기 위해 약간의 지연 추가
      document.body.appendChild(link);
      
      // 브라우저 호환성을 위한 클릭 이벤트 강제 실행
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      
      link.dispatchEvent(clickEvent);
      
      // 정리
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Gemini STT 기반 SRT 다운로드 완료!');

    } catch (error) {
      console.error('❌ Gemini STT SRT 생성 실패:', error);
      
      //// 실패시 기존 방식으로 폴백
      console.log('⏪ 기존 방식으로 폴백 시도...');
      try {
        const audioDuration = selectedAudioSource === 'processed' ? processedDuration : duration;
        const audioTypeLabel = selectedAudioSource === 'processed' ? 'processed' : 'original';
        
        const fallbackDuration = audioDuration || (scriptText.length / 10);
        const srtContent = generateSRTSubtitles(scriptText, wordsPerSubtitle, fallbackDuration);
        
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedVoice}-${audioTypeLabel}-subtitles-${wordsPerSubtitle}words-fallback.srt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        setSrtErrorMessage('SRT 자막 생성에 실패하여, 테스트용 SRT 파일을 다운로드합니다');
      } catch (fallbackError) {
        setSrtErrorMessage('SRT 자막 생성에 실패하여, 테스트용 SRT 파일을 다운로드합니다');
      }
    } finally {
      setIsGeneratingSRT(false);
    }
  };
  ///// SRT 자막 함수들 - 끝 /////

  const handleSilenceRemoval = async () => {
    if (!generatedAudio) return;

    setIsProcessingSilence(true);
    try {
      const result = await processAudioFromArrayBuffer(generatedAudio, silenceThreshold);
      
      // Convert processed Blob back to ArrayBuffer
      const processedArrayBuffer = await result.processedBlob.arrayBuffer();
      setProcessedAudio(processedArrayBuffer);
      
      // 미리 duration 로드
      const processedAudioDuration = await preloadAudioDuration(processedArrayBuffer);
      setProcessedDuration(processedAudioDuration);
      
      // Clean up URLs
      URL.revokeObjectURL(result.originalUrl);
      URL.revokeObjectURL(result.processedUrl);
    } catch (error) {
      console.error('무음 제거 중 오류:', error);
      alert('무음 제거 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setIsProcessingSilence(false);
    }
  };

  const preloadAudioDuration = async (audioBuffer: ArrayBuffer): Promise<number> => {
    return new Promise((resolve) => {
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audioUrl);
        resolve(duration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        resolve(0);
      };
    });
  };

  // 공통 AudioPlayer 컴포넌트
  const AudioPlayer = ({ 
    title, 
    audioBuffer, 
    isPlaying, 
    currentTime, 
    duration, 
    onPlay, 
    onSeek, 
    downloadFileName, 
    progressColor = '#007bff' 
  }: {
    title: string;
    audioBuffer: ArrayBuffer;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onPlay: () => void;
    onSeek: (time: number) => void;
    downloadFileName: string;
    progressColor?: string;
  }) => (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '20px',
      width: '600px',
      height: '106px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        justifyContent: 'center',
        width: '100%'
      }}>
        {/* 플레이/일시정지 버튼 */}
        <button
          onClick={onPlay}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: 'black',
            border: '2px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f0f0f0';
            e.target.style.borderColor = '#999';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = '#ccc';
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        {/* 오디오 정보와 프로그레스바 */}
        <div style={{ flex: 0.6 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#333',
            marginBottom: '8px'
          }}>
            {title} ({selectedVoice})
          </div>
          
          {/* 프로그레스바 */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              if (duration > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newTime = percentage * duration;
                onSeek(newTime);
              }
            }}>
              <div style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                height: '100%',
                backgroundColor: progressColor,
                transition: 'width 0.1s ease'
              }}></div>
            </div>
          </div>
          
          {/* 시간 정보 */}
          <div style={{ 
            fontSize: '12px', 
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* 다운로드 버튼 */}
        <button
          onClick={() => {
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: progressColor === '#28a745' ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 'bold'
          }}
        >
          다운로드
        </button>
      </div>
    </div>
  );

  const handleAudioPlay = async () => {
    if (!generatedAudio) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      try {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        const audioBlob = new Blob([generatedAudio], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
        
        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
          alert('오디오 재생 중 오류가 발생했습니다.');
        };
        
        setCurrentAudio(audio);
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('재생 오류:', error);
        alert('오디오 재생 중 오류가 발생했습니다.');
        setIsPlaying(false);
      }
    }
  };

  const handleProcessedAudioPlay = async () => {
    if (!processedAudio) return;

    if (processedAudioPlaying && processedCurrentAudio) {
      processedCurrentAudio.pause();
      setProcessedAudioPlaying(false);
    } else {
      try {
        const audioBlob = new Blob([processedAudio], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadedmetadata = () => {
          setProcessedDuration(audio.duration);
        };
        
        audio.ontimeupdate = () => {
          setProcessedCurrentTime(audio.currentTime);
        };
        
        audio.onended = () => {
          setProcessedAudioPlaying(false);
          setProcessedCurrentTime(0);
          URL.revokeObjectURL(audioUrl);
          setProcessedCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setProcessedAudioPlaying(false);
          setProcessedCurrentTime(0);
          URL.revokeObjectURL(audioUrl);
          setProcessedCurrentAudio(null);
          alert('처리된 오디오 재생 중 오류가 발생했습니다.');
        };
        
        setProcessedCurrentAudio(audio);
        await audio.play();
        setProcessedAudioPlaying(true);
      } catch (error) {
        console.error('처리된 오디오 재생 오류:', error);
        alert('처리된 오디오 재생 중 오류가 발생했습니다.');
        setProcessedAudioPlaying(false);
      }
    }
  };

  const handleAnalyzeContent3 = async (type: string) => {
    // 4번째 칼럼의 분석 결과 또는 3번째 칼럼 결과 확인
    const hasAnalysisResult = analysisResult2 || analysisResult || (timecodeList && timecodeList.length > 0);
    
    if (!hasAnalysisResult) {
      alert('먼저 4번째 칼럼에서 분석을 완료하거나, 3번째 칼럼에서 분석을 실행해주세요.');
      return;
    }

    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    if (type === '커스텀' && !customAnalysisPrompt3.trim()) {
      alert('커스텀 분석을 위한 프롬프트를 입력해주세요.');
      return;
    }

    setIsLoading(true);  // 이 함수는 음성 관련이므로 일단 기존 상태 유지
    setSelectedAnalysisType3(type);
    
    // 4번째 칼럼 결과가 있으면 그것과 원본 타임코드를 모두 사용
    const referenceContent = analysisResult2 ? 
      `4번째 칼럼 분석 결과:
${analysisResult2}

원본 타임코드:
${timecodeList.map(item => `${item.time}: ${item.text}`).join('\n')}` :
      `원본 타임코드:
${timecodeList.map(item => `${item.time}: ${item.text}`).join('\n')}`;
    
    const basePrompt = `다음 내용을 참고하세요:

${referenceContent}

요구사항:
- ${selectedLanguage3}로만 답변해주세요
- 함수 호출이나 코드 형식이 아닌 일반 텍스트로만 답변해주세요
- 대사만 작성해주세요`;

    const specificPrompt = type === '커스텀' ? customAnalysisPrompt3 : analysisTypes3[type];
    const analysisPrompt = `${basePrompt}
- ${specificPrompt}`;

    try {
      const response = await generateContentWithKeyRotation(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey.trim(),
      );

      console.log('분석 응답3:', response);
      const analysisText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
      setAnalysisResult3(analysisText);
      
    } catch (error) {
      console.error('분석 에러3:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 디버깅: 렌더링시 현재 상태 출력
  const currentHeight = (youtubeVideoId && currentStep === 1) ? '250vh' : '200vh';
  console.log('🎯 [RENDER DEBUG] 렌더링시 youtubeVideoId:', youtubeVideoId, '| currentStep:', currentStep, '| 높이:', currentHeight);

  return (
    <main className={c(theme, styles.infoShortsContainer)} style={{
      /* position: 'relative', */ /* 원복용 삭제처리가능 - Step 1: 스크롤 방지용 삭제 */
      width: '100%', /* 원복용 삭제처리가능 - Step 1: 가로폭 제한 */
      maxWidth: '100vw', /* 원복용 삭제처리가능 - Step 1: 가로폭 제한 */
      boxSizing: 'border-box', /* 원복용 삭제처리가능 - Step 1: 패딩 포함 계산 */
      overflow: 'visible',
      minHeight: currentHeight
    }}>
        {/* Step 1: YouTube URL Input */}
        <Step1
            currentStep={currentStep}
            previousStep={previousStep}
            navigationDirection={navigationDirection}
            youtubeUrlInput={youtubeUrlInput}
            setYoutubeUrlInput={setYoutubeUrlInput}
            handleLoadVideo={handleLoadVideo}
            youtubeVideoId={youtubeVideoId}
            requestedTimecode={requestedTimecode}
            timecodeList={timecodeList}
            setRequestedTimecode={setRequestedTimecode}
            videoColumnRef={videoColumnRef}
            language={language}
          />
        
        {/* Step 2: API Key Setup */}
        <Step2
            currentStep={currentStep}
            previousStep={previousStep}
            navigationDirection={navigationDirection}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
        
        {/* Step 3: Video Analysis */}
        <Step3
            currentStep={currentStep}
            previousStep={previousStep}
            navigationDirection={navigationDirection}
            youtubeVideoId={youtubeVideoId}
            buttonColumnRef={buttonColumnRef}
            modes={modes}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            showModal={showModal}
            setShowModal={setShowModal}
            modalContent={modalContent}
            setModalContent={setModalContent}
            scrollToColumn={scrollToColumn}
            isCustomMode={isCustomMode}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onModeSelect={onModeSelect}
            isLoadingGenerate={isLoadingGenerate}
            LoadingMessage={LoadingMessage}
            timecodeList={timecodeList}
            activeMode={activeMode}
            scrollRef={scrollRef}
            setRequestedTimecode={setRequestedTimecode}
            timeToSecs={timeToSecs}
            c={c}
            ChevronDown={ChevronDown}
            step2ErrorMessage={step2ErrorMessage}
          />
        
        {/* Step 4: Perspective Analysis */}
        <Step4
            currentStep={currentStep}
            previousStep={previousStep}
            navigationDirection={navigationDirection}
            whiteColumnRef={whiteColumnRef}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            ChevronDown={ChevronDown}
            analysisTypes={analysisTypes}
            expandedAnalysis={expandedAnalysis}
            setExpandedAnalysis={setExpandedAnalysis}
            scrollToColumn={scrollToColumn}
            c={c}
            customAnalysisPrompt={customAnalysisPrompt}
            setCustomAnalysisPrompt={setCustomAnalysisPrompt}
            handleAnalyzeContent={handleAnalyzeContent}
            apiKey={apiKey}
            isLoadingAnalysis={isLoadingAnalysis}
            LoadingMessage={LoadingMessage}
            analysisResult={analysisResult}
            selectedAnalysisType={selectedAnalysisType}
            DownloadCopyButtons={DownloadCopyButtons}
          />
        
        {/* Step 5: Script Writing */}
        <Step5
            currentStep={currentStep}
            previousStep={previousStep}
            navigationDirection={navigationDirection}
            fourthColumnRef={fourthColumnRef}
            selectedLanguage2={selectedLanguage2}
            setSelectedLanguage2={setSelectedLanguage2}
            ChevronDown={ChevronDown}
            analysisTypes2={analysisTypes2}
            expandedAnalysis2={expandedAnalysis2}
            setExpandedAnalysis2={setExpandedAnalysis2}
            scrollToColumn={scrollToColumn}
            c={c}
            customAnalysisPrompt2={customAnalysisPrompt2}
            setCustomAnalysisPrompt2={setCustomAnalysisPrompt2}
            handleAnalyzeContent2={handleAnalyzeContent2}
            apiKey={apiKey}
            isLoadingScript={isLoadingScript}
            LoadingMessage={LoadingMessage}
            analysisResult2={analysisResult2}
            selectedAnalysisType2={selectedAnalysisType2}
            DownloadCopyButtons={DownloadCopyButtons}
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            handleRewriteWithExamples={handleRewriteWithExamples}
            isLoadingRewrite={isLoadingRewrite}
            rewrittenResult={rewrittenResult}
          />
        
        {/* Step 6: Voice Generation */}
        <Step6 
          currentStep={currentStep}
          previousStep={previousStep}
          navigationDirection={navigationDirection}
          fifthColumnRef={fifthColumnRef}
          analysisResult2={analysisResult2}
          selectedLanguage2={selectedLanguage2}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          ChevronDown={ChevronDown}
          scriptText={scriptText}
          setScriptText={setScriptText}
          ssmlEnabled={ssmlEnabled}
          setSsmlEnabled={setSsmlEnabled}
          voiceSpeed={voiceSpeed}
          setVoiceSpeed={setVoiceSpeed}
          voicePitch={voicePitch}
          setVoicePitch={setVoicePitch}
          handleGenerateAudio={async () => {
            if (!scriptText.trim()) {
              alert('대사를 먼저 입력해주세요.');
              return;
            }
            
            setIsGeneratingAudio(true);
            setTtsErrorMessage(''); // 에러 메시지 초기화
            setDuration(0);
            setCurrentTime(0);
            setProcessedAudio(null);
            setProcessedDuration(0);
            setProcessedCurrentTime(0);
            
            const cleanedText = scriptText
              .replace(/[@#$%^&*()]/g, '')
              .replace(/:\s*:/g, ':');
            
            const actualApiKey = apiKey.trim();
            generateVoice({
              text: cleanedText,
              userVoice: selectedVoice,
              apiKey: actualApiKey
            }).then(async (result) => {
              if (result.success && result.audioBuffer) {
                setGeneratedAudio(result.audioBuffer);
                const audioDuration = await preloadAudioDuration(result.audioBuffer);
                setDuration(audioDuration);
              } else {
                if (result.error && (result.error.includes('authentication') || result.error.includes('API key') || result.error.includes('401') || result.error.includes('403') || result.error.includes('PERMISSION_DENIED'))) {
                  setTtsErrorMessage('Gemini Key 가 올바르지 않습니다. 카드2번으로 이동해서 확인해주세요.');
                } else {
                  setTtsErrorMessage(`음성 생성 실패: ${result.error || '알 수 없는 오류'}`);
                }
              }
            }).catch((error) => {
              console.error('TTS 오류:', error);
              if (error.message && (error.message.includes('authentication') || error.message.includes('API key') || error.message.includes('401') || error.message.includes('403') || error.message.includes('PERMISSION_DENIED'))) {
                setTtsErrorMessage('Gemini Key 가 올바르지 않습니다. 카드2번으로 이동해서 확인해주세요.');
              } else {
                setTtsErrorMessage('음성 생성 중 오류가 발생했습니다.');
              }
            }).finally(() => {
              setIsGeneratingAudio(false);
            });
          }}
          isGeneratingAudio={isGeneratingAudio}
          LoadingMessage={LoadingMessage}
          generatedAudio={generatedAudio}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          handleAudioPlay={handleAudioPlay}
          handleAudioSeek={(time) => {
            if (currentAudio && duration > 0) {
              currentAudio.currentTime = time;
              setCurrentTime(time);
            }
          }}
          AudioPlayer={AudioPlayer}
          processedAudio={processedAudio}
          processedCurrentTime={processedCurrentTime}
          processedDuration={processedDuration}
          processedAudioPlaying={processedAudioPlaying}
          handleProcessedAudioPlay={handleProcessedAudioPlay}
          handleProcessedAudioSeek={(time) => {
            if (processedCurrentAudio && processedDuration > 0) {
              processedCurrentAudio.currentTime = time;
              setProcessedCurrentTime(time);
            }
          }}
          silenceThreshold={silenceThreshold}
          setSilenceThreshold={setSilenceThreshold}
          handleSilenceRemoval={handleSilenceRemoval}
          isProcessingSilence={isProcessingSilence}
          selectedAudioSource={selectedAudioSource}
          setSelectedAudioSource={setSelectedAudioSource}
          wordsPerSubtitle={wordsPerSubtitle}
          setWordsPerSubtitle={setWordsPerSubtitle}
          handleDownloadSRT={handleDownloadSRT}
          isGeneratingSRT={isGeneratingSRT}
          apiKey={apiKey}
          ttsErrorMessage={ttsErrorMessage}
          srtErrorMessage={srtErrorMessage}
        />
        
        {/* Step 7: Related Videos */}
        <Step7
          currentStep={currentStep}
          previousStep={previousStep}
          navigationDirection={navigationDirection}
          sixthColumnRef={sixthColumnRef}
          handleKeywordExtraction={handleKeywordExtraction}
          apiKey={apiKey}
          youtubeVideoId={youtubeVideoId}
          isExtractingKeywords={isExtractingKeywords}
          extractedKeywords={extractedKeywords}
          scrollToColumn={scrollToColumn}
          keywordExtractionError={keywordExtractionError}
          generatedAudio={generatedAudio}
          processedAudio={processedAudio}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          handleAudioPlay={handleAudioPlay}
          handleAudioSeek={(time) => {
            if (currentAudio && duration > 0) {
              currentAudio.currentTime = time;
              setCurrentTime(time);
            }
          }}
          AudioPlayer={AudioPlayer}
          processedCurrentTime={processedCurrentTime}
          processedDuration={processedDuration}
          processedAudioPlaying={processedAudioPlaying}
          handleProcessedAudioPlay={handleProcessedAudioPlay}
          handleProcessedAudioSeek={(time) => {
            if (processedCurrentAudio && processedDuration > 0) {
              processedCurrentAudio.currentTime = time;
              setProcessedCurrentTime(time);
            }
          }}
          selectedAudioSource={selectedAudioSource}
          setSelectedAudioSource={setSelectedAudioSource}
          selectedVoice={selectedVoice}
        />

      {/* ================================================ */}
      {/* 📱 FOUR-COLUMN-LAYOUT 끝 (여기서 모든 칼럼 종료) */}
      {/* ================================================ */}
      
      {/* Floating Navigation */}
      <FloatingNavigation 
        currentStep={currentStep}
        setCurrentStep={handleStepChange}
        totalSteps={7}
        youtubeVideoId={youtubeVideoId}
        stepCompletionStates={{
          step1: youtubeVideoId !== null,
          step2: apiKey.trim().length > 0,
          step3: timecodeList && timecodeList.length > 0,
          step4: analysisResult && analysisResult.trim().length > 0,
          step5: analysisResult2 && analysisResult2.trim().length > 0,
          step6: generatedAudio !== null
        }}
      />
    </main>
  );
}


export default InfoShorts;
