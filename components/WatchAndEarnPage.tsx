

import React, { useState, useRef, useEffect } from 'react';
// FIX: Added WatchableAd to types.ts and MOCK_WATCHABLE_ADS to mockData.ts and importing them here.
import type { WatchableAd } from '../types';
import { MonetizationIcon, PlayIcon, BackIcon } from '../constants';
import { MOCK_WATCHABLE_ADS } from '../mockData';
import VideoPlayerModal from './VideoPlayerModal';

// AdThumbnailCard displays the ad info and handles click to open modal
const AdThumbnailCard: React.FC<{
  ad: WatchableAd;
  isWatched: boolean;
  onClick: () => void;
}> = ({ ad, isWatched, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-surface dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
  >
    <div className="relative flex-shrink-0 w-48 h-28">
        <img 
            src={ad.thumbnailUrl} 
            alt={ad.title} 
            className="w-full h-full object-cover rounded-md bg-black" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
            <div className="bg-black/60 p-2 rounded-full text-white backdrop-blur-sm shadow-sm">
                <PlayIcon className="w-6 h-6" />
            </div>
        </div>
        {isWatched && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                <span className="text-white font-bold text-sm bg-green-500/80 px-2 py-1 rounded">Watched</span>
             </div>
        )}
    </div>
    <div className="flex-1 min-w-0">
        <h3 className="font-bold truncate">{ad.title}</h3>
        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary line-clamp-2">{ad.description}</p>
        <div className={`font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 text-xs mt-2 ${isWatched ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
            <MonetizationIcon className="w-4 h-4" />
            <span>+${(ad.reward / 100).toFixed(2)}</span>
        </div>
    </div>
  </div>
);

interface WatchAndEarnPageProps {
  watchedAdIds: string[];
  onWatchAdComplete: (adId: string) => void;
  onBack: () => void;
}

export const WatchAndEarnPage: React.FC<WatchAndEarnPageProps> = ({ watchedAdIds, onWatchAdComplete, onBack }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef<number>(0);
  const [selectedAd, setSelectedAd] = useState<WatchableAd | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full pb-16 md:pb-0">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-dark-border transition-transform duration-300 flex items-center gap-4 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Watch & Earn</h1>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Watch short videos to earn ad credits</p>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {MOCK_WATCHABLE_ADS.map(ad => (
          <AdThumbnailCard
            key={ad.id}
            ad={ad}
            isWatched={watchedAdIds.includes(ad.id)}
            onClick={() => setSelectedAd(ad)}
          />
        ))}
      </div>

      {selectedAd && (
        <VideoPlayerModal 
            ad={selectedAd} 
            onClose={() => setSelectedAd(null)}
            onRewardClaimed={onWatchAdComplete}
        />
      )}
    </div>
  );
};
