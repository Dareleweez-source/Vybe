
import React, { useState } from 'react';
import type { User } from '../types';
import { 
  BackIcon, 
  CoinIcon, 
  VerifiedIcon,
  ImpressionsIcon,
  PeopleIcon,
  TagIcon,
  SettingsIcon
} from '../constants';
import { MOCK_SPONSORSHIP_TIERS, MOCK_BRAND_PARTNERSHIPS } from '../mockData';

interface SponsorshipPageProps {
  currentUser: User;
  onBack: () => void;
}

const StatItem = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
    <div className="flex items-center gap-2 text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xl font-black">{value}</div>
  </div>
);

const SponsorshipPage: React.FC<SponsorshipPageProps> = ({ currentUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'kit' | 'tiers' | 'brands'>('kit');

  const kit = currentUser.mediaKit || {
    totalReach: 0,
    engagementRate: 0,
    topCountries: [],
    audienceGender: { male: 0, female: 0, other: 0 }
  };

  return (
    <div className="w-full min-h-screen bg-background dark:bg-dark-background">
      <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Sponsorship Hub</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={currentUser.avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/30" alt="" />
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-black">{currentUser.name}</h2>
                {currentUser.verificationStatus === 'verified' && <VerifiedIcon className="w-5 h-5" />}
              </div>
              <p className="opacity-80 font-medium">{currentUser.handle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-bold opacity-70">Followers</p>
                <p className="text-lg font-black">{currentUser.followers?.toLocaleString()}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-bold opacity-70">Engagement</p>
                <p className="text-lg font-black">{kit.engagementRate}%</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl col-span-2">
                <p className="text-[10px] uppercase font-bold opacity-70">Primary Audience</p>
                <p className="text-lg font-black">{kit.topCountries[0]?.name || 'Global'}</p>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border dark:border-dark-border">
          <button 
            onClick={() => setActiveTab('kit')} 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'kit' ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary'}`}
          >
            Media Kit
          </button>
          <button 
            onClick={() => setActiveTab('tiers')} 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'tiers' ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary'}`}
          >
            Sponsor Tiers
          </button>
          <button 
            onClick={() => setActiveTab('brands')} 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'brands' ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary'}`}
          >
            Partnerships
          </button>
        </div>

        {/* Media Kit View */}
        {activeTab === 'kit' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <StatItem label="Total Reach" value={kit.totalReach.toLocaleString()} icon={ImpressionsIcon} />
              <StatItem label="Audience Base" value={currentUser.followers?.toLocaleString() || 0} icon={PeopleIcon} />
            </div>

            <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl border border-border dark:border-dark-border">
              <h3 className="text-lg font-black mb-4">Media Kit Insights</h3>
              <p className="text-sm text-on-surface-secondary">Your media kit showcases your reach and engagement to potential brand partners. Keep your profile updated to attract the best sponsorships.</p>
            </div>
          </div>
        )}

        {/* Tiers View */}
        {activeTab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {MOCK_SPONSORSHIP_TIERS.map(tier => (
              <div key={tier.id} className="bg-surface dark:bg-dark-surface rounded-3xl border border-border dark:border-dark-border overflow-hidden group hover:border-primary transition-all">
                <div className={`${tier.color} p-4 text-white`}>
                  <h3 className="font-black text-lg">{tier.name}</h3>
                  <p className="text-2xl font-black mt-2">${tier.price}<span className="text-xs font-normal opacity-80">/mo</span></p>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-sm text-on-surface-secondary leading-tight">{tier.description}</p>
                  <ul className="space-y-2">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="text-xs font-bold flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl border-2 border-primary text-primary font-black group-hover:bg-primary group-hover:text-white transition-all text-sm">
                    Edit Tier
                  </button>
                </div>
              </div>
            ))}
            <button className="h-full min-h-[200px] border-2 border-dashed border-border dark:border-dark-border rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group">
              <div className="p-3 bg-surface dark:bg-dark-surface rounded-full group-hover:scale-110 transition-transform">
                <TagIcon className="w-6 h-6 text-on-surface-secondary" />
              </div>
              <span className="font-bold text-sm text-on-surface-secondary">Create New Tier</span>
            </button>
          </div>
        )}

        {/* Partnerships View */}
        {activeTab === 'brands' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">Active Partners</h3>
              <button className="text-primary text-sm font-bold hover:underline">History</button>
            </div>
            {MOCK_BRAND_PARTNERSHIPS.map(bp => (
              <div key={bp.id} className="bg-surface dark:bg-dark-surface p-4 rounded-2xl border border-border dark:border-dark-border flex items-center gap-4">
                <img src={bp.brandLogo} className="w-14 h-14 rounded-2xl object-cover bg-white" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black truncate">{bp.brandName}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      bp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {bp.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-secondary font-bold truncate">{bp.campaignName}</p>
                  <div className="mt-2 flex items-center gap-2 text-primary">
                    <CoinIcon className="w-4 h-4" />
                    <span className="text-sm font-black">${bp.value.toLocaleString()}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-background rounded-full transition-colors">
                  <SettingsIcon className="w-5 h-5 text-on-surface-secondary" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipPage;
