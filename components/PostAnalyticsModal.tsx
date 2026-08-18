import React from 'react';
import type { Post as PostType } from '../types';
import { ImpressionsIcon, SparklesIcon as EngagementsIcon, ProfileIcon, NewFollowersIcon, VerifiedIcon, AnalyticsIcon } from '../constants';

interface PostAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostType | null;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    description?: string;
}> = ({ icon, label, value, description }) => (
    <div className="bg-surface p-4 rounded-lg">
        <div className="flex items-center text-on-surface-secondary">
            {icon}
            <span className="ml-2 text-sm font-semibold">{label}</span>
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {description && <p className="text-xs text-on-surface-secondary mt-1">{description}</p>}
    </div>
);


const PostAnalyticsModal: React.FC<PostAnalyticsModalProps> = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post || !post.analytics) return null;

  const { analytics, user, content } = post;
  const engagementRate = analytics.impressions > 0 ? ((analytics.engagements / analytics.impressions) * 100).toFixed(2) : '0.00';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
    >
      <div 
        className="bg-background rounded-2xl w-full max-w-lg shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 id="analytics-modal-title" className="text-xl font-bold flex items-center gap-2">
              <AnalyticsIcon className="w-6 h-6 text-primary" strokeWidth="2.5" />
              Post Analytics
            </h2>
            <button 
                onClick={onClose}
                className="text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
            <div className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="font-bold">{user.name}</p>
                            {user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-on-surface-secondary">{user.handle}</p>
                    </div>
                </div>
                <p className="mt-3 text-on-surface whitespace-pre-wrap">{content}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    icon={<ImpressionsIcon className="w-5 h-5" />}
                    label="Impressions"
                    value={formatNumber(analytics.impressions)}
                    description="Times this post was seen"
                />
                 <StatCard 
                    icon={<EngagementsIcon className="w-5 h-5" />}
                    label="Engagements"
                    value={formatNumber(analytics.engagements)}
                    description="Total interactions with this post"
                />
                 <StatCard 
                    icon={<ProfileIcon className="w-5 h-5" />}
                    label="Profile Visits"
                    value={formatNumber(analytics.profileVisits)}
                    description="From this post"
                />
                 <StatCard 
                    icon={<NewFollowersIcon className="w-5 h-5" />}
                    label="New Followers"
                    value={formatNumber(analytics.newFollowers)}
                    description="From this post"
                />
            </div>
            
             <div className="bg-surface p-4 rounded-lg">
                <div className="flex items-center text-on-surface-secondary">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <span className="ml-2 text-sm font-semibold">Engagement Rate</span>
                </div>
                <p className="text-2xl font-bold mt-2">{engagementRate}%</p>
                <p className="text-xs text-on-surface-secondary mt-1">(Engagements ÷ Impressions) × 100</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostAnalyticsModal;
