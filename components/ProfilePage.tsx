import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Post as PostType, Product, Community, AdCampaign } from '../types';
import { Post } from './Post';
import { VerifiedIcon, CameraIcon, LocationIcon, WebsiteIcon, MoreIcon, BackIcon, LinkIcon, ShopIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import CommentComponent from './Comment';
import ShopPage from './ShopPage';

interface ProfilePageProps {
  user: User;
  allPosts: PostType[];
  allProducts: Product[];
  activeAdCampaigns: AdCampaign[];
  currentUser: User;
  subscribedToUserIds: string[];
  handleUpdateProfile: (updates: Partial<User>, avatarFile?: File, bannerFile?: File) => void;
  openCreateProductModal: () => void;
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  handleSearch: (query: string) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handlePlayVideo: (postId: string) => void;
  handleTogglePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  allUsers: User[];
  handleOpenEditModal: (post: PostType) => void;
  handleOpenBoostModal: (post: PostType) => void;
  handleViewProfile: (userId: string) => void;
  handleToggleAccountStatus: (userId: string) => void;
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
  onBack: () => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex-grow flex-shrink-0 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200"
      role="tab"
      aria-selected={isActive}
    >
      <div className="relative py-4 px-4 text-center text-sm font-bold">
        <span className={`whitespace-nowrap ${isActive ? 'text-on-surface dark:text-dark-on-surface' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary'}`}>
          {label}
        </span>
        {isActive && <div className="absolute bottom-0 inset-x-4 h-1 bg-primary rounded-full"></div>}
      </div>
    </button>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, allPosts, allProducts, activeAdCampaigns, currentUser, subscribedToUserIds, handleUpdateProfile, openCreateProductModal, handleToggleLike, handleToggleEcho, handleToggleBookmark, handleSubscribe, openGiftModal, handleAddToCart, viewCommunity, handleSearch, blockedUserIds, handleToggleBlock, handleViewPost, handleOpenQuoteModal, handleOpenBoostModal, handlePlayVideo, handleTogglePlayVideo, allUsers, handleOpenEditModal, handleViewProfile, handleShareToCommunity, playingVideoId, onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [nameText, setNameText] = useState(user.name || '');
  const [bioText, setBioText] = useState(user.bio || '');
  const [locationText, setLocationText] = useState(user.location || '');
  const [countryText, setCountryText] = useState(user.country || '');
  const [websiteText, setWebsiteText] = useState(user.website || '');
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>(user.socialLinks || []);
  const [portfolioItems, setPortfolioItems] = useState<{id: string, title: string, description: string, imageUrl?: string, linkUrl?: string}[]>(user.portfolio || []);
  const [selectedColorTheme, setSelectedColorTheme] = useState(user.colorTheme || 'blue');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef<number>(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isOwnProfile = user.id === currentUser.id;
  const isBlocked = !isOwnProfile && blockedUserIds.includes(user.id);

  const [prevUserId, setPrevUserId] = useState(user.id);
  if (prevUserId !== user.id) {
    setPrevUserId(user.id);
    setNameText(user.name || '');
    setBioText(user.bio || '');
    setLocationText(user.location || '');
    setCountryText(user.country || '');
    setWebsiteText(user.website || '');
    setSocialLinks(user.socialLinks || []);
    setPortfolioItems(user.portfolio || []);
    setSelectedColorTheme(user.colorTheme || 'blue');
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreview(null);
    setBannerPreview(null);
    setIsEditing(false);
    setActiveTab('Posts');
  }

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const userPosts = useMemo(() => {
    return (allPosts || []).filter(p => 
      p.user.id === user.id &&
      (p.status !== 'pending_approval' || isOwnProfile)
    );
  }, [allPosts, user.id, isOwnProfile]);

  const userProducts = useMemo(() => {
    return (allProducts || []).filter(p => p.seller.id === user.id);
  }, [allProducts, user.id]);

  const allPostHandlers = { currentUser, subscribedToUserIds, handleToggleLike, handleToggleEcho, handleToggleBookmark, handleSubscribe, openGiftModal, handleAddToCart, viewCommunity, handleSearch, blockedUserIds, handleToggleBlock, handleViewPost, handleOpenQuoteModal, handleOpenBoostModal, handlePlayVideo, handleTogglePlayVideo, playingVideoId, allUsers, handleOpenEditModal, handleViewProfile, handleShareToCommunity, activeAdCampaigns, onNavigate };

  const handleSave = async () => {
    const updates: Partial<User> = {
        name: nameText,
        bio: bioText,
        location: locationText,
        country: countryText,
        website: websiteText,
        socialLinks: socialLinks,
        portfolio: portfolioItems,
        colorTheme: selectedColorTheme
    };
    handleUpdateProfile(updates, avatarFile || undefined, bannerFile || undefined);
    setIsEditing(false);
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const formatCount = (count: number | undefined): string => {
    if (count === undefined) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return count.toString();
  };

  const suggestedUsers = useMemo(() => {
    return (allUsers || []).filter(u => 
      u.id !== currentUser.id && 
      !subscribedToUserIds.includes(u.id) && 
      !blockedUserIds.includes(u.id)
    ).slice(0, 5);
  }, [allUsers, currentUser.id, subscribedToUserIds, blockedUserIds]);

  const renderContent = () => {
    switch(activeTab) {
      case 'Posts':
        return userPosts.length > 0
          ? userPosts.map(post => <Post key={post.id} post={post} {...allPostHandlers} />)
          : <div className="text-center p-8 text-on-surface-secondary">This user hasn't posted anything yet.</div>;
      case 'Replies': {
         const replies = (allPosts || []).flatMap(p => p.commentData || []).filter(c => c.user.id === user.id);
         return replies.length > 0 
            ? replies.map(reply => <CommentComponent key={reply.id} comment={reply} />)
            : <div className="text-center p-8 text-on-surface-secondary">This user hasn't replied to any posts yet.</div>;
      }
      case 'Media': {
         const mediaPosts = userPosts.filter(p => p.fileType === 'image' || p.fileType === 'video');
         return mediaPosts.length > 0 
            ? mediaPosts.map(post => <Post key={post.id} post={post} {...allPostHandlers} />)
            : <div className="text-center p-8 text-on-surface-secondary">This user hasn't posted any media yet.</div>;
      }
      case 'Likes': {
          const likedPosts = (allPosts || []).filter(p => p.isLiked && user.id === currentUser.id);
          return likedPosts.length > 0 
            ? likedPosts.map(post => <Post key={post.id} post={post} {...allPostHandlers} />)
            : <div className="text-center p-8 text-on-surface-secondary">Posts you like will appear here.</div>;
      }
      case 'Portfolio':
          return (
              <div className="p-4">
                  {isEditing ? (
                      <div>
                          <h3 className="font-bold text-lg mb-4">Edit Portfolio</h3>
                          {portfolioItems.map((item, index) => (
                              <div key={item.id} className="mb-6 p-4 border border-border dark:border-dark-border rounded-xl bg-surface dark:bg-dark-surface">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold">Item {index + 1}</h4>
                                      <button onClick={() => setPortfolioItems(portfolioItems.filter((_, i) => i !== index))} className="text-red-500 text-sm font-bold">Remove</button>
                                  </div>
                                  <input value={item.title} onChange={(e) => {
                                      const newItems = [...portfolioItems];
                                      newItems[index].title = e.target.value;
                                      setPortfolioItems(newItems);
                                  }} className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg p-2 mb-2" placeholder="Project Title" />
                                  <textarea value={item.description} onChange={(e) => {
                                      const newItems = [...portfolioItems];
                                      newItems[index].description = e.target.value;
                                      setPortfolioItems(newItems);
                                  }} className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg p-2 mb-2" placeholder="Project Description" rows={3} />
                                  <input value={item.imageUrl || ''} onChange={(e) => {
                                      const newItems = [...portfolioItems];
                                      newItems[index].imageUrl = e.target.value;
                                      setPortfolioItems(newItems);
                                  }} className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg p-2 mb-2" placeholder="Image URL (optional)" />
                                  <input value={item.linkUrl || ''} onChange={(e) => {
                                      const newItems = [...portfolioItems];
                                      newItems[index].linkUrl = e.target.value;
                                      setPortfolioItems(newItems);
                                  }} className="w-full bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg p-2" placeholder="Link URL (optional)" />
                              </div>
                          ))}
                          <button onClick={() => setPortfolioItems([...portfolioItems, { id: `portfolio-${Date.now()}`, title: '', description: '' }])} className="w-full py-3 border-2 border-dashed border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-colors">
                              + Add Portfolio Item
                          </button>
                      </div>
                  ) : (
                      portfolioItems.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {portfolioItems.map(item => (
                                  <div key={item.id} className="border border-border dark:border-dark-border rounded-xl overflow-hidden bg-surface dark:bg-dark-surface flex flex-col">
                                      {item.imageUrl && (
                                          <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                                      )}
                                      <div className="p-4 flex-1 flex flex-col">
                                          <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-4 flex-1">{item.description}</p>
                                          {item.linkUrl && (
                                              <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline mt-auto">
                                                  <LinkIcon className="w-4 h-4" /> View Project
                                              </a>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center p-8 text-on-surface-secondary">This user hasn't added any portfolio items yet.</div>
                      )
                  )}
              </div>
          );
      case 'Store':
        return <ShopPage products={userProducts} isEmbedded handleAddToCart={handleAddToCart} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border transition-transform duration-300 flex items-center gap-4 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{t('profile_posts_count', { count: userPosts.length })}</p>
        </div>
      </div>
      <div>
        <div className="h-48 bg-gray-300 dark:bg-dark-surface relative">
          {(bannerPreview || user.bannerUrl) && <img src={bannerPreview || user.bannerUrl} alt={`${user.name}'s banner`} className="w-full h-full object-cover" />}
          {isEditing && (
            <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <CameraIcon className="w-8 h-8"/>
                <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" hidden />
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
             <div className="relative -mt-20">
                <div className="p-[3.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full inline-block shadow-md">
                  <div className="p-[3px] bg-background dark:bg-dark-background rounded-full">
                    <img src={avatarPreview || user.avatarUrl} alt={`${user.name}'s avatar`} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover" />
                  </div>
                </div>
                {isEditing && (
                     <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                        <CameraIcon className="w-8 h-8"/>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" hidden />
                    </button>
                )}
             </div>
            {isOwnProfile ? (
              isEditing ? (
                 <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface font-bold px-4 py-2 rounded-full border border-border dark:border-dark-border">{t('button_cancel')}</button>
                    <button onClick={handleSave} className="bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background font-bold px-4 py-2 rounded-full">{t('button_save')}</button>
                 </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background font-bold px-4 py-2 rounded-full">{t('button_edit_profile')}</button>
              )
            ) : (
                <div className="flex items-center gap-2">
                    <div className="relative" ref={moreMenuRef}>
                        <button onClick={() => setMoreMenuOpen(prev => !prev)} className="p-2 border border-border dark:border-dark-border rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover">
                            <MoreIcon className="w-6 h-6"/>
                        </button>
                        {isMoreMenuOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-background dark:bg-dark-background rounded-lg shadow-lg border border-border dark:border-dark-border z-10">
                                <button onClick={() => { handleToggleBlock(user.id); setMoreMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-surface dark:hover:bg-dark-surface text-sm font-semibold text-red-500">
                                    {isBlocked ? `Unblock ${user.handle}` : `Block ${user.handle}`}
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background font-bold px-4 py-2 rounded-full">{t('button_subscribe_for', { price: user.subscriptionPrice || 0 })}</button>
                </div>
            )}
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <input value={nameText} onChange={(e) => setNameText(e.target.value)} className="text-xl font-extrabold bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-1 w-full max-w-xs" placeholder="Name" />
                ) : (
                    <h2 className="text-xl font-extrabold">{user.name}</h2>
                )}
                {user.verificationStatus === 'verified' && <VerifiedIcon className="w-5 h-5 text-primary" />}
                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{user.handle}</p>
            </div>
            {isBlocked ? (
                 <div className="mt-4 p-4 border border-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface">
                    <h2 className="font-bold">You've blocked @{user.handle}</h2>
                    <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">You can't see their posts or profile.</p>
                </div>
            ) : (
                <>
                    <div className="mt-4">
                        {isEditing ? (
                            <div className="relative">
                                <textarea value={bioText} onChange={(e) => setBioText(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-2" placeholder="Your bio" />
                            </div>
                        ) : (
                            user.bio && <p className="mt-2">{user.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">
                            {isEditing ? (
                                <input value={locationText} onChange={(e) => setLocationText(e.target.value)} className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-1" placeholder="Location" />
                            ) : (
                                user.location && <span className="flex items-center gap-1"><LocationIcon className="w-4 h-4"/>{user.location}</span>
                            )}
                            {isEditing ? (
                                <input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-1" placeholder="Website" />
                            ) : (
                                user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><WebsiteIcon className="w-4 h-4"/>{user.website.replace(/https?:\/\//, '')}</a>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="mt-4">
                                <h3 className="text-sm font-bold mb-2">Social Links</h3>
                                {socialLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input value={link.platform} onChange={(e) => {
                                            const newLinks = [...socialLinks];
                                            newLinks[index].platform = e.target.value;
                                            setSocialLinks(newLinks);
                                        }} className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-1 w-1/3" placeholder="Platform (e.g. Twitter)" />
                                        <input value={link.url} onChange={(e) => {
                                            const newLinks = [...socialLinks];
                                            newLinks[index].url = e.target.value;
                                            setSocialLinks(newLinks);
                                        }} className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-1 flex-1" placeholder="URL" />
                                        <button onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))} className="text-red-500 font-bold px-2">&times;</button>
                                    </div>
                                ))}
                                <button onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '' }])} className="text-primary text-sm font-bold">+ Add Link</button>
                            </div>
                        ) : (
                            socialLinks.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {socialLinks.map((link, index) => (
                                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
                                            <LinkIcon className="w-4 h-4" />
                                            {link.platform}
                                        </a>
                                    ))}
                                </div>
                            )
                        )}
                        {isEditing && (
                            <div className="mt-4">
                                <h3 className="text-sm font-bold mb-2">Color Theme</h3>
                                <div className="flex gap-2">
                                    {['blue', 'purple', 'green', 'red', 'orange', 'pink'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColorTheme(color)}
                                            className={`w-8 h-8 rounded-full border-2 ${selectedColorTheme === color ? 'border-on-surface dark:border-dark-on-surface' : 'border-transparent'}`}
                                            style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f97316' : '#ec4899' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <button onClick={() => onNavigate(`following/${user.id}`)} className="hover:underline"><span className="font-bold">{formatCount(user.following)}</span> <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{t('profile_following')}</span></button>
                        <button onClick={() => onNavigate(`followers/${user.id}`)} className="hover:underline"><span className="font-bold">{formatCount(user.followers)}</span> <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{t('profile_followers')}</span></button>
                    </div>
                    {isOwnProfile && userProducts.length === 0 && (
                        <div className="mt-6 mb-2">
                            <h3 className="font-bold text-lg mb-3 px-1">Create your own store</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                <div className="flex-shrink-0 w-40 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <ShopIcon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="text-center w-full mt-1">
                                        <p className="font-bold text-base truncate w-full">Set up store</p>
                                        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary truncate w-full">Sell products</p>
                                    </div>
                                    <button 
                                        onClick={openCreateProductModal}
                                        className="w-full bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-bold py-2 rounded-full mt-2 hover:opacity-90 transition-opacity"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Follow Suggestions */}
                    {suggestedUsers.length > 0 && (
                        <div className="mt-6 mb-2">
                            <h3 className="font-bold text-lg mb-3 px-1">Suggested for you</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {suggestedUsers.map(suggestedUser => (
                                    <div key={suggestedUser.id} className="flex-shrink-0 w-40 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                        <img 
                                            src={suggestedUser.avatarUrl} 
                                            alt={suggestedUser.name} 
                                            className="w-20 h-20 rounded-full object-cover cursor-pointer"
                                            onClick={() => handleViewProfile(suggestedUser.id)}
                                        />
                                        <div className="text-center w-full mt-1">
                                            <p className="font-bold text-base truncate w-full cursor-pointer hover:underline flex items-center justify-center gap-1" onClick={() => handleViewProfile(suggestedUser.id)}>
                                                {suggestedUser.name}
                                                {suggestedUser.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary" />}
                                            </p>
                                            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary truncate w-full">@{suggestedUser.handle.replace('@', '')}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleSubscribe(suggestedUser.id)}
                                            className="w-full bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-bold py-2 rounded-full mt-2 hover:opacity-90 transition-opacity"
                                        >
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
      {!isBlocked && (
        <>
            <div className="border-b border-border dark:border-dark-border flex overflow-x-auto no-scrollbar">
                <TabButton label="Posts" isActive={activeTab === 'Posts'} onClick={() => setActiveTab('Posts')} />
                <TabButton label="Replies" isActive={activeTab === 'Replies'} onClick={() => setActiveTab('Replies')} />
                <TabButton label="Media" isActive={activeTab === 'Media'} onClick={() => setActiveTab('Media')} />
                <TabButton label="Portfolio" isActive={activeTab === 'Portfolio'} onClick={() => setActiveTab('Portfolio')} />
                {isOwnProfile && <TabButton label="Likes" isActive={activeTab === 'Likes'} onClick={() => setActiveTab('Likes')} />}
                {userProducts.length > 0 && <TabButton label="Store" isActive={activeTab === 'Store'} onClick={() => setActiveTab('Store')} />}
            </div>
            <div>
                {renderContent()}
            </div>
        </>
      )}
    </div>
  );
};