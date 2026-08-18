import React from 'react';
import type { User, Story } from '../types';
import { AddIcon } from '../constants';

interface StoriesTrayProps {
  storiesByUser: { user: User, stories: Story[] }[];
  currentUser: User;
  onStoryClick: (userId: string) => void;
  onCreateStoryClick: () => void;
}

const StoryCircle: React.FC<{ user: User; stories: Story[]; onClick: () => void; }> = ({ user, onClick }) => {
    return (
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer space-y-1 group max-w-[96px]">
            <button 
                onClick={onClick} 
                className="relative focus:outline-none"
                aria-label={`${user.name}'s story`}
            >
                <div className="p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full shadow-md transition-transform duration-200 group-hover:scale-105 active:scale-95">
                    <div className="p-[2px] bg-surface dark:bg-dark-surface rounded-full">
                        <img 
                            className="w-[78px] h-[78px] rounded-full object-cover" 
                            src={user.avatarUrl}
                            alt={`${user.name}'s story`} 
                        />
                    </div>
                </div>
            </button>
            <span className="text-[11px] font-semibold text-on-surface dark:text-dark-on-surface truncate w-20 text-center tracking-tight">
                {user.name.split(' ')[0]}
            </span>
        </div>
    );
};

const CreateStoryCircle: React.FC<{ user: User; onClick: () => void; }> = ({ user, onClick }) => (
    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer space-y-1 group max-w-[96px]">
        <button 
            onClick={onClick} 
            className="relative focus:outline-none"
            aria-label="Your story"
        >
            <div className="p-[2.5px] rounded-full">
                <div className="p-[2px] bg-surface dark:bg-dark-surface rounded-full">
                    <img 
                        className="w-[78px] h-[78px] rounded-full object-cover transition-transform duration-200 group-hover:scale-105" 
                        src={user.avatarUrl} 
                        alt="Your story" 
                    />
                </div>
            </div>
            <div className="absolute bottom-0.5 right-0.5 bg-primary text-white rounded-full p-0.5 border-2 border-surface dark:border-dark-surface shadow-md">
                <AddIcon className="w-4 h-4 stroke-[3]" />
            </div>
        </button>
        <span className="text-[11px] font-semibold text-on-surface dark:text-dark-on-surface truncate w-20 text-center tracking-tight">
            Your story
        </span>
    </div>
);

const StoriesTray: React.FC<StoriesTrayProps> = ({ storiesByUser, currentUser, onStoryClick, onCreateStoryClick }) => {
  return (
    <div className="px-4 pt-2 pb-3 bg-surface dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
      <div className="flex space-x-5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
         <CreateStoryCircle user={currentUser} onClick={onCreateStoryClick} />
        {storiesByUser.map(({ user, stories }) => (
            <StoryCircle key={user.id} user={user} stories={stories} onClick={() => onStoryClick(user.id)} />
        ))}
      </div>
    </div>
  );
};

export default StoriesTray;