import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">My Cart</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{cartItems.length} items</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-100 shadow-sm">
                <i className="fas fa-shopping-basket text-3xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-slate-500 text-sm mt-1 px-10">Looks like you haven't added anything to your cart yet.</p>
              </div>
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-300 hover:text-red-500 self-start p-1 transition-colors"
                    title="Remove Item"
                >
                    <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 text-sm">Subtotal</span>
              <span className="text-xl font-bold text-slate-900">Rs {subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
            >
              <span>Proceed to Checkout</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
};