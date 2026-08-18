import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Post as PostType, User, Story as StoryType, Product, Community, AdCampaign } from '../types';
import { Post } from './Post';
import StoriesTray from './StoriesTray';
import { 
  RefreshIcon,
  VerifiedIcon,
  ShopIcon
} from '../constants';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  TrendingUp, 
  Users, 
  Compass, 
  Plus, 
  Filter, 
  Radio,
  ShoppingBag
} from 'lucide-react';
import AdPost from './AdPost';
import { useLanguage } from '../contexts/LanguageContext';
import AppHeader from './AppHeader';

const POSTS_PER_PAGE = 8;

interface FollowSuggestionBlock {
  type: 'follow-suggestions';
  users: User[];
}

interface ProductSuggestionBlock {
  type: 'product-suggestions';
  products: Product[];
}

interface FeedProps {
  posts: PostType[];
  stories: { user: User; stories: StoryType[] }[];
  activeAdCampaigns: AdCampaign[];
  allUsers: User[];
  allProducts: Product[];
  currentUser: User;
  subscribedToUserIds: string[];
  onLogout: () => void;
  activeView: string;
  onNavigate: (path: string) => void;
  openCompose: () => void;
  handleRefresh: () => void;
  claimedAdRewards: Record<string, ('like' | 'echo')[]>;
  handleClaimAdReward: (campaign: AdCampaign, engagementType: 'like' | 'echo') => void;
  onMobileMenuToggle: () => void;
  handleFollow: (userId: string) => void;
  onStoryClick: (userId: string) => void;
  onCreateStoryClick: () => void;
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
  playingVideoId: string | null;
  handleShareToCommunity: (post: PostType) => void;
  onAdImpression: (campaignId: string) => void;
  onAdClick: (campaignId: string) => void;
  openCreateProductModal: () => void;
}

const Spinner = () => (
  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
);

type FeedTab = 'for_you' | 'following' | 'trending' | 'media';

