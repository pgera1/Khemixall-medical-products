
import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetails } from './components/ProductDetails';
import { UserProfile } from './components/UserProfile';
import { PRODUCTS } from './constants';
import { Category, Product, CartItem, User, FilterState, SortOption, Order, OrderStatus } from './types';

const App: React.FC = () => {
  // -- State Management --
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'wishlist' | 'checkout' | 'confirmation' | 'admin' | 'profile'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  
  // Simulating a user database
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    { id: 'u1', name: 'Demo User', email: 'user@khemixall.com', address: { street: '123 Medical Way', city: 'Tech City', state: 'CA', zip: '90210', country: 'USA' } }
  ]);

  // Product, Cart, & Wishlist State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Orders State (Global)
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: Category.ALL,
    sortBy: 'featured',
    availability: 'all',
    brands: []
  });

  // Landing Page specific state
  const [landingSearchTerm, setLandingSearchTerm] = useState('');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // -- Derived Data for UI --
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const wishlistItemCount = wishlist.length;

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = filters.search.toLowerCase().trim();

    let result = products.filter(product => {
      // Enhanced search: Check name, description, brand, and features
      const matchesSearch = 
        term === '' ||
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.features.some(f => f.toLowerCase().includes(term));
      
      const matchesCategory = filters.category === Category.ALL || product.category === filters.category;
      
      const matchesAvailability = 
        filters.availability === 'all' ||
        (filters.availability === 'in-stock' && product.inStock) ||
        (filters.availability === 'out-of-stock' && !product.inStock);
      
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);

      return matchesSearch && matchesCategory && matchesAvailability && matchesBrand;
    });

    // Apply Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);
      case 'rating':
        return result.sort((a, b) => b.rating - a.rating);
      default:
        return result;
    }
  }, [filters, products]);

  // -- Handlers --
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  // Enhanced Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (authMode === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        setAuthError('Please fill in all fields');
        setAuthLoading(false);
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        name: authForm.name,
        email: authForm.email,
        address: { street: '', city: '', state: '', zip: '', country: '' }
      };
      setRegisteredUsers(prev => [...prev, newUser]);
      setUser(newUser);
      setIsAuthModalOpen(false);
    } else {
      // Sign In Logic
      if (authForm.email === 'admin@khemixall.com' && authForm.password === 'admin') {
        handleAdminLogin();
        return;
      }

      const foundUser = registeredUsers.find(u => u.email === authForm.email);
      if (foundUser) {
         setUser(foundUser);
         setIsAuthModalOpen(false);
      } else {
         if (authForm.email && authForm.password) {
            const demoUser: User = { id: 'demo', name: 'Demo User', email: authForm.email };
            setUser(demoUser);
            setIsAuthModalOpen(false);
         } else {
            setAuthError('Invalid credentials');
         }
      }
    }
    setAuthLoading(false);
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    // Simulate Google OAuth popup and network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const googleUser: User = {
      id: 'google_' + Date.now(),
      name: 'Google User', 
      email: 'user@gmail.com',
      isAdmin: false
    };
    
    setUser(googleUser);
    setIsAuthModalOpen(false);
    setAuthLoading(false);
  };

  const handleAdminLogin = () => {
    setUser({ 
      id: 'admin1', 
      name: 'Admin User', 
      email: 'admin@khemixall.com',
      isAdmin: true
    });
    setCurrentPage('admin');
    setIsAuthModalOpen(false);
    setAuthLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setCurrentPage('checkout');
  };

  const handlePayment = async () => {
    if (!user) return;
    setIsProcessingPayment(true);
    
    // Simulate payment gateway processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderId = 'KMX-' + Math.floor(100000 + Math.random() * 900000);
    
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items: [...cart],
      total: cartTotal,
      date: new Date(),
      status: OrderStatus.PENDING,
      shippingAddress: user.address || { street: '123 Tech Lane', city: 'Innovation', state: 'CA', zip: '90000', country: 'USA' },
      paymentMethod: 'Credit Card'
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setCart([]); 
    setIsProcessingPayment(false);
    setCurrentPage('confirmation');
  };

  const handleLandingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: landingSearchTerm }));
    setCurrentPage('shop');
  };

  // -- Admin Handlers --
  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const product: Product = {
      ...newProduct,
      id: (Date.now()).toString(),
      rating: 0,
      reviews: 0
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const toggleBrandFilter = (brand: string) => {
    setFilters(prev => {
      const newBrands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands: newBrands };
    });
  };

  // -- Render Pages --
  const renderLanding = () => (
    <main className="flex-1 pt-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Abstract Background */}
        <div className="absolute inset-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="absolute -top-[30%] -right-[10%] w-[50rem] h-[50rem] rounded-full bg-emerald-500/20 blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] rounded-full bg-teal-600/20 blur-[100px]"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in-up">
            Trusted by 500+ Hospitals
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight animate-fade-in-up animation-delay-200">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Medical Supply Chain</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
             Streamline your healthcare inventory with Khemixall's premium pharmaceutical and equipment procurement platform. Fast, reliable, and compliant.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative animate-fade-in-up animation-delay-400">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleLandingSearch} className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full p-2 shadow-2xl">
              <div className="pl-5 text-emerald-300">
                <i className="fas fa-search text-xl"></i>
              </div>
              <input 
                type="text" 
                placeholder="Search medicines, equipment, supplies..."
                className="flex-1 bg-transparent border-none text-white placeholder-slate-300 px-5 py-4 focus:ring-0 outline-none text-lg w-full font-medium"
                value={landingSearchTerm}
                onChange={(e) => setLandingSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg transform hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </form>
          </div>

          {/* Metrics / Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-400 animate-fade-in-up animation-delay-400">
             <div className="flex flex-col items-center gap-2">
                <i className="fas fa-truck-medical text-2xl text-emerald-400"></i>
                <span className="text-xs font-bold uppercase tracking-wider">24h Delivery</span>
             </div>
             <div className="w-px h-10 bg-slate-700 hidden md:block"></div>
             <div className="flex flex-col items-center gap-2">
                <i className="fas fa-shield-heart text-2xl text-emerald-400"></i>
                <span className="text-xs font-bold uppercase tracking-wider">FDA Certified</span>
             </div>
             <div className="w-px h-10 bg-slate-700 hidden md:block"></div>
             <div className="flex flex-col items-center gap-2">
                <i className="fas fa-globe-americas text-2xl text-emerald-400"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Global Reach</span>
             </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase text-xs mb-3 block">Our Expertise</span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Specialized Solutions for <br />Every Sector</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Tailored procurement channels designed to meet the rigorous standards of modern healthcare facilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
                { icon: 'fa-pills', title: 'Pharmaceuticals', desc: 'Prescription & OTC medications with cold-chain assurance.', cat: Category.PHARMACEUTICALS, color: 'blue' },
                { icon: 'fa-microscope', title: 'Medical Equipment', desc: 'Advanced diagnostic tools and surgical instruments.', cat: Category.EQUIPMENT, color: 'emerald' },
                { icon: 'fa-kit-medical', title: 'Hospital Supplies', desc: 'Daily essentials for patient care and clinic operations.', cat: Category.SUPPLIES, color: 'teal' }
            ].map((industry, idx) => (
                <div key={idx} className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${industry.color}-50 dark:bg-${industry.color}-900/20 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                    <div className={`relative w-16 h-16 bg-${industry.color}-50 dark:bg-${industry.color}-900/40 text-${industry.color}-600 dark:text-${industry.color}-400 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-inner`}>
                        <i className={`fas ${industry.icon}`}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{industry.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{industry.desc}</p>
                    <button 
                        onClick={() => { setFilters({ ...filters, category: industry.cat }); setCurrentPage('shop'); }} 
                        className={`text-${industry.color}-600 dark:text-${industry.color}-400 font-bold text-sm group-hover:underline flex items-center gap-2`}
                    >
                        Explore Catalog <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </button>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-slate-900"></div>
             {/* Decorative circles */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to upgrade your inventory?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of healthcare providers who trust Khemixall for their medical supply needs.</p>
          <button 
             onClick={() => setCurrentPage('shop')}
             className="bg-white text-emerald-900 px-12 py-5 rounded-full font-bold text-lg shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 transform"
          >
            Browse Full Catalog
          </button>
        </div>
      </section>
    </main>
  );

  const renderWishlist = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 min-h-screen">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Saved items for later purchase.</p>
        </div>
        <button 
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-3 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Continue Shopping
        </button>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map(product => (
            <div key={product.id} className="animate-fade-in">
                <ProductCard 
                product={product} 
                onAddToCart={addToCart} 
                isWishlisted={true}
                onToggleWishlist={() => toggleWishlist(product)}
                onClick={() => handleProductClick(product)}
                />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-300 shadow-sm">
            <i className="fas fa-heart text-3xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Save items you love to find them easily later.</p>
          <button 
            onClick={() => setCurrentPage('shop')}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            Explore Products
          </button>
        </div>
      )}
    </main>
  );

  const renderShop = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-filter text-emerald-500"></i> Filters
                </h3>
                
                {/* Search */}
                <div className="relative mb-6">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-700 outline-none text-sm transition-all dark:text-white dark:placeholder-slate-400"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                {/* Categories */}
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-1 mb-8">
                {Object.values(Category).map((cat) => (
                    <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                        filters.category === cat 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    >
                    {cat}
                    {filters.category === cat && <i className="fas fa-check text-xs"></i>}
                    </button>
                ))}
                </div>

                {/* Availability */}
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Availability</h4>
                <div className="space-y-2 mb-8">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'In Stock', value: 'in-stock' },
                    { label: 'Out of Stock', value: 'out-of-stock' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${filters.availability === option.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-emerald-400'}`}>
                          {filters.availability === option.value && <div className="w-2 h-2 rounded-full bg-white"></div>}
                       </div>
                       <input 
                         type="radio" 
                         name="availability" 
                         value={option.value}
                         checked={filters.availability === option.value}
                         onChange={() => setFilters({ ...filters, availability: option.value as any })}
                         className="hidden"
                       />
                       <span className={`text-sm font-medium ${filters.availability === option.value ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                         {option.label}
                       </span>
                    </label>
                  ))}
                </div>

                {/* Brand */}
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Brands</h4>
                <div className="space-y-2 mb-2">
                  {uniqueBrands.map((brand) => (
                     <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${filters.brands.includes(brand) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-emerald-400'}`}>
                           {filters.brands.includes(brand) && <i className="fas fa-check text-white text-[10px]"></i>}
                        </div>
                        <input 
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => toggleBrandFilter(brand)}
                          className="hidden"
                        />
                        <span className={`text-sm font-medium ${filters.brands.includes(brand) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                          {brand}
                        </span>
                     </label>
                  ))}
                </div>
            </div>

             <button 
                onClick={() => setFilters({ search: '', category: Category.ALL, sortBy: 'featured', availability: 'all', brands: [] })}
                className="w-full py-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:text-emerald-700 dark:hover:text-emerald-300 border border-dashed border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
                Reset All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center mb-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> results</p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Sort by:</span>
              <div className="relative">
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortOption })}
                    className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => (
                <div key={product.id} className={`animate-fade-in-up`} style={{ animationDelay: `${idx * 50}ms` }}>
                    <ProductCard 
                    product={product} 
                    onAddToCart={addToCart}
                    isWishlisted={wishlist.some(item => item.id === product.id)}
                    onToggleWishlist={() => toggleWishlist(product)}
                    onClick={() => handleProductClick(product)}
                    />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 animate-fade-in">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-500">
                <i className="fas fa-search text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No products found</h3>
              <p className="text-slate-500 dark:text-slate-400">We couldn't find what you're looking for.</p>
              <button 
                onClick={() => setFilters({ search: '', category: Category.ALL, sortBy: 'featured', availability: 'all', brands: [] })}
                className="mt-6 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-28">
      <button 
        onClick={() => setCurrentPage('shop')} 
        className="mb-8 flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
      >
        <i className="fas fa-arrow-left mr-2"></i> Back to Shop
      </button>
      
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">Secure Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-10">
        {/* Checkout Form */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">1</div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Shipping Address</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" defaultValue={user?.name} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Street Address</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" defaultValue={user?.address?.street} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">City</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" defaultValue={user?.address?.city} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ZIP Code</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" defaultValue={user?.address?.zip} />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
             <div className="flex items-center gap-4 mb-8 border-b border-slate-50 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">2</div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Payment Method</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center p-5 border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl cursor-pointer transition-all">
                <input type="radio" name="payment" className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <div className="ml-4 flex-1">
                  <span className="block font-bold text-slate-800 dark:text-white">Credit Card</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Visa, Mastercard, Amex</span>
                </div>
                <div className="flex gap-2 text-slate-400">
                    <i className="fab fa-cc-visa text-2xl"></i>
                    <i className="fab fa-cc-mastercard text-2xl"></i>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Card Number</label>
                    <div className="relative">
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono" />
                      <i className="fas fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">CVC</label>
                    <input type="text" placeholder="123" className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono" />
                 </div>
              </div>
            </div>
          </section>

          <button 
            onClick={handlePayment}
            disabled={cart.length === 0 || isProcessingPayment}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-200 dark:hover:shadow-none hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessingPayment ? (
                <>
                    <i className="fas fa-circle-notch fa-spin"></i> Processing...
                </>
            ) : (
                <>
                    <i className="fas fa-lock"></i> Pay Rs {cartTotal.toFixed(2)}
                </>
            )}
          </button>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 sticky top-28">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>
            <div className="space-y-5 mb-8 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 overflow-hidden shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight mb-1">{item.name}</h4>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rs {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-3">
              <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>Rs {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Tax (8%)</span>
                <span>Rs {(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-extrabold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <span>Total</span>
                <span>Rs {(cartTotal * 1.08).toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 py-3 rounded-xl">
                <i className="fas fa-shield-alt"></i> Secure SSL Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    if (!lastOrder) return null;

    const deliveryDate = new Date(lastOrder.date);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days delivery

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 pt-28">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 text-center mb-10 animate-fade-in-up relative overflow-hidden">
           {/* Confetti background effect (css only) */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
           
           <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <i className="fas fa-check text-5xl text-emerald-500 dark:text-emerald-400"></i>
           </div>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Order Confirmed!</h1>
           <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Thank you for your purchase. Your order has been received and is being processed.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-slate-100 dark:border-slate-700 py-8 mb-10">
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
               <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Number</span>
               <span className="font-mono font-bold text-slate-800 dark:text-white text-xl">{lastOrder.id}</span>
             </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
               <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</span>
               <span className="font-bold text-slate-800 dark:text-white text-lg">{lastOrder.date.toLocaleDateString()}</span>
             </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
               <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Est. Delivery</span>
               <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{deliveryDate.toLocaleDateString()}</span>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => setCurrentPage('shop')}
              className="bg-slate-900 dark:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <i className="fas fa-shopping-bag"></i> Continue Shopping
            </button>
            <button 
              onClick={() => setCurrentPage('profile')}
              className="px-10 py-4 rounded-full font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
            >
              View Order History
            </button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-300">
      <Navbar 
        cartItemCount={cartItemCount} 
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onLoginClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
        onLogoutClick={handleLogout}
        onNavigate={(page) => setCurrentPage(page as any)}
        wishlistItemCount={wishlistItemCount}
        onWishlistClick={() => setCurrentPage('wishlist')}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      {currentPage === 'home' && renderLanding()}
      {currentPage === 'shop' && renderShop()}
      {currentPage === 'wishlist' && renderWishlist()}
      {currentPage === 'checkout' && renderCheckout()}
      {currentPage === 'confirmation' && renderConfirmation()}
      {currentPage === 'profile' && user && (
          <UserProfile 
            user={user} 
            orders={orders.filter(o => o.userId === user.id)} 
            onLogout={handleLogout}
            onNavigate={(page) => setCurrentPage(page as any)}
          />
      )}
      {currentPage === 'admin' && (
        <div className="pt-20">
            <AdminDashboard 
                products={products}
                orders={orders}
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
            />
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
         <ProductDetails 
            product={selectedProduct} 
            onAddToCart={addToCart} 
            onClose={() => setSelectedProduct(null)} 
         />
      )}

      {/* Enhanced Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative transition-all transform scale-100 border border-white/20 dark:border-slate-700">
             <button 
                onClick={() => setIsAuthModalOpen(false)} 
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-600 transition-colors"
             >
               <i className="fas fa-times"></i>
             </button>
             
             <div className="text-center mb-8">
               <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 text-2xl shadow-inner">
                   <i className="fas fa-user-circle"></i>
               </div>
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                 {authMode === 'signin' ? 'Welcome Back' : 'Join Khemixall'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400">
                 {authMode === 'signin' ? 'Access your medical procurement dashboard' : 'Create an account for faster checkout'}
               </p>
             </div>
             
             <form onSubmit={handleAuthSubmit} className="space-y-5">
               {authMode === 'signup' && (
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                   <input 
                    type="text" 
                    required
                    value={authForm.name}
                    onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-white" 
                    placeholder="John Doe"
                   />
                 </div>
               )}
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Email Address</label>
                 <input 
                  type="email" 
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-white" 
                  placeholder="name@company.com"
                 />
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Password</label>
                 <input 
                  type="password" 
                  required
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-800 dark:text-white" 
                  placeholder="••••••••"
                 />
               </div>

               {authError && (
                 <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/30 py-3 rounded-xl border border-red-100 dark:border-red-900">
                   <i className="fas fa-exclamation-circle mr-1"></i> {authError}
                 </div>
               )}

               <button 
                 type="submit"
                 disabled={authLoading}
                 className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
               >
                 {authLoading ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                 ) : (
                    authMode === 'signin' ? 'Sign In' : 'Create Account'
                 )}
               </button>
             </form>

             <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                  <span className="px-3 bg-white dark:bg-slate-800 text-slate-400">Or continue with</span>
                </div>
             </div>

             <button 
               type="button"
               onClick={handleGoogleLogin}
               disabled={authLoading}
               className="w-full bg-white dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 text-slate-700 dark:text-white py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-3"
             >
               <i className="fab fa-google text-red-500 text-xl"></i>
               <span>Google Account</span>
             </button>

             <div className="mt-8 text-center">
               <p className="text-slate-500 dark:text-slate-400">
                 {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                 <button 
                    onClick={() => {
                        setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                        setAuthError('');
                    }}
                    className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                 >
                   {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                 </button>
               </p>
             </div>
             
             <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-center">
                <button 
                  onClick={handleAdminLogin}
                  className="text-xs text-slate-300 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
                >
                  <i className="fas fa-lock text-[10px]"></i> Admin Portal
                </button>
             </div>
           </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-400 py-16 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            {/* Updated Footer Branding */}
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center relative overflow-hidden shadow-lg">
                 <div className="absolute top-0 right-0 w-5 h-5 bg-white opacity-20 rounded-full transform translate-x-1 -translate-y-1 blur-sm"></div>
                 <div className="absolute bottom-0 left-0 w-5 h-5 bg-black opacity-10 rounded-full transform -translate-x-1 translate-y-1 blur-sm"></div>
                 <span className="text-white font-extrabold text-xl tracking-tighter">K</span>
               </div>
               <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Khemixall</h1>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Medical Solutions</p>
               </div>
            </div>
            
            <p className="text-sm leading-relaxed mb-6">
              Revolutionizing healthcare procurement with AI-driven logistics and premium grade medical supplies.
            </p>
            <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Returns Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
             <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Partners</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Legal</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-6">Newsletter</h4>
             <p className="text-xs text-slate-500 mb-4">Subscribe for the latest medical product updates.</p>
             <div className="flex">
                 <input type="email" placeholder="Email address" className="bg-slate-800 border-none rounded-l-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-emerald-500 outline-none" />
                 <button className="bg-emerald-600 text-white px-4 py-2 rounded-r-lg font-bold text-sm hover:bg-emerald-500 transition-colors">Go</button>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs font-medium text-slate-600">
          © 2024 Khemixall Medical Supply. All rights reserved.
        </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default App;