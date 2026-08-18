import type { Post, Story, Message, Product, AdCampaign, LiveStream, User, MonetizationSettings, MessagingSettings, Community, Gift, WatchableAd, SponsorshipTier, BrandPartnership } from './types';

export const defaultMonetization: MonetizationSettings = { subscriptionsEnabled: true, giftsEnabled: true, adsEnabled: true, tipsEnabled: true };
export const defaultMessaging: MessagingSettings = { allowDmsFrom: 'everyone', allowAudioCalls: true, allowVideoCalls: true };

export const MOCK_SPONSORSHIP_TIERS: SponsorshipTier[] = [];
export const MOCK_BRAND_PARTNERSHIPS: BrandPartnership[] = [];

export const ALL_USERS: User[] = [];
export const USERS: Record<string, User> = {};

export const INITIAL_POSTS: Post[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_COMMUNITIES: Community[] = [];
export const MOCK_AD_CAMPAIGNS: AdCampaign[] = [];
export const MOCK_LIVE_STREAMS: LiveStream[] = [];

export const MOCK_GIFTS: Gift[] = [
  { id: 'gift-1', name: 'Rose', icon: '🌹', priceInCoins: 10 },
  { id: 'gift-2', name: 'Coffee', icon: '☕', priceInCoins: 50 },
  { id: 'gift-3', name: 'Heart', icon: '❤️', priceInCoins: 100 },
  { id: 'gift-4', name: 'Rocket', icon: '🚀', priceInCoins: 500 },
];

export const MOCK_WATCHABLE_ADS: WatchableAd[] = [];
