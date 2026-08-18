
import React from 'react';
import { 
  AddIcon
} from '../constants';
import type { User } from '../types';

interface BottomNavProps {
  activeView: string;
  onNavigate: (path: string) => void;
  currentUser: User;
  isScrolling?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, isScrolling }) => {
  const navLinks = [
    { path: 'Compose', icon: AddIcon, activeIcon: AddIcon, label: 'Create', isAction: true },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-dark-background/95 backdrop-blur-md border-t border-border dark:border-dark-border px-2 py-2 flex justify-around items-center z-30 safe-area-pb transition-all duration-300 ${isScrolling ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      {navLinks.map((link) => {
        const isActive = 
            (link.path === 'Home' && (activeView === 'Home' || activeView === '')) || 
            (link.path !== 'Home' && activeView.toLowerCase().startsWith(link.path.toLowerCase()));
            
        const Icon = isActive ? link.activeIcon : link.icon;
        
        if (link.isAction) {
            return (
                <button
                    key={link.label}
                    onClick={() => onNavigate(link.path)}
                    className="relative -top-2 flex items-center justify-center bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background w-14 h-14 rounded-2xl shadow-xl hover:opacity-90 active:scale-90 transition-all border-4 border-on-surface dark:border-dark-on-surface"
                    aria-label={link.label}
                >
                    <Icon className="w-8 h-8 stroke-[3]" />
                </button>
            );
        }

        return (
          <button
            key={link.label}
            onClick={() => onNavigate(link.path)}
            className={`p-2 rounded-full transition-all duration-200 ${isActive ? 'text-on-surface dark:text-dark-on-surface scale-110' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary hover:scale-105'}`}
            aria-label={link.label}
          >
            <Icon className="w-7 h-7" />
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
