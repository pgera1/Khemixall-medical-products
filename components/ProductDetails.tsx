
import React, { useState, MouseEvent, useEffect, FormEvent } from 'react';
import { Product, Review } from '../types';
import { reviewStore } from '../services/reviewStore';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClose: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isHovering, setIsHovering] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Data State
  const [combinedReviews, setCombinedReviews] = useState<Review[]>([]);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
        const existingUserReviews = reviewStore.getReviewsByProductId(product.id);
        setCombinedReviews(existingUserReviews);
    }
  }, [activeTab, product]);

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userName || !userComment) return;
    
    setIsSubmittingReview(true);

    // Simulate network delay
    setTimeout(() => {
        const newReview: Review = {
            id: `user-${Date.now()}`,
            productId: product.id,
            author: userName,
            rating: userRating,
            date: 'Just now',
            title: userTitle,
            text: userComment,
            type: 'user'
        };

        reviewStore.addReview(newReview);
        
        // Update local state
        const updatedUserReviews = reviewStore.getReviewsByProductId(product.id);
        setCombinedReviews(updatedUserReviews);

        // Reset form
        setUserName('');
        setUserTitle('');
        setUserComment('');
        setUserRating(5);
        setIsSubmittingReview(false);
    }, 800);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'email' | 'copy') => {
    const text = `Check out ${product.name} on Khemixall Medical!`;
    const url = window.location.href; // Using current URL for demo

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(text + '\n' + url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        break;
    }
    if (platform !== 'copy') setIsShareOpen(false);
  };

  // Helper to get a higher resolution image for the zoom effect
  const zoomImage = product.image.includes('picsum') 
    ? product.image.replace('/400/400', '/1200/1200') 
    : product.image;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in" 
         onClick={onClose}
       ></div>

       {/* Modal Container */}
       <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up max-h-[90vh]">
         
         <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
         >
           <i className="fas fa-times"></i>
         </button>

         {/* Image Section */}
         <div className="w-full md:w-1/2 bg-slate-50 relative group h-[300px] md:h-auto flex-shrink-0">
             <div 
                className="w-full h-full relative overflow-hidden cursor-crosshair"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
             >
                {/* Base Image */}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
                />
                
                {/* Zoom Layer */}
                <div 
                    className={`absolute inset-0 bg-no-repeat transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        backgroundImage: `url(${zoomImage})`,
                        backgroundPosition: backgroundPosition,
                        backgroundSize: '200%'
                    }}
                />
             </div>

             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                <span className="bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <i className="fas fa-search-plus"></i> Hover to Zoom
                </span>
             </div>
         </div>

         {/* Details Section with Tabs */}
         <div className="w-full md:w-1/2 bg-white flex flex-col h-full max-h-[60vh] md:max-h-full relative">
             {/* Tab Header */}
             <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex gap-4 bg-white z-10">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'details' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                    Product Details
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'reviews' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                    <i className="fas fa-comments"></i> Reviews
                </button>
             </div>

             {/* Tab Content Scrollable Area */}
             <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide mb-20">
                {activeTab === 'details' ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {product.category}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {product.brand}
                                </span>
                            </div>
                            
                            {/* Stock Availability Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                product.inStock 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                {product.name}
                            </h2>
                            
                            {/* Share Button */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsShareOpen(!isShareOpen)}
                                    className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center justify-center"
                                    title="Share Product"
                                >
                                    <i className="fas fa-share-alt"></i>
                                </button>
                                
                                {isShareOpen && (
                                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-fade-in">
                                        <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                            <i className={`fas ${isCopied ? 'fa-check text-green-500' : 'fa-link'}`}></i>
                                            {isCopied ? 'Link Copied!' : 'Copy Link'}
                                        </button>
                                        <button onClick={() => handleShare('email')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                            <i className="fas fa-envelope"></i> Email
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                            <i className="fab fa-twitter text-blue-400"></i> Twitter
                                        </button>
                                        <button onClick={() => handleShare('facebook')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                            <i className="fab fa-facebook text-blue-600"></i> Facebook
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex text-amber-400 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-slate-200'}`}></i>
                                ))}
                            </div>
                            <span className="text-slate-400 font-medium text-sm border-l border-slate-200 pl-4">
                                {product.reviews} verified reviews
                            </span>
                        </div>

                        <div className="prose prose-slate mb-8">
                            <p className="text-slate-500 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-layer-group text-emerald-500"></i> Product Features
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.features.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-slate-600 text-sm">
                                    <i className="fas fa-check text-emerald-500 text-xs"></i> 
                                    <span>{feat}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-8">
                        
                            <>
                                {/* Add Review Section */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-4">Write a Review</h4>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setUserRating(star)}
                                                        className="text-2xl focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        <i className={`fas fa-star ${star <= (hoverRating || userRating) ? 'text-amber-400' : 'text-slate-200'}`}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    value={userName}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Review Title</label>
                                                <input 
                                                    type="text" 
                                                    value={userTitle}
                                                    onChange={(e) => setUserTitle(e.target.value)}
                                                    placeholder="Brief summary"
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Review</label>
                                            <textarea 
                                                required
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                placeholder="Share your experience with this product..."
                                                rows={3}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                            ></textarea>
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-200"
                                        >
                                            {isSubmittingReview ? 'Posting...' : 'Post Review'}
                                        </button>
                                    </form>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800">Latest Reviews</h4>
                                    {combinedReviews.length > 0 ? combinedReviews.map((review) => (
                                        <div key={review.id} className={`p-4 rounded-2xl border ${review.type === 'ai' ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-900 text-sm">{review.author}</span>
                                                        {review.type === 'ai' && (
                                                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">Verified Purchase</span>
                                                        )}
                                                        {review.type === 'user' && (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase font-bold">You</span>
                                                        )}
                                                    </div>
                                                    <div className="flex text-amber-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-slate-200'}`}></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-400">{review.date}</span>
                                            </div>
                                            {review.title && <h5 className="font-bold text-slate-700 text-sm mb-1">{review.title}</h5>}
                                            <p className="text-slate-600 text-sm leading-relaxed">{review.text}</p>
                                        </div>
                                    )) : (
                                        <p className="text-slate-400 text-sm text-center py-4">No reviews yet.</p>
                                    )}
                                </div>
                            </>
                        
                    </div>
                )}
             </div>

             {/* Sticky Footer in Details Panel */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex items-center justify-between z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                 <div>
                    <span className="text-xs text-slate-400 block mb-1">Price per unit</span>
                    <span className="text-2xl font-extrabold text-slate-900">Rs {product.price.toFixed(2)}</span>
                 </div>
                 <button 
                    onClick={() => {
                        onAddToCart(product);
                        onClose();
                    }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-200 hover:-translate-y-1 flex items-center gap-2"
                 >
                    <i className="fas fa-shopping-bag"></i> Add to Order
                 </button>
             </div>
         </div>
       </div>
    </div>
  );
};