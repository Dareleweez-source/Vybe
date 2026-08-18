
import React, { useRef, useEffect } from 'react';
import type { AdCampaign, User, Post as PostType, Product, Community } from '../types';
import { Post } from './Post';
import ProductCard from './ProductCard';
import { VerifiedIcon, ChevronRightIcon } from '../constants';

interface AdPostProps {
  campaign: AdCampaign;
  allUsers: User[];
  allPosts: PostType[];
  allProducts: Product[];
  currentUser: User;
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  handleFollow: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  handleSearch: (query: string) => void;
  onAdImpression: (campaignId: string) => void;
  onAdClick: (campaignId: string) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleOpenEditModal: (post: PostType) => void;
  handleViewProfile: (userId: string) => void;
  handleOpenBoostModal?: (post: PostType) => void;
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
}

const AdPost: React.FC<AdPostProps> = (props) => {
  const {
      campaign, allPosts, allProducts, allUsers,
      onAdClick, onAdImpression,
      playingVideoId, handlePlayVideo, handleFollow, subscribedToUserIds,
      ...postHandlers
  } = props;
  
  const adRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onAdImpression(campaign.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = adRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [campaign.id, onAdImpression]);

  const handleAdClickWrapper = () => {
    onAdClick(campaign.id);
  };
  
  const AdHeader = () => (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-amber-500">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span className="text-sm font-black tracking-tight uppercase">Sponsored</span>
    </div>
  );

  const renderAdContent = () => {
    const owner = allUsers.find(u => u.id === campaign.ownerId);
    if (!owner) return null;

    switch (campaign.promotionType) {
        case 'post': {
            const post = allPosts.find(p => p.id === campaign.promotedPostId);
            if (!post) return null;

            return (
                <div onClick={handleAdClickWrapper} className="relative group">
                    <AdHeader />
                    <Post 
                      {...postHandlers}
                      playingVideoId={playingVideoId}
                      handlePlayVideo={handlePlayVideo}
                      post={post}
                      allUsers={allUsers}
                      subscribedToUserIds={subscribedToUserIds}
                      isBoosted={false} // Disable Post's default booster to use our custom header
                    />
                </div>
            );
        }

        case 'account': {
             const isFollowing = subscribedToUserIds.includes(owner.id);
             return (
                <div className="group" onClick={handleAdClickWrapper}>
                    <AdHeader />
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-4 bg-surface dark:bg-dark-surface p-4 rounded-3xl border border-border dark:border-dark-border group hover:border-amber-500/50 transition-all shadow-sm">
                            <button onClick={(e) => { e.stopPropagation(); postHandlers.handleViewProfile(owner.id); }} className="flex-shrink-0 relative">
                                <img src={owner.avatarUrl} alt={owner.name} className="w-16 h-16 rounded-full object-cover border-2 border-background dark:border-dark-surface shadow-sm transition-transform group-hover:scale-105" />
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-background dark:border-dark-surface">
                                    <VerifiedIcon className="w-3.5 h-3.5" />
                                </div>
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className="font-black text-lg truncate leading-tight">{owner.name}</p>
                                </div>
                                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">{owner.handle}</p>
                                <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary line-clamp-1 mt-1 font-medium italic">{owner.bio || "Creator on Cascade"}</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleFollow(owner.id); }}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                                    isFollowing 
                                    ? 'bg-surface-hover dark:bg-dark-surface-hover text-on-surface' 
                                    : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        case 'product': {
             const product = allProducts.find(p => p.id === campaign.promotedProductId);
             if (!product) return null;
             return (
                <div className="group" onClick={handleAdClickWrapper}>
                    <AdHeader />
                    <div className="px-4 pb-4">
                        <div className="bg-surface dark:bg-dark-surface rounded-3xl overflow-hidden border border-border dark:border-dark-border hover:border-amber-500/50 transition-all shadow-sm">
                            <ProductCard product={product} onAddToCart={postHandlers.handleAddToCart} />
                        </div>
                    </div>
                </div>
            );
        }

        default:
             return (
                <article className="group" onClick={handleAdClickWrapper}>
                    <AdHeader />
                    <div className="px-5 pb-5">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <img src={owner.avatarUrl} alt="Sponsor avatar" className="w-11 h-11 rounded-full border-2 border-primary/20 p-0.5" />
                                <div>
                                    <p className="font-black text-base">{owner.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Official Partner</span>
                                        {owner.verificationStatus === 'verified' && <VerifiedIcon className="w-3 h-3 text-primary" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            {campaign.content && (
                                <p className="my-3 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {campaign.content}
                                </p>
                            )}
                            
                            {campaign.mediaUrl && (
                            <div className="mt-4 rounded-3xl border border-border dark:border-dark-border overflow-hidden bg-black/5 aspect-video relative">
                                {campaign.mediaType === 'image' ? (
                                    <img src={campaign.mediaUrl} alt="Ad media" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                                ) : (
                                    <div onClick={(e) => { e.stopPropagation(); handlePlayVideo(campaign.id); }} className="w-full h-full">
                                        <video ref={videoRef} src={campaign.mediaUrl} controls={false} muted loop playsInline className="block w-full h-full object-cover bg-black" />
                                    </div>
                                )}
                            </div>
                            )}

                            <a 
                                href={campaign.destinationUrl}
                                onClick={handleAdClickWrapper}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 flex items-center justify-between w-full bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all group/cta"
                            >
                                <span className="font-black text-base text-primary">{campaign.ctaText}</span>
                                <div className="bg-primary text-white p-1.5 rounded-full shadow-md group-hover/cta:translate-x-1 transition-transform">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </div>
                            </a>
                        </div>
                    </div>
                </article>
             );
    }
  }

  return (
    <div ref={adRef} className="border-b border-border dark:border-dark-border bg-gradient-to-b from-amber-500/[0.02] to-transparent">
      {renderAdContent()}
    </div>
  );
};

export default AdPost;
