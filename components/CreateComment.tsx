import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';

interface CreateCommentProps {
  currentUser: User;
  onCreateComment: (content: string) => void;
  initialText?: string;
  sticky?: boolean;
}

const CreateComment: React.FC<CreateCommentProps> = ({ currentUser, onCreateComment, initialText, sticky = true }) => {
  const [content, setContent] = useState(() => initialText || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialText && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [initialText]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onCreateComment(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className={`p-4 border-t border-gray-200 dark:border-dark-border bg-background dark:bg-dark-background ${sticky ? 'sticky bottom-0' : ''}`}>
      <form onSubmit={handleSubmit} className="flex items-start space-x-2">
        <img src={currentUser.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Post your reply"
            className="w-full bg-surface dark:bg-dark-surface rounded-xl p-2 focus:outline-none resize-none"
            rows={1}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-primary text-white font-bold px-6 py-2 h-10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors duration-200"
        >
          Reply
        </button>
      </form>
    </div>
  );
};

export default CreateComment;