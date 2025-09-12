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

import c from 'classnames';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import YouTube from 'react-youtube';
import {timeToSecs} from './utils';

const formatTime = (t) =>
  `${Math.floor(t / 60)}:${Math.floor(t % 60)
    .toString()
    .padStart(2, '0')}`;

export default function VideoPlayer({
  videoId,
  timecodeList,
  requestedTimecode,
  jumpToTimecode,
  onLoadVideo,
  youtubeUrlInput,
  setYoutubeUrlInput,
}) {
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(null);
  const intervalRef = useRef(null);

  const scrubberTime = duration > 0 ? currentTime / duration : 0;
  const currentPercent = scrubberTime * 100;

  const timecodeListReversed = useMemo(
    () => timecodeList?.toReversed(),
    [timecodeList],
  );

  const startTicking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (player) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        if (timecodeListReversed) {
          setCurrentCaption(
            timecodeListReversed.find((t) => timeToSecs(t.time) <= time)?.text,
          );
        }
      }
    }, 100);
  }, [player, timecodeListReversed]);

  const stopTicking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }, [isPlaying, player]);

  const onPlayerReady = (event) => {
    setPlayer(event.target);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(player.getDuration());
      startTicking();
    } else {
      setIsPlaying(false);
      stopTicking();
    }
  };

  useEffect(() => {
    if (player && requestedTimecode !== null) {
      player.seekTo(requestedTimecode, true);
    }
  }, [player, requestedTimecode]);

  useEffect(() => {
    const onKeyPress = (e) => {
      if (
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        e.key === ' '
      ) {
        e.preventDefault();
        togglePlay();
      }
    };

    addEventListener('keypress', onKeyPress);
    return () => removeEventListener('keypress', onKeyPress);
  }, [togglePlay]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    stopTicking();
  }, [videoId, stopTicking]);

  return (
    <div className="videoPlayer">
      {videoId ? (
        <>
          <div className="youtube-player-container">
            <YouTube
              videoId={videoId}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              opts={{
                height: '100%',
                width: '100%',
                playerVars: {
                  controls: 1,
                  modestbranding: 1,
                  rel: 0,
                },
              }}
              style={{height: '100%', width: '100%'}}
            />

            {currentCaption && (
              <div className="videoCaption">{currentCaption}</div>
            )}
          </div>

          <div className="videoControls">
            <div className="videoScrubber">
              <input
                style={{'--pct': `${currentPercent}%`} as React.CSSProperties}
                type="range"
                min="0"
                max="1"
                value={scrubberTime || 0}
                step="0.000001"
                onChange={(e) => {
                  const newScrubberTime = e.target.valueAsNumber;
                  const newCurrentTime = newScrubberTime * duration;
                  setCurrentTime(newCurrentTime);
                  if (player) {
                    player.seekTo(newCurrentTime, true);
                  }
                }}
                onPointerDown={() => setIsScrubbing(true)}
                onPointerUp={() => setIsScrubbing(false)}
              />
            </div>
            <div className="timecodeMarkers">
              {timecodeList?.map(({time, text, value}, i) => {
                const secs = timeToSecs(time);
                const pct = (secs / duration) * 100;

                return (
                  <div
                    className="timecodeMarker"
                    key={i}
                    style={{left: `${pct}%`}}>
                    <div
                      className="timecodeMarkerTick"
                      onClick={() => jumpToTimecode(secs)}>
                      <div />
                    </div>
                    <div
                      className={c('timecodeMarkerLabel', {right: pct > 50})}>
                      <div>{time}</div>
                      <p>{value || text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="videoTime">
              <button>
                <span className="icon" onClick={togglePlay}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </>
      ) : (
        <div className="emptyVideo">
          <p>Enter a YouTube URL above to get started.</p>
        </div>
      )}
    </div>
  );
}
