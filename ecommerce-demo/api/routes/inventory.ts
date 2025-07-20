import { Hono } from 'hono';
import { inventory } from '../mock-data/inventory';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Apply auth middleware to all routes
app.use('*', authMiddleware);

// Get product inventory by product ID
app.get('/product', (c: any) => {
  const productId = c.req.header('x-product-id');
  
  if (!productId) {
    return c.json({ 
      error: 'Missing product ID',
      message: 'x-product-id header is required'
    }, 400);
  }
  
  const product = inventory[productId];
  
  if (!product) {
    return c.json({ 
      error: 'Product not found',
      message: 'Product with this ID does not exist'
    }, 404);
  }
  
  return c.json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      inStock: product.inStock,
      quantity: product.quantity,
      available: product.available,
      reserved: product.reserved,
      location: product.location,
      sku: product.sku
    }
  });
});

// Get all products inventory
app.get('/', (c: any) => {
  const products = Object.values(inventory).map(product => ({
    id: product.id,
    name: product.name,
    inStock: product.inStock,
    quantity: product.quantity,
    available: product.available,
    reserved: product.reserved,
    location: product.location,
    sku: product.sku,
    category: product.category
  }));
  
  return c.json({
    success: true,
    data: products
  });
});

// Reserve inventory for a product
app.post('/reserve', async (c: any) => {
  const productId = c.req.header('x-product-id');
  const quantity = parseInt(c.req.header('x-quantity') || '0');
  
  if (!productId) {
    return c.json({ 
      error: 'Missing product ID',
      message: 'x-product-id header is required'
    }, 400);
  }
  
  if (!quantity || quantity <= 0) {
    return c.json({ 
      error: 'Invalid quantity',
      message: 'x-quantity header must be greater than 0'
    }, 400);
  }
  
  const product = inventory[productId];
  
  if (!product) {
    return c.json({ 
      error: 'Product not found',
      message: 'Product with this ID does not exist'
    }, 404);
  }
  
  if (!product.inStock) {
    return c.json({ 
      error: 'Product out of stock',
      message: 'This product is currently out of stock'
    }, 400);
  }
  
  if (product.available < quantity) {
    return c.json({ 
      error: 'Insufficient stock',
      message: `Only ${product.available} units available, requested ${quantity}`
    }, 400);
  }
  
  // Reserve the inventory
  const updatedProduct = {
    ...product,
    reserved: product.reserved + quantity,
    available: product.available - quantity,
    updatedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: `${quantity} units reserved successfully`,
    data: {
      productId: product.id,
      reserved: updatedProduct.reserved,
      available: updatedProduct.available,
      reservationId: `res-${productId}-${Date.now()}`
    }
  });
});

// Release reserved inventory
app.post('/release', async (c: any) => {
  const productId = c.req.header('x-product-id');
  const quantity = parseInt(c.req.header('x-quantity') || '0');
  const reservationId = c.req.header('x-reservation-id');
  
  if (!productId) {
    return c.json({ 
      error: 'Missing product ID',
      message: 'x-product-id header is required'
    }, 400);
  }
  
  if (!quantity || quantity <= 0) {
    return c.json({ 
      error: 'Invalid quantity',
      message: 'x-quantity header must be greater than 0'
    }, 400);
  }
  
  const product = inventory[productId];
  
  if (!product) {
    return c.json({ 
      error: 'Product not found',
      message: 'Product with this ID does not exist'
    }, 404);
  }
  
  if (product.reserved < quantity) {
    return c.json({ 
      error: 'Invalid release quantity',
      message: `Only ${product.reserved} units are reserved, cannot release ${quantity}`
    }, 400);
  }
  
  // Release the reserved inventory
  const updatedProduct = {
    ...product,
    reserved: product.reserved - quantity,
    available: product.available + quantity,
    updatedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: `${quantity} units released successfully`,
    data: {
      productId: product.id,
      reserved: updatedProduct.reserved,
      available: updatedProduct.available
    }
  });
});

// Update inventory levels (admin only)
app.put('/update', async (c: any) => {
  const productId = c.req.header('x-product-id');
  const quantity = parseInt(c.req.header('x-quantity') || '0');
  const location = c.req.header('x-location');
  
  if (!productId) {
    return c.json({ 
      error: 'Missing product ID',
      message: 'x-product-id header is required'
    }, 400);
  }
  
  const product = inventory[productId];
  
  if (!product) {
    return c.json({ 
      error: 'Product not found',
      message: 'Product with this ID does not exist'
    }, 404);
  }
  
  if (quantity < 0) {
    return c.json({ 
      error: 'Invalid quantity',
      message: 'x-quantity header cannot be negative'
    }, 400);
  }
  
  // Update inventory
  const updatedProduct = {
    ...product,
    quantity: quantity,
    available: quantity - product.reserved,
    inStock: quantity > 0,
    location: location || product.location,
    updatedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    message: 'Inventory updated successfully',
    data: {
      id: updatedProduct.id,
      name: updatedProduct.name,
      quantity: updatedProduct.quantity,
      available: updatedProduct.available,
      reserved: updatedProduct.reserved,
      inStock: updatedProduct.inStock,
      location: updatedProduct.location
    }
  });
});

// Get low stock alerts
app.get('/alerts/low-stock', (c: any) => {
  const lowStockThreshold = 10;
  const lowStockProducts = Object.values(inventory)
    .filter(product => product.available <= lowStockThreshold)
    .map(product => ({
      id: product.id,
      name: product.name,
      available: product.available,
      threshold: lowStockThreshold,
      location: product.location,
      sku: product.sku
    }));
  
  return c.json({
    success: true,
    data: {
      threshold: lowStockThreshold,
      products: lowStockProducts,
      count: lowStockProducts.length
    }
  });
});

export default app; 