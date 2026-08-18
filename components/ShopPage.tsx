import React, { useState, useMemo } from 'react';
import type { Product, User } from '../types';
import { CartIcon, FilterIcon, StarIcon, SearchIcon, BackIcon, LinkIcon } from '../constants';
import { MOCK_PRODUCTS } from '../mockData';
import { useNotifications } from './Notifications';

import AppHeader from './AppHeader';

interface ShopPageProps {
  handleAddToCart: (product: Product) => void;
  isEmbedded?: boolean;
  openCartModal?: () => void;
  showCart?: boolean;
  products?: Product[];
  onBack?: () => void;
  cartItemCount?: number;
  currentUser?: User | null;
  onNavigate?: (path: string) => void;
}

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Digital', 'Home', 'Accessories'];

const ShopPage: React.FC<ShopPageProps> = ({ handleAddToCart, isEmbedded = false, openCartModal, showCart, products, onBack, cartItemCount = 0, currentUser, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification } = useNotifications();
  
  const allProducts = products || MOCK_PRODUCTS;

  const handleAffiliate = (product: Product) => {
    const userId = currentUser?.id || 'guest';
    const affiliateLink = `https://cascade.social/shop/${product.id}?ref=${userId}`;
    navigator.clipboard.writeText(affiliateLink).then(() => {
        addNotification(`Affiliate link copied! Earn ${product.affiliateCommission}% commission.`, 'info');
    }).catch(() => {
        alert('Failed to copy link');
    });
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, activeCategory, searchQuery]);

  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
        <StarIcon className="w-3 h-3 fill-current" />
        <span>{rating.toFixed(1)}</span>
    </div>
  );

  const shopContent = (
    <>
        {/* Search and Filter Section */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-gray-200 dark:border-dark-border space-y-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-on-surface-secondary dark:text-dark-on-surface-secondary" />
                </div>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface dark:bg-dark-surface rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-transparent"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                            activeCategory === category 
                            ? 'bg-on-surface dark:bg-dark-on-surface text-background dark:text-dark-background' 
                            : 'bg-surface dark:bg-dark-surface text-on-surface-secondary dark:text-dark-on-surface-secondary border border-gray-200 dark:border-dark-border'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 pb-24">
        {filteredProducts.length > 0 ? filteredProducts.map(product => (
            <div key={product.id} className="bg-surface dark:bg-dark-surface rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border flex flex-col h-full hover:shadow-md transition-shadow duration-200">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    {product.rating > 4.5 && (
                        <div className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">TOP RATED</div>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary truncate max-w-[70%]">{product.seller.name}</p>
                        {renderRating(product.rating || 0)}
                    </div>
                    <h3 className="font-bold text-sm line-clamp-2 mb-1 flex-1 leading-tight">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between pt-2">
                        <p className="font-bold text-lg text-primary">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                            {product.allowAffiliate && (
                                <button
                                    onClick={() => handleAffiliate(product)}
                                    className="bg-surface dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-on-surface-secondary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors shadow-sm active:scale-95"
                                    title={`Affiliate: Earn ${product.affiliateCommission}%`}
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover transition-colors shadow-sm active:scale-95"
                                aria-label="Add to cart"
                            >
                                <CartIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )) : (
            <div className="col-span-2 text-center py-12 text-on-surface-secondary dark:text-dark-on-surface-secondary">
                <FilterIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold text-lg">No products found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
        )}
        </div>
    </>
  );

  if (isEmbedded) {
    return shopContent;
  }
  
  return (
    <div className="w-full min-h-screen bg-background dark:bg-dark-background">
      {currentUser && onNavigate && (
        <AppHeader currentUser={currentUser} activeView="Store" onNavigate={onNavigate} />
      )}
      <div className="sticky top-0 bg-background dark:bg-dark-background z-20 px-4 py-3 border-b border-gray-200 dark:border-dark-border flex justify-between items-center h-14 shadow-sm">
        <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                <BackIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-bold">Store</h1>
        </div>
        {showCart && (
          <button onClick={openCartModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface relative" aria-label="Open cart">
            <CartIcon className="w-6 h-6 text-on-surface dark:text-dark-on-surface" />
            {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-background dark:border-dark-background">
                    {cartItemCount}
                </span>
            )}
          </button>
        )}
      </div>
      {shopContent}
    </div>
  );
};

export default ShopPage;