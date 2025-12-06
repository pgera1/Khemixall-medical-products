import React from 'react';
import { User, Order, OrderStatus } from '../types';

interface UserProfileProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, orders, onLogout, onNavigate }) => {
  
  const handleDownloadInvoice = (order: Order) => {
    const content = `
    KHEMIXALL MEDICAL SUPPLY - INVOICE
    -----------------------------------
    Order ID: ${order.id}
    Date: ${new Date(order.date).toLocaleDateString()}
    Status: ${order.status}
    
    Customer: ${user.name}
    Email: ${user.email}
    
    Shipping Address:
    ${order.shippingAddress.street}
    ${order.shippingAddress.city}, ${order.shippingAddress.zip}
    
    ITEMS:
    -----------------------------------
    ${order.items.map(item => `${item.name} x${item.quantity} - Rs ${(item.price * item.quantity).toFixed(2)}`).join('\n')}
    -----------------------------------
    
    TOTAL: Rs ${order.total.toFixed(2)}
    Payment Method: ${order.paymentMethod}
    
    Thank you for your business.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700 border-green-200';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.PROCESSING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 text-3xl font-bold shadow-inner">
               {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{user.email}</p>
            <button 
              onClick={onLogout}
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Account Details</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{user.phone || '+1 (555) 000-0000'}</p>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Default Address</label>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">
                    {user.address ? (
                        <>
                        {user.address.street}<br/>
                        {user.address.city}, {user.address.zip}<br/>
                        {user.address.country}
                        </>
                    ) : (
                        <span className="text-slate-400 italic">No address saved</span>
                    )}
                  </p>
               </div>
               <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline">Edit Details</button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order History</h1>
             <button 
               onClick={() => onNavigate('shop')}
               className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
             >
               Start New Order
             </button>
          </div>

          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                      <div>
                         <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Order #{order.id}</span>
                         <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                            {order.status}
                         </span>
                         <button 
                            onClick={() => handleDownloadInvoice(order)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download Invoice"
                         >
                            <i className="fas fa-file-invoice"></i>
                         </button>
                      </div>
                   </div>
                   
                   <div className="space-y-4 mb-6">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                           </div>
                           <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Rs {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                   </div>

                   <div className="flex justify-between items-center pt-2">
                      <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Track Order</button>
                      <div className="text-right">
                         <span className="text-xs text-slate-400 block">Total Amount</span>
                         <span className="text-xl font-extrabold text-slate-900 dark:text-white">Rs {order.total.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-500">
                   <i className="fas fa-box-open text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No orders yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">When you place an order, it will appear here.</p>
                <button onClick={() => onNavigate('shop')} className="text-emerald-600 font-bold hover:underline">Browse Products</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};