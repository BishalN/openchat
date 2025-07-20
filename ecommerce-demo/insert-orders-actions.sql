-- Insert Orders Custom Actions
-- Replace 'd87f6f6c-f490-463d-9db5-4e0ab771d343' with your actual agent ID

-- 1. Get Order Status
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

-- 2. Get Order History
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

-- 3. Get Order Details
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

-- 4. Cancel Order
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

-- 5. Request Refund
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