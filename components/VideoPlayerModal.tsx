

import React, { useState, useRef, useEffect } from 'react';
// FIX: Added WatchableAd to types.ts and importing it here.
import type { WatchableAd } from '../types';
import { MonetizationIcon } from '../constants';

interface VideoPlayerModalProps {
  ad: WatchableAd;
  onClose: () => void;
  onRewardClaimed: (adId: string) => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ ad, onClose, onRewardClaimed }) => {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleVideoEnd = () => {
      setIsVideoFinished(true);
      setProgress(100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  const handleClaim = () => {
    onRewardClaimed(ad.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 id="video-player-title" className="text-xl font-bold">{ad.title}</h2>
            <button 
                onClick={onClose}
                className="text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={ad.videoUrl}
            controls
            autoPlay
            playsInline
            onError={() => {
              console.warn("Ad video failed to load source, enabling claim...", ad.videoUrl);
              setIsVideoFinished(true);
            }}
            className="w-full h-full"
          />
        </div>
        <div className="p-4 bg-surface">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <button
              onClick={handleClaim}
              disabled={!isVideoFinished}
              className="w-full bg-primary text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MonetizationIcon className="w-6 h-6" />
              Claim ${(ad.reward / 100).toFixed(2)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
