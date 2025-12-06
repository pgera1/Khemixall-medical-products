
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  brand: string;
  features: string[];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title?: string;
  text: string;
  type: 'user' | 'ai';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  address?: Address;
  phone?: string;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  date: Date;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
}

export enum Category {
  ALL = 'All',
  PHARMACEUTICALS = 'Pharmaceuticals',
  EQUIPMENT = 'Medical Equipment',
  SUPPLIES = 'First Aid & Supplies',
  WELLNESS = 'Wellness & Vitamins'
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export interface FilterState {
  search: string;
  category: Category;
  sortBy: SortOption;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  brands: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}