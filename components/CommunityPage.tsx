
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Community, Post as PostType, User, Product, ReportStatus } from '../types';
import { Post } from './Post';
import { BackIcon, ShieldIcon } from '../constants';
import ModerationDashboard from './ModerationDashboard';
import ReportModal from './ReportModal';

interface CommunityPageProps {
  community: Community;
  allPosts: PostType[];
  currentUser: User;
  subscribedToUserIds: string[];
  onJoinCommunity: (communityId: string) => void;
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
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleViewProfile: (userId: string) => void;
  handleOpenEditModal: (post: PostType) => void;
  handleOpenBoostModal: (post: PostType) => void;
  allUsers: User[];
  onBack: () => void;
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
  onUpdateCommunity: (updatedCommunity: Community) => void;
  onBanUser: (userId: string, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  onResolveReport: (reportId: string, resolution: ReportStatus) => void;
  onReportContent: (type: 'post' | 'comment' | 'user', id: string, reason: string, description: string, communityId?: string) => void;
  onApprovePost: (postId: string, communityId?: string) => void;
  onRejectPost: (postId: string, communityId?: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = (props) => {
  const { community, allPosts, currentUser, onJoinCommunity, onBack, onUpdateCommunity, onBanUser, onUnbanUser, onResolveReport, onReportContent, onApprovePost, onRejectPost, allUsers, ...postHandlers } = props;
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const lastScrollY = useRef<number>(0);

  const isMember = (currentUser.joinedCommunityIds || []).includes(community.id);
  const isModerator = community.ownerId === currentUser.id || (community.moderatorIds || []).includes(currentUser.id);

  const communityPosts = useMemo(() => {
    const now = new Date();
    return (allPosts || [])
      .filter(p => 
        p.communityId === community.id &&
        (p.status !== 'scheduled' || !p.scheduledAt || new Date(p.scheduledAt) <= now) &&
        (p.status !== 'pending_approval' || isModerator || p.user.id === currentUser.id)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allPosts, community.id, isModerator, currentUser.id]);

  const pendingPosts = useMemo(() => {
      return (allPosts || []).filter(p => p.communityId === community.id && p.status === 'pending_approval');
  }, [allPosts, community.id]);

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

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  };

  return (
    <div className="w-full">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border transition-transform duration-300 flex items-center gap-4 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{community.name}</h1>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{formatCount(community.memberCount)} members</p>
        </div>
        {isModerator && (
            <button 
                onClick={() => setIsModerationOpen(!isModerationOpen)}
                className={`p-2 rounded-full transition-colors ${isModerationOpen ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface'}`}
                title="Moderation Tools"
            >
                <ShieldIcon className="w-6 h-6" />
            </button>
        )}
      </div>
      
      {isModerationOpen ? (
        <div className="p-4">
            <ModerationDashboard 
                community={community}
                allUsers={allUsers}
                posts={pendingPosts}
                currentUser={currentUser}
                onUpdateCommunity={onUpdateCommunity}
                onBanUser={onBanUser}
                onUnbanUser={onUnbanUser}
                onResolveReport={onResolveReport}
                onApprovePost={(postId) => onApprovePost(postId, community.id)}
                onRejectPost={(postId) => onRejectPost(postId, community.id)}
            />
        </div>
      ) : (
        <div>
            <div className="h-48 bg-gray-300 dark:bg-dark-surface">
            {community.bannerUrl && <img src={community.bannerUrl} alt={`${community.name}'s banner`} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
            <div className="flex justify-between items-start">
                <img src={community.avatarUrl} alt={`${community.name}'s avatar`} className="w-32 h-32 rounded-2xl border-4 border-background dark:border-dark-background -mt-16" />
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="font-bold text-sm px-4 py-2 rounded-full border border-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                    >
                        Report
                    </button>
                    <button
                    onClick={() => onJoinCommunity(community.id)}
                    className={`font-bold text-sm px-6 py-2 rounded-full transition-colors duration-200 ${
                        isMember
                        ? 'bg-surface text-on-surface border border-border dark:border-dark-border hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 hover:border-red-300'
                        : 'bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background hover:bg-on-surface/90 dark:hover:bg-dark-on-surface/90'
                    }`}
                    >
                    {isMember ? 'Joined' : 'Join'}
                    </button>
                </div>
            </div>
            <div className="mt-2">
                <h2 className="text-xl font-extrabold">{community.name}</h2>
                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">c/{community.handle}</p>
                <p className="mt-2">{community.description}</p>
            </div>
            </div>
            
            <div className="mt-4">
                <div className="border-b border-border dark:border-dark-border flex px-4">
                    <button className="px-4 py-2 font-bold border-b-2 border-primary text-primary">Posts</button>
                    <button className="px-4 py-2 font-bold border-b-2 border-transparent text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface">About</button>
                </div>
                
                <div>
                    {communityPosts.map(post => (
                        <Post key={post.id} post={post} currentUser={currentUser} allUsers={allUsers} {...postHandlers} />
                    ))}
                    {communityPosts.length === 0 && (
                        <div className="p-8 text-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
                            <p className="font-bold text-xl">No posts yet</p>
                            <p>Be the first to post in this community!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={(reason, description) => onReportContent('user', community.id, reason, description, community.id)} // Reporting the community itself effectively
        reportedType="user" // Using 'user' type for community report for now or add 'community' type
      />
    </div>
  );
};
