export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  plan: 'free' | 'premium' | 'enterprise';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBilling: string;
  features: string[];
  price: {
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  };
  cancelledAt?: string;
  trialEndsAt?: string;
}

export const subscriptions: Record<string, Subscription> = {
  'sub-1': {
    id: 'sub-1',
    userId: 'demo-user-1',
    status: 'active',
    plan: 'premium',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    nextBilling: '2024-02-01T00:00:00Z',
    features: [
      'unlimited_orders',
      'priority_support',
      'advanced_analytics',
      'custom_branding',
      'api_access'
    ],
    price: {
      amount: 29.99,
      currency: 'USD',
      interval: 'month'
    }
  },
  'sub-2': {
    id: 'sub-2',
    userId: 'demo-user-2',
    status: 'active',
    plan: 'free',
    currentPeriodStart: '2024-01-15T00:00:00Z',
    currentPeriodEnd: '2024-02-15T00:00:00Z',
    nextBilling: '2024-02-15T00:00:00Z',
    features: [
      'basic_orders',
      'email_support',
      'basic_analytics'
    ],
    price: {
      amount: 0,
      currency: 'USD',
      interval: 'month'
    }
  },
  'sub-3': {
    id: 'sub-3',
    userId: 'demo-user-3',
    status: 'active',
    plan: 'enterprise',
    currentPeriodStart: '2024-01-10T00:00:00Z',
    currentPeriodEnd: '2024-04-10T00:00:00Z',
    nextBilling: '2024-04-10T00:00:00Z',
    features: [
      'unlimited_orders',
      'priority_support',
      'advanced_analytics',
      'custom_branding',
      'api_access',
      'white_label',
      'dedicated_account_manager',
      'custom_integrations'
    ],
    price: {
      amount: 299.99,
      currency: 'USD',
      interval: 'month'
    }
  }
}; 