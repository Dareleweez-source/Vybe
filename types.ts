
export interface MonetizationSettings {
  subscriptionsEnabled: boolean;
  giftsEnabled: boolean;
  adsEnabled: boolean;
  tipsEnabled: boolean;
}

export interface MessagingSettings {
  allowDmsFrom: 'everyone' | 'following' | 'none';
  allowAudioCalls: boolean;
  allowVideoCalls: boolean;
}

export interface SponsorshipTier {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  color: string;
}

export interface BrandPartnership {
  id: string;
  brandName: string;
  brandLogo: string;
  campaignName: string;
  status: 'active' | 'pending' | 'completed';
  value: number;
  startDate: string;
}

export interface MediaKit {
  totalReach: number;
  engagementRate: number;
  topCountries: { name: string; percentage: number }[];
  audienceGender: { male: number; female: number; other: number };
}

export interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  memberCount: number;
  ownerId: string;
  isPrivate: boolean;
  rules?: string[];
  moderatorIds?: string[];
  bannedUsers?: BannedUser[];
  reports?: Report[];
  moderationSettings?: ModerationSettings;
  auditLogs?: AuditLog[];
}

export interface BannedUser {
  userId: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}

export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'nudity' | 'misinformation' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string; // ID of the post, comment, or user
  reportedType: 'post' | 'comment' | 'user';
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModerationSettings {
  autoFilterWords: string[];
  requireApproval: boolean;
  allowReports: boolean;
  autoBanReportCount?: number;
}

export interface AuditLog {
  id: string;
  action: 'ban' | 'unban' | 'approve_post' | 'reject_post' | 'resolve_report' | 'update_settings' | 'promote_moderator' | 'demote_moderator' | 'kick_user';
  moderatorId: string;
  targetId?: string;
  reason?: string;
  timestamp: string;
}

export interface User {
  id:string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl?: string;
  email?: string;
  password?: string;
  bio?: string;
  location?: string;
  country?: string;
  website?: string;
  socialLinks?: { platform: string; url: string }[];
  portfolio?: { id: string; title: string; description: string; imageUrl?: string; linkUrl?: string }[];
  colorTheme?: string;
  followers?: number;
  following?: number;
  subscriptionPrice?: number;
  monetizationSettings?: MonetizationSettings;
  messagingSettings?: MessagingSettings;
  verificationStatus?: 'none' | 'verified' | 'pending_review' | 'pending_payment' | 'rejected';
  rejectionReason?: string;
  joinedCommunityIds?: string[];
  followingIds?: string[];
  adBalance?: number;
  coinBalance?: number;
  currency?: string;
  locale?: string;
  accountStatus?: 'active' | 'disabled';
  monetizationEligibility?: 'eligible' | 'ineligible' | 'under_review';
  ineligibilityReason?: string;
  mediaKit?: MediaKit;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  seller: User;
  category: string;
  rating: number;
  allowAffiliate?: boolean;
  affiliateCommission?: number; // Percentage (0-100)
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  amount: number;
  deliveryAddress: string;
  timestamp: string;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  priceInCoins: number;
}

export interface UserGift {
  giftId: string;
  userId: string; // User who sent the gift
}

export interface PostAnalytics {
  impressions: number;
  engagements: number;
  profileVisits: number;
  newFollowers: number;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface PollChoice {
  text: string;
  votes: number;
}

export interface Poll {
  choices: PollChoice[];
  endsAt: string; // ISO string
}

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id:string;
  user: User;
  content: string;
  imageUrl?: string; // Kept for backward compatibility
  videoUrl?: string; // Kept for backward compatibility
  media?: PostMedia[]; // Support for multiple items
  thumbnailUrl?: string;
  fileType?: 'image' | 'video';
  duration?: number; // duration in seconds
  likes: number;
  comments: number;
  commentData: Comment[];
  echos: number;
  timestamp: string;
  editedAt?: string;
  views?: number;
  isLiked: boolean;
  isEchoed: boolean;
  isBookmarked: boolean;
  likedBy?: string[];
  echoedBy?: string[];
  bookmarkedBy?: string[];
  isSubscriberOnly?: boolean;
  taggedProduct?: Product;
  giftsReceived?: UserGift[];
  communityId?: string;
  communityName?: string;
  analytics?: PostAnalytics;
  scheduledAt?: string;
  status?: 'published' | 'scheduled' | 'pending_approval';
  quotedPost?: Post;
  poll?: Poll;
  location?: string;
  linkUrl?: string;
  watchAndEarn?: {
    duration: number;
    reward: number;
  };
}

export interface StoryReply {
  user: User;
  text: string;
  timestamp: string;
}

export interface StoryReaction {
  userId: string;
  emoji: string;
}

export interface Story {
  id: string;
  user: User;
  imageUrl?: string;
  videoUrl?: string;
  text?: string;
  backgroundStyle?: string;
  fontStyle?: string;
  textColor?: string;
  fileType: 'image' | 'video' | 'text';
  timestamp: string;
  isAd?: boolean;
  ctaText?: string;
  ctaLink?: string;
  isSubscriberOnly?: boolean;
  giftsReceived?: UserGift[];
  replies?: StoryReply[];
  reactions?: StoryReaction[];
}

export type NewStoryData =
  | { type: 'media'; file: File; fileType: 'image' | 'video' }
  | { type: 'text'; text: string; backgroundStyle: string; fontStyle: string; textColor: string };

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  audioUrl?: string;
  type: 'text' | 'audio';
  timestamp: string;
  read: boolean;
  reactions?: Reaction[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'like' | 'follow' | 'info';
}

export type AdCampaignCta = 
  | 'Learn More' | 'Shop Now' | 'Sign Up' | 'Visit Website' 
  | 'View Profile' | 'Follow' | 'View Post' | 'View Shop' | 'Install';

export type PromotionType = 'account' | 'store' | 'product' | 'website' | 'app' | 'post';

export interface AdCampaign {
  id: string;
  name: string;
  ownerId: string;
  promotionType: PromotionType;
  // Optional creative for website/app ads
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  // Link to existing content
  promotedPostId?: string;
  promotedProductId?: string;
  // CTA and destination
  ctaText: AdCampaignCta;
  destinationUrl: string;
  // Budget and performance
  budget: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  impressions: number;
  clicks: number;
  spent: number;
  // FIX: Added engagementReward property to AdCampaign to resolve error in App.tsx
  engagementReward?: number;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface LiveStreamComment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  reactions?: CommentReaction[];
}

export interface LiveStream {
  id: string;
  broadcaster: User;
  title: string;
  status: 'live' | 'ended';
  viewers: number;
  startTime: string;
  endTime?: string;
  thumbnailUrl?: string;
  comments: LiveStreamComment[];
}

export type TransactionType = 'deposit' | 'tip' | 'gift' | 'reward' | 'purchase' | 'sale';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // can be positive or negative
  timestamp: string; // ISO string
}

// FIX: Add WatchableAd interface for Watch & Earn feature
export interface WatchableAd {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  reward: number; // Coins earned for watching
}
