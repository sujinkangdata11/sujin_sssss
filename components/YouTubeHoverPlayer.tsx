import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<any> | null = null;

const loadYouTubeIframeAPI = (): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires window.'));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve(window.YT);
      };
    });
  }

  return youtubeApiPromise;
};

interface YouTubeHoverPlayerProps {
  videoId: string;
  className?: string;
  style?: React.CSSProperties;
}

const YouTubeHoverPlayer: React.FC<YouTubeHoverPlayerProps> = ({ videoId, className, style }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (!isMounted || !containerRef.current) return;

        playerRef.current = new YT.Player(containerRef.current, {
          videoId,
          host: 'https://www.youtube.com',
          playerVars: {
            autoplay: 0,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: () => {
              if (!isMounted) return;
              try {
                playerRef.current?.mute?.();
              } catch (error) {
                console.warn('⚠️ [YouTubeHoverPlayer] mute 실패:', error);
              }
              setIsReady(true);
            }
          }
        });
      })
      .catch((error) => {
        console.error('❌ [YouTubeHoverPlayer] API 로드 실패:', error);
      });

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.stopVideo?.();
          playerRef.current.destroy?.();
        } catch (error) {
          console.warn('⚠️ [YouTubeHoverPlayer] destroy 실패:', error);
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const handlePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.mute?.();
      playerRef.current.playVideo?.();
    } catch (error) {
      console.warn('⚠️ [YouTubeHoverPlayer] play 실패:', error);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.pauseVideo?.();
    } catch (error) {
      console.warn('⚠️ [YouTubeHoverPlayer] pause 실패:', error);
    }
  }, []);

  return (
    <div
      className={className}
      style={{ position: 'relative', cursor: 'pointer', ...style }}
      onMouseEnter={handlePlay}
      onMouseLeave={handlePause}
      onFocus={handlePlay}
      onBlur={handlePause}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.08))'
          }}
        >
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>로딩 중...</span>
        </div>
      )}
    </div>
  );
};

export default YouTubeHoverPlayer;
