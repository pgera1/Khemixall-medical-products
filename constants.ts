
import { Category, Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Digital Stethoscope Pro',
    description: 'Advanced digital stethoscope with noise cancellation and app integration for heart sound analysis.',
    price: 299.99,
    category: Category.EQUIPMENT,
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    brand: 'MediTech',
    features: ['Digital', 'Bluetooth', 'Noise Cancellation']
  },
  {
    id: '2',
    name: 'Immunity Multi-Vitamin Complex',
    description: 'Comprehensive daily supplement supporting immune system health with Zinc, Vitamin C, and D3.',
    price: 24.50,
    category: Category.WELLNESS,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    reviews: 850,
    inStock: true,
    brand: 'VitalLife',
    features: ['Organic', 'Gluten-Free', 'Non-GMO']
  },
  {
    id: '3',
    name: 'Clinical Grade Pulse Oximeter',
    description: 'Accurate blood oxygen saturation (SpO2) and pulse rate monitor.',
    price: 45.00,
    category: Category.EQUIPMENT,
    image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviews: 320,
    inStock: true,
    brand: 'MediTech',
    features: ['Digital', 'Portable', 'Battery Included']
  },
  {
    id: '4',
    name: 'Premium First Aid Kit (Professional)',
    description: '200-piece industrial first aid kit suitable for offices and small clinics.',
    price: 89.99,
    category: Category.SUPPLIES,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 56,
    inStock: true,
    brand: 'SafetyFirst',
    features: ['Comprehensive', 'Sterile', 'Compact']
  },
  {
    id: '5',
    name: 'Non-Contact Infrared Thermometer',
    description: 'Instant and accurate temperature readings without physical contact.',
    price: 35.99,
    category: Category.EQUIPMENT,
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
    rating: 4.4,
    reviews: 2100,
    inStock: true,
    brand: 'MediTech',
    features: ['Non-Contact', 'Digital', 'Instant Read']
  },
  {
    id: '6',
    name: 'Organic Whey Protein Isolate',
    description: 'Grass-fed whey protein for recovery and muscle support. Unflavored, medical grade.',
    price: 55.00,
    category: Category.WELLNESS,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews: 112,
    inStock: true,
    brand: 'VitalLife',
    features: ['Organic', 'Gluten-Free', 'High Protein']
  },
  {
    id: '7',
    name: 'Sterile Surgical Gloves (Box of 100)',
    description: 'Powder-free, latex-free nitrile exam gloves.',
    price: 18.50,
    category: Category.SUPPLIES,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 430,
    inStock: true,
    brand: 'SafeHands',
    features: ['Sterile', 'Latex-Free', 'Disposable']
  },
  {
    id: '8',
    name: 'Khemixall Pain Relief Gel',
    description: 'Fast-acting topical analgesic for arthritis and muscle pain.',
    price: 12.99,
    category: Category.PHARMACEUTICALS,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    rating: 4.3,
    reviews: 150,
    inStock: true,
    brand: 'Khemixall Pharma',
    features: ['Fast-Acting', 'Topical', 'Pain Relief']
  }
];