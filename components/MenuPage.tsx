import React from 'react';
import { SIDEBAR_LINKS, BackIcon } from '../constants';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MenuPageProps {
  user: User;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onBack: () => void;
  activeView: string;
}

const getItemColor = (path: string) => {
    switch (path) {
        case 'Communities': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        case 'Sponsorship': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
        case 'Bookmarks': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'Askai': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
        case 'Profile': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
        case 'Analytics': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
        case 'Ad-manager': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Monetization': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'Settings': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
};

const MenuPage: React.FC<MenuPageProps> = ({ user, onNavigate, onLogout, onBack, activeView }) => {
  const { t } = useLanguage();

  const mainLinks = SIDEBAR_LINKS.filter(link => link.type === 'link' && !['Analytics', 'Ad-manager', 'Monetization', 'Settings'].includes(link.path || ''));
  const secondaryLinks = SIDEBAR_LINKS.filter(link => link.type === 'link' && ['Analytics', 'Ad-manager', 'Monetization', 'Settings'].includes(link.path || ''));
  const logoutLink = SIDEBAR_LINKS.find(link => link.type === 'action' && link.id === 'logout');

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 dark:bg-dark-background/95 backdrop-blur-xl border-b border-border dark:border-dark-border px-4 py-3 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
          <BackIcon className="w-6 h-6 text-on-surface dark:text-dark-on-surface" />
        </button>
        <h1 className="text-2xl font-black text-on-surface dark:text-dark-on-surface tracking-tight">Menu</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div 
            className="flex items-center gap-4 p-5 bg-surface dark:bg-dark-surface rounded-3xl border border-border dark:border-dark-border cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" 
            onClick={() => onNavigate(`profile/${user.id}`)}
        >
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-4 border-background dark:border-dark-background shadow-sm" />
            <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-on-surface dark:text-dark-on-surface truncate">{user.name}</h2>
                <p className="text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">{user.handle}</p>
                <div className="mt-1 text-sm text-primary font-bold">View Profile</div>
            </div>
        </div>

        {/* Main Grid Navigation */}
        <div>
            <h3 className="text-xs font-bold text-on-surface-secondary dark:text-dark-on-surface-secondary uppercase tracking-wider mb-3 px-1">Explore</h3>
            <div className="grid grid-cols-2 gap-3">
                {mainLinks.map((link: any) => {
                    const isActive = activeView === link.path;
                    const colorClass = getItemColor(link.path);
                    
                    return (
                        <button
                            key={link.path}
                            onClick={() => onNavigate(link.path)}
                            className={`flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border dark:border-dark-border bg-surface dark:bg-dark-surface hover:border-primary/30 hover:shadow-sm'}`}
                        >
                            <div className={`p-3 rounded-xl ${colorClass}`}>
                                <link.icon className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-base font-bold text-on-surface dark:text-dark-on-surface">{t(link.labelKey)}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Secondary Links List */}
        <div>
            <h3 className="text-xs font-bold text-on-surface-secondary dark:text-dark-on-surface-secondary uppercase tracking-wider mb-3 px-1">Tools & Settings</h3>
            <div className="bg-surface dark:bg-dark-surface rounded-3xl border border-border dark:border-dark-border overflow-hidden">
                {secondaryLinks.map((link: any, index) => {
                    const colorClass = getItemColor(link.path);
                    return (
                        <button
                            key={link.path}
                            onClick={() => onNavigate(link.path)}
                            className={`w-full flex items-center gap-4 p-4 transition-colors hover:bg-surface-hover dark:hover:bg-dark-surface-hover ${index !== secondaryLinks.length - 1 ? 'border-b border-border dark:border-dark-border' : ''}`}
                        >
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                                <link.icon className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-base font-bold text-on-surface dark:text-dark-on-surface flex-1 text-left">{t(link.labelKey)}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Logout Button */}
        {logoutLink && (
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
                <logoutLink.icon className="w-6 h-6 stroke-[2.5]" />
                <span>{t(logoutLink.labelKey)}</span>
            </button>
        )}
        
        <div className="text-center text-xs font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary py-4">
            Cascade v1.0.0
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
