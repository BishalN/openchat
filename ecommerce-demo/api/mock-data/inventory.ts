export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: 'widgets' | 'gadgets' | 'solutions' | 'accessories';
  inStock: boolean;
  quantity: number;
  reserved: number;
  available: number;
  location: string;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const inventory: Record<string, Product> = {
  'prod-1': {
    id: 'prod-1',
    name: 'Premium Widget Pro',
    description: 'High-quality premium widget with advanced features and superior performance.',
    price: 49.99,
    currency: 'USD',
    category: 'widgets',
    inStock: true,
    quantity: 150,
    reserved: 10,
    available: 140,
    location: 'warehouse-1',
    sku: 'WID-PRO-001',
    weight: 2.5,
    dimensions: {
      length: 10,
      width: 5,
      height: 3,
      unit: 'inches'
    },
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    tags: ['premium', 'featured', 'bestseller'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-23T12:00:00Z'
  },
  'prod-2': {
    id: 'prod-2',
    name: 'Super Gadget',
    description: 'Innovative gadget that revolutionizes your daily workflow.',
    price: 29.99,
    currency: 'USD',
    category: 'gadgets',
    inStock: true,
    quantity: 75,
    reserved: 5,
    available: 70,
    location: 'warehouse-2',
    sku: 'GAD-SUP-002',
    weight: 1.2,
    dimensions: {
      length: 8,
      width: 4,
      height: 2,
      unit: 'inches'
    },
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    tags: ['innovative', 'portable'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-22T15:30:00Z'
  },
  'prod-3': {
    id: 'prod-3',
    name: 'Basic Widget',
    description: 'Reliable basic widget for everyday use.',
    price: 19.99,
    currency: 'USD',
    category: 'widgets',
    inStock: true,
    quantity: 300,
    reserved: 20,
    available: 280,
    location: 'warehouse-1',
    sku: 'WID-BAS-003',
    weight: 1.0,
    dimensions: {
      length: 6,
      width: 3,
      height: 2,
      unit: 'inches'
    },
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    tags: ['basic', 'affordable'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-21T09:15:00Z'
  },
  'prod-4': {
    id: 'prod-4',
    name: 'Enterprise Solution',
    description: 'Comprehensive enterprise solution for large-scale operations.',
    price: 199.99,
    currency: 'USD',
    category: 'solutions',
    inStock: true,
    quantity: 25,
    reserved: 8,
    available: 17,
    location: 'warehouse-3',
    sku: 'SOL-ENT-004',
    weight: 15.0,
    dimensions: {
      length: 20,
      width: 15,
      height: 10,
      unit: 'inches'
    },
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    tags: ['enterprise', 'scalable', 'professional'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-23T11:45:00Z'
  },
  'prod-5': {
    id: 'prod-5',
    name: 'Premium Accessory Kit',
    description: 'Complete accessory kit for premium widgets.',
    price: 15.99,
    currency: 'USD',
    category: 'accessories',
    inStock: false,
    quantity: 0,
    reserved: 0,
    available: 0,
    location: 'warehouse-1',
    sku: 'ACC-PRE-005',
    weight: 0.5,
    dimensions: {
      length: 4,
      width: 3,
      height: 1,
      unit: 'inches'
    },
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    tags: ['accessory', 'kit'],
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-20T16:20:00Z'
  }
}; 