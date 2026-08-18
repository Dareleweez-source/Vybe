import React, { useMemo } from 'react';
import { CommentIcon, LikedIcon, ProfileIcon, EchoIcon, BackIcon } from '../constants';
import type { User } from '../types';

// Enhanced Mock notification data to demonstrate grouping
const MOCK_NOTIFICATIONS: any[] = [];

import AppHeader from './AppHeader';

interface NotificationsPageProps {
  onBack: () => void;
  currentUser: User;
  onNavigate?: (path: string) => void;
}

interface GroupedNotification {
    id: string; // ID of the most recent notification in the group
    type: string;
    users: User[]; // All users involved
    postContent?: string;
    timestamp: string; // Most recent timestamp
    count: number;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack, currentUser, onNavigate }) => {

    const ICONS: Record<string, React.ReactNode> = {
        follow: <ProfileIcon className="w-8 h-8 text-primary" />,
        like: <LikedIcon className="w-8 h-8 text-pink-500" />,
        comment: <CommentIcon className="w-8 h-8 text-blue-500" />,
        echo: <EchoIcon className="w-8 h-8 text-green-500" />
    };

    const groupedNotifications = useMemo(() => {
        const groups: Record<string, GroupedNotification> = {};
        const sortedNotifs = [...MOCK_NOTIFICATIONS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        sortedNotifs.forEach(notif => {
            let key = notif.id; // Default unique key

            // Grouping Logic
            if (notif.type === 'follow') {
                 // Group follows by day
                 const date = new Date(notif.timestamp).toDateString();
                 key = `follow-${date}`;
            } else if (notif.postContent) {
                if (notif.type === 'echo') {
                    // Shares: Group by Post AND Day
                    const date = new Date(notif.timestamp).toDateString();
                    key = `echo-${notif.postContent}-${date}`;
                } else if (notif.type === 'like') {
                    // Likes: Group by Post
                    key = `like-${notif.postContent}`;
                } else if (notif.type === 'comment') {
                    // Comments: Group by Post
                    key = `comment-${notif.postContent}`;
                }
            }

            if (!groups[key]) {
                groups[key] = {
                    id: notif.id,
                    type: notif.type,
                    users: [notif.user],
                    postContent: notif.postContent,
                    timestamp: notif.timestamp,
                    count: 1
                };
            } else {
                // Add user to existing group if not already there (deduplication)
                if (!groups[key].users.find(u => u.id === notif.user.id)) {
                    groups[key].users.push(notif.user);
                }
                groups[key].count += 1;
                // Keep the timestamp of the newest one (since we sorted desc, the first one encountered is newest, so we keep existing)
            }
        });

        return Object.values(groups).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, []);

    const renderNotificationText = (group: GroupedNotification) => {
        const { users, type, count } = group;
        const names = users.map(u => u.name);
        
        // FIX: The `userString` variable was inferred as a string, but was assigned JSX elements.
        // Explicitly typing it as `React.ReactNode` resolves the type error.
        let userString: React.ReactNode = '';
        if (users.length === 1) {
            userString = <span className="font-bold">{names[0]}</span>;
        } else if (users.length === 2) {
            userString = <span><span className="font-bold">{names[0]}</span> and <span className="font-bold">{names[1]}</span></span>;
        } else {
            userString = <span><span className="font-bold">{names[0]}</span>, <span className="font-bold">{names[1]}</span> and <span className="font-bold">{count - 2} others</span></span>;
        }

        let action = '';
        switch (type) {
            case 'like': action = 'liked your post'; break;
            case 'comment': action = 'commented on your post'; break;
            case 'echo': action = 'shared your post'; break;
            case 'follow': action = 'followed you'; break;
            default: action = 'interacted with you';
        }

        return (
            <p className="text-on-surface dark:text-dark-on-surface text-base">
                {userString} {action}
            </p>
        );
    };

    return (
        <div className="w-full min-h-screen">
            {onNavigate && <AppHeader currentUser={currentUser} activeView="Notifications" onNavigate={onNavigate} />}
            <div className="sticky top-0 bg-background dark:bg-dark-background z-10 px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4 shadow-sm">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                    <BackIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            <div>
                {groupedNotifications.map(group => {
                    const icon = ICONS[group.type];

                    return (
                        <div key={group.id} className="border-b border-border dark:border-dark-border px-4 py-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200 cursor-pointer">
                            <div className="flex gap-4">
                                <div className="w-10 flex-shrink-0 flex justify-center pt-1">
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-1">
                                        {/* Avatar Stack for groups */}
                                        <div className="flex -space-x-3 overflow-hidden py-1">
                                            {group.users.slice(0, 3).map((u, i) => (
                                                <img 
                                                    key={i} 
                                                    src={u.avatarUrl} 
                                                    alt={u.name} 
                                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-background dark:ring-dark-background" 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        {renderNotificationText(group)}
                                        {group.postContent && (
                                            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1 line-clamp-2">
                                                {group.postContent}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {groupedNotifications.length === 0 && (
                    <div className="p-8 text-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
                        <p>No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;