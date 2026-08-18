
import React, { useState, useMemo } from 'react';
import type { User, Post as PostType, Product, Community, AdCampaign } from '../types';
import { Post } from './Post';
import { AnalyticsIcon, ImpressionsIcon, NewFollowersIcon, ProfileIcon, RocketIcon as EngagementsIcon, MonetizationIcon } from '../constants';

// All the handlers the Post component might need
interface PostHandlers {
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
  allUsers: User[];
  subscribedToUserIds: string[];
  activeAdCampaigns: AdCampaign[];
  onNavigate: (path: string) => void;
}

interface AnalyticsPageProps extends PostHandlers {
  currentUser: User;
  allPosts: PostType[];
  onBack: () => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border">
        <div className="flex items-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
            {icon}
            <span className="ml-2 text-sm font-semibold">{label}</span>
        </div>
        <p className="text-3xl font-bold mt-2 text-on-surface dark:text-dark-on-surface">{value}</p>
    </div>
);

const TimeframeButton: React.FC<{ days: 7 | 30 | 90; timeframe: number; setTimeframe: (days: 7 | 30 | 90) => void }> = ({ days, timeframe, setTimeframe }) => (
    <button
      onClick={() => setTimeframe(days)}
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 whitespace-nowrap ${
        timeframe === days
          ? 'bg-primary text-white'
          : 'bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
      }`}
    >
      Last {days} days
    </button>
  );

const AnalyticsPage: React.FC<AnalyticsPageProps> = (props) => {
  const { currentUser, allPosts, ...postHandlers } = props;
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);

  const userPosts = useMemo(() => (allPosts || []).filter(p => p.user.id === currentUser.id), [allPosts, currentUser.id]);

  const filteredPosts = useMemo(() => {
    const now = new Date();
    return userPosts.filter(post => {
      const postDate = new Date(post.timestamp);
      const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= timeframe;
    });
  }, [userPosts, timeframe]);

  const summaryStats = useMemo(() => {
    return filteredPosts.reduce(
      (acc, post) => {
        if (post.analytics) {
          acc.impressions += post.analytics.impressions;
          acc.engagements += post.analytics.engagements;
          acc.profileVisits += post.analytics.profileVisits;
          acc.newFollowers += post.analytics.newFollowers;
        }
        return acc;
      },
      { impressions: 0, engagements: 0, profileVisits: 0, newFollowers: 0 }
    );
  }, [filteredPosts]);
  
  const estimatedEarnings = useMemo(() => {
    // A simple mock calculation for earnings
    return summaryStats.engagements * 0.015 + summaryStats.impressions * 0.0007;
  }, [summaryStats]);

  const topPosts = useMemo(() => {
    return [...filteredPosts]
        .filter(p => p.analytics)
        .sort((a, b) => (b.analytics?.engagements || 0) - (a.analytics?.engagements || 0))
        .slice(0, 5);
  }, [filteredPosts]);


  return (
    <div className="w-full min-h-screen">
      <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <AnalyticsIcon className="w-6 h-6 text-primary" strokeWidth="2.5" />
            Analytics
          </h1>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Your content performance</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2 p-1 bg-surface-hover dark:bg-dark-surface-secondary rounded-full overflow-x-auto no-scrollbar">
            <TimeframeButton days={7} timeframe={timeframe} setTimeframe={setTimeframe} />
            <TimeframeButton days={30} timeframe={timeframe} setTimeframe={setTimeframe} />
            <TimeframeButton days={90} timeframe={timeframe} setTimeframe={setTimeframe} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<ImpressionsIcon className="w-5 h-5" />} label="Impressions" value={formatNumber(summaryStats.impressions)} />
            <StatCard icon={<EngagementsIcon className="w-5 h-5" />} label="Engagements" value={formatNumber(summaryStats.engagements)} />
            <StatCard icon={<ProfileIcon className="w-5 h-5" />} label="Profile Visits" value={formatNumber(summaryStats.profileVisits)} />
            <StatCard icon={<NewFollowersIcon className="w-5 h-5" />} label="New Followers" value={formatNumber(summaryStats.newFollowers)} />
        </div>
        
         <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <div className="flex items-center text-green-700 dark:text-green-300">
                <MonetizationIcon className="w-5 h-5" />
                <span className="ml-2 text-sm font-semibold">Estimated Earnings</span>
            </div>
            <p className="text-3xl font-bold mt-2 text-green-800 dark:text-green-200">${estimatedEarnings.toFixed(2)}</p>
         </div>

        <div>
            <h2 className="text-xl font-bold mb-4">Top Posts</h2>
            {topPosts.length > 0 ? (
                <div className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
                    {topPosts.map((post, index) => (
                        <div key={post.id} className={index < topPosts.length - 1 ? 'border-b border-border dark:border-dark-border' : ''}>
                           <Post post={post} currentUser={currentUser} {...postHandlers} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border">
                    <p className="font-semibold">No posts in this period</p>
                    <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Create new content to see your analytics.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
