import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import Step1 from '../InfoShorts/steps/Step1';
import infoShortsStyles from '../InfoShorts/InfoShorts.module.css';
import { Language } from '../../types';
import { fetchChannelIds } from '../../utils/channelCsv';

const STORY_CHANNEL_CSV_URL = new URL('../../pages/channel_ID/story_channel.csv', import.meta.url).href;

interface StoryShortsProps {
  language: Language;
}

const getPreferredTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const StoryShorts: React.FC<StoryShortsProps> = ({ language }) => {
  const [theme] = useState<'light' | 'dark'>(getPreferredTheme);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [requestedTimecode, setRequestedTimecode] = useState<number | null>(null);
  const [allowedChannelIds, setAllowedChannelIds] = useState<string[] | null>(null);

  const videoColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!youtubeUrlInput.trim()) {
      setYoutubeVideoId(null);
      setRequestedTimecode(null);
    }
  }, [youtubeUrlInput]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadChannelIds = async () => {
      try {
        const ids = await fetchChannelIds(STORY_CHANNEL_CSV_URL, { signal: controller.signal });
        if (!isCancelled) {
          setAllowedChannelIds(ids);
        }
      } catch (error) {
        if (controller.signal.aborted || isCancelled) {
          return;
        }
        console.error('story_channel.csv 로드 실패:', error);
        setAllowedChannelIds([]);
      }
    };

    loadChannelIds();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, []);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleLoadVideo = (event: React.FormEvent) => {
    event.preventDefault();
    const videoId = extractYoutubeId(youtubeUrlInput);

    if (videoId) {
      setYoutubeVideoId(videoId);
      setRequestedTimecode(null);
    } else {
      alert('Invalid YouTube URL. Please enter a valid URL.');
    }
  };

  const handleRequestedTimecode = (timecode: number) => {
    setRequestedTimecode(timecode);
  };

  const currentHeight = youtubeVideoId ? '250vh' : '210vh';

  return (
    <main className={classNames(theme, infoShortsStyles.infoShortsContainer)}>
      <div className={infoShortsStyles.stepViewport} style={{ minHeight: currentHeight }}>
        <Step1
          currentStep={1}
          previousStep={1}
          navigationDirection={null}
          youtubeUrlInput={youtubeUrlInput}
          setYoutubeUrlInput={setYoutubeUrlInput}
          handleLoadVideo={handleLoadVideo}
          youtubeVideoId={youtubeVideoId ?? ''}
          requestedTimecode={(requestedTimecode ?? null) as unknown as number}
          timecodeList={[] as unknown as number[]}
          setRequestedTimecode={handleRequestedTimecode as unknown as (timecode: number) => void}
          videoColumnRef={videoColumnRef}
          language={language}
          allowedChannelIds={allowedChannelIds}
        />
      </div>
    </main>
  );
};

export default StoryShorts;
