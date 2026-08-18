import React, { useState } from 'react';
import type { User } from '../types';
import { CoinIcon } from '../constants';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToTip: User | null;
  currentUser: User;
  handleSendTip: (amount: number, user: User) => void;
}

const TIP_AMOUNTS = [10, 50, 100, 500];

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, userToTip, currentUser, handleSendTip }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);

  if (!isOpen || !userToTip) return null;

  const handleSubmit = () => {
    handleSendTip(selectedAmount, userToTip);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      <div 
        className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-sm shadow-lg overflow-hidden border border-gray-200 dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-center relative">
            <button 
                onClick={onClose}
                className="absolute left-2 text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
            <h2 id="tip-modal-title" className="text-xl font-bold">Send a Tip</h2>
        </div>
        <div className="p-6 flex flex-col items-center">
            <img src={userToTip.avatarUrl} alt={userToTip.name} className="w-20 h-20 rounded-full mb-2" />
            <p className="font-bold text-lg">Show your support for</p>
            <p className="font-bold text-lg text-primary">{userToTip.name}</p>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mb-6">{userToTip.handle}</p>

            <div className="w-full grid grid-cols-4 gap-3 mb-6">
                {TIP_AMOUNTS.map(amount => (
                    <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-3 rounded-full font-bold transition-colors duration-200 border-2 flex flex-col items-center justify-center ${selectedAmount === amount ? 'bg-primary text-white border-primary' : 'bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-surface-secondary border-gray-200 dark:border-dark-border'}`}
                    >
                         <div className="flex items-center gap-1 text-xs font-semibold">
                           <CoinIcon className="w-3 h-3"/>
                           <span>{amount}</span>
                        </div>
                    </button>
                ))}
            </div>

             <div className="w-full bg-surface dark:bg-dark-surface p-3 rounded-lg flex justify-between items-center mb-6 border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Your Balance:</p>
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                        <CoinIcon className="w-5 h-5"/>
                        <span>{currentUser.coinBalance || 0}</span>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={!selectedAmount || (currentUser.coinBalance || 0) < selectedAmount}
                className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Send {selectedAmount} Coin Tip
            </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;