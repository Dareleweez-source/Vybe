
import React, { useState, useRef, useEffect } from 'react';
import type { AdCampaign, User } from '../types';
import { AdManagerIcon, AddIcon, CreditCardIcon, BackIcon } from '../constants';

interface AdManagerPageProps {
  campaigns: AdCampaign[];
  onCreateAd: () => void;
  currentUser: User;
  onAddFunds: (amount: number) => void;
  onBack?: () => void;
}

const getStatus = (campaign: AdCampaign): { text: string; color: string } => {
  const now = new Date();
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);
  if (now < start) return { text: 'Scheduled', color: 'bg-blue-500' };
  if (now > end) return { text: 'Ended', color: 'bg-gray-500' };
  return { text: 'Active', color: 'bg-green-500' };
};

const AdManagerPage: React.FC<AdManagerPageProps> = ({ campaigns, onCreateAd, currentUser, onAddFunds, onBack }) => {
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
  
  const formattedBalance = (() => {
    try {
      // This can fail in some environments if locale/currency is unsupported
      return new Intl.NumberFormat(currentUser.locale || 'en-US', {
        style: 'currency',
        currency: currentUser.currency || 'USD',
      }).format(currentUser.adBalance || 0);
    } catch (e) {
      console.warn("Could not format currency, using fallback.", e);
      return `$${(currentUser.adBalance || 0).toFixed(2)}`;
    }
  })();

  return (
    <div className="w-full pb-16 md:pb-0 min-h-screen">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-dark-border flex justify-between items-center transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
              <AdManagerIcon className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Ad Manager</h1>
          </div>
        </div>
        <button onClick={onCreateAd} className="bg-primary text-white font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 text-sm">
            <AddIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Create Campaign</span>
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-surface dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-4 flex justify-between items-center">
            <div>
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Ad Balance</p>
                <p className="font-bold text-2xl">{formattedBalance}</p>
            </div>
            <button onClick={() => onAddFunds(50)} className="bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background font-bold px-4 py-2 rounded-full hover:bg-on-surface/90 dark:hover:bg-dark-on-surface/90 transition-colors duration-200 flex items-center gap-2 text-sm">
                <CreditCardIcon className="w-5 h-5" />
                <span>Add Funds</span>
            </button>
        </div>
        {campaigns.length === 0 ? (
            <div className="text-center py-16">
                <h2 className="text-xl font-bold">No Campaigns Yet</h2>
                <p className="text-on-surface-secondary dark:text-on-surface-secondary mt-2">Click "Create Campaign" to get started.</p>
            </div>
        ) : campaigns.map(campaign => {
          const status = getStatus(campaign);
          const spentPercentage = (campaign.spent / campaign.budget) * 100;

          return (
            <div key={campaign.id} className="bg-surface dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-4">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg">{campaign.name}</h2>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  <span>{status.text}</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{campaign.promotionType.charAt(0).toUpperCase() + campaign.promotionType.slice(1)} Promotion</p>

              <div className="mt-4">
                <div className="flex justify-between text-sm font-semibold text-on-surface-secondary dark:text-on-surface-secondary mb-1">
                  <span>Budget</span>
                  <span>${campaign.spent.toFixed(2)} / ${campaign.budget.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-surface-secondary rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${spentPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Impressions</p>
                  <p className="font-bold text-lg">{new Intl.NumberFormat().format(campaign.impressions)}</p>
                </div>
                <div>
                  <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Clicks</p>
                  <p className="font-bold text-lg">{new Intl.NumberFormat().format(campaign.clicks)}</p>
                </div>
                <div>
                  <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">CTR</p>
                  <p className="font-bold text-lg">{campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default AdManagerPage;
