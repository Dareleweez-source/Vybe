
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Story } from '../types';
import { EmojiIcon, SendIcon } from '../constants';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  usersWithStories: { user: User, stories: Story[] }[];
  initialUserIndex: number;
  onStoryReaction: (storyId: string, emoji: string) => void;
  onStoryReply: (storyId: string, text: string) => void;
}

const IMAGE_DURATION = 5000; // 5 seconds
const VIDEO_MAX_DURATION = 30000; // 30 seconds
const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

const CLOSE_ICON = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);


const StoryViewer: React.FC<StoryViewerProps> = ({ isOpen, onClose, usersWithStories, initialUserIndex, onStoryReaction, onStoryReply }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string }[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setCurrentUserIndex(initialUserIndex);
        setCurrentStoryIndex(0);
        setIsPaused(false);
        setIsLoading(true);
      }, 0);
    } else {
        setTimeout(() => {
            setReplyText('');
            setShowEmojiPicker(false);
        }, 0);
    }
  }, [isOpen, initialUserIndex]);

  const advanceStory = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (isPaused) return;
    const currentUserStories = usersWithStories[currentUserIndex]?.stories;
    if (!currentUserStories) return; 
    setReplyText('');
    setShowEmojiPicker(false);
    setIsLoading(true);

    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < usersWithStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentUserIndex, currentStoryIndex, usersWithStories, onClose, isPaused]);
  
  const goBackStory = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      setReplyText('');
      setShowEmojiPicker(false);
      setIsLoading(true);

      if (currentStoryIndex > 0) {
          setCurrentStoryIndex(prev => prev - 1);
      } else if (currentUserIndex > 0) {
          const prevUserStories = usersWithStories[currentUserIndex - 1].stories;
          setCurrentUserIndex(prev => prev - 1);
          setCurrentStoryIndex(prevUserStories.length - 1);
      }
  }, [currentUserIndex, currentStoryIndex, usersWithStories]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        advanceStory(e);
      } else if (e.key === 'ArrowLeft') {
        goBackStory(e);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, advanceStory, goBackStory, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    const story = usersWithStories[currentUserIndex]?.stories[currentStoryIndex];
    if (!story) return;

    const videoElement = videoRef.current;
    let imageTimer: number;
    let videoTimer: number;

    const handleVideoEnd = () => advanceStory();
    const handleVideoError = (e: any) => {
        console.warn("Story video failed to load, skipping...", e);
        advanceStory();
    };
    const handleCanPlay = () => setIsLoading(false);

    const cleanup = () => {
        clearTimeout(imageTimer);
        clearTimeout(videoTimer);
        if (videoElement) {
            videoElement.removeEventListener('ended', handleVideoEnd);
            videoElement.removeEventListener('error', handleVideoError);
            videoElement.removeEventListener('canplay', handleCanPlay);
            if (!videoElement.paused) {
                videoElement.pause();
            }
        }
    };

    if (story.fileType === 'image' || story.fileType === 'text') {
        setTimeout(() => setIsLoading(false), 0);
        if (!isPaused) {
            imageTimer = window.setTimeout(advanceStory, IMAGE_DURATION);
        }
    } else if (story.fileType === 'video' && videoElement) {
        if (videoElement.readyState < 3) {
            setTimeout(() => setIsLoading(true), 0);
        } else {
            setTimeout(() => setIsLoading(false), 0);
        }

        videoElement.addEventListener('ended', handleVideoEnd);
        videoElement.addEventListener('error', handleVideoError);
        videoElement.addEventListener('canplay', handleCanPlay);
        
        if (isPaused) {
            videoElement.pause();
        } else {
            const playPromise = videoElement.play();
            if (playPromise) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.warn("Story video play suppressed:", error);
                    }
                });
            }
            videoTimer = window.setTimeout(advanceStory, VIDEO_MAX_DURATION);
        }
    }

    return cleanup;

  }, [isOpen, currentUserIndex, currentStoryIndex, isPaused, advanceStory, usersWithStories]);

  if (!isOpen) return null;

  const currentUserGroup = usersWithStories[currentUserIndex];
  if (!currentUserGroup) {
      onClose();
      return null;
  }
  const currentStory = currentUserGroup.stories[currentStoryIndex];

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!(e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement)) {
        setIsPaused(true);
    }
  }
  const handleTouchEnd = () => setIsPaused(false);
  
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (replyText.trim()) {
        onStoryReply(currentStory.id, replyText.trim());
        setReplyText('');
    }
  };

  const handleSendReaction = (emoji: string) => {
    onStoryReaction(currentStory.id, emoji);
    setShowEmojiPicker(false);
    const newId = new Date().getTime();
    setFloatingEmojis(prev => [...prev, { id: newId, emoji }]);
    setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== newId));
    }, 2000); 
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-[450px] max-h-screen aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
          {currentUserGroup.stories.map((story, index) => (
            <div key={story.id} className="h-1 bg-white/30 rounded-full flex-1">
               <div
                key={`${story.id}-${currentUserIndex}-${currentStoryIndex}`}
                className="h-full bg-white rounded-full"
                style={{
                  width: index < currentStoryIndex ? '100%' : '0%',
                  animation: index === currentStoryIndex && !isPaused && !isLoading
                    ? `fill-progress ${story.fileType === 'video' ? VIDEO_MAX_DURATION : IMAGE_DURATION}ms linear forwards`
                    : 'none',
                }}
              />
            </div>
          ))}
           <style>{`
                @keyframes fill-progress { from { width: 0% } to { width: 100% } }
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0.5); opacity: 1; }
                    100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
                }
                .float-animation { animation: float-up 2s ease-out forwards; }
                @keyframes story-transition {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .story-content-animate {
                  animation: story-transition 0.4s ease-in-out;
                }
            `}</style>
        </div>
        
        {/* Header */}
        <div className="absolute top-5 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <img src={currentUserGroup.user.avatarUrl} className="w-8 h-8 rounded-full border border-white/20" />
                <div>
                  <span className="text-white font-bold text-sm shadow-sm">{currentUserGroup.user.name}</span>
                  {currentStory.isAd && <p className="text-[10px] text-white/80 font-bold uppercase tracking-tight">Sponsored</p>}
                </div>
            </div>
          <button onClick={onClose} className="text-white drop-shadow-md hover:scale-110 transition-transform">
            <CLOSE_ICON className="w-6 h-6" />
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        )}

        {/* Content */}
        <div 
          className="flex-1 w-full h-full select-none z-0"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div key={currentStory.id} className="w-full h-full story-content-animate">
            {currentStory.fileType === 'image' && (
              <img src={currentStory.imageUrl} className="w-full h-full object-cover" />
            )}
            {currentStory.fileType === 'video' && (
              <video 
                ref={videoRef}
                key={currentStory.videoUrl}
                src={currentStory.videoUrl} 
                className="w-full h-full object-cover" 
                playsInline
              />
            )}
            {currentStory.fileType === 'text' && (
              <div className={`w-full h-full flex items-center justify-center p-8 ${currentStory.backgroundStyle}`}>
                <p className={`text-3xl font-bold text-center break-words ${currentStory.fontStyle} ${currentStory.textColor || 'text-white'}`}>
                  {currentStory.text}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-20 right-8 flex flex-col-reverse gap-4 pointer-events-none">
            {floatingEmojis.map(({ id, emoji }) => (
                <div key={id} className="float-animation text-4xl">
                    {emoji}
                </div>
            ))}
        </div>

        {/* Footer */}
        {currentStory.isAd && currentStory.ctaLink ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <a 
                href={currentStory.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white/90 text-black text-center font-bold py-3 rounded-full hover:bg-white transition-colors shadow-lg"
              >
                {currentStory.ctaText || 'Learn More'}
              </a>
          </div>
        ) : (
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                 {showEmojiPicker && (
                    <div className="flex items-center justify-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-full mb-3 border border-white/10">
                        {EMOJI_REACTIONS.map(emoji => (
                            <button key={emoji} onClick={() => handleSendReaction(emoji)} className="text-3xl hover:scale-125 transition-transform">
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="bg-black/50 backdrop-blur-md text-white rounded-full p-2.5 border border-white/20">
                        <EmojiIcon className="w-6 h-6" />
                    </button>
                    <input 
                        type="text"
                        value={replyText}
                        onFocus={() => setIsPaused(true)}
                        onBlur={() => setIsPaused(false)}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${currentUserGroup.user.name}...`}
                        className="w-full bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/70"
                    />
                    <button type="submit" className="text-white font-bold p-2.5 drop-shadow-md">
                        <SendIcon className="w-6 h-6"/>
                    </button>
                </form>
            </div>
        )}

        {/* Tap Navigation Zones */}
        <div className="absolute inset-0 flex z-10">
            <div className="w-1/3 h-full" onClick={goBackStory}></div>
            <div className="w-2/3 h-full" onClick={advanceStory}></div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
