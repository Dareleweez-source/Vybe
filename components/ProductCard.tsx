import React from 'react';
import type { Product } from '../types';
import { LinkIcon } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAffiliate?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onAffiliate }) => {
  return (
    <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-surface flex items-center gap-4">
      <img src={product.imageUrl} alt={product.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 overflow-hidden">
        <p className="font-bold text-on-surface truncate">{product.name}</p>
        <p className="text-sm text-on-surface-secondary mt-1">{product.description.substring(0, 50)}...</p>
        <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-lg text-primary">${product.price.toFixed(2)}</p>
            <div className="flex gap-2">
              {product.allowAffiliate && onAffiliate && (
                  <button
                      onClick={(e) => { e.stopPropagation(); onAffiliate(product); }}
                      className="bg-surface dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-on-surface-secondary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors shadow-sm active:scale-95"
                      title={`Affiliate: Earn ${product.affiliateCommission}%`}
                  >
                      <LinkIcon className="w-4 h-4" />
                  </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;