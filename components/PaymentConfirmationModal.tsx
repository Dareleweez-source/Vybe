
import React from 'react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  type: 'adFunds' | 'verification' | 'buyCoins';
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, onConfirm, amount, type }) => {
  if (!isOpen) return null;

  const typeMessages = {
    adFunds: `add $${amount.toFixed(2)} to your ad balance`,
    verification: 'verify your account',
    buyCoins: `purchase ${amount} coins`
  };

  const message = `Please confirm if you have successfully completed the payment to ${typeMessages[type]}.`;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-confirm-title"
    >
      <div
        className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-sm shadow-lg overflow-hidden border border-border dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <h2 id="payment-confirm-title" className="text-2xl font-black mb-4">
            Confirm Your Payment
          </h2>
          <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mb-8">
            {message}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 border border-on-surface-secondary dark:border-dark-on-surface-secondary text-on-surface dark:text-dark-on-surface font-bold py-3 rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-hover transition-colors duration-200"
            >
              Yes, I've Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
