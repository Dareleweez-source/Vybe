
import React, { useState, useEffect, useRef } from 'react';
import type { Comment, User } from '../types';
import { VerifiedIcon } from '../constants';
import ReportModal from './ReportModal';

interface CommentProps {
  comment: Comment;
  postId?: string;
  currentUser?: User;
  handleReplyToComment?: (postId: string, parentCommentId: string, content: string) => void;
  isReply?: boolean;
  blockedUserIds?: string[];
  onReportContent?: (type: 'post' | 'comment' | 'user', id: string, reason: string, description: string) => void;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

const CommentComponent: React.FC<CommentProps> = ({ comment, postId, currentUser, handleReplyToComment, isReply = false, blockedUserIds = [], onReportContent }) => {
  const { user, content, timestamp } = comment;
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isReplying && textareaRef.current) {
        const ta = textareaRef.current;
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
        ta.focus();
    }
  }, [isReplying]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && postId && handleReplyToComment) {
      handleReplyToComment(postId, comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };


  return (
    <div className={`flex space-x-3 ${isReply ? 'pt-4' : 'p-4 border-b border-gray-200 dark:border-dark-border'}`}>
      <div className="flex flex-col items-center flex-shrink-0">
        <img src={user.avatarUrl} alt={`${user.name}'s avatar`} className={`rounded-full ${isReply ? 'w-8 h-8' : 'w-12 h-12'}`} />
        {comment.replies && comment.replies.length > 0 && (
          <div className="w-0.5 grow bg-gray-200 dark:bg-dark-border mt-2"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 min-w-0">
          <span className="font-bold truncate">{user.name}</span>
           {user.verificationStatus === 'verified' && <VerifiedIcon className="w-5 h-5 text-primary flex-shrink-0" />}
          <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">{user.handle}</span>
          <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary">·</span>
          <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{timeAgo(timestamp)}</span>
        </div>
        <p className="my-1 whitespace-pre-wrap break-words">{content}</p>

        <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary">
            {handleReplyToComment && postId && currentUser && (
                <button onClick={() => setIsReplying(!isReplying)} className="font-semibold hover:underline">
                Reply
                </button>
            )}
            {onReportContent && (
                <button onClick={() => setIsReportModalOpen(true)} className="font-semibold hover:underline text-red-500">
                    Report
                </button>
            )}
        </div>

        {isReplying && currentUser && postId && handleReplyToComment && (
          <form onSubmit={handleReplySubmit} className="mt-2 flex items-start space-x-2">
            <img src={currentUser.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={replyContent}
                onChange={handleContentChange}
                placeholder={`Replying to ${comment.user.name}`}
                className="w-full bg-surface dark:bg-dark-surface rounded-xl p-2 text-sm focus:outline-none resize-none overflow-hidden"
                rows={1}
              />
            </div>
            <button type="submit" disabled={!replyContent.trim()} className="bg-primary text-white font-bold px-4 py-1.5 rounded-full text-sm disabled:opacity-50">
              Reply
            </button>
          </form>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.filter(reply => !blockedUserIds.includes(reply.user.id)).map(reply => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                postId={postId}
                currentUser={currentUser}
                handleReplyToComment={handleReplyToComment}
                isReply={true}
                blockedUserIds={blockedUserIds}
                onReportContent={onReportContent}
              />
            ))}
          </div>
        )}
      </div>
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={(reason, description) => onReportContent && onReportContent('comment', comment.id, reason, description)}
        reportedType="comment"
      />
    </div>
  );
};

export default CommentComponent;
