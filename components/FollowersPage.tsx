
import React, { useMemo, useState } from 'react';
import type { User } from '../types';
import { VerifiedIcon, BackIcon } from '../constants';

interface FollowersPageProps {
  currentUser: User;
  targetUser: User;
  allUsers: User[];
  onBack: () => void;
  handleViewProfile: (userId: string) => void;
  handleFollow: (userId: string) => void;
  pageType: 'followers' | 'following';
}

const UserRow: React.FC<{
    user: User;
    currentUser: User;
    isFollowing: boolean;
    onFollow: (userId: string) => void;
    onViewProfile: (userId: string) => void;
}> = ({ user, currentUser, isFollowing, onFollow, onViewProfile }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200">
            <button onClick={() => onViewProfile(user.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <p className="font-bold truncate">{user.name}</p>
                        {user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary flex-shrink-0" />}
                        <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">{user.handle}</p>
                    </div>
                    {user.bio && <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary truncate mt-1">{user.bio}</p>}
                </div>
            </button>
            {user.id !== currentUser.id && (
                 <button
                    onClick={() => onFollow(user.id)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className={`font-bold text-sm px-4 py-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    isFollowing
                        ? 'bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface border border-border dark:border-dark-border hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 hover:border-red-300'
                        : 'bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background hover:bg-on-surface/90 dark:hover:bg-dark-on-surface/90'
                    }`}
                >
                    {isFollowing ? (isHovering ? 'Unfollow' : 'Following') : 'Follow'}
                </button>
            )}
        </div>
    );
};


const FollowersPage: React.FC<FollowersPageProps> = ({ currentUser, targetUser, allUsers, onBack, handleViewProfile, handleFollow, pageType }) => {
    
    const listUsers = useMemo(() => {
        if (pageType === 'followers') {
            return (allUsers || []).filter(u => u.followingIds?.includes(targetUser.id));
        } else { // following
            return (allUsers || []).filter(u => targetUser.followingIds?.includes(u.id));
        }
    }, [allUsers, targetUser, pageType]);
    
    const title = pageType.charAt(0).toUpperCase() + pageType.slice(1);
    const isOwnProfile = targetUser.id === currentUser.id;

    const noUsersText = pageType === 'followers'
        ? (isOwnProfile ? "You don't have any followers yet." : `${targetUser.name} doesn't have any followers.`)
        : (isOwnProfile ? "You aren't following anyone yet." : `${targetUser.name} isn't following anyone.`);

    const noUsersSubText = pageType === 'followers'
        ? "When someone follows you, they'll be listed here."
        : "When you follow people, they'll be listed here.";


    const currentUserFollowingIds = currentUser.followingIds || [];

    return (
        <div className="w-full min-h-screen">
            <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                    <BackIcon className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">{title}</h1>
                    <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{targetUser.handle}</p>
                </div>
            </div>
            
            <div>
                {listUsers.length > 0 ? (
                    listUsers.map(listUser => (
                        <UserRow
                            key={listUser.id}
                            user={listUser}
                            currentUser={currentUser}
                            isFollowing={currentUserFollowingIds.includes(listUser.id)}
                            onFollow={handleFollow}
                            onViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
                        <p className="font-bold text-xl">
                            {noUsersText}
                        </p>
                        {isOwnProfile && <p>{noUsersSubText}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowersPage;
