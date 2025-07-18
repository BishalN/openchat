# Custom Actions Integration with LLM Tools

This document explains how custom actions are integrated as tools into the LLM system in ChatBuddy.

## Overview

Custom actions allow users to define external API integrations that can be called by the LLM during conversations. These actions are dynamically converted into tools that the LLM can use when appropriate.

## Architecture

### 1. Database Schema

Custom actions are stored in the `custom_actions` table with the following structure:

```typescript
type CustomActionConfig = {
  dataInputs: DataInput[];           // Parameters the LLM can provide
  apiMethod: "GET" | "POST" | "PUT" | "DELETE";
  apiUrl: string;                    // External API endpoint
  parameters: KeyValuePair[];        // Static query parameters
  headers: KeyValuePair[];           // HTTP headers
  body: KeyValuePair[];              // Static body parameters
  dataAccessType: "full" | "limited"; // Data access control
  allowedFields?: string[];          // Fields accessible when limited
  exampleResponse?: string;          // Example response for LLM
};
```

### 2. Tool Generation Process

When a chat request is made:

1. **Fetch Custom Actions**: Query the database for all active custom actions for the agent
2. **Create Dynamic Tools**: Convert each custom action into a tool definition
3. **Generate Parameter Schema**: Create Zod schemas based on the action's data inputs
4. **Execute Actions**: Handle API calls with proper error handling and data filtering

### 3. Integration Points

#### Private Chat (`/api/chat`)
- Authenticated users can use custom actions
- Actions are scoped to the user's agents
- Full telemetry and logging

#### Public Chat (`/api/public-chat`)
- Public agents can use custom actions
- Actions are scoped to the specific agent
- Identity verification for public access

## Usage Examples

### Example 1: Weather API Integration

```typescript
// Custom Action Configuration
{
  name: "getWeather",
  whenToUse: "When user asks about weather conditions",
  config: {
    dataInputs: [
      { name: "city", type: "Text", description: "City name", array: false },
      { name: "country", type: "Text", description: "Country code", array: false }
    ],
    apiMethod: "GET",
    apiUrl: "https://api.weatherapi.com/v1/current.json",
    parameters: [
      { key: "key", value: "YOUR_API_KEY" }
    ],
    headers: [],
    body: [],
    dataAccessType: "limited",
    allowedFields: ["location", "current.temp_c", "current.condition.text"]
  }
}
```

**LLM Usage:**
```
User: "What's the weather like in London?"
LLM: [Calls getWeather tool with city="London", country="UK"]
Response: "The current temperature in London is 18°C with partly cloudy conditions."
```

### Example 2: Database Query Tool

```typescript
// Custom Action Configuration
{
  name: "searchProducts",
  whenToUse: "When user asks about products or inventory",
  config: {
    dataInputs: [
      { name: "query", type: "Text", description: "Search term", array: false },
      { name: "category", type: "Text", description: "Product category", array: false }
    ],
    apiMethod: "POST",
    apiUrl: "https://api.example.com/products/search",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_TOKEN" }
    ],
    body: [
      { key: "limit", value: "10" }
    ],
    dataAccessType: "full"
  }
}
```

## Implementation Details

### 1. Dynamic Tool Creation

```typescript
// lib/ai/custom-actions.ts
export async function createCustomActionTools(agentId: string, trace: any) {
  const customActions = await db.query.customActionsTable.findMany({
    where: and(
      eq(customActionsTable.agentId, agentId),
      eq(customActionsTable.isActive, true)
    ),
  });

  const customTools: Record<string, any> = {};

  for (const action of customActions) {
    // Create dynamic parameter schema
    const parameterSchema: Record<string, any> = {};
    action.config.dataInputs.forEach((input: any) => {
      let schema;
      switch (input.type) {
        case 'Number': schema = z.number(); break;
        case 'Boolean': schema = z.boolean(); break;
        case 'Date': schema = z.string(); break;
        default: schema = z.string();
      }
      
      if (input.array) {
        schema = z.array(schema);
      }
      
      parameterSchema[input.name] = schema.describe(input.description);
    });

    customTools[action.name] = {
      description: action.whenToUse,
      parameters: z.object(parameterSchema),
      execute: async (params: any) => {
        return await executeCustomAction(action, params, trace);
      },
    };
  }

  return customTools;
}
```

### 2. Action Execution

```typescript
export async function executeCustomAction(action: any, parameters: any, trace: any) {
  const { config } = action;
  
  // Build the request
  const url = new URL(config.apiUrl);
  
  // Add static parameters
  config.parameters.forEach((param: any) => {
    url.searchParams.append(param.key, param.value);
  });

  // Add dynamic parameters from LLM
  Object.entries(parameters).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  // Execute the request
  const response = await fetch(url.toString(), {
    method: config.apiMethod,
    headers: config.headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
    body: config.apiMethod !== 'GET' ? JSON.stringify(config.body.reduce((acc, b) => ({ ...acc, [b.key]: b.value }), {})) : undefined,
  });

  const result = await response.json();
  
  // Filter data if limited access
  if (config.dataAccessType === 'limited' && config.allowedFields) {
    return config.allowedFields.reduce((acc, field) => {
      if (result[field] !== undefined) {
        acc[field] = result[field];
      }
      return acc;
    }, {});
  }

  return result;
}
```

## Security Considerations

### 1. Data Access Control
- **Full Access**: Returns complete API response
- **Limited Access**: Only returns specified fields from `allowedFields`

### 2. Authentication
- Private chat: User authentication required
- Public chat: Agent identity verification
- API credentials stored securely in action configuration

### 3. Input Validation
- All LLM inputs are validated against the defined schema
- Type checking for numbers, booleans, dates, and strings
- Array support for multiple values

## Monitoring and Telemetry

### 1. Langfuse Integration
- All custom action executions are traced
- Input parameters and output results are logged
- Error handling with proper error messages

### 2. Performance Monitoring
- Execution time tracking
- Success/failure rates
- API response times

## Best Practices

### 1. Action Design
- Use clear, descriptive names for actions
- Provide detailed `whenToUse` descriptions
- Include example responses when possible
- Use limited data access for sensitive APIs

### 2. Error Handling
- Implement proper error handling in external APIs
- Provide meaningful error messages
- Use appropriate HTTP status codes

### 3. Performance
- Keep API responses concise
- Use caching when appropriate
- Implement rate limiting for external APIs

## Future Enhancements

### 1. Caching Layer
- Cache frequently used API responses
- Implement cache invalidation strategies

### 2. Rate Limiting
- Per-user rate limiting for custom actions
- Per-action rate limiting

### 3. Advanced Features
- Webhook support for real-time updates
- Batch processing for multiple actions
- Action chaining and dependencies

### 4. UI Improvements
- Visual action builder
- Action testing interface
- Usage analytics dashboard 