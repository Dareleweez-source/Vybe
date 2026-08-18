
import React from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const themes: { id: Theme; labelKey: string }[] = [
    { id: 'light', labelKey: 'theme_light' }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div
        className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-sm shadow-lg overflow-hidden border border-gray-200 dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <h2 id="theme-modal-title" className="text-xl font-bold">
            {t('profile_menu_display')}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-2">
          <ul>
            {themes.map(({ id, labelKey }) => (
              <li key={id}>
                <button
                  onClick={() => setTheme(id)}
                  className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
                >
                  <span className="font-semibold">{t(labelKey)}</span>
                  {theme === id && (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 text-primary fill-current"><g><path d="M9.64 18.355c.14.14.33.22.53.22h.02c.2 0 .39-.08.53-.22l7-7c.29-.29.29-.77 0-1.06s-.77-.29-1.06 0l-6.47 6.47-3.47-3.47c-.29-.29-.77-.29-1.06 0s-.29.77 0 1.06l4 4z"></path></g></svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;