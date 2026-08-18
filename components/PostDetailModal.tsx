
import React from 'react';
import type { Post as PostType, User, Product, Community, AdCampaign } from '../types';
// FIX: Changed default import of 'Post' to a named import.
import { Post } from './Post';
import CommentComponent from './Comment';
import CreateComment from './CreateComment';

interface PostDetailModalProps {
  post: PostType;
  currentUser: User;
  subscribedToUserIds: string[];
  onBack: () => void;
  onCreateComment: (postId: string, content: string) => void;
  handleReplyToComment: (postId: string, parentCommentId: string, content: string) => void;
  commentInitialText?: string;
  activeAdCampaigns: AdCampaign[];
  // Post interaction handlers
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openTipModal: (user: User) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  handleSearch: (query: string) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handleOpenEditModal: (post: PostType) => void;
  handleOpenBoostModal: (post: PostType) => void;
  handleViewProfile: (userId: string) => void;
  allUsers: User[];
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleShareToCommunity: (post: PostType) => void;
  // Add missing props
  claimedPostRewardIds?: string[];
  handleClaimPostReward?: (postId: string, reward: number) => void;
  onNavigate: (path: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = (props) => {
  const { 
    post, 
    onBack, 
    onCreateComment, 
    currentUser, 
    commentInitialText, 
    activeAdCampaigns, 
    handleReplyToComment, 
    blockedUserIds, 
    ...rest 
  } = props;

  const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);

  return (
    <div className="flex flex-col">
      
        <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-dark-border">
          <button 
                onClick={onBack}
                className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
                aria-label="Close"
            >
                &times;
          </button>
          <h1 className="text-xl font-bold">Post</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
        <div>
          <Post 
              {...rest}
              post={post}
              currentUser={currentUser}
              isDetailView={true} 
              isBoosted={isBoosted}
              blockedUserIds={blockedUserIds}
          />
          {[...(post.commentData || [])]
            .filter(comment => !blockedUserIds.includes(comment.user.id))
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(comment => (
              <CommentComponent 
                key={comment.id}
                comment={comment}
                postId={post.id}
                currentUser={currentUser}
                handleReplyToComment={handleReplyToComment}
                blockedUserIds={blockedUserIds}
              />
          ))}
        </div>
        <CreateComment 
          currentUser={currentUser} 
          onCreateComment={(content) => onCreateComment(post.id, content)} 
          initialText={commentInitialText}
          post={post}
        />
    </div>
  );
};

export default PostDetailModal;
