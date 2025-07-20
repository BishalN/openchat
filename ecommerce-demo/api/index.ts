import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import subscriptionsRouter from './routes/subscriptions';
import ordersRouter from './routes/orders';
import inventoryRouter from './routes/inventory';
import { inventory } from './mock-data/inventory';
import { users } from './mock-data/users';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'x-user-id', 'x-user-hash'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Public products endpoint (no auth required)
app.get('/api/products', (c) => {
  const products = Object.values(inventory).map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.category,
    inStock: product.inStock,
    images: product.images,
    tags: product.tags
  }));
  
  return c.json({
    success: true,
    data: products
  });
});

// API Routes
app.route('/api/subscriptions', subscriptionsRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/inventory', inventoryRouter);

// Demo identity generation endpoint
app.get('/api/demo/identity/:userId', (c) => {
  const userId = c.req.param('userId');
  const secretKey = process.env.AGENT_SECRET_KEY || 'demo-secret-key';
  
  // Generate HMAC hash
  const crypto = require('crypto');
  const userHash = crypto
    .createHmac('sha256', secretKey)
    .update(userId)
    .digest('hex');
  
  return c.json({
    userId,
    userHash,
    headers: {
      'x-user-id': userId,
      'x-user-hash': userHash
    }
  });
});

// Demo users endpoint
app.get('/api/demo/users', (c) => {
  return c.json({
    success: true,
    data: Object.values(users).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      subscription: user.subscription,
      permissions: user.permissions
    }))
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/subscriptions/:userId/status',
      'POST /api/subscriptions/:userId/upgrade',
      'POST /api/subscriptions/:userId/cancel',
      'GET /api/subscriptions/:userId/billing',
      'GET /api/orders/:orderId/status',
      'GET /api/orders/user/:userId/history',
      'GET /api/orders/:orderId/details',
      'POST /api/orders/:orderId/cancel',
      'POST /api/orders/:orderId/refund',
      'GET /api/inventory/:productId',
      'GET /api/inventory',
      'POST /api/inventory/:productId/reserve',
      'POST /api/inventory/:productId/release',
      'PUT /api/inventory/:productId/update',
      'GET /api/inventory/alerts/low-stock',
      'GET /api/demo/identity/:userId',
      'GET /api/demo/users'
    ]
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end',
    timestamp: new Date().toISOString()
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3001');
console.log(`🚀 E-commerce Demo API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
}); 