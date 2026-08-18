
import React from 'react';
import type { Post as PostType, User, Product, Community, AdCampaign } from '../types';
import { Post } from './Post';
import { BookmarkIcon, BackIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

// Reusing props from ExplorePage
interface BookmarksPageProps {
  posts: PostType[];
  activeAdCampaigns: AdCampaign[];
  onBack: () => void;
  // Pass down all the handlers for the Post component
  currentUser: User;
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
  handleOpenBoostModal: (post: PostType) => void;
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleViewProfile: (userId: string) => void;
  handleOpenEditModal: (post: PostType) => void;
  allUsers: User[];
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = (props) => {
  const { posts, currentUser, activeAdCampaigns, onBack } = props;
  const { t } = useLanguage();

  const bookmarkedPosts = (posts || []).filter(post => {
    if (!post.isBookmarked) return false;
    
    const now = new Date();
    const isPublished = !(post.status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) > now);
    const isOwnPost = post.user.id === currentUser.id;

    return isPublished || isOwnPost;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="w-full min-h-screen">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{t('sidebar_bookmarks')}</h1>
          <p className="text-sm text-on-surface-secondary">@{props.currentUser.handle}</p>
        </div>
      </div>

      <div>
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map(post => {
            const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);
            return <Post key={post.id} post={post} isBoosted={isBoosted} {...props} />
          })
        ) : (
          <div className="p-8 text-center text-on-surface-secondary">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold text-xl">No Bookmarks</p>
            <p>You haven't bookmarked any posts yet. When you do, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
