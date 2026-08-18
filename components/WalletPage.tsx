
import React, { useState, useRef, useEffect } from 'react';
import type { User, Transaction, TransactionType } from '../types';
import { CoinIcon, GiftIcon, TipIcon, ShopIcon, BackIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface WalletPageProps {
  currentUser: User;
  transactions: Transaction[];
  onBuyCoins: (amount: number) => void;
  onBack?: () => void;
}

const COIN_PACKAGES = [
    { amount: 100, price: 0.99 },
    { amount: 550, price: 4.99 },
    { amount: 1200, price: 9.99 },
    { amount: 7000, price: 49.99 },
];

const TransactionIcon: React.FC<{ type: TransactionType }> = ({ type }) => {
    switch (type) {
        case 'deposit':
            return <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center"><CoinIcon className="w-5 h-5" /></div>;
        case 'tip':
            return <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center"><TipIcon className="w-5 h-5" strokeWidth="2.5" /></div>;
        case 'gift':
            return <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center"><GiftIcon className="w-5 h-5" /></div>;
        default:
            return <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center"><ShopIcon className="w-5 h-5" /></div>;
    }
};

const WalletPage: React.FC<WalletPageProps> = ({ currentUser, transactions, onBuyCoins, onBack }) => {
    const { t } = useLanguage();
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formattedBalance = currentUser.coinBalance ? currentUser.coinBalance.toLocaleString() : '0';

    return (
        <div className="w-full pb-16 md:pb-0 min-h-screen">
            <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex justify-between items-center transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                        <BackIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">{t('wallet_title')}</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                    <p className="font-medium opacity-90 mb-1">Your Balance</p>
                    <div className="flex items-center gap-2">
                        <CoinIcon className="w-8 h-8" />
                        <span className="text-4xl font-extrabold">{formattedBalance}</span>
                    </div>
                </div>

                {/* Buy Coins */}
                <div>
                    <h2 className="text-lg font-bold mb-3">Buy Coins</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {COIN_PACKAGES.map((pkg, index) => (
                            <button 
                                key={index}
                                onClick={() => onBuyCoins(pkg.amount)}
                                className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-4 rounded-xl flex flex-col items-center hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
                            >
                                <div className="flex items-center gap-1 font-bold text-lg mb-1">
                                    <CoinIcon className="w-5 h-5 text-amber-500" />
                                    <span>{pkg.amount}</span>
                                </div>
                                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                    ${pkg.price}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <h2 className="text-lg font-bold mb-3">Transaction History</h2>
                    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border overflow-hidden">
                        {transactions.length > 0 ? (
                            <ul>
                                {transactions.map((tx) => (
                                    <li key={tx.id} className="p-4 border-b border-border dark:border-dark-border last:border-0 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TransactionIcon type={tx.type} />
                                            <div>
                                                <p className="font-semibold text-sm">{tx.description}</p>
                                                <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-on-surface dark:text-dark-on-surface'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
                                No transactions yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
