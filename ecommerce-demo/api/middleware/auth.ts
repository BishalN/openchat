import { Context, Next } from 'hono';
import crypto from 'crypto';
import { users } from '../mock-data/users';

export interface AuthenticatedContext extends Context {
  user: {
    id: string;
    email: string;
    name: string;
    subscription: string;
    permissions: string[];
  };
}

export async function authMiddleware(c: Context, next: Next) {
  const userId = c.req.header('x-user-id');
  const userHash = c.req.header('x-user-hash');
  
  // Skip auth for public endpoints
  if (c.req.path === '/api/health' || c.req.path === '/api/products') {
    return next();
  }
  
  if (!userId || !userHash) {
    return c.json({ 
      error: 'Identity verification required',
      message: 'Please provide x-user-id and x-user-hash headers'
    }, 401);
  }
  
  // Verify the user exists
  const user = users[userId];
  if (!user) {
    return c.json({ 
      error: 'User not found',
      message: 'Invalid user ID provided'
    }, 404);
  }
  
  // Verify HMAC signature
  const secretKey = "7471ff593246647c9945a8900dad3c9666bdad4f4934028861a1bdfcdb0ae0b3";
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(userId)
    .digest('hex');
    
  if (computedHash !== userHash) {
    return c.json({ 
      error: 'Invalid identity',
      message: 'Identity verification failed'
    }, 401);
  }
  
  // Add user to context
  (c as any).user = {
    id: user.id,
    email: user.email,
    name: user.name,
    subscription: user.subscription,
    permissions: user.permissions
  };
  
  await next();
}

