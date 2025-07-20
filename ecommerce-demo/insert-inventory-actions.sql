-- Insert Inventory Custom Actions
-- Replace 'd87f6f6c-f490-463d-9db5-4e0ab771d343' with your actual agent ID

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