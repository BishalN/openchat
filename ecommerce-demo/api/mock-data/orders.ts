export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export const orders: Record<string, Order> = {
  'order-123': {
    id: 'order-123',
    userId: 'demo-user-1',
    status: 'shipped',
    items: [
      {
        productId: 'prod-1',
        name: 'Premium Widget Pro',
        quantity: 2,
        price: 49.99,
        currency: 'USD'
      },
      {
        productId: 'prod-2',
        name: 'Super Gadget',
        quantity: 1,
        price: 29.99,
        currency: 'USD'
      }
    ],
    total: 129.97,
    currency: 'USD',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'credit_card',
    trackingNumber: '1Z999AA1234567890',
    estimatedDelivery: '2024-01-25T00:00:00Z',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-22T14:15:00Z'
  },
  'order-124': {
    id: 'order-124',
    userId: 'demo-user-1',
    status: 'delivered',
    items: [
      {
        productId: 'prod-3',
        name: 'Basic Widget',
        quantity: 1,
        price: 19.99,
        currency: 'USD'
      }
    ],
    total: 19.99,
    currency: 'USD',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'paypal',
    trackingNumber: '1Z999AA1234567891',
    estimatedDelivery: '2024-01-18T00:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z'
  },
  'order-125': {
    id: 'order-125',
    userId: 'demo-user-2',
    status: 'pending',
    items: [
      {
        productId: 'prod-1',
        name: 'Premium Widget Pro',
        quantity: 1,
        price: 49.99,
        currency: 'USD'
      }
    ],
    total: 49.99,
    currency: 'USD',
    shippingAddress: {
      name: 'Jane Smith',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    billingAddress: {
      name: 'Jane Smith',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    paymentMethod: 'credit_card',
    createdAt: '2024-01-23T11:45:00Z',
    updatedAt: '2024-01-23T11:45:00Z'
  },
  'order-126': {
    id: 'order-126',
    userId: 'demo-user-3',
    status: 'processing',
    items: [
      {
        productId: 'prod-4',
        name: 'Enterprise Solution',
        quantity: 5,
        price: 199.99,
        currency: 'USD'
      }
    ],
    total: 999.95,
    currency: 'USD',
    shippingAddress: {
      name: 'Bob Wilson',
      street: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    billingAddress: {
      name: 'Bob Wilson',
      street: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    paymentMethod: 'bank_transfer',
    createdAt: '2024-01-22T08:15:00Z',
    updatedAt: '2024-01-23T10:30:00Z'
  }
}; 