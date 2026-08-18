
import React, { useState } from 'react';
import type { User, Post, Gift } from '../types';
import { CoinIcon } from '../constants';
import { MOCK_GIFTS } from '../mockData';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToGift: Post | null;
  currentUser: User;
  handleSendGift: (post: Post, gift: Gift) => void;
}

const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, postToGift, currentUser, handleSendGift }) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(MOCK_GIFTS[0]);

  if (!isOpen || !postToGift) return null;

  const handleSubmit = () => {
    if (selectedGift) {
      handleSendGift(postToGift, selectedGift);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gift-modal-title"
    >
      <div 
        className="bg-background rounded-2xl w-full max-w-sm shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-center relative">
            <button 
                onClick={onClose}
                className="absolute left-2 text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
            <h2 id="gift-modal-title" className="text-xl font-bold">Send a Gift</h2>
        </div>
        <div className="p-6 flex flex-col items-center">
            <p className="text-on-surface-secondary mb-4">Send a gift to {postToGift.user.name}</p>

            <div className="w-full grid grid-cols-4 gap-3 mb-6">
                {MOCK_GIFTS.map(gift => (
                    <button
                        key={gift.id}
                        onClick={() => setSelectedGift(gift)}
                        className={`py-3 rounded-lg flex flex-col items-center gap-2 transition-colors duration-200 border-2 ${selectedGift?.id === gift.id ? 'border-primary bg-primary/10' : 'bg-surface hover:bg-gray-100 border-surface'}`}
                    >
                        <span className="text-4xl">{gift.icon}</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                           <CoinIcon className="w-3 h-3"/>
                           <span>{gift.priceInCoins}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="w-full bg-surface p-3 rounded-lg flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">Your Balance:</p>
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                        <CoinIcon className="w-5 h-5"/>
                        <span>{currentUser.coinBalance || 0}</span>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={!selectedGift || (currentUser.coinBalance || 0) < (selectedGift?.priceInCoins || 0)}
                className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {selectedGift ? `Send Gift for ${selectedGift.priceInCoins} Coins` : 'Select a Gift'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default GiftModal;
