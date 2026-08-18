
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Post } from '../types';
import { 
    BackIcon, 
    LikedIcon, 
    LikeIcon, 
    CommentIcon, 
    EchoIcon, 
    ShareIcon, 
    BookmarkIcon, 
    BookmarkedIcon, 
    VerifiedIcon,
    ChevronRightIcon
} from '../constants';
import RepostModal from './RepostModal';
import VideoPlayer from './VideoPlayer';

interface MediaViewerPageProps {
  post: Post;
  initialIndex: number;
  onBack: () => void;
  currentUser: User;
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleViewPost: (post: Post) => void;
  handleViewProfile: (userId: string) => void;
  handleOpenQuoteModal: (post: Post) => void;
}

const MediaViewerPage: React.FC<MediaViewerPageProps> = ({ 
    post, 
    initialIndex, 
    onBack, 
    handleToggleLike,
    handleToggleEcho,
    handleToggleBookmark,
    handleViewPost,
    handleViewProfile,
    handleOpenQuoteModal
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showOverlay, setShowOverlay] = useState(true);
    const [isRepostMenuOpen, setRepostMenuOpen] = useState(false);
    const overlayTimeoutRef = useRef<number | null>(null);

    const mediaList = post.media && post.media.length > 0 
        ? post.media 
        : (post.imageUrl ? [{ url: post.imageUrl, type: 'image' as const }] : (post.videoUrl ? [{ url: post.videoUrl, type: 'video' as const }] : []));

    const currentMedia = mediaList[currentIndex];

    const resetOverlayTimeout = useCallback(() => {
        setShowOverlay(true);
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = window.setTimeout(() => {
            setShowOverlay(false);
        }, 4000);
    }, []);

    useEffect(() => {
        setTimeout(resetOverlayTimeout, 0);
        return () => { if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current); };
    }, [currentIndex, resetOverlayTimeout]);

    if (!currentMedia) return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Media not found</div>;

    const navigateMedia = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
        if (direction === 'next' && currentIndex < mediaList.length - 1) setCurrentIndex(currentIndex + 1);
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none"
            onClick={resetOverlayTimeout}
        >
            <style>{`
                .media-exit-active { transition: opacity 0.3s ease; opacity: 0; }
                .media-enter { opacity: 0; }
                .media-enter-active { transition: opacity 0.3s ease; opacity: 1; }
            `}</style>

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                {currentMedia.type === 'image' ? (
                    <img 
                        src={currentMedia.url} 
                        alt="Full size view" 
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ pointerEvents: 'auto' }}
                    />
                ) : (
                    <VideoPlayer 
                        src={currentMedia.url} 
                        autoPlay={true}
                        muted={false}
                        className="w-full h-full"
                    />
                )}
            </div>

            {/* Top Navigation Bar */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 z-50 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <BackIcon className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(post.user.id); }}>
                        <img src={post.user.avatarUrl} className="w-9 h-9 rounded-full border border-white/20" alt="" />
                        <div>
                            <div className="flex items-center gap-1">
                                <p className="text-white font-bold text-sm">{post.user.name}</p>
                                {post.user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-white/60 text-xs">{post.user.handle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Navigation Buttons (Desktop/Large screens) */}
            {mediaList.length > 1 && (
                <>
                    <button 
                        disabled={currentIndex === 0}
                        onClick={(e) => { e.stopPropagation(); navigateMedia('prev'); }}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-black/60 active:scale-95'} ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <button 
                        disabled={currentIndex === mediaList.length - 1}
                        onClick={(e) => { e.stopPropagation(); navigateMedia('next'); }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all ${currentIndex === mediaList.length - 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-black/60 active:scale-95'} ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Bottom Actions Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-50 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                    <p className="text-white text-sm line-clamp-2 md:line-clamp-none font-medium drop-shadow-md">
                        {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 w-full max-w-md">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleLike(post.id); }} className={`flex items-center gap-1.5 p-1.5 rounded-full group transition-colors ${post.isLiked ? 'text-pink-500' : 'text-white hover:bg-white/10'}`}>
                            {post.isLiked ? <LikedIcon className="w-6 h-6" /> : <LikeIcon className="w-6 h-6" />}
                            <span className="text-sm font-bold">{post.likes}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleViewPost(post); }} className="flex items-center gap-1.5 p-1.5 rounded-full text-white hover:bg-white/10 transition-colors">
                            <CommentIcon className="w-6 h-6" />
                            <span className="text-sm font-bold">{post.comments}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRepostMenuOpen(true); }} className="p-1.5 rounded-full group transition-colors text-white hover:bg-white/10">
                            <EchoIcon className="w-6 h-6" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleBookmark(post.id); }} className={`p-1.5 rounded-full hover:bg-white/10 transition-colors text-white`}>
                            {post.isBookmarked ? <BookmarkedIcon className="w-6 h-6" /> : <BookmarkIcon className="w-6 h-6" />}
                        </button>
                        <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white">
                            <ShareIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
            <RepostModal isOpen={isRepostMenuOpen} onClose={() => setRepostMenuOpen(false)} post={post} handleEcho={handleToggleEcho} handleQuotePost={handleOpenQuoteModal} />
        </div>
    );
};

export default MediaViewerPage;
