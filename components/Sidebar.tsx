
import React from 'react';
import { SIDEBAR_LINKS, AddIcon } from '../constants';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeView: string;
  onNavigate: (path: string) => void;
  openCompose: () => void;
  user: User;
  onLogout: () => void;
  handleRefresh: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, onNavigate, openCompose, user, onLogout,
  isMobileMenuOpen, setMobileMenuOpen
}) => {
  const { t } = useLanguage();

  const handleNavigateAndClose = (path: string) => {
    if (path === 'Profile') {
        onNavigate(`profile/${user.id}`);
    } else {
        onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <header 
        className={`fixed md:sticky top-0 h-screen w-52 lg:w-56 px-2 lg:px-3 py-1 flex flex-col bg-background dark:bg-dark-background border-r border-border dark:border-dark-border z-40 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="flex-shrink-0 flex items-center justify-between md:block px-3 pt-3 pb-2">
          <button
            onClick={() => { onNavigate('Home'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            className="py-2 px-1 transition-transform active:scale-95 duration-200"
            aria-label="Home"
          >
            <h1 className="text-3xl font-black italic tracking-tight font-serif bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              cascade
            </h1>
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200" aria-label="Close">
            &times;
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pb-4 px-2">
          <nav>
            <ul>
              {SIDEBAR_LINKS.map((link, index) => {
                if (link.type === 'divider') {
                  return <li key={`divider-${index}`}><div className="h-px bg-border dark:bg-dark-border my-2 mx-4 opacity-50" /></li>;
                }

                const commonClasses = "flex items-center gap-4 text-lg py-3 px-4 my-0.5 rounded-full transition-all duration-200 w-full text-left";
                
                if (link.type === 'action') {
                  const handleActionClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    if ('id' in link && link.id === 'logout') {
                      onLogout();
                      setMobileMenuOpen(false);
                    }
                  };
                  return (
                    <li key={'id' in link ? link.id : index}>
                      <button onClick={handleActionClick} className={`${commonClasses} text-on-surface dark:text-dark-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover`}>
                        {'icon' in link && <link.icon className="w-6 h-6" />}
                        <span className="font-semibold">{'labelKey' in link && link.labelKey ? t(link.labelKey) : 'label' in link ? link.label : ''}</span>
                      </button>
                    </li>
                  );
                }

                const isActive = activeView.toLowerCase().startsWith(link.path.toLowerCase()) || 
                                (link.path === 'Home' && activeView === '');
                
                const Icon = (isActive && link.activeIcon) ? link.activeIcon : link.icon;
                const highlightClasses = link.isHighlight 
                  ? "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20" 
                  : isActive 
                    ? "text-on-surface dark:text-dark-on-surface font-black" 
                    : "text-on-surface dark:text-dark-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover";

                return (
                  <li key={link.path}>
                    <a
                      href={`#${link.path}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateAndClose(link.path);
                      }}
                      className={`${commonClasses} ${highlightClasses}`}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5]' : ''}`} />
                      <span className={`${isActive ? 'font-black' : 'font-medium'}`}>{t(link.labelKey)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {activeView === 'Home' && (
              <>
                <button 
                    onClick={openCompose}
                    className="hidden lg:flex items-center justify-center gap-2 bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background font-black py-4 mt-6 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all text-xl w-full border-4 border-on-surface dark:border-dark-on-surface"
                >
                    Post
                </button>
                <button 
                    onClick={openCompose}
                    className="lg:hidden flex items-center justify-center bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background w-14 h-14 mt-6 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all border-4 border-on-surface dark:border-dark-on-surface"
                >
                    <AddIcon className="w-8 h-8 stroke-[3]" />
                </button>
              </>
            )}
          </nav>

          <button 
            onClick={() => onNavigate(`profile/${user.id}`)}
            className="hidden md:flex items-center gap-3 p-3 mt-auto rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors text-left"
          >
            <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-xs text-on-surface-secondary truncate">{user.handle}</p>
            </div>
          </button>
        </div>
      </header>
    </>
  );
};

export default Sidebar;
