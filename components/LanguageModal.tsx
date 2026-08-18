import React from 'react';
import { useLanguage, languages, LanguageCode } from '../contexts/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div
        className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-sm shadow-lg overflow-hidden border border-border dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border dark:border-dark-border flex items-center justify-between">
          <h2 id="language-modal-title" className="text-xl font-bold">
            {t('settings_language')}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-2">
          <ul>
            {(Object.keys(languages) as LanguageCode[]).map((langCode) => (
              <li key={langCode}>
                <button
                  onClick={() => {
                    setLanguage(langCode);
                    onClose();
                  }}
                  className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200"
                >
                  <span className="font-semibold">{languages[langCode].flag} {languages[langCode].name}</span>
                  {language === langCode && (
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

export default LanguageModal;