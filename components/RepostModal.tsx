import React from 'react';
import type { Post } from '../types';
import { EchoIcon, QuoteIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  handleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleQuotePost: (post: Post) => void;
}

const RepostModal: React.FC<RepostModalProps> = ({ isOpen, onClose, post, handleEcho, handleQuotePost }) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-background dark:bg-dark-surface rounded-t-2xl w-full shadow-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-2"></div>
        </div>
        <ul className="pb-4">
          <li>
            <button onClick={(e) => { e.stopPropagation(); handleEcho(post.id, false); onClose(); }} className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-surface dark:hover:bg-dark-surface-hover text-lg font-semibold">
              <EchoIcon className="w-6 h-6" />
              <span>{post.isEchoed ? 'Undo Echo' : t('share_echo')}</span>
            </button>
          </li>
          <li>
            <button onClick={(e) => { e.stopPropagation(); handleQuotePost(post); onClose(); }} className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-surface dark:hover:bg-dark-surface-hover text-lg font-semibold">
              <QuoteIcon className="w-6 h-6" />
              <span>{t('share_quote_post')}</span>
            </button>
          </li>
          <li>
            <button onClick={onClose} className="w-full text-center px-4 py-4 mt-2 text-lg font-semibold text-gray-500 dark:text-gray-400 hover:bg-surface dark:hover:bg-dark-surface-hover border-t border-gray-200 dark:border-dark-border">
              Cancel
            </button>
          </li>
        </ul>
      </div>
       <style>{`
          @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
          }
          .animate-slide-up {
              animation: slide-up 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default RepostModal;
