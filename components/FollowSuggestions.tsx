
import React from 'react';
import type { User } from '../types';
import { VerifiedIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface FollowSuggestionsProps {
  suggestedUsers: User[];
  handleFollow: (userId: string) => void;
  handleViewProfile: (userId: string) => void;
}

const FollowSuggestions: React.FC<FollowSuggestionsProps> = ({ suggestedUsers, handleFollow, handleViewProfile }) => {
  const { t } = useLanguage();

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">{t('follow_suggestions_title')}</h2>
      <ul className="space-y-4">
        {suggestedUsers.map(user => (
          <li key={user.id} className="flex items-center justify-between">
            <div onClick={() => handleViewProfile(user.id)} className="flex items-center gap-3 overflow-hidden cursor-pointer">
              <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <p className="font-bold truncate hover:underline">{user.name}</p>
                  {user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
                <p className="text-on-surface-secondary truncate">{user.handle}</p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              className="bg-on-surface text-background font-bold text-sm px-4 py-2 rounded-full hover:bg-on-surface/90 transition-colors duration-200 flex-shrink-0"
            >
              {t('button_follow')}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default FollowSuggestions;
