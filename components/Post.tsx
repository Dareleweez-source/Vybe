import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Post as PostType, User, Product, Community, Poll, PostAnalytics } from '../types';
import { CommentIcon, EchoIcon, LikeIcon, ShareIcon, MoreIcon, LikedIcon, BookmarkIcon, BookmarkedIcon, LockIcon, StarIcon, GiftIcon, VerifiedIcon, AnalyticsIcon, PlayIcon, LinkIcon, CalendarIcon, PauseIcon, VolumeOffIcon, VolumeUpIcon, RocketIcon, FullscreenIcon, LocationIcon, AlertIcon } from '../constants';
import ProductCard from './ProductCard';
import PostAnalyticsModal from './PostAnalyticsModal';
import { useNotifications } from './Notifications';
import { useLanguage } from '../contexts/LanguageContext';
import ShareModal from './ShareModal';
import RepostModal from './RepostModal';
import ReportModal from './ReportModal';

const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
};

interface PostProps {
  post: PostType;
  currentUser: User;
  allUsers: User[];
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  handleSearch: (query: string) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handleOpenEditModal: (post: PostType) => void;
  handleOpenBoostModal?: (post: PostType) => void;
  handleViewProfile: (userId: string) => void;
  handlePlayVideo: (postId: string) => void;
  handleTogglePlayVideo?: (postId: string) => void;
  playingVideoId: string | null;
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
  onReportContent?: (type: 'post' | 'comment' | 'user', id: string, reason: string, description: string, communityId?: string) => void;
  isDetailView?: boolean;
  isBoosted?: boolean;
}

