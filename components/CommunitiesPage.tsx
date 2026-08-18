
import React, { useState, useRef, useEffect } from 'react';
import type { Community, User } from '../types';
import { AddIcon, BackIcon } from '../constants';

interface CommunitiesPageProps {
  allCommunities: Community[];
  currentUser: User;
  onJoinCommunity: (communityId: string) => void;
  onCreateCommunity: () => void;
  onViewCommunity: (community: Community) => void;
  onBack: () => void;
}

const CommunityListItem: React.FC<{
  community: Community;
  isMember: boolean;
  onJoin: () => void;
  onView: () => void;
}> = ({ community, isMember, onJoin, onView }) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200">
      <button onClick={onView} className="flex items-center gap-4 flex-1 min-w-0">
        <img src={community.avatarUrl} alt={community.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        <div className="text-left min-w-0">
          <h3 className="font-bold truncate">{community.name}</h3>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{formatCount(community.memberCount)} members</p>
        </div>
      </button>
      <button
        onClick={onJoin}
        className={`font-bold text-sm px-4 py-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
          isMember
            ? 'bg-surface text-on-surface border border-border dark:border-dark-border hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 hover:border-red-300'
            : 'bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background hover:bg-on-surface/90 dark:hover:bg-dark-on-surface/90'
        }`}
      >
        {isMember ? 'Joined' : 'Join'}
      </button>
    </div>
  );
};

const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ allCommunities, currentUser, onJoinCommunity, onCreateCommunity, onViewCommunity, onBack }) => {
  const joinedCommunityIds = currentUser.joinedCommunityIds || [];
  const myCommunities = (allCommunities || []).filter(c => joinedCommunityIds.includes(c.id));
  const discoverCommunities = (allCommunities || []).filter(c => !joinedCommunityIds.includes(c.id));
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex justify-between items-center transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                <BackIcon className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-xl font-bold">Communities</h1>
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Find and join communities</p>
            </div>
        </div>
        <button onClick={onCreateCommunity} className="bg-primary text-white font-bold p-2 rounded-full hover:bg-primary-hover transition-colors duration-200" aria-label="Create Community">
            <AddIcon className="w-6 h-6" />
        </button>
      </div>
      <div>
        {myCommunities.length > 0 && (
          <div className="border-b border-border dark:border-dark-border">
            <h2 className="font-bold p-4 pb-2">Your Communities</h2>
            {myCommunities.map(community => (
              <CommunityListItem
                key={community.id}
                community={community}
                isMember={true}
                onJoin={() => onJoinCommunity(community.id)}
                onView={() => onViewCommunity(community)}
              />
            ))}
          </div>
        )}
        <div>
          <h2 className="font-bold p-4 pb-2">Discover</h2>
          {discoverCommunities.map(community => (
            <CommunityListItem
              key={community.id}
              community={community}
              isMember={false}
              onJoin={() => onJoinCommunity(community.id)}
              onView={() => onViewCommunity(community)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage;
