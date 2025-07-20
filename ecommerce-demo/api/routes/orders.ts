import { Hono } from 'hono';
import { orders } from '../mock-data/orders';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Apply auth middleware to all routes
app.use('*', authMiddleware);

// Get order status by order ID
app.get('/status', (c: any) => {
  const orderId = c.req.header('x-order-id');
  const user = (c as any).user;
  
  if (!orderId) {
    return c.json({ 
      error: 'Missing order ID',
      message: 'x-order-id header is required'
    }, 400);
  }
  
  const order = orders[orderId];
  
  if (!order) {
    return c.json({ 
      error: 'Order not found',
      message: 'Order with this ID does not exist'
    }, 404);
  }
  
  // Check if user owns this order
  if (order.userId !== user.id) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'You can only view your own orders'
    }, 403);
  }
  
  return c.json({
    success: true,
    data: {
      id: order.id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  });
});

// Get order history for a user
app.get('/history', (c: any) => {
  const userId = c.req.header('x-user-id');
  const user = (c as any).user;
  
  if (!userId) {
    return c.json({ 
      error: 'Missing user ID',
      message: 'x-user-id header is required'
    }, 400);
  }
  
  // Check if user is requesting their own history
  if (userId !== user.id) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'You can only view your own order history'
    }, 403);
  }
  
  // Get all orders for this user
  const userOrders = Object.values(orders).filter(order => order.userId === userId);
  
  return c.json({
    success: true,
    data: userOrders.map(order => ({
      id: order.id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }))
  });
});

// Get order details by order ID
app.get('/details', (c: any) => {
  const orderId = c.req.header('x-order-id');
  const user = (c as any).user;

  console.log(orderId);
  
  if (!orderId) {
    return c.json({ 
      error: 'Missing order ID',
      message: 'x-order-id header is required'
    }, 400);
  }
  
  const order = orders[orderId];
  
  if (!order) {
    return c.json({ 
      error: 'Order not found',
      message: 'Order with this ID does not exist'
    }, 404);
  }
  
  // Check if user owns this order
  if (order.userId !== user.id) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'You can only view your own orders'
    }, 403);
  }
  
  return c.json({
    success: true,
    data: order
  });
});

// Cancel an order
app.post('/cancel', async (c: any) => {
  const orderId = c.req.header('x-order-id');
  const reason = c.req.header('x-cancel-reason');
  const user = (c as any).user;
  
  if (!orderId) {
    return c.json({ 
      error: 'Missing order ID',
      message: 'x-order-id header is required'
    }, 400);
  }
  
  const order = orders[orderId];
  
  if (!order) {
    return c.json({ 
      error: 'Order not found',
      message: 'Order with this ID does not exist'
    }, 404);
  }
  
  // Check if user owns this order
  if (order.userId !== user.id) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'You can only cancel your own orders'
    }, 403);
  }
  
  // Check if order can be cancelled
  if (order.status === 'shipped' || order.status === 'delivered') {
    return c.json({ 
      error: 'Cannot cancel order',
      message: 'Order has already been shipped or delivered'
    }, 400);
  }
  
  if (order.status === 'cancelled') {
    return c.json({ 
      error: 'Order already cancelled',
      message: 'This order has already been cancelled'
    }, 400);
  }
  
  // Cancel the order
  const cancelledOrder = {
    ...order,
    status: 'cancelled',
    cancelReason: reason || 'No reason provided',
    updatedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: 'Order cancelled successfully',
    data: cancelledOrder
  });
});

// Request refund for an order
app.post('/refund', async (c: any) => {
  const orderId = c.req.header('x-order-id');
  const reason = c.req.header('x-refund-reason');
  const user = (c as any).user;
  
  if (!orderId) {
    return c.json({ 
      error: 'Missing order ID',
      message: 'x-order-id header is required'
    }, 400);
  }
  
  const order = orders[orderId];
  
  if (!order) {
    return c.json({ 
      error: 'Order not found',
      message: 'Order with this ID does not exist'
    }, 404);
  }
  
  // Check if user owns this order
  if (order.userId !== user.id) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'You can only request refunds for your own orders'
    }, 403);
  }
  
  // Check if order is eligible for refund
  if (order.status !== 'delivered') {
    return c.json({ 
      error: 'Cannot request refund',
      message: 'Order must be delivered to request a refund'
    }, 400);
  }
  
  // Create refund request
  const refundRequest = {
    id: `refund-${orderId}`,
    orderId: order.id,
    amount: order.total,
    currency: order.currency,
    reason: reason || 'Customer request',
    status: 'pending',
    requestedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: 'Refund request submitted successfully',
    data: refundRequest
  });
});

export default app; 