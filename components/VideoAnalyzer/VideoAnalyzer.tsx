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

import React from 'react';
import c from 'classnames';
import {useRef, useState, useEffect} from 'react';
import './index.css';
import {generateContent} from './api';
import {generateVoice, playAudioBuffer} from './tts';
///// Gemini STT import 추가 /////
import { generateSRTWithGeminiSTT, validateAndCleanSRT } from './tts/geminiSTT';
import functions from './functions';
import modes from './modes';
import {timeToSecs} from './utils';
import { processAudioFromArrayBuffer, AudioProcessingResult } from './audioProcessor';

import VideoPlayer from './VideoPlayer';
import { ChevronDown } from './components/ChevronDown';

// 텍스트 다운로드 및 복사 버튼 컴포넌트
interface DownloadCopyButtonsProps {
  content: string;
  filename: string;
}

const DownloadCopyButtons: React.FC<DownloadCopyButtonsProps> = ({ content, filename }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      marginTop: '20px',
      marginBottom: '10px',
      width: '100%'
    }}>
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
          flex: '1'
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
          flex: '1'
        }}
      >
        📋 복사하기
      </button>
    </div>
  );
};

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const VideoAnalyzer: React.FC = () => {
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [timecodeList, setTimecodeList] = useState(null);
  const [requestedTimecode, setRequestedTimecode] = useState(null);
  const [selectedMode, setSelectedMode] = useState(Object.keys(modes)[0]);
  const [activeMode, setActiveMode] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    example1: null,
    example2: null,
    example3: null
  });
  const [expandedModes, setExpandedModes] = useState<Record<string, boolean>>({});
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

      const response = await generateContent(
        rewritePrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey,
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
  const [showVoiceDropdown, setShowVoiceDropdown] = useState<boolean>(false);
  const [isExtractingKeywords, setIsExtractingKeywords] = useState<boolean>(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string>('');
  const [isLoadingGenerate, setIsLoadingGenerate] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
  const [scriptText, setScriptText] = useState<string>('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<ArrayBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<string | null>(null);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(-30);
  const [isProcessingSilence, setIsProcessingSilence] = useState<boolean>(false);
  const [showSilenceControls, setShowSilenceControls] = useState<boolean>(false);
  const [processedAudio, setProcessedAudio] = useState<ArrayBuffer | null>(null);
  const [processedAudioPlaying, setProcessedAudioPlaying] = useState<boolean>(false);
  const [processedCurrentAudio, setProcessedCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [processedCurrentTime, setProcessedCurrentTime] = useState<number>(0);
  const [processedDuration, setProcessedDuration] = useState<number>(0);
  
  ///// SRT 자막 관련 상태 - 시작 /////
  const [wordsPerSubtitle, setWordsPerSubtitle] = useState<number>(3);
  const [isGeneratingSRT, setIsGeneratingSRT] = useState<boolean>(false);
  const [selectedAudioSource, setSelectedAudioSource] = useState<'original' | 'processed'>('original');
  ///// SRT 자막 관련 상태 - 끝 /////
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
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
    setActiveMode(mode);
    // setSelectedMode는 유지 - 사용자가 선택한 모드 그대로 유지
    setIsLoadingGenerate(true);

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

    const resp = await generateContent(
      isCustomMode
        ? modes[mode].prompt(customPrompt)
        : modes[mode].prompt,
      functionDeclarations,
      `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      apiKey,
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
      const response = await generateContent(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey,
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
      const response = await generateContent(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey,
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
    // 3번째 칼럼의 분석 결과 확인
    if (!analysisResult && (!timecodeList || timecodeList.length === 0)) {
      alert('먼저 3번째 칼럼에서 영상 분석을 실행해주세요.');
      return;
    }

    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
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
      const response = await generateContent(
        keywordPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey,
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
        
        alert('Gemini STT 실패로 기본 방식을 사용했습니다. 타임스탬프가 부정확할 수 있습니다.');
      } catch (fallbackError) {
        alert('SRT 파일 생성에 완전히 실패했습니다.');
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
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '15px',
      marginTop: '15px'
    }}>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: progressColor === '#28a745' ? '#28a745' : '#333', 
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {title}
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
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
        <div style={{ flex: 1 }}>
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
      const response = await generateContent(
        analysisPrompt,
        [],
        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        apiKey,
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

  return (
    <main className={c(theme)}>
      <div className="url-input-section">
        <form onSubmit={handleLoadVideo} className="url-input-form">
          <input
            type="text"
            placeholder="Enter YouTube URL..."
            value={youtubeUrlInput}
            onChange={(e) => setYoutubeUrlInput(e.target.value)}
            className="url-input"
            required
          />
          <button type="submit" className="load-button">
            Load Video
          </button>
        </form>
      </div>


      {/* ================================================ */}
      {/* 📱 FOUR-COLUMN-LAYOUT 시작 (1,2,3,4,5,6 칼럼) */}
      {/* ================================================ */}
      <div className="four-column-layout">
        
        {/* ============================================ */}
        {/* 1️⃣ 첫번째 칼럼: 비디오 플레이어 */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>1. 쇼츠 링크 입력</div>
          <div className="video-column" ref={videoColumnRef}>
            <VideoPlayer
              videoId={youtubeVideoId}
              requestedTimecode={requestedTimecode}
              timecodeList={timecodeList}
              jumpToTimecode={setRequestedTimecode}
              onLoadVideo={handleLoadVideo}
              youtubeUrlInput={youtubeUrlInput}
              setYoutubeUrlInput={setYoutubeUrlInput}
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* 2️⃣ 두번째 칼럼: 분석 모드 선택 및 Generate */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>2.영상 분석</div>
          <aside className="button-column" ref={buttonColumnRef}>
            <div className="modeSelector">
            <div>
              <h2 style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>영상 분석하기:</h2>
              <div className="modeList">
                {Object.entries(modes).map(([mode, {emoji, prompt}]) => (
                  <div key={mode}>
                    <button
                      className={c('button', {
                        active: mode === selectedMode,
                      })}
                      onClick={() => {
                        if (selectedMode === mode && expandedModes[mode]) {
                          // 이미 선택된 버튼을 다시 누르면 아코디언 닫기
                          setExpandedModes(prev => ({
                            ...prev,
                            [mode]: false
                          }));
                        } else {
                          // 새로운 버튼을 누르면 선택 + 아코디언 열기
                          setSelectedMode(mode);
                          setExpandedModes(prev => ({
                            ...prev,
                            [mode]: true
                          }));
                          // 2번째 칼럼을 중앙으로 스크롤
                          setTimeout(() => scrollToColumn(buttonColumnRef), 100);
                        }
                      }}
                      style={{width: '100%', height: '48px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>
                        <span className="emoji">{emoji}</span> {mode}
                      </span>
                      <ChevronDown isOpen={expandedModes[mode]} />
                    </button>
                    {expandedModes[mode] && (
                      <div style={{
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderTop: 'none',
                        borderRadius: '0 0 4px 4px',
                        padding: '15px',
                        fontSize: '15px',
                        color: 'var(--text)',
                        lineHeight: '1.7'
                      }}>
                        {mode === '커스텀' ? (
                          <div>
                            <textarea
                              placeholder="커스텀 분석을 위한 프롬포트를 입력하세요..."
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              rows={4}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                background: 'var(--highlight)',
                                color: 'var(--text)',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                lineHeight: '1.7'
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <strong>Current Prompt:</strong><br/>
                            {typeof prompt === 'function' ? 'Custom prompt with user input' : prompt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{marginBottom: '10px'}}>
                <label htmlFor="apiKey2" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333', fontSize: '16px'}}>
                  Gemini API Key:
                </label>
                <input
                  id="apiKey2"
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{width: '100%', height: '48px', padding: '8px', border: '1px solid #ccc', borderRadius: '12px'}}
                />
              </div>
              <button
                className="button generateButton"
                onClick={() => onModeSelect(selectedMode)}
                disabled={!apiKey.trim() || !youtubeVideoId || (isCustomMode && !customPrompt.trim())}>
                ▶️ Generate
              </button>
              
              {isLoadingGenerate && <LoadingMessage />}
            </div>
          </div>
          <div className={c('tools', {inactive: !youtubeVideoId})}>
              <section
                className={c('output', {['mode' + activeMode]: activeMode})}
                ref={scrollRef}>
                {timecodeList && activeMode ? (
                  activeMode === 'Table' ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Description</th>
                          <th>Objects</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timecodeList.map(({time, text, objects}, i) => (
                          <tr
                            key={i}
                            role="button"
                            onClick={() =>
                              setRequestedTimecode(timeToSecs(time))
                            }>
                            <td>
                              <time>{time}</time>
                            </td>
                            <td>{text}</td>
                            <td>{objects.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (modes as any)[activeMode].isList ? (
                    <ul>
                      {timecodeList.map(({time, text}, i) => (
                        <li key={i} className="outputItem">
                          <button
                            onClick={() =>
                              setRequestedTimecode(timeToSecs(time))
                            }>
                            <time>{time}</time>
                            <p className="text">{text}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    timecodeList.map(({time, text}, i) => (
                      <>
                        <span
                          key={i}
                          className="sentence"
                          role="button"
                          onClick={() =>
                            setRequestedTimecode(timeToSecs(time))
                          }>
                          <time>{time}</time>
                          <span>{text}</span>
                        </span>{' '}
                      </>
                    ))
                  )
                ) : null}
              </section>
            </div>
          </aside>
        </div>

        {/* ============================================ */}
        {/* 3️⃣ 세번째 칼럼: 영상 분석 및 번역 */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>3. 관점 분석</div>
          <div className="white-column" ref={whiteColumnRef}>
            <div className="modeList">
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', fontSize: '16px' }}>분석 언어:</label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                      padding: '8px 40px 8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#333',
                      width: '100%',
                      height: '48px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="한국어">한국어</option>
                    <option value="일본어">일본어</option>
                    <option value="영어">영어</option>
                  </select>
                  <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <ChevronDown isOpen={false} />
                  </div>
                </div>
              </div>

              {Object.entries(analysisTypes).map(([type, prompt]) => (
                <div key={type}>
                  <button
                    className={c('button', {
                      active: expandedAnalysis === type,
                    })}
                    onClick={() => {
                      if (expandedAnalysis === type) {
                        // 이미 선택된 버튼을 다시 누르면 아코디언 닫기
                        setExpandedAnalysis('');
                      } else {
                        // 새로운 버튼을 누르면 선택 + 아코디언 열기
                        setExpandedAnalysis(type);
                        // 3번째 칼럼을 중앙으로 스크롤
                        setTimeout(() => scrollToColumn(whiteColumnRef), 100);
                      }
                    }}
                    style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px'}}
                  >
                    <span>
                      <span className="emoji">{type === '커스텀' ? '🔧' : type === '역사적 관점' ? '🏛️' : type === '과학적 관점' ? '🧪' : type === '바이럴 쇼츠용' ? '🔥' : '📝'}</span> {type}
                    </span>
                    <ChevronDown isOpen={expandedAnalysis === type} />
                  </button>
                  {expandedAnalysis === type && (
                    <div style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      padding: '15px',
                      fontSize: '15px',
                      color: 'var(--text)',
                      lineHeight: '1.7'
                    }}>
                      {type === '커스텀' ? (
                        <div>
                          <textarea
                            placeholder="커스텀 분석을 위한 프롬프트를 입력하세요..."
                            value={customAnalysisPrompt}
                            onChange={(e) => setCustomAnalysisPrompt(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              background: 'var(--highlight)',
                              color: 'var(--text)',
                              fontSize: '15px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              lineHeight: '1.7'
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <strong>프롬프트:</strong><br/>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {prompt.replace(/\\n/g, '\n')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button
                className="button generateButton"
                style={{ fontSize: '16px' }}
                onClick={() => {
                  if (expandedAnalysis) {
                    handleAnalyzeContent(expandedAnalysis);
                  } else {
                    alert('분석 타입을 선택해주세요.');
                  }
                }}
                disabled={
                  !apiKey.trim() || 
                  !expandedAnalysis ||
                  (expandedAnalysis === '커스텀' && !customAnalysisPrompt.trim())
                }>
                🔬 분석하기
              </button>
              
              {isLoadingAnalysis && <LoadingMessage />}
            </div>
          </div>
          
          {analysisResult && (
            <div>
              <DownloadCopyButtons 
                content={analysisResult}
                filename={`분석결과_${selectedAnalysisType}`}
              />
              
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                color: '#333'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>
                  분석 결과 ({selectedAnalysisType}):
                </h4>
                
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
          )}
          </div>

        {/* ============================================ */}
        {/* 4️⃣ 네번째 칼럼: 대사 생성 및 스타일 변경 */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>4. 대사 쓰기</div>
          <div className="fourth-column" ref={fourthColumnRef}>
            <div className="modeList">
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>대사 언어:</label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select
                    value={selectedLanguage2}
                    onChange={(e) => setSelectedLanguage2(e.target.value)}
                    style={{
                      padding: '8px 40px 8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#333',
                      width: '100%',
                      height: '48px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="한국어">한국어</option>
                    <option value="일본어">일본어</option>
                    <option value="영어">영어</option>
                  </select>
                  <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <ChevronDown isOpen={false} />
                  </div>
                </div>
              </div>

              {Object.entries(analysisTypes2).map(([type, prompt]) => (
                <div key={type}>
                  <button
                    className={c('button', {
                      active: expandedAnalysis2 === type,
                    })}
                    onClick={() => {
                      if (expandedAnalysis2 === type) {
                        // 이미 선택된 버튼을 다시 누르면 아코디언 닫기
                        setExpandedAnalysis2('');
                      } else {
                        // 새로운 버튼을 누르면 선택 + 아코디언 열기
                        setExpandedAnalysis2(type);
                        // 4번째 칼럼을 중앙으로 스크롤
                        setTimeout(() => scrollToColumn(fourthColumnRef), 100);
                      }
                    }}
                    style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px'}}
                  >
                    <span>
                      <span className="emoji">{type === '커스텀' ? '🔧' : type === '3초 후킹' ? '⚡' : type === '정보력 만렙' ? '🧠' : type === '바이럴 대사' ? '💬' : '📝'}</span> {type}
                    </span>
                    <ChevronDown isOpen={expandedAnalysis2 === type} />
                  </button>
                  {expandedAnalysis2 === type && (
                    <div style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      padding: '15px',
                      fontSize: '15px',
                      color: 'var(--text)',
                      lineHeight: '1.7'
                    }}>
                      {type === '커스텀' ? (
                        <div>
                          <textarea
                            placeholder="커스텀 분석을 위한 프롬프트를 입력하세요..."
                            value={customAnalysisPrompt2}
                            onChange={(e) => setCustomAnalysisPrompt2(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              background: 'var(--highlight)',
                              color: 'var(--text)',
                              fontSize: '15px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              lineHeight: '1.7'
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <strong>프롬프트:</strong><br/>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {prompt.replace(/\\n/g, '\n')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button
                className="button generateButton"
                style={{ fontSize: '16px' }}
                onClick={() => {
                  if (expandedAnalysis2) {
                    handleAnalyzeContent2(expandedAnalysis2);
                  } else {
                    alert('분석 타입을 선택해주세요.');
                  }
                }}
                disabled={
                  !apiKey.trim() || 
                  !expandedAnalysis2 ||
                  (expandedAnalysis2 === '커스텀' && !customAnalysisPrompt2.trim())
                }>
                🎬 대사 만들기
              </button>
              
              {isLoadingScript && <LoadingMessage />}
            </div>
          </div>
          
          {analysisResult2 && (
            <>
              <DownloadCopyButtons 
                content={analysisResult2}
                filename={`대사쓰기_${selectedAnalysisType2}`}
              />
              
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                color: '#333'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>
                  분석 결과 ({selectedAnalysisType2}):
                </h4>
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.7',
                  fontSize: '15px',
                  color: '#333'
                }}>
                  {analysisResult2.replace(/\\n/g, '\n')}
                </div>
              </div>
              
              <div style={{
                marginTop: '15px',
                padding: '20px',
                background: '#e8f4f8',
                border: '1px solid #bee5eb',
                borderRadius: '12px',
                color: '#0c5460',
                fontSize: '13px'
              }}>
                <div style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
                  이 대사를 내 스타일로 바꾸고 싶다면,<br/>
                  잘된 예시 3개를 올려주세요
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['example1', 'example2', 'example3'].map((fileKey, index) => (
                    <div key={fileKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {!uploadedFiles[fileKey] ? (
                        <label style={{
                          padding: '8px 12px',
                          background: 'white',
                          border: '1px solid #bee5eb',
                          borderRadius: '12px',
                          color: '#0c5460',
                          fontSize: '15px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          textAlign: 'center',
                          height: '48px',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'white'}>
                          📁 잘된 예시{index + 1}.txt 업로드
                          <input
                            type="file"
                            accept=".txt"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(fileKey, file);
                              }
                            }}
                          />
                        </label>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f0f9ff',
                          border: '1px solid #bee5eb',
                          borderRadius: '12px',
                          height: '48px'
                        }}>
                          <span style={{ 
                            color: '#0c5460', 
                            fontSize: '15px',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            📄 {uploadedFiles[fileKey].name}
                          </span>
                          <button
                            onClick={() => handleFileDelete(fileKey)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#dc3545',
                              fontSize: '15px',
                              cursor: 'pointer',
                              marginLeft: '8px',
                              padding: '2px 6px',
                              borderRadius: '3px'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#ffebee'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleRewriteWithExamples}
                  style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s',
                    height: '48px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#6366f1'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                  disabled={Object.values(uploadedFiles).every(file => file === null)}
                >
                  📝 이 예시를 기준으로 재작성하기
                </button>
                
                {isLoadingRewrite && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <LoadingMessage />
                  </div>
                )}
                
                {rewrittenResult && (
                  <div>
                    <DownloadCopyButtons 
                      content={rewrittenResult}
                      filename="재작성된_대사"
                    />
                    
                    <div style={{
                      padding: '15px',
                      background: '#f0fff4',
                      border: '1px solid #90ee90',
                      borderRadius: '6px',
                      color: '#333'
                    }}>
                      <h4 style={{ marginBottom: '10px', color: '#2d5016' }}>
                        재작성된 대사:
                      </h4>
                      <div style={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.7',
                        fontSize: '15px',
                        color: '#333'
                      }}>
                        {rewrittenResult.replace(/\\n/g, '\n')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* 5️⃣ 다섯번째 칼럼: 음성 생성 (TTS) */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>5. 음성 생성</div>
          <div className="fifth-column" ref={fifthColumnRef}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', fontSize: '16px' }}>음성 선택:</label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <button
                    onClick={() => {
                      setShowVoiceDropdown(!showVoiceDropdown);
                      setTimeout(() => scrollToColumn(fifthColumnRef), 100);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#333',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      height: '48px'
                    }}
                  >
                    <span>{selectedVoice}</span>
                    <ChevronDown isOpen={showVoiceDropdown} />
                  </button>
                  
                  {showVoiceDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '360px',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      padding: '15px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                      }}>
                        {voiceOptions.map((voice, index) => (
                          <div
                            key={voice}
                            onClick={() => {
                              setSelectedVoice(voice);
                              setShowVoiceDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '12px',
                              border: selectedVoice === voice ? '2px solid #2872E3' : '1px solid #ddd',
                              borderRadius: '6px',
                              backgroundColor: selectedVoice === voice ? '#f0f7ff' : 'white',
                              cursor: 'pointer',
                              width: '100px',
                              height: '100px',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedVoice !== voice) {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedVoice !== voice) {
                                e.currentTarget.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <span
                              style={{ 
                                fontWeight: selectedVoice === voice ? 'bold' : 'normal',
                                fontSize: '15px',
                                textAlign: 'center',
                                marginBottom: '4px',
                                pointerEvents: 'none'
                              }}
                            >
                              {voice}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                
                                if (isPreviewPlaying === voice) {
                                  // 현재 재생 중인 음성이면 일시정지
                                  if (previewAudio) {
                                    previewAudio.pause();
                                    setIsPreviewPlaying(null);
                                  }
                                } else {
                                  // 다른 음성 재생 중이면 먼저 정지
                                  if (previewAudio) {
                                    previewAudio.pause();
                                  }
                                  
                                  // 새로운 음성 재생
                                  try {
                                    const audio = new Audio(`voices/${voice}.wav`);
                                    audio.onended = () => {
                                      setIsPreviewPlaying(null);
                                      setPreviewAudio(null);
                                    };
                                    audio.onerror = () => {
                                      console.error('미리듣기 재생 오류');
                                      setIsPreviewPlaying(null);
                                      setPreviewAudio(null);
                                    };
                                    
                                    setPreviewAudio(audio);
                                    setIsPreviewPlaying(voice);
                                    audio.play();
                                  } catch (error) {
                                    console.error('미리듣기 재생 오류:', error);
                                    alert(`${voice} 음성을 재생할 수 없습니다.`);
                                  }
                                }
                              }}
                              style={{
                                padding: '0',
                                backgroundColor: 'transparent',
                                color: 'black',
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                                fontSize: '12px',
                                cursor: 'pointer',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isPreviewPlaying === voice ? '⏸️' : '▶️'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <textarea
              placeholder="대사를 넣어주세요."
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              onFocus={() => {
                setTimeout(() => scrollToColumn(fifthColumnRef), 100);
              }}
              style={{
                width: '100%',
                height: '430px',
                marginTop: '0',
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: 'white',
                color: '#333',
                lineHeight: '1.8'
              }}
            />
            
            <div style={{ marginTop: '10px' }}>
              <button
                className="button generateButton"
                style={{ fontSize: '16px' }}
                onClick={async () => {
                  if (!scriptText.trim()) {
                    alert('대사를 먼저 입력해주세요.');
                    return;
                  }
                  
                  setIsGeneratingVoice(true);
                  // setGeneratedAudio(null); // 기존 오디오 UI를 유지하기 위해 주석처리
                  setDuration(0);
                  setCurrentTime(0);
                  setProcessedAudio(null);
                  setProcessedDuration(0);
                  setProcessedCurrentTime(0);
                  
                  try {
                    console.log(`${selectedVoice} 음성으로 TTS 생성 시작...`);
                    
                    //// 특수문자 삭제 ////
                    const cleanedText = scriptText
                      .replace(/[@#$%^&*()]/g, '')
                      .replace(/:\s*:/g, ':');
                    //// 특수문자 삭제 ////
                    
                    // TTS 모듈을 사용하여 음성 생성 (재생하지 않음)
                    const result = await generateVoice({
                      text: cleanedText,
                      userVoice: selectedVoice,
                      apiKey: apiKey.trim()
                    });
                    
                    if (result.success && result.audioBuffer) {
                      setGeneratedAudio(result.audioBuffer);
                      // 미리 duration 로드
                      const audioDuration = await preloadAudioDuration(result.audioBuffer);
                      setDuration(audioDuration);
                    } else {
                      alert(`음성 생성 실패: ${result.error || '알 수 없는 오류'}`);
                    }
                  } catch (error) {
                    console.error('TTS 오류:', error);
                    alert('TTS 생성 중 오류가 발생했습니다.');
                  } finally {
                    setIsGeneratingVoice(false);
                  }
                }}
                disabled={!apiKey.trim() || !scriptText.trim() || isGeneratingVoice}>
                🎵 음성 생성하기
              </button>
              
              {/* 음성 생성 로딩 메시지 */}
              {isGeneratingVoice && <LoadingMessage type="voice" />}
              
              {/* 음성생성하기 버튼과 플레이 UI 사이 간격 */}
              <div style={{ marginTop: '30px' }}></div>
              
              {/* 원본 음성 플레이어 */}
              {/* TEMP: 중복 플레이어 주석처리 */}
              {/* {generatedAudio && (
                <AudioPlayer
                  title="🎵 생성된 음성"
                  audioBuffer={generatedAudio}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlay={handleAudioPlay}
                  onSeek={(time) => {
                    if (currentAudio && duration > 0) {
                      currentAudio.currentTime = time;
                      setCurrentTime(time);
                    }
                  }}
                  downloadFileName={`generated-voice-${selectedVoice}.wav`}
                  progressColor="#007bff"
                />
              )} */}

              {/* 무음 제거 컨트롤 */}
              {generatedAudio && (
                <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  gap: '12px'
                }}>
                  {/* 플레이/일시정지 버튼 */}
                  <button
                    onClick={async () => {
                      if (isPlaying && currentAudio) {
                        // 일시정지
                        currentAudio.pause();
                        setIsPlaying(false);
                      } else {
                        // 재생
                        try {
                          // 기존 오디오 정리
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
                    }}
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
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      생성된 음성 ({selectedVoice})
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
                        if (currentAudio && duration > 0) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const percentage = clickX / rect.width;
                          const newTime = percentage * duration;
                          currentAudio.currentTime = newTime;
                          setCurrentTime(newTime);
                        }
                      }}>
                        <div style={{
                          width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#7c3aed',
                          transition: 'width 0.1s ease'
                        }} />
                      </div>
                    </div>
                    
                    {/* 시간 표시 */}
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
                      //// WAV 파일 다운로드
                      const audioBlob = new Blob([generatedAudio], { type: 'audio/wav' });
                      const url = URL.createObjectURL(audioBlob);
                      
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `generated-voice-${selectedVoice}.wav`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      URL.revokeObjectURL(url);
                      
                      //// 200ms 후 TXT 파일 연속 다운로드
                      setTimeout(() => {
                        const textContent = scriptText;
                        const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                        const textUrl = URL.createObjectURL(textBlob);
                        
                        const textLink = document.createElement('a');
                        textLink.href = textUrl;
                        textLink.download = `generated-voice-${selectedVoice}-script.txt`;
                        document.body.appendChild(textLink);
                        textLink.click();
                        document.body.removeChild(textLink);
                        
                        URL.revokeObjectURL(textUrl);
                      }, 200);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 'normal'
                    }}
                  >
                    다운로드
                  </button>
                </div>
              )}
              
              {/* 무음 제거 컨트롤 */}
              {generatedAudio && (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginTop: '15px',
                  marginBottom: '10px'
                }}>
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#495057', 
                      marginBottom: '23px' 
                    }}>
                      무음 감지 레벨: <span style={{ color: '#007bff' }}>{silenceThreshold} dB</span>
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={0}
                      step={1}
                      value={silenceThreshold}
                      onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                      disabled={isProcessingSilence}
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#dee2e6',
                        borderRadius: '4px',
                        appearance: 'none',
                        cursor: isProcessingSilence ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <div style={{ 
                      fontSize: '15px', 
                      color: '#6c757d', 
                      marginTop: '20px',
                      textAlign: 'center',
                      lineHeight: '1.8'
                    }}>
                      ⏩⏩⏩ 숫자가 0 으로 갈수록<br />무음처리가 더 많이됩니다.
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSilenceRemoval}
                    disabled={isProcessingSilence}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: isProcessingSilence ? '#6c757d' : '#7c3aed1a',
                      color: isProcessingSilence ? 'white' : '#7c3aed',
                      border: isProcessingSilence ? 'none' : '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: isProcessingSilence ? 'not-allowed' : 'pointer',
                      fontWeight: 'normal',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isProcessingSilence ? '🔄 처리 중...' : '🔇 무음 제거 실행'}
                  </button>
                </div>
              )}
                  
              {/* 처리된 오디오 플레이어 */}
              {processedAudio && (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🎵 무음 제거된 음성
                  </div>
                      
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                        {/* 플레이/일시정지 버튼 */}
                        <button
                          onClick={handleProcessedAudioPlay}
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
                          {processedAudioPlaying ? '⏸️' : '▶️'}
                        </button>
                        
                        {/* 오디오 정보와 프로그레스바 */}
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#333',
                            marginBottom: '8px'
                          }}>
                            무음 제거된 음성 ({selectedVoice})
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
                              if (processedCurrentAudio && processedDuration > 0) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const percentage = clickX / rect.width;
                                const newTime = percentage * processedDuration;
                                processedCurrentAudio.currentTime = newTime;
                                setProcessedCurrentTime(newTime);
                              }
                            }}>
                              <div style={{
                                width: `${processedDuration > 0 ? (processedCurrentTime / processedDuration) * 100 : 0}%`,
                                height: '100%',
                                backgroundColor: '#28a745',
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
                            <span>{formatTime(processedCurrentTime)}</span>
                            <span>{formatTime(processedDuration)}</span>
                          </div>
                        </div>
                        
                        {/* 다운로드 버튼 */}
                        <button
                          onClick={() => {
                            //// WAV 파일 다운로드 (무음제거됨)
                            const audioBlob = new Blob([processedAudio], { type: 'audio/wav' });
                            const url = URL.createObjectURL(audioBlob);
                            
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `silence-removed-${selectedVoice}.wav`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            URL.revokeObjectURL(url);
                            
                            //// 200ms 후 TXT 파일 연속 다운로드
                            setTimeout(() => {
                              const textContent = scriptText;
                              const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                              const textUrl = URL.createObjectURL(textBlob);
                              
                              const textLink = document.createElement('a');
                              textLink.href = textUrl;
                              textLink.download = `silence-removed-${selectedVoice}-script.txt`;
                              document.body.appendChild(textLink);
                              textLink.click();
                              document.body.removeChild(textLink);
                              
                              URL.revokeObjectURL(textUrl);
                            }, 200);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'normal'
                          }}
                        >
                          다운로드
                        </button>
                  </div>
                </div>
              )}

              {/* ///// SRT 자막 내보내기 블럭 - 시작 ///// */}
              {(generatedAudio || processedAudio) && scriptText && (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📝 자막 SRT로 내보내기 (베타,매우 부정확함)
                  </div>
                  
                  {/* ///// 오디오 소스 선택 드롭다운 ///// */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      오디오 소스:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={selectedAudioSource}
                        onChange={(e) => setSelectedAudioSource(e.target.value as 'original' | 'processed')}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '12px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          minWidth: '140px',
                          height: '48px',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          paddingRight: '30px',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          backgroundSize: '16px'
                        }}
                      >
                        <option value="original">원본 음성</option>
                        <option value="processed" disabled={!processedAudio}>
                          무음제거 음성 {!processedAudio ? '(비활성화)' : ''}
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      한 자막당 단어 수:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={wordsPerSubtitle}
                        onChange={(e) => setWordsPerSubtitle(Number(e.target.value))}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '12px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          minWidth: '120px',
                          height: '48px',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          paddingRight: '30px',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          backgroundSize: '16px'
                        }}
                      >
                        <option value={1}>1단어</option>
                        <option value={2}>2단어</option>
                        <option value={3}>3단어</option>
                        <option value={4}>4단어</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadSRT}
                    disabled={isGeneratingSRT}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: isGeneratingSRT ? '#ccc' : '#7c3aed1a',
                      color: isGeneratingSRT ? '#666' : '#7c3aed',
                      border: '1px solid rgba(124,58,237,.2)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isGeneratingSRT ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    {isGeneratingSRT ? (
                      <>🔄 SRT 생성 중...</>
                    ) : (
                      <>📄 자막 SRT로 내보내기</>
                    )}
                  </button>

                  {/* SRT 로딩 메시지 */}
                  {isGeneratingSRT && <LoadingMessage type="srt" />}
                  
                  {/* SRT 사용법 안내 메시지 */}
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#856404',
                    lineHeight: '1.5'
                  }}>
                    ⚠️ 이 자막 SRT를 사용하려면 반드시 아래 사용법을 읽으세요. <a 
                      href="https://www.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#007bff',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      사용 방법 보기
                    </a>
                  </div>
                </div>
              )}
              {/* ///// SRT 자막 내보내기 블럭 - 끝 ///// */}

            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 6️⃣ 여섯번째 칼럼: 관련 영상 키워드 검색 */}
        {/* ============================================ */}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textAlign: 'left' }}>6. 관련 영상 더 찾기</div>
          <div className="sixth-column" ref={sixthColumnRef}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#333', fontSize: '16px', margin: 0 }}>관련 영상 더 찾기</h3>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <button
                className="button generateButton"
                onClick={handleKeywordExtraction}
                disabled={!apiKey.trim() || !youtubeVideoId || isExtractingKeywords}
                style={{ width: '100%', marginBottom: '15px', fontSize: '16px' }}
              >
                {isExtractingKeywords ? '🔄 키워드 추출 중...' : '🔍 영상의 키워드 추출'}
              </button>
              
              <div style={{
                marginTop: '10px',
                marginBottom: '15px',
                minHeight: '120px',
                padding: '15px',
                background: extractedKeywords ? '#f8f9fa' : '#fafafa',
                border: '1px solid #dee2e6',
                borderRadius: '12px',
                color: '#333'
              }}>
                <h4 style={{ 
                  marginBottom: '10px', 
                  color: '#333', 
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  추출된 키워드:
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
                            // 복사 완료 알림을 위한 간단한 피드백
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
                      color: '#999',
                      fontSize: '16px',
                      lineHeight: '1.5'
                    }}>
                      키워드 추출 버튼을 눌러서 영상의 키워드를 추출해보세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button
              className="button generateButton"
              onClick={() => {
                alert('관련 영상 검색 (준비 중)');
                setTimeout(() => scrollToColumn(sixthColumnRef), 100);
              }}
              style={{ fontSize: '16px' }}>
              🔍 홈으로 가서 관련 영상 더 찾기
            </button>
            
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#856404',
              lineHeight: '1.5'
            }}>
              ⚠️ 홈으로 이동하면 이곳의 내용이 전부 새로고침됩니다. 중요한 정보는 다운로드와 복사해놓으세요
            </div>
          </div>
        </div>
        
      {/* ================================================ */}
      {/* 📱 FOUR-COLUMN-LAYOUT 끝 (여기서 모든 칼럼 종료) */}
      {/* ================================================ */}
      </div>
    </main>
  );
}


export default VideoAnalyzer;
