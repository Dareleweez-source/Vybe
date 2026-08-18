import React, { useState, useMemo } from 'react';
import { BackIcon, MonetizationIcon, AnalyticsIcon, ShopIcon, GiftIcon, BriefcaseIcon } from '../constants';

interface PlatformEconomicsPageProps {
  onBack: () => void;
}

const PlatformEconomicsPage: React.FC<PlatformEconomicsPageProps> = ({ onBack }) => {
  const [activeUsers, setActiveUsers] = useState(1000000);
  const [subscriptionRate, setSubscriptionRate] = useState(5); // 5% of users subscribe
  const [avgSubscriptionPrice, setAvgSubscriptionPrice] = useState(5); // $5/month
  const [platformFee, setPlatformFee] = useState(20); // 20% platform fee
  const [adLoad, setAdLoad] = useState(10); // 10 ads per user per month
  const [cpm, setCpm] = useState(5); // $5 CPM
  const [marketplaceVolume, setMarketplaceVolume] = useState(1000000); // $1M GMV
  const [marketplaceFee, setMarketplaceFee] = useState(10); // 10% fee
  
  const revenue = useMemo(() => {
    const subscriptionRevenue = (activeUsers * (subscriptionRate / 100) * avgSubscriptionPrice) * (platformFee / 100);
    const adRevenue = (activeUsers * adLoad / 1000) * cpm;
    const marketplaceRevenue = marketplaceVolume * (marketplaceFee / 100);
    const giftMargin = (activeUsers * 0.1 * 1) * 0.30;

    return {
      subscriptions: subscriptionRevenue,
      ads: adRevenue,
      marketplace: marketplaceRevenue,
      gifts: giftMargin,
      total: subscriptionRevenue + adRevenue + marketplaceRevenue + giftMargin
    };
  }, [activeUsers, subscriptionRate, avgSubscriptionPrice, platformFee, adLoad, cpm, marketplaceVolume, marketplaceFee]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20">
      <div className="sticky top-0 z-10 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md border-b border-border dark:border-dark-border px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
          <BackIcon className="w-6 h-6 text-on-surface dark:text-dark-on-surface" />
        </button>
        <h1 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">Platform Economics</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
                <h2 className="text-lg font-medium opacity-90 mb-1">Projected Monthly Revenue</h2>
                <p className="text-4xl font-black tracking-tight">{formatCurrency(revenue.total)}</p>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">ARR</span>
                    <span>{formatCurrency(revenue.total * 12)} (Annual Run Rate)</span>
                </div>
            </div>

            <div className="bg-surface dark:bg-dark-surface rounded-2xl p-6 border border-border dark:border-dark-border shadow-sm">
                <h3 className="font-bold text-lg mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400"><BriefcaseIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Subscriptions ({platformFee}%)</span>
                        </div>
                        <span className="font-bold">{formatCurrency(revenue.subscriptions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400"><MonetizationIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Advertising</span>
                        </div>
                        <span className="font-bold">{formatCurrency(revenue.ads)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-600 dark:text-amber-400"><ShopIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Marketplace ({marketplaceFee}%)</span>
                        </div>
                        <span className="font-bold">{formatCurrency(revenue.marketplace)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded text-pink-600 dark:text-pink-400"><GiftIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Virtual Goods (30%)</span>
                        </div>
                        <span className="font-bold">{formatCurrency(revenue.gifts)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Simulator Controls */}
        <div className="bg-surface dark:bg-dark-surface rounded-2xl p-6 border border-border dark:border-dark-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <AnalyticsIcon className="w-6 h-6 text-primary" />
                    Revenue Simulator
                </h3>
                <button 
                    onClick={() => { setActiveUsers(1000000); setSubscriptionRate(5); setAvgSubscriptionPrice(5); setPlatformFee(20); setAdLoad(10); setCpm(5); setMarketplaceVolume(1000000); setMarketplaceFee(10); }}
                    className="text-sm text-primary font-bold hover:underline"
                >
                    Reset Defaults
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-secondary">Monthly Active Users</label>
                    <input type="range" min="10000" max="10000000" step="10000" value={activeUsers} onChange={(e) => setActiveUsers(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs font-mono">
                        <span>10k</span>
                        <span className="font-bold text-primary">{activeUsers.toLocaleString()}</span>
                        <span>10M</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-secondary">Subscription Rate (%)</label>
                    <input type="range" min="0" max="20" step="0.1" value={subscriptionRate} onChange={(e) => setSubscriptionRate(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs font-mono">
                        <span>0%</span>
                        <span className="font-bold text-primary">{subscriptionRate}%</span>
                        <span>20%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-secondary">Platform Fee (%)</label>
                    <input type="range" min="0" max="50" step="1" value={platformFee} onChange={(e) => setPlatformFee(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs font-mono">
                        <span>0%</span>
                        <span className="font-bold text-primary">{platformFee}%</span>
                        <span>50%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-secondary">Ad CPM ($)</label>
                    <input type="range" min="0.5" max="50" step="0.5" value={cpm} onChange={(e) => setCpm(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs font-mono">
                        <span>$0.50</span>
                        <span className="font-bold text-primary">${cpm.toFixed(2)}</span>
                        <span>$50.00</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-secondary">Marketplace GMV ($)</label>
                    <input type="range" min="0" max="10000000" step="10000" value={marketplaceVolume} onChange={(e) => setMarketplaceVolume(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs font-mono">
                        <span>$0</span>
                        <span className="font-bold text-primary">${marketplaceVolume.toLocaleString()}</span>
                        <span>$10M</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-4">
            <h3 className="font-bold text-lg">How Cascade Makes Money</h3>
            
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                <h4 className="font-bold text-primary mb-1">1. Creator Subscriptions</h4>
                <p className="text-sm text-on-surface-secondary">
                    Cascade takes a <strong>{platformFee}% platform fee</strong> on all creator subscriptions. 
                    With {activeUsers.toLocaleString()} users and a {subscriptionRate}% conversion rate at ${avgSubscriptionPrice}/mo, 
                    this generates <strong>{formatCurrency(revenue.subscriptions)}/mo</strong>.
                </p>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                <h4 className="font-bold text-primary mb-1">2. Advertising Network</h4>
                <p className="text-sm text-on-surface-secondary">
                    Brands pay for reach. With {adLoad} ads per user/month and a CPM of ${cpm}, 
                    advertising generates <strong>{formatCurrency(revenue.ads)}/mo</strong>.
                </p>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                <h4 className="font-bold text-primary mb-1">3. Marketplace Commissions</h4>
                <p className="text-sm text-on-surface-secondary">
                    We charge a <strong>{marketplaceFee}% transaction fee</strong> on all digital and physical product sales.
                    Based on ${marketplaceVolume.toLocaleString()} GMV, this yields <strong>{formatCurrency(revenue.marketplace)}/mo</strong>.
                </p>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                <h4 className="font-bold text-primary mb-1">4. Virtual Goods (Coins & Gifts)</h4>
                <p className="text-sm text-on-surface-secondary">
                    Users purchase Coins to send Gifts. Cascade retains a margin (approx 30%) on coin purchases after creator payouts.
                    Projected net revenue: <strong>{formatCurrency(revenue.gifts)}/mo</strong>.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlatformEconomicsPage;
