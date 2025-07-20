-- Insert All Ecommerce Custom Actions (Inventory + Orders)
-- Replace 'd87f6f6c-f490-463d-9db5-4e0ab771d343' with your actual agent ID

-- ========================================
-- INVENTORY ACTIONS
-- ========================================

-- 1. Get Product Inventory
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get Product Inventory',
  'When you need to check the current inventory status and stock levels for a specific product',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/product",
    "headers": [
      {
        "key": "x-product-id",
        "value": "{{productId}}"
      }
    ],
    "apiMethod": "GET",
    "dataInputs": [
      {
        "name": "productId",
        "type": "Text",
        "array": false,
        "description": "The product ID to check inventory for"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 2. Get All Products Inventory
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get All Products Inventory',
  'When you need to retrieve inventory information for all products in the system',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/",
    "headers": [],
    "apiMethod": "GET",
    "dataInputs": [],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 3. Reserve Inventory
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Reserve Inventory',
  'When you need to reserve inventory for a product during the ordering process',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/reserve",
    "headers": [
      {
        "key": "x-product-id",
        "value": "{{productId}}"
      },
      {
        "key": "x-quantity",
        "value": "{{quantity}}"
      }
    ],
    "apiMethod": "POST",
    "dataInputs": [
      {
        "name": "productId",
        "type": "Text",
        "array": false,
        "description": "The product ID to reserve inventory for"
      },
      {
        "name": "quantity",
        "type": "Number",
        "array": false,
        "description": "The quantity to reserve (must be greater than 0)"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 4. Release Reserved Inventory
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Release Reserved Inventory',
  'When you need to release previously reserved inventory (e.g., when an order is cancelled)',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/release",
    "headers": [
      {
        "key": "x-product-id",
        "value": "{{productId}}"
      },
      {
        "key": "x-quantity",
        "value": "{{quantity}}"
      },
      {
        "key": "x-reservation-id",
        "value": "{{reservationId}}"
      }
    ],
    "apiMethod": "POST",
    "dataInputs": [
      {
        "name": "productId",
        "type": "Text",
        "array": false,
        "description": "The product ID to release inventory for"
      },
      {
        "name": "quantity",
        "type": "Number",
        "array": false,
        "description": "The quantity to release (must be greater than 0)"
      },
      {
        "name": "reservationId",
        "type": "Text",
        "array": false,
        "description": "Optional reservation ID for tracking"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 5. Update Inventory Levels
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Update Inventory Levels',
  'When you need to update inventory levels for a product (admin function)',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/update",
    "headers": [
      {
        "key": "x-product-id",
        "value": "{{productId}}"
      },
      {
        "key": "x-quantity",
        "value": "{{quantity}}"
      },
      {
        "key": "x-location",
        "value": "{{location}}"
      }
    ],
    "apiMethod": "PUT",
    "dataInputs": [
      {
        "name": "productId",
        "type": "Text",
        "array": false,
        "description": "The product ID to update inventory for"
      },
      {
        "name": "quantity",
        "type": "Number",
        "array": false,
        "description": "The new total quantity (cannot be negative)"
      },
      {
        "name": "location",
        "type": "Text",
        "array": false,
        "description": "Optional new location for the inventory"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 6. Get Low Stock Alerts
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get Low Stock Alerts',
  'When you need to identify products that are running low on stock',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/inventory/alerts/low-stock",
    "headers": [],
    "apiMethod": "GET",
    "dataInputs": [],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- ========================================
-- ORDERS ACTIONS
-- ========================================

-- 7. Get Order Status
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get Order Status',
  'When you need to check the current status and tracking information for a specific order',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/orders/status",
    "headers": [
      {
        "key": "x-order-id",
        "value": "{{orderId}}"
      }
    ],
    "apiMethod": "GET",
    "dataInputs": [
      {
        "name": "orderId",
        "type": "Text",
        "array": false,
        "description": "The order ID to check status for"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 8. Get Order History
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get Order History',
  'When you need to retrieve the complete order history for a user',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/orders/history",
    "headers": [
      {
        "key": "x-user-id",
        "value": "{{userId}}"
      }
    ],
    "apiMethod": "GET",
    "dataInputs": [
      {
        "name": "userId",
        "type": "Text",
        "array": false,
        "description": "The user ID to get order history for"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 9. Get Order Details
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Get Order Details',
  'When you need to retrieve complete details and items for a specific order',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/orders/details",
    "headers": [
      {
        "key": "x-order-id",
        "value": "{{orderId}}"
      }
    ],
    "apiMethod": "GET",
    "dataInputs": [
      {
        "name": "orderId",
        "type": "Text",
        "array": false,
        "description": "The order ID to get details for"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 10. Cancel Order
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Cancel Order',
  'When you need to cancel an order that has not been shipped yet',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/orders/cancel",
    "headers": [
      {
        "key": "x-order-id",
        "value": "{{orderId}}"
      },
      {
        "key": "x-cancel-reason",
        "value": "{{cancelReason}}"
      }
    ],
    "apiMethod": "POST",
    "dataInputs": [
      {
        "name": "orderId",
        "type": "Text",
        "array": false,
        "description": "The order ID to cancel"
      },
      {
        "name": "cancelReason",
        "type": "Text",
        "array": false,
        "description": "Optional reason for cancellation"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
);

-- 11. Request Refund
INSERT INTO custom_actions (agent_id, name, when_to_use, config, is_active, created_at, updated_at)
VALUES (
  'd87f6f6c-f490-463d-9db5-4e0ab771d343',
  'Request Refund',
  'When you need to request a refund for a delivered order',
  '{
    "body": [],
    "apiUrl": "http://localhost:3001/api/orders/refund",
    "headers": [
      {
        "key": "x-order-id",
        "value": "{{orderId}}"
      },
      {
        "key": "x-refund-reason",
        "value": "{{refundReason}}"
      }
    ],
    "apiMethod": "POST",
    "dataInputs": [
      {
        "name": "orderId",
        "type": "Text",
        "array": false,
        "description": "The order ID to request refund for"
      },
      {
        "name": "refundReason",
        "type": "Text",
        "array": false,
        "description": "Optional reason for refund request"
      }
    ],
    "parameters": [],
    "dataAccessType": "full"
  }',
  true,
  NOW(),
  NOW()
); 