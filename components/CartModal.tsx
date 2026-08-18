
import React, { useState } from 'react';
import type { User, Product } from '../types';
import { CoinIcon, CartIcon, LocationIcon } from '../constants';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onRemove: (productId: string) => void;
  currentUser: User;
  onCheckout: (address: string) => void;
  onNavigate: (path: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onRemove, currentUser, onCheckout, onNavigate }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const totalInDollars = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalInCoins = Math.round(totalInDollars * 100);
  const userBalance = currentUser.coinBalance || 0;
  const hasEnoughCoins = userBalance >= totalInCoins;
  const isAddressValid = deliveryAddress.trim().length >= 10;

  const handleCheckoutClick = () => {
    if (isAddressValid && hasEnoughCoins) {
        onCheckout(deliveryAddress.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-end transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-modal-title"
    >
      <div 
        className="bg-background dark:bg-dark-background w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-background dark:bg-dark-background z-10">
            <h2 id="cart-modal-title" className="text-xl font-bold flex items-center gap-2">
                <CartIcon className="w-6 h-6"/>
                Your Cart <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary text-sm font-normal">({cartItems.length} items)</span>
            </h2>
            <button 
                onClick={onClose}
                className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-surface dark:bg-dark-surface p-6 rounded-full mb-4">
                <CartIcon className="w-12 h-12 text-on-surface-secondary dark:text-dark-on-surface-secondary opacity-50" />
            </div>
            <h3 className="text-xl font-bold">Your cart is empty</h3>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">Looks like you haven't added anything yet.</p>
            <button onClick={onClose} className="mt-6 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary-hover">
                Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-3 bg-surface dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="font-bold line-clamp-1 pr-2">{item.name}</p>
                            <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">Sold by {item.seller.name}</p>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="self-start text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors">
                        Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-dark-border bg-surface dark:bg-dark-surface space-y-4">
                
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-on-surface dark:text-dark-on-surface">
                        <LocationIcon className="w-4 h-4 text-primary" />
                        Delivery Address
                    </label>
                    <textarea 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your full delivery address for shipping..."
                        rows={2}
                        className="w-full p-3 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-all placeholder:text-on-surface-secondary"
                    />
                    {!isAddressValid && deliveryAddress.length > 0 && (
                        <p className="text-[10px] text-red-500 font-bold">Please enter a complete address (min 10 characters).</p>
                    )}
                </div>

                <div className="space-y-3 mb-2">
                    <div className="flex justify-between items-center text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">
                        <span>Subtotal</span>
                        <span>${totalInDollars.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-xl">
                        <span>Total</span>
                        <div className="text-right">
                            <p>${totalInDollars.toFixed(2)}</p>
                            <p className="text-xs font-normal text-amber-600 flex items-center justify-end gap-1">
                                <CoinIcon className="w-3 h-3" /> {totalInCoins.toLocaleString()} coins
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background dark:bg-dark-background rounded-lg p-3 border border-gray-200 dark:border-dark-border flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary">Your Balance</span>
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                        <CoinIcon className="w-5 h-5" />
                        <span>{userBalance.toLocaleString()}</span>
                    </div>
                </div>

                {!hasEnoughCoins && (
                  <div className="text-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm border border-red-100 dark:border-red-800">
                      <p>Insufficient coin balance.</p>
                      <button onClick={() => onNavigate('wallet')} className="font-bold underline mt-1 hover:text-red-800 dark:hover:text-red-100">
                          Top up wallet
                      </button>
                  </div>
                )}

                <button 
                  onClick={handleCheckoutClick}
                  disabled={!hasEnoughCoins || cartItems.length === 0 || !isAddressValid}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                    {!isAddressValid && cartItems.length > 0 ? 'Enter Address to Continue' : 'Checkout'}
                </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CartModal;
