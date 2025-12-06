import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface NavbarProps {
  cartItemCount: number;
  onCartClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onNavigate: (page: string) => void;
  wishlistItemCount?: number;
  onWishlistClick?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartItemCount, 
  onCartClick, 
  user, 
  onLoginClick, 
  onLogoutClick,
  onNavigate,
  wishlistItemCount = 0,
  onWishlistClick,
  isDarkMode,
  toggleDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Click outside handler for profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex flex-col items-center pointer-events-none ${
        scrolled ? 'pt-4' : 'pt-6'
      }`}
    >
      <div 
        className={`
          pointer-events-auto
          relative flex justify-between items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${scrolled 
            ? 'w-[92%] max-w-7xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-full py-2.5 px-6' 
            : 'w-full max-w-7xl bg-transparent border-transparent py-2 px-4 sm:px-6 lg:px-8'
          }
        `}
      >
        {/* Left Section: Logo */}
        <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center relative overflow-hidden shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 transform group-hover:scale-105">
                <div className="absolute top-0 right-0 w-5 h-5 bg-white opacity-20 rounded-full transform translate-x-1 -translate-y-1 blur-sm"></div>
                <div className="absolute bottom-0 left-0 w-5 h-5 bg-black opacity-10 rounded-full transform -translate-x-1 translate-y-1 blur-sm"></div>
                <span className="text-white font-extrabold text-xl tracking-tighter">K</span>
            </div>
            <div className="hidden md:block">
              <h1 className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-800 dark:text-white' : 'text-slate-900 dark:text-white group-hover:text-emerald-300'} group-hover:text-emerald-600 dark:group-hover:text-emerald-400`}>
                Khemixall
              </h1>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Medical Solutions</p>
            </div>
          </div>
        </div>

        {/* Center Section: Admin Link (Desktop) */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {user?.isAdmin && (
            <button onClick={() => onNavigate('admin')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
              <i className="fas fa-shield-alt"></i> Admin
            </button>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                scrolled 
                ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/20'
            }`}
          >
              <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon'}`}></i>
          </button>

          {/* Wishlist */}
          <button 
            onClick={onWishlistClick}
            className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 group ${
                scrolled
                ? 'text-slate-500 dark:text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-pink-500 hover:bg-white/20'
            }`}
            title="Wishlist"
          >
            <i className="fas fa-heart text-lg transform group-hover:scale-110 transition-transform"></i>
            {wishlistItemCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-pink-500 rounded-full shadow-sm border-2 border-white dark:border-slate-900">
                {wishlistItemCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button 
            onClick={onCartClick}
            className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 group ${
                scrolled
                ? 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-400 hover:bg-white/20'
            }`}
            title="Cart"
          >
            <i className="fas fa-shopping-bag text-lg transform group-hover:scale-110 transition-transform"></i>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm border-2 border-white dark:border-slate-900">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Auth */}
          <div className={`relative hidden md:flex items-center pl-4 ml-2 border-l ${scrolled ? 'border-slate-200 dark:border-slate-700' : 'border-slate-300/50 dark:border-slate-600'}`}>
            {user ? (
              <div className="relative" ref={profileRef}>
                  <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
                  >
                      <div className="text-right hidden lg:block">
                          <p className="text-xs text-slate-400 font-medium">Welcome,</p>
                          <p className={`text-sm font-bold leading-none ${scrolled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-800 dark:text-slate-100'}`}>
                          {user.name}
                          </p>
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-inner border ${scrolled ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' : 'bg-white/90 text-slate-800 border-white/50'}`}>
                          {user.isAdmin ? <i className="fas fa-crown text-amber-500 text-xs"></i> : <i className="fas fa-user text-xs"></i>}
                      </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                      <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in origin-top-right ring-1 ring-black/5">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                            </div>
                           <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                              <i className="fas fa-user-circle w-4 text-slate-400"></i> My Profile
                           </button>
                           <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                              <i className="fas fa-box w-4 text-slate-400"></i> Orders
                           </button>
                           <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                           <button onClick={() => { onLogoutClick(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 rounded-b-xl">
                              <i className="fas fa-sign-out-alt w-4"></i> Logout
                           </button>
                      </div>
                  )}
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    scrolled 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500' 
                    : 'bg-emerald-500/90 hover:bg-emerald-400 text-white backdrop-blur-sm'
                }`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-2">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`p-2 transition-colors focus:outline-none ${scrolled ? 'text-slate-600 dark:text-slate-300 hover:text-emerald-600' : 'text-slate-800 dark:text-white'}`}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Floating below navbar */}
      <div 
        className={`
            pointer-events-auto md:hidden mt-2 w-[92%] max-w-7xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 origin-top
            ${isMenuOpen ? 'max-h-[30rem] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}
        `}
      >
        <div className="px-4 py-4 space-y-2">
          {user?.isAdmin && (
             <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30">
               <i className="fas fa-shield-alt w-6"></i> Admin Dashboard
             </button>
          )}
          {!user && (
             <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-emerald-600 shadow-md">
               <i className="fas fa-sign-in-alt w-6"></i> Sign In
             </button>
          )}
          {user && (
            <>
             <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800 mb-2">Signed in as <strong className="text-slate-800 dark:text-white block truncate">{user.email}</strong></div>
             <button onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
               <i className="fas fa-user w-6"></i> My Profile
             </button>
             <button onClick={() => { onLogoutClick(); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
               <i className="fas fa-sign-out-alt w-6"></i> Logout
             </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};