const Feed: React.FC<FeedProps> = ({ 
  posts, 
  stories, 
  activeAdCampaigns, 
  allUsers, 
  allProducts, 
  currentUser, 
  subscribedToUserIds, 
  activeView, 
  onNavigate, 
  openCompose, 
  handleRefresh, 
  claimedAdRewards, 
  handleClaimAdReward, 
  handleFollow, 
  openCreateProductModal, 
  ...handlers 
}) => {
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<FeedTab>('for_you');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [displayedPosts, setDisplayedPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter posts according to activeTab and mediaFilter
  const sortedPosts = useMemo(() => {
    const now = new Date();
    let filtered = (posts || []).filter(post => 
      !handlers.blockedUserIds.includes(post.user.id) &&
      (post.status !== 'scheduled' || !post.scheduledAt || new Date(post.scheduledAt) <= now) &&
      post.status !== 'pending_approval'
    );

    // Filter by Tab
    if (activeTab === 'following') {
      filtered = filtered.filter(p => subscribedToUserIds.includes(p.user.id) || p.user.id === currentUser.id);
    } else if (activeTab === 'trending') {
      filtered = [...filtered].sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.echos || 0) * 2 + (a.repliesCount || 0) * 1.5;
        const scoreB = (b.likes || 0) + (b.echos || 0) * 2 + (b.repliesCount || 0) * 1.5;
        return scoreB - scoreA;
      });
    } else if (activeTab === 'media') {
      filtered = filtered.filter(p => (p.mediaUrls && p.mediaUrls.length > 0) || p.mediaType === 'video' || p.videoUrl);
    } else {
      // Default: For You (newest first with engagement boost)
      filtered = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Secondary Filter (photos vs videos)
    if (mediaFilter === 'photos') {
      filtered = filtered.filter(p => p.mediaUrls && p.mediaUrls.length > 0 && p.mediaType !== 'video' && !p.videoUrl);
    } else if (mediaFilter === 'videos') {
      filtered = filtered.filter(p => p.mediaType === 'video' || p.videoUrl);
    }

    return filtered;
  }, [posts, handlers.blockedUserIds, activeTab, subscribedToUserIds, currentUser.id, mediaFilter]);
  
  useEffect(() => {
    const initialPosts = sortedPosts.slice(0, POSTS_PER_PAGE);
    setDisplayedPosts(initialPosts);
    setPage(1);
    setHasMore(sortedPosts.length > POSTS_PER_PAGE);
  }, [sortedPosts]);

  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    setTimeout(() => { 
      const nextPage = page + 1;
      const newPosts = sortedPosts.slice(page * POSTS_PER_PAGE, nextPage * POSTS_PER_PAGE);
      
      if (newPosts.length > 0) {
        setDisplayedPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
      }

      setHasMore(nextPage * POSTS_PER_PAGE < sortedPosts.length);
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, page, sortedPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          if (hasMore && !isLoading) {
            loadMorePosts();
          }
        }
      },
      { rootMargin: '400px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, loadMorePosts]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === 0 || window.scrollY > 0) return;
    const touchY = e.touches[0].clientY;
    const pullDiff = touchY - pullStartY;
    
    if (pullDiff > 0) {
      const newPullMoveY = Math.min(pullDiff * 0.4, 120); 
      setPullMoveY(newPullMoveY);
    }
  };

  const performRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const initialPosts = sortedPosts.slice(0, POSTS_PER_PAGE);
      setDisplayedPosts(initialPosts);
      setPage(1);
      setHasMore(sortedPosts.length > POSTS_PER_PAGE);
      handleRefresh(); 
      setIsRefreshing(false);
      setPullMoveY(0);
    }, 1200);
  }, [sortedPosts, handleRefresh]);

  const handleTouchEnd = () => {
    if (pullStartY === 0) return;
    if (pullMoveY > 60) { 
      performRefresh();
    } else {
      setPullMoveY(0);
    }
    setPullStartY(0);
  };

  const activeAds = useMemo(() => (activeAdCampaigns || []).filter(ad => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    return now >= start && now <= end && ad.ownerId !== currentUser.id;
  }), [activeAdCampaigns, currentUser.id]);

  const suggestedUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.id !== currentUser.id && 
      !subscribedToUserIds.includes(u.id) &&
      u.accountStatus !== 'disabled' &&
      !handlers.blockedUserIds.includes(u.id)
    );
  }, [allUsers, currentUser.id, subscribedToUserIds, handlers.blockedUserIds]);

  const feedItems = useMemo(() => {
    const items: (PostType | AdCampaign | FollowSuggestionBlock | ProductSuggestionBlock)[] = [];
    let adIndex = 0;
    const SUGGESTION_POSITION = 1; 
    const PRODUCT_SUGGESTION_POSITION = 3;

    displayedPosts.forEach((post, index) => {
      items.push(post);
      if (index === SUGGESTION_POSITION && suggestedUsers.length > 0) {
        items.push({ type: 'follow-suggestions', users: suggestedUsers.slice(0, 10) } as FollowSuggestionBlock);
      }
      if (index === PRODUCT_SUGGESTION_POSITION && allProducts && allProducts.length > 0) {
        const suggestedProducts = allProducts.filter(p => p.seller.id !== currentUser.id).slice(0, 10);
        if (suggestedProducts.length > 0 || allProducts.filter(p => p.seller.id === currentUser.id).length === 0) {
          items.push({ type: 'product-suggestions', products: suggestedProducts } as ProductSuggestionBlock);
        }
      }
      if (index > 0 && (index + 1) % 3 === 0) {
        if (activeAds.length > 0) {
          items.push(activeAds[adIndex % activeAds.length]);
          adIndex++;
        }
      }
    });

    return items;
  }, [displayedPosts, activeAds, suggestedUsers, allProducts, currentUser.id]);
  
  const allPostHandlers = useMemo(() => ({ ...handlers, allUsers, activeAdCampaigns, onNavigate }), [handlers, allUsers, activeAdCampaigns, onNavigate]);

  return (
    <div className="w-full pb-20">
      {/* Top Header Navigation */}
      <AppHeader currentUser={currentUser} activeView={activeView} onNavigate={onNavigate} openCompose={openCompose}>
        <StoriesTray 
          storiesByUser={stories}
          currentUser={currentUser}
          onStoryClick={handlers.onStoryClick}
          onCreateStoryClick={handlers.onCreateStoryClick}
        />
      </AppHeader>

      {/* Primary Feed Navigation Tabs */}
      <div className="sticky top-14 z-10 bg-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-border px-4 py-1.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'for_you' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-surface-secondary dark:bg-dark-surface-secondary text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            For You
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'following' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-surface-secondary dark:bg-dark-surface-secondary text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Following
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'trending' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-surface-secondary dark:bg-dark-surface-secondary text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trending
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'media' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-surface-secondary dark:bg-dark-surface-secondary text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Media
          </button>
        </div>

        {/* Optional Media Filter Pills */}
        {activeTab === 'media' && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-dark-border/50">
            <span className="text-2xs font-semibold text-on-surface-secondary dark:text-dark-on-surface-secondary flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-2.5 py-1 rounded-md text-2xs font-medium ${
                mediaFilter === 'all' 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMediaFilter('photos')}
              className={`px-2.5 py-1 rounded-md text-2xs font-medium ${
                mediaFilter === 'photos' 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setMediaFilter('videos')}
              className={`px-2.5 py-1 rounded-md text-2xs font-medium ${
                mediaFilter === 'videos' 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'
              }`}
            >
              Videos
            </button>
          </div>
        )}
      </div>

      {/* Main Touch & Scroll Area */}
      <div 
        className="min-h-[calc(100vh-120px)] touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull To Refresh Indicator */}
        <div 
          className="flex justify-center items-center overflow-hidden w-full bg-transparent pointer-events-none"
          style={{ 
            height: isRefreshing ? '60px' : `${pullMoveY}px`,
            transition: isRefreshing ? 'height 0.3s ease' : 'height 0.1s ease-out',
            opacity: Math.min(pullMoveY / 40, 1)
          }}
        >
          <div className={`p-2 rounded-full bg-surface dark:bg-dark-surface shadow-md border border-gray-100 dark:border-dark-border ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullMoveY * 3}deg)` }}>
            <RefreshIcon className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Quick Inline Composer Box */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-surface dark:bg-dark-surface shadow-xs">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-dark-border cursor-pointer"
              onClick={() => handlers.handleViewProfile(currentUser.id)}
            />
            <button
              onClick={openCompose}
              className="flex-1 text-left px-4 py-2.5 bg-background dark:bg-dark-background hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary border border-gray-200 dark:border-dark-border rounded-full text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary transition-all"
            >
              What's happening on Cascade?
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-dark-border/40 px-2">
            <button 
              onClick={openCompose}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo</span>
            </button>

            <button 
              onClick={openCompose}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>

            <button 
              onClick={openCompose}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Assist</span>
            </button>

            <button 
              onClick={() => onNavigate('live')}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Radio className="w-4 h-4" />
              <span>Go Live</span>
            </button>
          </div>
        </div>

        {/* Empty State Handler */}
        {displayedPosts.length === 0 && !isLoading && (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-on-surface dark:text-dark-on-surface mb-1">
              No posts found
            </h3>
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary max-w-xs mx-auto mb-6">
              {activeTab === 'following' 
                ? "You aren't following anyone yet or they haven't posted recently." 
                : "Be the first one to create a post or change your feed filter!"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={openCompose}
                className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
              {activeTab !== 'for_you' && (
                <button
                  onClick={() => setActiveTab('for_you')}
                  className="bg-surface-secondary dark:bg-dark-surface-secondary text-on-surface dark:text-dark-on-surface text-sm font-bold px-5 py-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Switch to For You
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feed Items Rendering Loop */}
        {feedItems.map((item, index) => {
          if ('type' in item && item.type === 'follow-suggestions') {
            const suggestionBlock = item as FollowSuggestionBlock;
            return (
              <div key="suggestions" className="py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-b from-surface to-background dark:from-dark-surface dark:to-dark-background">
                <div className="px-4 mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-md flex items-center gap-2 text-on-surface dark:text-dark-on-surface">
                    <Users className="w-4 h-4 text-primary" />
                    {t('follow_suggestions_title')}
                  </h3>
                </div>
                <div className="flex overflow-x-auto px-4 gap-3 pb-2 scrollbar-hide snap-x snap-mandatory">
                  {suggestionBlock.users.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handlers.handleViewProfile(user.id)} 
                      className="snap-center flex-shrink-0 w-40 p-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-background dark:bg-dark-surface flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 group shadow-2xs"
                    >
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform duration-300 border border-gray-200 dark:border-dark-border" 
                      />
                      <div className="text-center w-full mt-1">
                        <p className="font-bold text-sm truncate w-full flex items-center justify-center gap-1">
                          {user.name}
                          {user.verificationStatus === 'verified' && <VerifiedIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </p>
                        <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary truncate w-full">@{user.handle.replace('@', '')}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFollow(user.id); }}
                        className="w-full bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-xs font-bold py-1.5 rounded-full mt-1 hover:opacity-90 transition-opacity"
                      >
                        {t('button_follow')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if ('type' in item && item.type === 'product-suggestions') {
            const suggestionBlock = item as ProductSuggestionBlock;
            const hasOwnProducts = allProducts.some(p => p.seller.id === currentUser.id);
            return (
              <div key="product-suggestions" className="py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-b from-surface to-background dark:from-dark-surface dark:to-dark-background">
                <div className="px-4 mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-md flex items-center gap-2 text-on-surface dark:text-dark-on-surface">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Marketplace Highlights
                  </h3>
                  <button 
                    onClick={() => onNavigate('Shop')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View Store
                  </button>
                </div>
                <div className="flex overflow-x-auto px-4 gap-3 pb-2 scrollbar-hide snap-x snap-mandatory">
                  {!hasOwnProducts && (
                    <div className="snap-center flex-shrink-0 w-40 p-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-background dark:bg-dark-surface flex flex-col items-center gap-2 shadow-2xs">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShopIcon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center w-full mt-1">
                        <p className="font-bold text-sm truncate w-full">Set up store</p>
                        <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary truncate w-full">Sell items</p>
                      </div>
                      <button 
                        onClick={openCreateProductModal}
                        className="w-full bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-xs font-bold py-1.5 rounded-full mt-1 hover:opacity-90 transition-opacity"
                      >
                        Create
                      </button>
                    </div>
                  )}
                  {suggestionBlock.products.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => handlers.handleViewProfile(product.seller.id)} 
                      className="snap-center flex-shrink-0 w-40 p-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-background dark:bg-dark-surface flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 group shadow-2xs"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="text-center w-full mt-1">
                        <p className="font-bold text-sm truncate w-full">{product.name}</p>
                        <p className="text-xs font-semibold text-primary truncate w-full">${product.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlers.handleAddToCart(product); }}
                        className="w-full bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-xs font-bold py-1.5 rounded-full mt-1 hover:opacity-90 transition-opacity"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if ('user' in item) {
            const post = item as PostType;
            const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);
            return (
              <Post 
                key={post.id}
                post={post} 
                currentUser={currentUser}
                subscribedToUserIds={subscribedToUserIds}
                isBoosted={isBoosted}
                {...allPostHandlers}
              />
            );
          }

          if ('ownerId' in item) {
            const campaign = item as AdCampaign;
            return (
              <AdPost
                key={`ad-${campaign.id}-${index}`}
                campaign={campaign}
                allPosts={posts}
                allProducts={allProducts}
                allUsers={allUsers}
                currentUser={currentUser}
                subscribedToUserIds={subscribedToUserIds}
                onAdImpression={handlers.onAdImpression}
                onAdClick={handlers.onAdClick}
                handleClaimAdReward={handleClaimAdReward}
                claimedAdRewards={claimedAdRewards}
                handleFollow={handleFollow}
                {...allPostHandlers}
              />
            );
          }
          
          return null;
        })}

        {/* Bottom Scroll Loader */}
        <div ref={loaderRef} className="flex justify-center items-center h-24">
          {isLoading && <Spinner />}
          {!hasMore && displayedPosts.length > POSTS_PER_PAGE && (
            <p className="text-xs font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">
              {t('feed_reached_end')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
