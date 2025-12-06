import React, { useState } from 'react';
import { Product, Category, Order, OrderStatus } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders?: Order[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    products, 
    orders = [], 
    onUpdateProduct, 
    onAddProduct, 
    onDeleteProduct,
    onUpdateOrderStatus
}) => {
  const [view, setView] = useState<'inventory' | 'add' | 'orders' | 'analytics'>('inventory');
  const [dataSource, setDataSource] = useState<'local' | 'mongodb'>('local');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: Category.EQUIPMENT,
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    brand: '',
    features: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image, // In real app, this would be the URL from uploaded file
      inStock: newProduct.inStock,
      brand: newProduct.brand,
      features: newProduct.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
    });
    setView('inventory');
    // Reset form
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: Category.EQUIPMENT,
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
      inStock: true,
      brand: '',
      features: ''
    });
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImageFile(e.target.files[0]);
        // Simulate upload by just keeping the default image or using a local preview URL
        // In a real app, you'd upload to S3/Cloudinary here
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const calculateAnalytics = () => {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      return { totalRevenue, totalOrders, pendingOrders, averageOrderValue };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your product inventory, orders, and view reports.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                <button 
                    onClick={() => setView('inventory')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${view === 'inventory' ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Inventory
                </button>
                <button 
                    onClick={() => setView('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${view === 'orders' ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Orders
                </button>
                <button 
                    onClick={() => setView('analytics')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${view === 'analytics' ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    Analytics
                </button>
                <button 
                    onClick={() => setView('add')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${view === 'add' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <i className="fas fa-plus mr-2"></i> Add Product
                </button>
            </div>
        </div>
      </div>

      {view === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                          <i className="fas fa-dollar-sign text-xl"></i>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rs {analytics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                          <i className="fas fa-shopping-bag text-xl"></i>
                      </div>
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Orders</h3>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.totalOrders}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400">
                          <i className="fas fa-clock text-xl"></i>
                      </div>
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Pending Orders</h3>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.pendingOrders}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl text-purple-600 dark:text-purple-400">
                          <i className="fas fa-chart-line text-xl"></i>
                      </div>
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Avg. Order Value</h3>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rs {analytics.averageOrderValue.toFixed(2)}</p>
              </div>
          </div>
      )}

      {view === 'orders' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                          <tr>
                              <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Order ID</th>
                              <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Date</th>
                              <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Customer</th>
                              <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Total</th>
                              <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                          {orders.map(order => (
                              <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">{order.id}</td>
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(order.date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">User {order.userId.slice(0,4)}</td>
                                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">Rs {order.total.toFixed(2)}</td>
                                  <td className="px-6 py-4">
                                      <select 
                                        value={order.status}
                                        onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                        className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
                                      >
                                          {Object.values(OrderStatus).map(status => (
                                              <option key={status} value={status}>{status}</option>
                                          ))}
                                      </select>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {orders.length === 0 && (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">No orders found.</div>
                  )}
              </div>
          </div>
      )}

      {view === 'inventory' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Product</th>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Category</th>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Brand</th>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Price</th>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="px-8 py-5 font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600">
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-300 font-medium">{product.category}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-300">{product.brand}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-xs">Rs</span>
                        <input 
                          type="number" 
                          value={product.price}
                          onChange={(e) => onUpdateProduct(product.id, { price: parseFloat(e.target.value) })}
                          className="w-24 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-900"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                         <button 
                            onClick={() => onUpdateProduct(product.id, { inStock: !product.inStock })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                product.inStock 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' 
                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                        <button 
                           onClick={() => setDeleteId(product.id)}
                           className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                           title="Delete Product"
                        >
                           <i className="fas fa-trash-alt"></i>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'add' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 p-10 animate-fade-in-up">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Product</h2>
                <p className="text-slate-500 dark:text-slate-400">Enter the details for the new inventory item.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Product Name</label>
                    <input required type="text" className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                        value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Surgical Mask" />
                </div>
                
                {/* Image Upload Simulation */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Product Image</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {imageFile ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                <i className="fas fa-check-circle"></i> {imageFile.name}
                            </div>
                        ) : (
                            <div className="text-slate-400">
                                <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                                <p className="text-sm font-bold">Click to upload image</p>
                                <p className="text-xs">SVG, PNG, JPG or GIF</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Price (Rs)</label>
                        <input required type="number" step="0.01" className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                            value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Category</label>
                        <div className="relative">
                            <select className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                                value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}>
                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Brand</label>
                    <input required type="text" className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                        value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Description</label>
                    <textarea required className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[100px]" rows={3}
                        value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Features (comma separated)</label>
                    <input type="text" placeholder="e.g. Sterile, Latex-free, Durable" className="w-full px-5 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                        value={newProduct.features} onChange={e => setNewProduct({...newProduct, features: e.target.value})} />
                </div>
                <div className="pt-6 flex justify-end gap-4 border-t border-slate-50 dark:border-slate-700">
                    <button type="button" onClick={() => setView('inventory')} className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Upload Product
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 transform scale-100 transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <i className="fas fa-trash-alt text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Product?</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Are you sure you want to remove this product from your inventory? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};