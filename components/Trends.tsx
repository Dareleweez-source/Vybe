
import React, { useState } from 'react';
import type { User } from '../types';
import { MoreIcon, SearchIcon } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import FollowSuggestions from './FollowSuggestions';

interface TrendsProps {
  handleSearch: (query: string) => void;
  suggestedUsers: User[];
  handleFollow: (userId: string) => void;
  handleViewProfile: (userId: string) => void;
}

const TRENDS_DATA = [
    { categoryKey: 'trends_category_tech', topic: '#React19', posts: '15.2K posts' },
    { categoryKey: 'trends_category_webdev', topic: '#Vite', posts: '8,456 posts' },
    { categoryKey: 'trends_category_ai', topic: 'Gemini API', posts: '22.1K posts' },
    { categoryKey: 'trends_category_design', topic: 'UI/UX Best Practices', posts: '5,001 posts' },
];

const parsePostCount = (postString: string): number => {
    const cleanedString = postString.replace(/ posts|,/g, '').toLowerCase();
    if (cleanedString.includes('k')) {
      return parseFloat(cleanedString.replace('k', '')) * 1000;
    }
    return parseInt(cleanedString, 10);
};

const sortedTrendsData = [...TRENDS_DATA].sort((a, b) => parsePostCount(b.posts) - parsePostCount(a.posts));


const Trends: React.FC<TrendsProps> = ({ handleSearch, suggestedUsers, handleFollow, handleViewProfile }) => {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <aside>
      <div className="sticky top-4 space-y-4">
         <form onSubmit={onSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-on-surface-secondary" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('trends_search_placeholder')}
            className="w-full bg-surface rounded-full py-2 pl-10 pr-4 text-on-surface border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <div className="bg-surface rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold p-4">{t('trends_title')}</h2>
          <ul>
            {sortedTrendsData.map((trend, index) => (
              <li key={index}>
                <a href="#" className="flex justify-between items-start p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="text-sm text-on-surface-secondary">{t(trend.categoryKey)}</p>
                    <p className="font-bold">{trend.topic}</p>
                    <p className="text-sm text-on-surface-secondary">{trend.posts}</p>
                  </div>
                   <MoreIcon className="w-5 h-5 text-on-surface-secondary" />
                </a>
              </li>
            ))}
          </ul>
           <a href="#" className="text-primary p-4 block font-semibold hover:bg-gray-100 rounded-b-2xl">{t('trends_show_more')}</a>
        </div>
        
        {suggestedUsers.length > 0 && (
          <div className="bg-surface rounded-2xl border border-gray-200 p-4">
            <FollowSuggestions 
              suggestedUsers={suggestedUsers}
              handleFollow={handleFollow}
              handleViewProfile={handleViewProfile}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Trends;
