import { Hono } from 'hono';
import { subscriptions } from '../mock-data/subscriptions';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Apply auth middleware to all routes
app.use('*', authMiddleware);

// Get subscription status for a user
app.get('/status', (c) => {
  const userId = c.req.header('x-user-id');
  
  if (!userId) {
    return c.json({ 
      error: 'Missing user ID',
      message: 'x-user-id header is required'
    }, 400);
  }
  
  // Find subscription for this user
  const subscription = Object.values(subscriptions).find(sub => sub.userId === userId);
  
  if (!subscription) {
    return c.json({ 
      error: 'Subscription not found',
      message: 'No subscription found for this user'
    }, 404);
  }
  
  return c.json({
    success: true,
    data: subscription
  });
});

// Upgrade subscription plan
app.post('/upgrade', async (c) => {
  const userId = c.req.header('x-user-id');
  const plan = c.req.header('x-plan');
  
  if (!userId) {
    return c.json({ 
      error: 'Missing user ID',
      message: 'x-user-id header is required'
    }, 400);
  }
  
  if (!plan || !['free', 'premium', 'enterprise'].includes(plan)) {
    return c.json({ 
      error: 'Invalid plan',
      message: 'x-plan header must be one of: free, premium, enterprise'
    }, 400);
  }
  
  // Find existing subscription
  const subscriptionId = Object.keys(subscriptions).find(id => 
    subscriptions[id].userId === userId
  );
  
  if (!subscriptionId) {
    return c.json({ 
      error: 'Subscription not found',
      message: 'No subscription found for this user'
    }, 404);
  }
  
  // Update subscription in mock data
  subscriptions[subscriptionId] = {
    ...subscriptions[subscriptionId],
    plan: plan as 'free' | 'premium' | 'enterprise'
  };
  
  return c.json({
    success: true,
    message: 'Subscription upgraded successfully',
    data: subscriptions[subscriptionId]
  });
});

// Cancel subscription
app.post('/cancel', async (c) => {
  const userId = c.req.header('x-user-id');
  const reason = c.req.header('x-cancel-reason');
  
  if (!userId) {
    return c.json({ 
      error: 'Missing user ID',
      message: 'x-user-id header is required'
    }, 400);
  }
  
  // Find existing subscription
  const subscriptionId = Object.keys(subscriptions).find(id => 
    subscriptions[id].userId === userId
  );
  
  if (!subscriptionId) {
    return c.json({ 
      error: 'Subscription not found',
      message: 'No subscription found for this user'
    }, 404);
  }
  
  // Cancel subscription in mock data
  subscriptions[subscriptionId] = {
    ...subscriptions[subscriptionId],
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: subscriptions[subscriptionId]
  });
});

// Get billing history
  app.get('/billing', (c) => {
  const userId = c.req.header('x-user-id');
  
  if (!userId) {
    return c.json({ 
      error: 'Missing user ID',
      message: 'x-user-id header is required'
    }, 400);
  }
  
  // Mock billing history
  const billingHistory = [
    {
      id: 'bill-1',
      amount: 29.99,
      currency: 'USD',
      status: 'paid',
      date: '2024-01-01T00:00:00Z',
      description: 'Premium Plan - January 2024'
    },
    {
      id: 'bill-2',
      amount: 29.99,
      currency: 'USD',
      status: 'paid',
      date: '2023-12-01T00:00:00Z',
      description: 'Premium Plan - December 2023'
    }
  ];
  
  return c.json({
    success: true,
    data: billingHistory
  });
});

export default app; 