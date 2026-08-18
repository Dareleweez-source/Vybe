
import React, { useState, useMemo, useEffect } from 'react';
import type { Post as PostType, User, Product, Community, AdCampaign } from '../types';
import { MoreIcon, SearchIcon, VerifiedIcon, BackIcon, CommunitiesIconFilled } from '../constants';
import { Post } from './Post';
import { useLanguage } from '../contexts/LanguageContext';


import AppHeader from './AppHeader';

interface ExplorePageProps {
  posts: PostType[];
  activeAdCampaigns: AdCampaign[];
  handleSearch: (query: string) => void;
  onBack: () => void;
  // Pass down all the handlers for the Post component
  currentUser: User;
  subscribedToUserIds: string[];
  handleToggleLike: (postId: string) => void;
  handleToggleEcho: (postId: string, isQuotePost?: boolean) => void;
  handleToggleBookmark: (postId: string) => void;
  handleSubscribe: (userId: string) => void;
  openGiftModal: (post: PostType) => void;
  handleAddToCart: (product: Product) => void;
  viewCommunity: (community: Community) => void;
  blockedUserIds: string[];
  handleToggleBlock: (userId: string) => void;
  handleViewPost: (post: PostType) => void;
  handleOpenQuoteModal: (post: PostType) => void;
  handleOpenBoostModal: (post: PostType) => void;
  handlePlayVideo: (postId: string) => void;
  playingVideoId: string | null;
  handleViewProfile: (userId: string) => void;
  handleOpenEditModal: (post: PostType) => void;
  allUsers: User[];
  allCommunities: Community[];
  handleShareToCommunity: (post: PostType) => void;
  onNavigate: (path: string) => void;
  handleJoinCommunity?: (communityId: string) => void;
}

const TabButton: React.FC<{ label: string, id: string, activeTab: string, setActiveTab: (id: string) => void }> = ({ label, id, activeTab, setActiveTab }) => (
    <button 
      onClick={() => setActiveTab(id as any)}
      className={`px-4 py-2 font-bold border-b-2 transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-secondary hover:bg-surface-hover dark:hover:bg-dark-surface-hover'}`}
    >
        {label}
    </button>
);

