import React from 'react';
import type { Post as PostType, User, Product, Community, AdCampaign } from '../types';
import { Post } from './Post';
import CommentComponent from './Comment';
import CreateComment from './CreateComment';
import { BackIcon } from '../constants';

interface PostDetailPageProps {
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
  onReportContent?: (type: 'post' | 'comment' | 'user', id: string, reason: string, description: string, communityId?: string) => void;
}

const PostDetailPage: React.FC<PostDetailPageProps> = (props) => {
  const { 
    post, 
    onBack, 
    onCreateComment, 
    currentUser, 
    commentInitialText, 
    activeAdCampaigns, 
    handleReplyToComment, 
    blockedUserIds, 
    onReportContent,
    ...rest 
  } = props;

  const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);

  return (
    <div className="flex flex-col">
      
        <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 flex items-center gap-4 border-b border-gray-200 dark:border-dark-border">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
        <div>
          <Post 
              {...rest}
              post={post}
              currentUser={currentUser}
              isDetailView={true} 
              isBoosted={isBoosted}
              blockedUserIds={blockedUserIds}
              onReportContent={onReportContent}
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
                onReportContent={onReportContent ? (type, id, reason, description) => onReportContent(type, id, reason, description, post.communityId) : undefined}
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

export default PostDetailPage;