const PollDisplay: React.FC<{ initialPoll: Poll }> = ({ initialPoll }) => {
    const [poll, setPoll] = useState(initialPoll);
    const [votedChoice, setVotedChoice] = useState<number | null>(null);
    const [isPollEnded, setIsPollEnded] = useState(false);
    
    useEffect(() => {
        const pollEndTime = new Date(poll.endsAt).getTime();
        const checkPollEnd = () => {
            if (new Date().getTime() > pollEndTime) {
                setIsPollEnded(true);
            }
        };
        checkPollEnd();
        const interval = setInterval(checkPollEnd, 60000); 
        return () => clearInterval(interval);
    }, [poll.endsAt]);

    const handleVote = (choiceIndex: number) => {
        if (votedChoice !== null || isPollEnded) return;
        
        setVotedChoice(choiceIndex);
        const newChoices = poll.choices.map((choice, index) => {
            if (index === choiceIndex) {
                return { ...choice, votes: choice.votes + 1 };
            }
            return choice;
        });
        setPoll({ ...poll, choices: newChoices });
    };

    const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0);

    const getTimeRemaining = () => {
        const now = new Date().getTime();
        const endTime = new Date(poll.endsAt).getTime();
        const distance = endTime - now;
        if (distance < 0) return "Poll ended";
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d left`;
        if (hours > 0) return `${hours}h left`;
        return `${minutes}m left`;
    };

    const hasVoted = votedChoice !== null;

    return (
        <div className="mt-3 space-y-2">
            {poll.choices.map((choice, index) => {
                const percentage = totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0;
                const isVotedOption = votedChoice === index;

                return (
                    <div key={index}>
                        {hasVoted || isPollEnded ? (
                            <div className="relative w-full h-9 rounded-md border border-gray-300 dark:border-dark-border overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20" style={{ width: `${percentage}%` }}></div>
                                <div className="absolute inset-0 px-3 flex items-center justify-between text-sm font-semibold">
                                    <span className="flex items-center gap-2">
                                        <span>{choice.text}</span>
                                        {isVotedOption && <span className="text-primary">✓</span>}
                                    </span>
                                    <span>{percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleVote(index)}
                                className="w-full text-left font-semibold px-4 py-2 border-2 border-gray-300 dark:border-dark-border rounded-md hover:border-primary dark:hover:border-primary transition-colors duration-200"
                            >
                                {choice.text}
                            </button>
                        )}
                    </div>
                );
            })}
            <div className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">
                <span>{totalVotes.toLocaleString()} votes</span>
                {!isPollEnded && <span> · {getTimeRemaining()}</span>}
            </div>
        </div>
    );
};


const PostComponent: React.FC<PostProps> = ({ post, currentUser, subscribedToUserIds, handleToggleLike, handleToggleEcho, handleToggleBookmark, handleSubscribe, openGiftModal, handleAddToCart, viewCommunity, handleSearch, handleToggleBlock, handleViewPost, handleOpenQuoteModal, handleOpenEditModal, handleOpenBoostModal, handleViewProfile, handlePlayVideo, handleTogglePlayVideo, playingVideoId, onNavigate, onReportContent, isDetailView = false, isBoosted = false }) => {
  const [isAnalyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const isScheduled = post.status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) > new Date();

  const [isMuted, setIsMuted] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef<number>(0);
  
  // Video Controls State
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const isPlaying = playingVideoId === post.id;

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setVideoCurrentTime(video.currentTime);
      if (video.duration > 0) {
          setVideoProgress((video.currentTime / video.duration) * 100);
      }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setVideoDuration(e.currentTarget.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const video = videoRefs.current[currentMediaIndex];
      if (video && videoDuration > 0) {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          video.currentTime = pos * videoDuration;
      }
  };

  const togglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (handleTogglePlayVideo) {
          handleTogglePlayVideo(post.id);
      } else {
          // Fallback if handler not provided (e.g. in some contexts)
          handlePlayVideo(post.id);
      }
  };

  const analyticsData = useMemo<PostAnalytics | null>(() => {
    if (post.analytics) return post.analytics;
    if (typeof post.views !== 'undefined' && post.views > 0) {
      return {
        impressions: post.views,
        engagements: (post.likes || 0) + (post.comments || 0) + (post.echos || 0),
        profileVisits: 0,
        newFollowers: 0,
      };
    }
    return null;
  }, [post]);

  const handleAffiliate = (product: Product) => {
    const affiliateLink = `https://cascade.social/shop/${product.id}?ref=${currentUser.id}`;
    navigator.clipboard.writeText(affiliateLink).then(() => {
        addNotification(`Affiliate link copied! Earn ${product.affiliateCommission}% commission.`, 'info');
    }).catch(() => {
        alert('Failed to copy link');
    });
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        if (!post.isLiked) {
            handleToggleLike(post.id);
        }
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
    } else {
        const currentMedia = mediaList[currentMediaIndex];
        if (currentMedia && currentMedia.type === 'video') {
            if (handleTogglePlayVideo) {
                handleTogglePlayVideo(post.id);
            } else {
                handlePlayVideo(post.id);
            }
        } else {
            onNavigate(`media/${post.id}/${currentMediaIndex}`);
        }
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    Object.keys(videoRefs.current).forEach(key => {
        const idx = parseInt(key);
        const video = videoRefs.current[idx];
        if (video) {
            if (idx === currentMediaIndex && isPlaying) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        }
    });
  }, [isPlaying, currentMediaIndex]);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const renderContentWithHashtags = (text: string) => {
    const parts = text.split(/([#@][\w_]+)/g);
    return (
      <p className={`my-3 whitespace-pre-wrap break-words leading-relaxed text-on-surface dark:text-dark-on-surface ${isDetailView ? 'text-xl' : 'text-base md:text-lg line-clamp-5'}`}>
        {parts.map((part, index) => {
          if (part.startsWith('#')) {
            return <button key={index} onClick={(e) => { e.stopPropagation(); handleSearch(part); }} className="text-primary hover:underline">{part}</button>;
          } else if (part.startsWith('@')) {
             return <button key={index} onClick={(e) => { e.stopPropagation(); handleSearch(part); }} className="text-primary hover:underline">{part}</button>;
          }
          return part;
        })}
      </p>
    );
  };

  const isOwnPost = post.user.id === currentUser.id;
  const isSubscriberOnly = post.isSubscriberOnly;
  const isSubscribed = subscribedToUserIds.includes(post.user.id) || isOwnPost; 
  const canView = !isSubscriberOnly || isSubscribed;

  const mediaList = (() => {
    if (post.media && post.media.length > 0) return post.media;
    if (post.imageUrl) return [{ url: post.imageUrl, type: 'image' as const }];
    if (post.videoUrl) return [{ url: post.videoUrl, type: 'video' as const }];
    return [];
  })();

  return (
    <article 
        className={`bg-surface dark:bg-dark-surface border-y sm:border border-gray-200 dark:border-dark-border mb-2.5 sm:rounded-xl shadow-xs ${isDetailView ? '' : 'hover:bg-surface-hover/50 dark:hover:bg-dark-surface-hover/50 transition-colors cursor-pointer'}`}
        onClick={() => !isDetailView && handleViewPost(post)}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' } as any}
    >
        {isScheduled && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-4 py-1 flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" />
                <span>Scheduled for {new Date(post.scheduledAt!).toLocaleString()}</span>
            </div>
        )}

        {post.status === 'pending_approval' && (
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-bold px-4 py-1 flex items-center gap-2">
                <AlertIcon className="w-3 h-3" />
                <span>Pending Approval</span>
            </div>
        )}
        
        {isBoosted && (
             <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-amber-500 mb-1">
                <StarIcon className="w-4 h-4 fill-current" />
                <span className="text-xs font-black tracking-wide uppercase">Sponsored</span>
            </div>
        )}

      <div className={`p-4 ${isDetailView ? 'pb-20' : ''}`}>
        {isBoosted ? (
            <div className="flex justify-between items-center mb-3 border border-[#2f3336] rounded-[2.5rem] p-3 pr-6 bg-[#16181c] dark:bg-[#16181c]">
                <div className="flex gap-4 overflow-hidden items-center">
                    <div onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="relative cursor-pointer flex-shrink-0 ml-1">
                        <img src={post.user.avatarUrl} alt={post.user.name} className="w-[60px] h-[60px] rounded-full object-cover" />
                        {post.user.verificationStatus === 'verified' && (
                            <div className="absolute -bottom-1 -right-1 bg-[#16181c] rounded-full p-[2px]">
                                <VerifiedIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center gap-0.5">
                        <span onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="font-bold text-lg text-white hover:underline cursor-pointer truncate leading-tight">
                            {post.user.name}
                        </span>
                        <span onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="text-[15px] text-gray-400 hover:underline cursor-pointer truncate leading-tight">
                            @{post.user.handle.replace('@', '')}
                        </span>
                        {post.user.bio && (
                            <span className="text-[15px] text-gray-400 truncate italic leading-tight">
                                {post.user.bio}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isOwnPost && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSubscribe(post.user.id); }}
                            className={`text-base font-bold transition-colors ${
                                isSubscribed
                                    ? 'text-[#202327]'
                                    : 'text-primary hover:underline'
                            }`}
                        >
                            {isSubscribed ? 'Following' : 'Follow'}
                        </button>
                    )}
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!isMenuOpen); }} className="p-2 -mr-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors">
                            <MoreIcon className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
                                <button onClick={(e) => { e.stopPropagation(); setIsReportModalOpen(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold text-red-500 flex items-center gap-2">
                                    <AlertIcon className="w-4 h-4" />
                                    Report Ad
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex justify-between items-center mb-3">
                <div className="flex gap-3 overflow-hidden items-center">
                    <div onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="cursor-pointer flex-shrink-0 group">
                        <div className="p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full transition-transform group-hover:scale-105">
                            <div className="p-[1.5px] bg-background dark:bg-dark-background rounded-full">
                                <img src={post.user.avatarUrl} alt={post.user.name} className="w-9 h-9 rounded-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1">
                            <span onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="font-bold text-on-surface dark:text-dark-on-surface hover:underline cursor-pointer truncate">
                                {post.user.name}
                            </span>
                            {post.user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary flex-shrink-0" />}
                            <span onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }} className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary hover:underline cursor-pointer truncate">
                                {post.user.handle}
                            </span>
                            {!isSubscribed && !isOwnPost && (
                                <>
                                    <span className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">·</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleSubscribe(post.user.id); }}
                                        className="text-sm font-bold text-primary hover:underline"
                                    >
                                        Follow
                                    </button>
                                </>
                            )}
                            <>
                                <span className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">·</span>
                                <span className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary hover:underline cursor-pointer whitespace-nowrap">
                                    {timeAgo(post.timestamp)}
                                </span>
                                {post.editedAt && <span className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">· <span className="italic">{t('post_edited')}</span></span>}
                            </>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!isMenuOpen); }} className="p-2 -mr-2 text-on-surface-secondary dark:text-dark-on-surface-secondary hover:bg-surface-hover dark:hover:bg-dark-surface-hover rounded-full transition-colors">
                            <MoreIcon className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
                                {isOwnPost ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(post); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold">
                                            {t('post_menu_edit')}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); if (handleOpenBoostModal) handleOpenBoostModal(post); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold flex items-center gap-2">
                                            <RocketIcon className="w-4 h-4 text-amber-500" />
                                            Boost Post
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setAnalyticsModalOpen(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold flex items-center gap-2">
                                            <AnalyticsIcon className="w-4 h-4 text-blue-500" />
                                            View Analytics
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); openGiftModal(post); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold flex items-center gap-2 text-amber-500">
                                            <GiftIcon className="w-4 h-4" />
                                            Send Gift
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSubscribe(post.user.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold">
                                            {subscribedToUserIds.includes(post.user.id) ? `Unfollow @${post.user.handle}` : `Follow @${post.user.handle}`}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleToggleBlock(post.user.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold text-red-500">
                                            Block @{post.user.handle}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setIsReportModalOpen(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface-hover dark:hover:bg-dark-surface-hover text-sm font-semibold text-red-500 flex items-center gap-2">
                                            <AlertIcon className="w-4 h-4" />
                                            Report Post
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="pl-0 md:pl-[52px]">
            {post.communityName && (
                <div onClick={(e) => { e.stopPropagation(); if (post.communityId && viewCommunity) viewCommunity({ id: post.communityId, name: post.communityName! } as Community); }} className="mb-1 text-xs font-bold text-on-surface-secondary dark:text-dark-on-surface-secondary hover:underline cursor-pointer">
                    {t('post_posted_in', { communityName: post.communityName })}
                </div>
            )}
            
            {post.location && (
                <div className="mb-2 flex items-center gap-1 text-xs text-primary font-medium">
                    <LocationIcon className="w-3 h-3" />
                    <span>{post.location}</span>
                </div>
            )}

            {renderContentWithHashtags(post.content)}

            {post.quotedPost && (
                <div className="mt-3 border border-border dark:border-dark-border rounded-xl p-3 bg-surface/30 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors" onClick={(e) => { e.stopPropagation(); handleViewPost(post.quotedPost!); }}>
                    <div className="flex items-center gap-2 mb-1">
                        <img src={post.quotedPost.user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                        <span className="font-bold text-sm">{post.quotedPost.user.name}</span>
                        <span className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary">@{post.quotedPost.user.handle}</span>
                    </div>
                    <p className="text-sm line-clamp-3">{post.quotedPost.content}</p>
                </div>
            )}

            {post.linkUrl && (
                <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-3 block border border-border dark:border-dark-border rounded-xl p-3 bg-surface/30 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary truncate">{post.linkUrl}</span>
                    </div>
                </a>
            )}

            {!canView ? (
                <div className="mt-3 p-6 bg-surface-hover dark:bg-dark-surface-hover rounded-2xl border border-border dark:border-dark-border text-center">
                    <LockIcon className="w-8 h-8 mx-auto text-on-surface-secondary mb-2" />
                    <p className="font-bold">{t('post_subscriber_only')}</p>
                    <p className="text-sm text-on-surface-secondary mb-4">{t('post_subscriber_only_prompt', { name: post.user.name })}</p>
                    <button className="bg-primary text-white font-bold px-4 py-2 rounded-full text-sm">
                        {t('button_subscribe_for', { price: post.user.subscriptionPrice || 0 })}
                    </button>
                </div>
            ) : (
                <>
                    {mediaList.length > 0 && (
                        <div className={`mt-2.5 relative overflow-hidden bg-black ${isDetailView ? 'aspect-[4/3]' : 'aspect-[16/10]'} max-h-[360px] -mx-4 w-[calc(100%+2rem)] md:w-full md:mx-0 md:rounded-xl`} onClick={handleMediaClick}>
                            <div className="absolute inset-0 flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}>
                                {mediaList.map((m, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-full h-full flex items-center justify-center relative">
                                        {m.type === 'image' ? (
                                            <img src={m.url} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <>
                                                <video
                                                    ref={el => videoRefs.current[idx] = el}
                                                    src={m.url}
                                                    loop
                                                    playsInline
                                                    muted={isMuted}
                                                    className="w-full h-full object-cover"
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onLoadedMetadata={handleLoadedMetadata}
                                                    onError={() => console.warn("Video failed to load")}
                                                />
                                                {!isPlaying && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                                                        <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm">
                                                            <PlayIcon className="w-8 h-8 text-white fill-current" />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Video Controls Overlay */}
                                                {isPlaying && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent z-20 flex flex-col gap-2 opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                                        {/* Progress Bar */}
                                                        <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer group" onClick={handleSeek}>
                                                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${videoProgress}%` }}></div>
                                                            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" style={{ left: `${videoProgress}%` }}></div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between text-white">
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={togglePlay} className="hover:text-primary transition-colors">
                                                                    <PauseIcon className="w-5 h-5 fill-current" />
                                                                </button>
                                                                <span className="text-xs font-medium tabular-nums">
                                                                    {Math.floor(videoCurrentTime / 60)}:{Math.floor(videoCurrentTime % 60).toString().padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="hover:text-primary transition-colors">
                                                                    {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handlePlayVideo(post.id); }} className="hover:text-primary transition-colors" title="Full Screen">
                                                                    <FullscreenIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {mediaList.length > 1 && (
                                <>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                        {mediaList.map((_, idx) => (
                                            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                                        ))}
                                    </div>
                                    {currentMediaIndex > 0 && (
                                        <button onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => prev - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                    )}
                                    {currentMediaIndex < mediaList.length - 1 && (
                                        <button onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => prev + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    )}
                                </>
                            )}
                            
                            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-all duration-700 ${showHeartAnimation ? 'scale-125 opacity-100' : 'scale-50 opacity-0'}`}>
                                <LikedIcon className="w-24 h-24 text-white fill-current drop-shadow-xl" />
                            </div>
                        </div>
                    )}

                    {post.poll && <PollDisplay initialPoll={post.poll} />}
                    {post.taggedProduct && <ProductCard product={post.taggedProduct} onAddToCart={handleAddToCart} onAffiliate={handleAffiliate} />}
                </>
            )}

            <div className="flex items-center justify-between mt-3 text-on-surface-secondary dark:text-dark-on-surface-secondary -ml-1.5 md:max-w-md">
                <button onClick={(e) => { e.stopPropagation(); handleToggleLike(post.id); }} className={`flex items-center gap-1.5 p-1.5 rounded-full group transition-colors ${post.isLiked ? 'text-pink-600' : 'hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'}`}>
                    {post.isLiked ? <LikedIcon className="w-[24px] h-[24px]" /> : <LikeIcon className="w-[24px] h-[24px]" />}
                    <span className="text-sm font-bold">{post.likes > 0 && formatCount(post.likes)}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleViewPost(post); }} className="flex items-center gap-1.5 p-1.5 rounded-full hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <CommentIcon className="w-[24px] h-[24px]" />
                    <span className="text-sm font-bold">{post.comments > 0 && formatCount(post.comments)}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setRepostMenuOpen(true); }} className="p-1.5 rounded-full group transition-colors hover:bg-surface-hover dark:hover:bg-dark-surface-hover">
                    <EchoIcon className="w-[24px] h-[24px]" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleToggleBookmark(post.id); }} className={`p-1.5 rounded-full transition-colors hover:bg-surface-hover dark:hover:bg-dark-surface-hover`}>
                    {post.isBookmarked ? <BookmarkedIcon className="w-[24px] h-[24px]" /> : <BookmarkIcon className="w-[24px] h-[24px]" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShareMenuOpen(true); }} className="p-1.5 rounded-full hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <ShareIcon className="w-[24px] h-[24px]" />
                </button>
            </div>
        </div>
      </div>

      <PostAnalyticsModal isOpen={isAnalyticsModalOpen} onClose={() => setAnalyticsModalOpen(false)} post={analyticsData ? { ...post, analytics: analyticsData } : null} />
      <RepostModal isOpen={isRepostMenuOpen} onClose={() => setRepostMenuOpen(false)} post={post} handleEcho={handleToggleEcho} handleQuotePost={handleOpenQuoteModal} />
      <ShareModal isOpen={isShareMenuOpen} onClose={() => setShareMenuOpen(false)} post={post} handleEcho={handleToggleEcho} handleQuotePost={handleOpenQuoteModal} handleNativeShare={() => {}} handleCopyLink={() => {}} handleShareToCommunity={() => {}} />
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={(reason, description) => onReportContent && onReportContent('post', post.id, reason, description, post.communityId)}
        reportedType="post"
      />
    </article>
  );
};

export const Post = React.memo(PostComponent);
