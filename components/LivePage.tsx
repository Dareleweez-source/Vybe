import React, { useMemo } from 'react';
import type { LiveStream, User, AdCampaign, Post as PostType, Product, Community } from '../types';
import { TvIcon, PeopleIcon, BackIcon } from '../constants';
import AdPost from './AdPost';

import AppHeader from './AppHeader';

interface LivePageProps {
  liveStreams: LiveStream[];
  adCampaigns: AdCampaign[];
  allPosts: PostType[];
  allProducts: Product[];
  allUsers: User[];
  onViewStream: (stream: LiveStream) => void;
  onStartStream: () => void;
  currentUser: User;
  onBack: () => void;
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  handleFollow: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  handleClaimAdReward: (campaign: AdCampaign, engagementType: 'like' | 'echo') => void;
  claimedAdRewards: Record<string, ('like' | 'echo')[]>;
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
  handleOpenBoostModal: (post: PostType) => void;
  handleShareToCommunity: (post: PostType) => void;
  // FIX: Add onNavigate to props to satisfy AdPost component requirements
  onNavigate: (path: string) => void;
}

const LiveStreamCard: React.FC<{ stream: LiveStream; onClick: () => void }> = ({ stream, onClick }) => (
  <button onClick={onClick} className="w-full text-left group">
    <div className="relative aspect-video bg-surface dark:bg-dark-surface rounded-lg overflow-hidden border border-border dark:border-dark-border group-hover:ring-2 group-hover:ring-primary transition-all">
      <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
      {stream.status === 'live' && (
        <>
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">LIVE</div>
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <PeopleIcon className="w-3 h-3" />
                <span>{stream.viewers.toLocaleString()}</span>
            </div>
        </>
      )}
      {stream.status === 'ended' && (
         <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <p className="text-white font-bold">Stream Ended</p>
         </div>
      )}
    </div>
    <div className="flex items-start gap-3 mt-2">
      <img src={stream.broadcaster.avatarUrl} alt={stream.broadcaster.name} className="w-10 h-10 rounded-full flex-shrink-0" />
      <div>
        <h3 className="font-bold line-clamp-2">{stream.title}</h3>
        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{stream.broadcaster.name}</p>
      </div>
    </div>
  </button>
);


const LivePage: React.FC<LivePageProps> = (props) => {
  const { 
    liveStreams, 
    onViewStream, 
    onStartStream, 
    currentUser, 
    onBack,
    adCampaigns,
    allPosts,
    allProducts,
    allUsers,
    subscribedToUserIds,
    onNavigate,
    ...postHandlers 
  } = props;
  
  const activeStreams = (liveStreams || []).filter(s => s.status === 'live');
  const recentStreams = (liveStreams || []).filter(s => s.status === 'ended');

  const activeAds = useMemo(() => (adCampaigns || []).filter(ad => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    return now >= start && now <= end && ad.ownerId !== currentUser.id;
  }), [adCampaigns, currentUser.id]);

  const liveItems = useMemo(() => {
    const items: (LiveStream | AdCampaign)[] = [];
    let adIndex = 0;
    const AD_INTERVAL = 3;

    activeStreams.forEach((stream, index) => {
      items.push(stream);
      
      if ((index + 1) % AD_INTERVAL === 0) {
        if (adIndex < activeAds.length) {
          items.push(activeAds[adIndex]);
          adIndex++;
        }
      }
    });

    return items;
  }, [activeStreams, activeAds]);

  return (
    <div className="w-full min-h-screen">
      <AppHeader currentUser={currentUser} activeView="Live" onNavigate={onNavigate} />
      <div className="sticky top-0 bg-background dark:bg-dark-background z-10 px-4 py-3 border-b border-border dark:border-dark-border flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Live Streams</h1>
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Watch creators live now</p>
          </div>
        </div>
        <button onClick={onStartStream} className="bg-primary text-white font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 text-sm">
          <TvIcon className="w-5 h-5" />
          <span>Go Live</span>
        </button>
      </div>
      <div className="p-4 space-y-8">
        {activeStreams.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Live Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              {liveItems.map(item => {
                if ('broadcaster' in item) { // Type guard for LiveStream
                  const stream = item as LiveStream;
                  return <LiveStreamCard key={stream.id} stream={stream} onClick={() => onViewStream(stream)} />
                }
                
                if ('ownerId' in item) { // Type guard for AdCampaign
                  const campaign = item as AdCampaign;
                  return (
                    <AdPost
                      key={`ad-${campaign.id}`}
                      campaign={campaign}
                      allUsers={allUsers}
                      allPosts={allPosts}
                      allProducts={allProducts}
                      currentUser={currentUser}
                      subscribedToUserIds={subscribedToUserIds}
                      onNavigate={onNavigate}
                      {...postHandlers}
                    />
                  );
                }
                
                return null;
              })}
            </div>
          </section>
        )}
        {recentStreams.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Recent Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              {recentStreams.map(stream => (
                <LiveStreamCard key={stream.id} stream={stream} onClick={() => onViewStream(stream)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LivePage;