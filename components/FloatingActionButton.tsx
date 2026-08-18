
import React from 'react';
import { AddIcon } from '../constants';

interface FloatingActionButtonProps {
  onClick: () => void;
  isScrolling?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, isScrolling }) => {
  return (
    <button
      onClick={onClick}
      className={`md:hidden fixed bottom-24 right-4 w-16 h-16 bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background rounded-2xl flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:opacity-95 transition-all duration-300 active:scale-90 z-40 border-4 border-on-surface dark:border-dark-on-surface ${isScrolling ? 'opacity-40 scale-90 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}
      aria-label="Create Post"
    >
      <AddIcon className="w-9 h-9 stroke-[3]" />
    </button>
  );
};

export default FloatingActionButton;
