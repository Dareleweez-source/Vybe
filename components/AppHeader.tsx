import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  TvIcon,
  NotificationsIcon,
  MailIcon
} from '../constants';

interface AppHeaderProps {
  currentUser?: User;
  activeView: string;
  onNavigate: (path: string) => void;
  openCompose?: () => void;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeView, onNavigate, children }) => {
  const showTopRow = activeView === 'Home';
  const isVideoView = activeView === 'Videos';

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (activeView !== 'Home') {
    return <></>;
  }

  return (
    <div className={`sticky top-0 z-20 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isVideoView ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent' : 'bg-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-border shadow-xs'}`}>
      <div className="max-w-2xl mx-auto">
        {showTopRow && (
          <div className="flex items-center justify-between w-full h-14 px-4 py-2">
            <div className="flex items-center gap-3">
              <h1 
                onClick={() => { onNavigate('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-3xl sm:text-3.5xl font-black italic tracking-tight cursor-pointer select-none font-serif bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent leading-none"
              >
                cascade
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('Notifications'); }} 
                aria-label="Notifications" 
                className="p-1.5 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-on-surface dark:text-dark-on-surface transition-colors relative"
              >
                <NotificationsIcon className="w-8 h-8 stroke-[2.2]"/>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('Messages'); }} 
                aria-label="Direct Messages" 
                className="p-1.5 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-on-surface dark:text-dark-on-surface transition-colors"
              >
                <MailIcon className="w-8 h-8 stroke-[2.2]"/>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('live'); }} 
                aria-label="Live Stream" 
                className="p-1.5 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-on-surface dark:text-dark-on-surface transition-colors"
              >
                <TvIcon className="w-8 h-8 stroke-[2.2]"/>
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default AppHeader;
