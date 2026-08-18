
import React, { useState, useRef, useEffect } from 'react';
import type { User, MonetizationSettings, Post as PostType, Order } from '../types';
// FIX: Added missing CoinIcon import to resolve "Cannot find name 'CoinIcon'" error.
import { StarIcon, GiftIcon, CreditCardIcon, ShopIcon, LockIcon, BackIcon, LocationIcon, CoinIcon, BriefcaseIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface MonetizationPageProps {
  earnings: {
    subscriptions: number;
    tips: number;
    adRevenue: number;
    gifts: number;
    sponsorships?: number;
  };
  currentUser: User;
  orders: Order[];
  onUpdateSettings: (setting: keyof MonetizationSettings, value: boolean) => void;
  allPosts: PostType[];
  onBack?: () => void;
  onNavigate: (path: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border">
        <div className="flex items-center text-on-surface-secondary dark:text-dark-on-surface-secondary">
            {icon}
            <span className="ml-2 text-sm font-semibold">{label}</span>
        </div>
        <p className="text-2xl font-bold mt-2 text-on-surface dark:text-dark-on-surface">{value}</p>
    </div>
);

const ToggleSwitch: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isEligible: boolean;
}> = ({ label, description, enabled, onChange, isEligible }) => (
  <div className={`flex justify-between items-center bg-surface dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border ${!isEligible ? 'opacity-50' : ''}`}>
    <div>
      <h4 className={`font-semibold ${!isEligible ? 'text-on-surface dark:text-dark-on-surface' : ''}`}>{label}</h4>
      <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{description}</p>
    </div>
    <button
      onClick={() => isEligible && onChange(!enabled)}
      disabled={!isEligible}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-surface-hover'} ${!isEligible ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export const MonetizationPage: React.FC<MonetizationPageProps> = ({ earnings, currentUser, orders, onUpdateSettings, onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Sales'>('Overview');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const totalEarnings = Number(earnings.subscriptions) + Number(earnings.tips) + Number(earnings.adRevenue) + Number(earnings.gifts) + Number(earnings.sponsorships || 0);

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

  return (
    <div className="w-full pb-16 md:pb-0">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex flex-col transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
                {onBack && <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface"><BackIcon className="w-6 h-6" /></button>}
                <h1 className="text-xl font-bold">{t('profile_menu_monetization')}</h1>
            </div>
        </div>
        <div className="flex border-t border-border dark:border-dark-border -mx-4">
            <button 
                onClick={() => setActiveTab('Overview')} 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'Overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('Sales')} 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'Sales' ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary'}`}
            >
                Sales History {orders.length > 0 && `(${orders.length})`}
            </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'Overview' ? (
            <>
                {currentUser.monetizationEligibility !== 'eligible' ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                    <LockIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200">Monetization Ineligible</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{currentUser.ineligibilityReason || "Your account doesn't meet the requirements for monetization yet."}</p>
                </div>
                ) : (
                <div>
                    <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border text-center">
                    <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Total earnings (last 30 days)</p>
                    <p className="text-4xl font-extrabold mt-1">${totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                    <StatCard icon={<StarIcon className="w-5 h-5" />} label="Subscriptions" value={`$${Number(earnings.subscriptions).toFixed(2)}`} />
                    <StatCard icon={<GiftIcon className="w-5 h-5" />} label="Gifts & Tips" value={`$${(Number(earnings.tips) + Number(earnings.gifts)).toFixed(2)}`} />
                    <StatCard icon={<CreditCardIcon className="w-5 h-5" />} label="Ad Revenue" value={`$${Number(earnings.adRevenue).toFixed(2)}`} />
                    <StatCard icon={<BriefcaseIcon className="w-5 h-5" />} label="Sponsorships" value={`$${Number(earnings.sponsorships || 0).toFixed(2)}`} />
                    </div>
                </div>
                )}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Settings</h3>
                    <ToggleSwitch label="Subscriptions" description="Allow users to subscribe to your profile for a monthly fee." enabled={currentUser.monetizationSettings?.subscriptionsEnabled || false} onChange={val => onUpdateSettings('subscriptionsEnabled', val)} isEligible={currentUser.monetizationEligibility === 'eligible'} />
                    <ToggleSwitch label="Gifts & Tips" description="Allow users to send you gifts on posts and tips on your profile." enabled={currentUser.monetizationSettings?.tipsEnabled || false} onChange={val => onUpdateSettings('tipsEnabled', val)} isEligible={currentUser.monetizationEligibility === 'eligible'} />
                    <ToggleSwitch label="Ad Revenue" description="Earn money from ads shown on your profile and posts." enabled={currentUser.monetizationSettings?.adsEnabled || false} onChange={val => onUpdateSettings('adsEnabled', val)} isEligible={currentUser.monetizationEligibility === 'eligible'} />
                </div>
            </>
        ) : (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShopIcon className="w-6 h-6 text-primary" />
                    Incoming Orders
                </h2>
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-surface dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border">
                        <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">You haven't sold any products yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-surface dark:bg-dark-surface p-4 rounded-2xl border border-border dark:border-dark-border shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-black text-primary uppercase text-[10px] tracking-widest mb-1">New Sale</p>
                                        <h4 className="font-bold text-lg">{order.productName}</h4>
                                        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Purchased by <span className="text-on-surface dark:text-dark-on-surface font-semibold">{order.buyerName}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-amber-500 flex items-center justify-end gap-1">
                                            <CoinIcon className="w-5 h-5" />
                                            {(order.amount * 100).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-background dark:bg-dark-background/50 p-3 rounded-xl border border-border dark:border-dark-border/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-secondary dark:text-dark-on-surface-secondary mb-2">
                                        <LocationIcon className="w-3.5 h-3.5" />
                                        SHIPPING ADDRESS
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic">
                                        {order.deliveryAddress}
                                    </p>
                                </div>
                                
                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 bg-primary/10 text-primary font-bold py-2.5 rounded-full text-sm hover:bg-primary/20 transition-all">
                                        Mark as Shipped
                                    </button>
                                    <button className="px-5 border border-border dark:border-dark-border font-bold py-2.5 rounded-full text-sm hover:bg-surface-hover dark:hover:bg-dark-surface-hover">
                                        Contact Buyer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
