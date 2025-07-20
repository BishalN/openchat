export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'premium' | 'enterprise';
  permissions: string[];
  preferences: {
    notifications: boolean;
    language: string;
    currency: string;
  };
  createdAt: string;
}

export const users: Record<string, User> = {
  'demo-user-1': {
    id: 'demo-user-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    subscription: 'premium',
    permissions: ['subscription:read', 'subscription:write', 'order:read', 'order:write', 'inventory:read'],
    preferences: {
      notifications: true,
      language: 'en',
      currency: 'USD'
    },
    createdAt: '2024-01-01T00:00:00Z'
  },
  'demo-user-2': {
    id: 'demo-user-2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    subscription: 'free',
    permissions: ['subscription:read', 'order:read', 'inventory:read'],
    preferences: {
      notifications: false,
      language: 'en',
      currency: 'USD'
    },
    createdAt: '2024-01-15T00:00:00Z'
  },
  'demo-user-3': {
    id: 'demo-user-3',
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    subscription: 'enterprise',
    permissions: ['subscription:read', 'subscription:write', 'order:read', 'order:write', 'inventory:read', 'inventory:write'],
    preferences: {
      notifications: true,
      language: 'en',
      currency: 'USD'
    },
    createdAt: '2024-01-10T00:00:00Z'
  }
}; 