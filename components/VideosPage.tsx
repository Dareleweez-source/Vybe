
import React, { useMemo } from 'react';
import type { Post as PostType, User, Product, Community, AdCampaign } from '../types';
import { BackIcon, VideoIconFilled } from '../constants';
import { Post } from './Post';

interface VideosPageProps {
  posts: PostType[];
  activeAdCampaigns: AdCampaign[];
  onBack: () => void;
  currentUser: User;
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handleOpenBoostModal: (post: PostType) => void;
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleViewProfile: (userId: string) => void;
  handleOpenEditModal: (post: PostType) => void;
  allUsers: User[];
  allCommunities: Community[];
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
}

const VideosPage: React.FC<VideosPageProps> = (props) => {
  const { posts, onBack, activeAdCampaigns } = props;

  const videoPosts = useMemo(() => {
    return posts.filter(p => p.fileType === 'video');
  }, [posts]);

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 pt-4 px-4 pb-4 border-b border-border dark:border-dark-border flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
            <VideoIconFilled className="w-6 h-6 text-primary" />
            Videos
        </h1>
      </div>

      <div className="mt-2">
        {videoPosts.length > 0 ? (
            videoPosts.map(post => {
                const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);
                return <Post key={post.id} post={post} isBoosted={isBoosted} {...props} />;
            })
        ) : (
            <div className="p-8 text-center text-on-surface-secondary">
                <p>No videos found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
