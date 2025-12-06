import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isWishlisted = false, onToggleWishlist, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full relative cursor-pointer"
    >
      
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Loading placeholder effect */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="relative w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out z-10"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'; // Fallback image
            target.onerror = null;
          }}
        />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all hover:scale-110 z-30"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`fas fa-heart ${isWishlisted ? 'text-pink-500' : 'text-slate-300 group-hover:text-pink-400'} transition-colors text-lg`}></i>
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.inStock ? (
             <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase">
               In Stock
             </span>
          ) : (
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase">
               Sold Out
             </span>
          )}
        </div>
        
        {/* Quick Add Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-white text-slate-800 w-12 h-12 rounded-full shadow-lg translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 hover:bg-emerald-600 hover:text-white flex items-center justify-center z-30"
          aria-label="Add to cart"
        >
          <i className="fas fa-plus text-lg"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative bg-white z-20">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
            <i className="fas fa-star text-amber-400 text-xs"></i>
            <span className="text-amber-700 text-xs font-bold">{product.rating}</span>
          </div>
        </div>
        
        <div className="mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{product.brand}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span key={idx} className="inline-flex items-center bg-slate-50 text-slate-600 text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-100">
              {feature}
            </span>
          ))}
          {product.features.length > 2 && (
             <span className="inline-flex items-center bg-slate-50 text-slate-400 text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-100">+{product.features.length - 2}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Price</span>
            <span className="text-xl font-extrabold text-slate-900">Rs {product.price.toFixed(2)}</span>
          </div>
          <button 
             onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
             }}
             className="px-4 py-2 rounded-xl bg-slate-50 text-slate-900 text-sm font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};