const ExplorePage: React.FC<ExplorePageProps> = (props) => {
  const { posts, handleSearch, activeAdCampaigns, currentUser, onBack, allUsers, allCommunities, handleJoinCommunity, onNavigate } = props;
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // The actual query driving results
  const [activeTab, setActiveTab] = useState<'top' | 'posts' | 'people' | 'communities'>('top');
  const { t } = useLanguage();

  const TRENDS = [
    { category: t('trends_category_tech'), topic: '#React19', posts: '15.2K posts' },
    { category: t('trends_category_webdev'), topic: '#Vite', posts: '8,456 posts' },
    { category: t('trends_category_ai'), topic: 'Gemini API', posts: '22.1K posts' },
    { category: t('trends_category_design'), topic: 'UI/UX Best Practices', posts: '5,001 posts' },
  ];

  // Parse URL query param on mount
  useEffect(() => {
    let isMounted = true;
    const hash = window.location.hash;
    if (hash.includes('?q=')) {
        const q = decodeURIComponent(hash.split('?q=')[1]);
        if (isMounted) {
            setTimeout(() => {
                setQuery(q);
                setSearchQuery(q);
            }, 0);
        }
    } else {
        if (isMounted) setTimeout(() => setSearchQuery(''), 0);
    }
    return () => { isMounted = false; };
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
      setSearchQuery(query.trim());
    }
  };
  
  // Filter Logic
  const searchResults = useMemo(() => {
      if (!searchQuery) return { posts: [], people: [], communities: [] };
      const lowerQuery = searchQuery.toLowerCase();

      return {
          posts: (posts || []).filter(p => 
            p.content.toLowerCase().includes(lowerQuery) && 
            p.status !== 'pending_approval' &&
            (p.status !== 'scheduled' || !p.scheduledAt || new Date(p.scheduledAt) <= new Date())
          ),
          people: (allUsers || []).filter(u => u.name.toLowerCase().includes(lowerQuery) || u.handle.toLowerCase().includes(lowerQuery)),
          communities: (allCommunities || []).filter(c => c.name.toLowerCase().includes(lowerQuery) || c.handle.toLowerCase().includes(lowerQuery)),
      };
  }, [searchQuery, posts, allUsers, allCommunities]);

  const trendingPosts = useMemo(() => {
    const now = new Date();
    return [...(posts || [])]
      .filter(p => 
        (p.status !== 'scheduled' || !p.scheduledAt || new Date(p.scheduledAt) <= now) &&
        p.status !== 'pending_approval'
      )
      .sort((a, b) => (b.likes + b.echos * 2) - (a.likes + a.echos * 2))
      .slice(0, 10); // Take top 10 viral posts
  }, [posts]);

  const discoverCommunities = useMemo(() => {
    // Show communities the user isn't in yet
    const joinedIds = currentUser.joinedCommunityIds || [];
    return allCommunities.filter(c => !joinedIds.includes(c.id)).slice(0, 8);
  }, [allCommunities, currentUser.joinedCommunityIds]);

  return (
    <div className="w-full min-h-screen pb-20">
      <AppHeader currentUser={currentUser} activeView="Explore" onNavigate={onNavigate} />
      <div className="sticky top-0 bg-background dark:bg-dark-background z-10 pt-4 px-4 pb-0 border-b border-border dark:border-dark-border flex flex-col gap-2 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                <BackIcon className="w-6 h-6" />
            </button>
            <form onSubmit={onSearchSubmit} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-on-surface-secondary dark:text-dark-on-surface-secondary" />
            </div>
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('trends_search_placeholder')}
                className="w-full bg-surface dark:bg-dark-surface rounded-full py-2 pl-10 pr-4 text-on-surface dark:text-dark-on-surface border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </form>
        </div>
        
        {searchQuery && (
            <div className="flex overflow-x-auto no-scrollbar">
                <TabButton label="Top" id="top" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton label="Posts" id="posts" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton label="People" id="people" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton label="Communities" id="communities" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        )}
      </div>

      {searchQuery ? (
          <div className="pb-20">
              {(activeTab === 'top' || activeTab === 'people') && searchResults.people.length > 0 && (
                  <div className="border-b border-border dark:border-dark-border">
                      <h3 className="font-bold px-4 py-2 text-on-surface-secondary">People</h3>
                      {searchResults.people.slice(0, activeTab === 'top' ? 3 : undefined).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover cursor-pointer" onClick={() => props.handleViewProfile(user.id)}>
                              <div className="flex items-center gap-3">
                                  <img src={user.avatarUrl} className="w-10 h-10 rounded-full" />
                                  <div>
                                      <div className="flex items-center gap-1">
                                          <span className="font-bold">{user.name}</span>
                                          {user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary" />}
                                      </div>
                                      <p className="text-sm text-on-surface-secondary">@{user.handle}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {activeTab === 'top' && searchResults.people.length > 3 && (
                          <button onClick={() => setActiveTab('people')} className="w-full p-3 text-primary font-bold text-sm hover:bg-surface-hover">See more people</button>
                      )}
                  </div>
              )}

              {(activeTab === 'top' || activeTab === 'communities') && searchResults.communities.length > 0 && (
                  <div className="border-b border-border dark:border-dark-border">
                      <h3 className="font-bold px-4 py-2 text-on-surface-secondary">Communities</h3>
                      {searchResults.communities.slice(0, activeTab === 'top' ? 3 : undefined).map(community => (
                          <div key={community.id} className="flex items-center gap-3 p-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover cursor-pointer" onClick={() => props.viewCommunity(community)}>
                              <img src={community.avatarUrl} className="w-10 h-10 rounded-lg" />
                              <div>
                                  <span className="font-bold">{community.name}</span>
                                  <p className="text-sm text-on-surface-secondary">c/{community.handle} • {community.memberCount} members</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {(activeTab === 'top' || activeTab === 'posts') && (
                  <div>
                      {activeTab === 'posts' && <h3 className="font-bold px-4 py-2 text-on-surface-secondary">Posts</h3>}
                      {searchResults.posts.map(post => {
                          const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);
                          return <Post key={post.id} post={post} isBoosted={isBoosted} {...props} />;
                      })}
                      {searchResults.posts.length === 0 && activeTab === 'posts' && (
                          <div className="p-8 text-center text-on-surface-secondary">No posts found matching "{searchQuery}"</div>
                      )}
                  </div>
              )}
              
              {activeTab === 'top' && searchResults.posts.length === 0 && searchResults.people.length === 0 && searchResults.communities.length === 0 && (
                   <div className="p-8 text-center text-on-surface-secondary">No results for "{searchQuery}"</div>
              )}
          </div>
      ) : (
        <>
            <div className="border-b border-border dark:border-dark-border">
                <h2 className="text-xl font-bold p-4">{t('trends_title')}</h2>
                <ul>
                {TRENDS.map((trend, index) => (
                    <li key={index}>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleSearch(trend.topic); setSearchQuery(trend.topic); setQuery(trend.topic); }} className="flex justify-between items-start p-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200">
                        <div>
                        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{trend.category}</p>
                        <p className="font-bold">{trend.topic}</p>
                        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{trend.posts}</p>
                        </div>
                        <MoreIcon className="w-5 h-5 text-on-surface-secondary dark:text-dark-on-surface-secondary" />
                    </a>
                    </li>
                ))}
                </ul>
                <a href="#" className="text-primary p-4 block font-semibold hover:bg-surface-hover dark:hover:bg-dark-surface-hover">{t('trends_show_more')}</a>
            </div>

            {/* Discover Communities Section */}
            {discoverCommunities.length > 0 && (
              <div className="py-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-b from-surface/50 to-background dark:from-dark-surface/30 dark:to-dark-background">
                <div className="px-4 mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CommunitiesIconFilled className="w-5 h-5 text-primary" />
                    Discover Communities
                  </h3>
                  <button onClick={() => props.onNavigate('communities')} className="text-primary text-sm font-bold hover:underline">View all</button>
                </div>
                <div className="flex overflow-x-auto px-4 gap-4 pb-2 scrollbar-hide snap-x snap-mandatory">
                  {discoverCommunities.map(community => (
                    <div 
                      key={community.id} 
                      className="snap-center flex-shrink-0 w-64 p-4 border border-gray-200 dark:border-dark-border rounded-3xl bg-background dark:bg-dark-surface flex flex-col items-center text-center hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div 
                        onClick={() => props.viewCommunity(community)}
                        className="cursor-pointer w-full flex flex-col items-center"
                      >
                        <div className="relative mb-3">
                          <img src={community.avatarUrl} alt={community.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-dark-background shadow-md group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="w-full mb-3 px-2">
                          <p className="font-bold text-base truncate">{community.name}</p>
                          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">c/{community.handle}</p>
                          <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary font-medium mt-1">
                            {community.memberCount.toLocaleString()} members
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (handleJoinCommunity) handleJoinCommunity(community.id); 
                        }}
                        className="bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background text-sm font-bold py-2.5 px-4 rounded-full w-full hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-200 shadow-sm"
                      >
                        Join Community
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-2">
                <h3 className="font-bold px-4 py-3 text-lg border-b border-border dark:border-dark-border">Trending Posts</h3>
                {trendingPosts.map(post => {
                  const isBoosted = (activeAdCampaigns || []).some(c => c.promotionType === 'post' && c.promotedPostId === post.id);
                  return <Post key={post.id} post={post} isBoosted={isBoosted} {...props} />
                })}
            </div>
        </>
      )}
    </div>
  );
};

export default ExplorePage;
