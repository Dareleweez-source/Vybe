
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Post as PostType, User, Product, Community } from '../types';
import { 
    BackIcon,
    PlayIcon, 
    PauseIcon,
    VolumeUpIcon, 
    VolumeOffIcon,
    AddIcon
} from '../constants';
import ShareModal from './ShareModal';
import RepostModal from './RepostModal';
import { useNotifications } from './Notifications';

// Reusing PostProps, but adding onBack.
interface VideoPlayerPageProps {
  post: PostType;
  onBack: () => void;
  currentUser: User;
  allUsers: User[];
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openTipModal: (user: User) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  claimedPostRewardIds: string[];
  handleClaimPostReward: (postId: string, reward: number) => void;
  viewCommunity: (community: Community) => void;
  handleSearch: (query: string) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handleOpenEditModal: (post: PostType) => void;
  handleViewProfile: (userId: string) => void;
  handlePlayVideo: (postId: string) => void;
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
  allPosts: PostType[];
}

const formatCount = (count: number): string => {
  if (!count) return '0';
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
};

// Custom Reels Icons matching the exact screenshot design
const YellowVerifiedBadge = () => (
  <svg className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.49 4.49 0 01-3.397 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.498-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 011.307-3.498 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53-1.471-1.47a.75.75 0 00-1.06 1.06l2.031 2.031a.75.75 0 001.14-.094l3.816-5.345z" clipRule="evenodd" />
  </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const HeartIconFilled = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const ChatBubbleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.585 1.637a9.75 9.75 0 01-1.892 3.261.75.75 0 00.536 1.272 11.2 11.2 0 004.982-1.311c.548-.27 1.182-.204 1.666.07A8.96 8.96 0 0012 20.25z" />
  </svg>
);

const LoopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const BookmarkRibbonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const BookmarkRibbonFilled = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const DotsHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const VideoPlayerPage: React.FC<VideoPlayerPageProps> = (props) => {
  const { post, handleToggleLike, handleToggleEcho, handleToggleBookmark, handleSubscribe, handleViewPost, handleViewProfile, handleOpenQuoteModal, handleShareToCommunity, onBack, onNavigate, allPosts, subscribedToUserIds } = props;

  const videoUrl = useMemo(() => {
      if (post.videoUrl) return post.videoUrl;
      if (post.media) {
          const videoMedia = post.media.find(m => m.type === 'video');
          if (videoMedia) return videoMedia.url;
      }
      return '';
  }, [post]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const isFollowing = subscribedToUserIds?.includes(post.user.id);
  
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
  const { addNotification } = useNotifications();

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const videoPosts = useMemo(() => {
      return (allPosts || []).filter(p => p.fileType === 'video' || p.videoUrl || (p.media && p.media.some(m => m.type === 'video')));
  }, [allPosts]);

  const currentIndex = videoPosts.findIndex(p => p.id === post.id);
  const nextVideo = currentIndex !== -1 && currentIndex < videoPosts.length - 1 ? videoPosts[currentIndex + 1] : null;
  const prevVideo = currentIndex !== -1 && currentIndex > 0 ? videoPosts[currentIndex - 1] : null;

  const handleScroll = useCallback((e: React.WheelEvent) => {
      if (e.deltaY > 50 && nextVideo) {
          onNavigate(`video/${nextVideo.id}`);
      } else if (e.deltaY < -50 && prevVideo) {
          onNavigate(`video/${prevVideo.id}`);
      }
  }, [nextVideo, prevVideo, onNavigate]);

  // Touch handling for swipe navigation
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;

      if (diff > 50 && nextVideo) {
          onNavigate(`video/${nextVideo.id}`);
      } else if (diff < -50 && prevVideo) {
          onNavigate(`video/${prevVideo.id}`);
      }
      touchStartY.current = null;
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.warn("Video play prevented:", error);
              setIsPlaying(false);
            }
          });
        }
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
       const playPromise = videoElement.play();
       if (playPromise !== undefined) {
          playPromise.catch(error => {
             if (error.name === 'AbortError') return;
             if (error.name === 'NotAllowedError') {
                 videoElement.muted = true;
                 setIsMuted(true);
                 videoElement.play().catch(() => setIsPlaying(false));
             } else {
                 setIsPlaying(false);
             }
          });
       }
    }
    return () => {
        if (videoElement) videoElement.pause();
    };
  }, [post.id]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareMenuOpen(false);
    const url = `https://cascade-app.dev/post/${post.id}`;
    const shareData = {
      title: `Reel by ${post.user.name}`,
      text: post.content,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addNotification('Link copied to clipboard!', 'info');
      } catch {
        addNotification('Failed to copy link.', 'info');
      }
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareMenuOpen(false);
    const url = `https://cascade-app.dev/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
        addNotification('Link copied to clipboard!', 'info');
    }).catch(() => {
        addNotification('Failed to copy link.', 'info');
    });
  };

  // Caption processing for hashtags
  const userHandle = `@${post.user.handle.replace('@', '')}`;
  const displayLikes = formatCount(post.likes || 3200);
  const displayComments = formatCount(post.comments || 210);
  const displayEchos = formatCount(post.echos || 600);

  return (
    <div 
        className="w-full h-[100dvh] bg-black text-white flex flex-col relative overflow-hidden select-none" 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleScroll}
        ref={containerRef}
    >
      {/* 1. TOP BAR OVERLAY */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
            aria-label="Back"
          >
            <BackIcon className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          {/* Header Title: "Reels ∨" */}
          <div className="flex items-center gap-1 cursor-pointer group" onClick={() => onNavigate('Videos')}>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans drop-shadow-md">
              Reels
            </h1>
            <ChevronDownIcon className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Camera Icon on top right */}
        <button 
          onClick={() => onNavigate('Compose')} 
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          aria-label="Camera / Create Reel"
        >
          <CameraIcon className="w-6 h-6 stroke-[2]" />
        </button>
      </div>

      {/* 2. FULLSCREEN VIDEO CONTENT */}
      <div className="w-full h-full relative bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Mute/Unmute Overlay Icon on Tap */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute top-20 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white/90 hover:text-white transition-opacity z-20"
          aria-label="Toggle Mute"
        >
          {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
        </button>

        {/* Bottom Ambient Dark Gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
      </div>

      {/* 3. RIGHT VERTICAL ACTION BAR */}
      <div className="absolute right-3 bottom-14 z-30 flex flex-col items-center gap-3.5 text-white">
        {/* User Profile Avatar with Plus Badge */}
        <div className="relative mb-1 cursor-pointer group" onClick={() => handleViewProfile(post.user.id)}>
          <img 
            src={post.user.avatarUrl} 
            alt={post.user.name} 
            className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-md group-hover:scale-105 transition-transform"
          />
          {!isFollowing && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleSubscribe(post.user.id); }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-black shadow-md hover:scale-110 transition-transform"
              aria-label="Follow"
            >
              <AddIcon className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <button 
          onClick={() => handleToggleLike(post.id)} 
          className="flex flex-col items-center gap-0.5 group focus:outline-none"
          aria-label="Like"
        >
          <div className="p-1 transition-transform group-active:scale-125">
            {post.isLiked ? (
              <HeartIconFilled className="w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-md" />
            ) : (
              <HeartIcon className="w-8 h-8 text-white drop-shadow-md" />
            )}
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-md">
            {displayLikes}
          </span>
        </button>

        {/* Comment Button */}
        <button 
          onClick={() => handleViewPost(post)} 
          className="flex flex-col items-center gap-0.5 group focus:outline-none"
          aria-label="Comment"
        >
          <div className="p-1 transition-transform group-active:scale-125">
            <ChatBubbleIcon className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-md">
            {displayComments}
          </span>
        </button>

        {/* Repost / Loop Button */}
        <button 
          onClick={() => setRepostMenuOpen(true)} 
          className="flex flex-col items-center gap-0.5 group focus:outline-none"
          aria-label="Repost"
        >
          <div className="p-1 transition-transform group-active:scale-125">
            <LoopIcon className={`w-8 h-8 drop-shadow-md ${post.isEchoed ? 'text-emerald-400' : 'text-white'}`} />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-md">
            {displayEchos}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button 
          onClick={() => handleToggleBookmark(post.id)} 
          className="p-1 transition-transform active:scale-125 focus:outline-none"
          aria-label="Bookmark"
        >
          {post.isBookmarked ? (
            <BookmarkRibbonFilled className="w-8 h-8 text-primary fill-primary drop-shadow-md" />
          ) : (
            <BookmarkRibbonIcon className="w-8 h-8 text-white drop-shadow-md" />
          )}
        </button>

        {/* Share / Send Button */}
        <button 
          onClick={() => setShareMenuOpen(true)} 
          className="p-1 transition-transform active:scale-125 focus:outline-none"
          aria-label="Share"
        >
          <PaperAirplaneIcon className="w-8 h-8 text-white drop-shadow-md -rotate-12" />
        </button>

        {/* Three Dots Button */}
        <button 
          onClick={() => setShareMenuOpen(true)} 
          className="p-1 transition-transform active:scale-125 focus:outline-none mt-0.5"
          aria-label="More options"
        >
          <DotsHorizontalIcon className="w-7 h-7 text-white drop-shadow-md" />
        </button>
      </div>

      {/* 4. BOTTOM LEFT OVERLAY: AUTHOR, CAPTION, HASHTAGS */}
      <div className="absolute left-3 right-16 bottom-11 z-30 flex flex-col text-white pointer-events-auto">
        {/* Profile Avatar on its own row */}
        <div className="mb-2">
          <img 
            src={post.user.avatarUrl} 
            alt={post.user.name} 
            className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md cursor-pointer"
            onClick={() => handleViewProfile(post.user.id)}
          />
        </div>

        {/* Author Name, Verified Badge, Handle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span 
            onClick={() => handleViewProfile(post.user.id)}
            className="font-bold text-base text-white drop-shadow-md hover:underline cursor-pointer tracking-tight"
          >
            {post.user.name}
          </span>
          <YellowVerifiedBadge />
          <span className="text-xs text-white/80 font-normal drop-shadow-xs">
            {userHandle}
          </span>
        </div>

        {/* Follow Button on its own row */}
        <div className="mt-1.5 mb-2">
          <button 
            onClick={() => handleSubscribe(post.user.id)}
            className="border border-white/90 rounded-full px-4 py-0.5 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-xs transition-colors shadow-xs"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Caption Text */}
        <p className="text-sm font-normal text-white/95 drop-shadow-md leading-relaxed line-clamp-3 pr-2 mb-1.5">
          {post.content || "Check out this amazing drone footage from our latest trip! The perspective from up here is just breathtaking. 🚁🌍"}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 text-sm font-bold text-white drop-shadow-md">
          <span className="cursor-pointer hover:underline">#Drone</span>
          <span className="cursor-pointer hover:underline">#Travel</span>
          <span className="cursor-pointer hover:underline">#Adventure</span>
        </div>
      </div>

      {/* 5. BOTTOM PROGRESS BAR & TIMESTAMPS */}
      <div className="absolute bottom-2.5 left-3 right-3 z-30 flex items-center justify-between gap-2.5 text-white text-xs">
        {/* Play/Pause Button */}
        <button onClick={togglePlay} className="text-white hover:opacity-80 flex-shrink-0">
          {isPlaying ? <PauseIcon className="w-5 h-5 fill-current" /> : <PlayIcon className="w-5 h-5 fill-current" />}
        </button>

        {/* Progress Scrubber */}
        <div 
          className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative touch-none my-1"
          onClick={handleSeek}
          ref={progressRef}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-white rounded-full" 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md"></div>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[11px] font-medium text-white/90 drop-shadow-md flex-shrink-0 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration || 45)}
        </span>

        {/* Dots */}
        <button onClick={() => setShareMenuOpen(true)} className="text-white hover:opacity-80 flex-shrink-0">
          <DotsHorizontalIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Modals */}
      <ShareModal 
          isOpen={isShareMenuOpen}
          onClose={() => setShareMenuOpen(false)}
          post={post}
          handleEcho={handleToggleEcho}
          handleQuotePost={handleOpenQuoteModal}
          handleNativeShare={handleNativeShare}
          handleCopyLink={handleCopyLink}
          handleShareToCommunity={(e) => { e.stopPropagation(); handleShareToCommunity(post); setShareMenuOpen(false); }}
      />
      
      <RepostModal 
          isOpen={isRepostMenuOpen} 
          onClose={() => setRepostMenuOpen(false)} 
          post={post} 
          handleEcho={handleToggleEcho} 
          handleQuotePost={handleOpenQuoteModal} 
      />
    </div>
  );
};

export default VideoPlayerPage;

