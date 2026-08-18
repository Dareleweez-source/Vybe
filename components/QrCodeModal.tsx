import React from 'react';
import type { User } from '../types';
import { VerifiedIcon } from '../constants';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-code-modal-title"
    >
      <div
        className="bg-background dark:bg-dark-surface rounded-3xl w-full max-w-xs shadow-lg overflow-hidden border border-border dark:border-dark-border flex flex-col items-center pt-12 pb-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
            onClick={onClose}
            className="absolute top-2 right-2 text-text-secondary dark:text-dark-text-secondary font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200"
            aria-label="Close"
          >
            &times;
        </button>

        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-background dark:border-dark-surface shadow-md" />
        <div className="flex items-center gap-1 mt-4">
            <h2 id="qr-code-modal-title" className="text-2xl font-bold">{user.name}</h2>
            {user.verificationStatus === 'verified' && <VerifiedIcon className="w-6 h-6 text-primary" />}
        </div>
        <p className="text-text-secondary dark:text-dark-text-secondary">{user.handle}</p>
        
        <div className="bg-white p-4 rounded-lg mt-6">
            {/* Using a simple SVG as a placeholder for a real QR code */}
            <svg width="200" height="200" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1h10v10H1V1z" stroke="#000" strokeWidth="2"/>
              <path d="M5 5h2v2H5V5z" fill="#000"/>
              <path d="M22 1h10v10H22V1z" stroke="#000" strokeWidth="2"/>
              <path d="M26 5h2v2h-2V5z" fill="#000"/>
              <path d="M1 22h10v10H1V22z" stroke="#000" strokeWidth="2"/>
              <path d="M5 26h2v2H5v-2z" fill="#000"/>
              <path d="M14 14h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-12 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-12-4h2v2h-2v-2zm-4-4h2v2h-2v-2zm12 8h2v2h-2v-2zm-4 0h2v2h-2v-2zm4-4h2v2h-2v-2zm4 0h2v2h-2v-2zm-4-4h2v2h-2v-2zm-8-4h2v2h-2v-2zm2 8h2v2h-2v-2z" fill="#000"/>
            </svg>
        </div>
        
        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-6 text-center max-w-xs">Scan this code with your phone's camera to open {user.handle}'s profile.</p>
      </div>
    </div>
  );
};

export default QrCodeModal;