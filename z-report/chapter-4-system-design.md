# Chapter 4: System Design

## 4.1 Design

### 4.1.1 Object-Oriented Design

#### Entity-Relationship (ER) Diagrams

The system design is represented through comprehensive ER diagrams showing the database structure and relationships:

**Main Database Schema ER Diagram**

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text name
        integer age
        text email UK
        timestamp created_at
        timestamp updated_at
    }
    
    AGENTS {
        uuid id PK
        text name
        text description
        text secret_key
        uuid user_id FK
        boolean is_public
        jsonb config
        timestamp created_at
        timestamp updated_at
    }
    
    SOURCES {
        uuid id PK
        uuid agent_id FK
        enum type
        text name
        jsonb details
        timestamp created_at
        timestamp updated_at
    }
    
    EMBEDDINGS {
        uuid id PK
        uuid source_id FK
        text content
        vector embedding
        integer chunk_index
        jsonb metadata
        timestamp created_at
    }
    
    CUSTOM_ACTIONS {
        uuid id PK
        uuid agent_id FK
        text name
        text when_to_use
        jsonb config
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CONVERSATIONS {
        uuid id PK
        uuid agent_id FK
        uuid user_id FK
        jsonb identity
        text title
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        varchar role
        jsonb parts
        integer order
        timestamp created_at
    }
    
    AGENT_CHAT_INTERFACE_CONFIGS {
        uuid id PK
        uuid agent_id FK UK
        jsonb config
        timestamp created_at
        timestamp updated_at
    }
    
    PROFILES ||--o{ AGENTS : "creates"
    AGENTS ||--o{ SOURCES : "has"
    SOURCES ||--o{ EMBEDDINGS : "generates"
    AGENTS ||--o{ CUSTOM_ACTIONS : "defines"
    AGENTS ||--o{ CONVERSATIONS : "participates_in"
    PROFILES ||--o{ CONVERSATIONS : "participates_in"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    AGENTS ||--|| AGENT_CHAT_INTERFACE_CONFIGS : "has_config"
```

**Source Types and Details ER Diagram**

```mermaid
erDiagram
    SOURCES {
        uuid id PK
        uuid agent_id FK
        enum type
        text name
        jsonb details
        timestamp created_at
        timestamp updated_at
    }
    
    FILE_SOURCE_DETAILS {
        text fileUrl
        number fileSize
        text mimeType
        number characterCount
    }
    
    TEXT_SOURCE_DETAILS {
        text content
    }
    
    WEBSITE_SOURCE_DETAILS {
        text url
        text title
        text content
    }
    
    QA_SOURCE_DETAILS {
        array pairs
    }
    
    SOURCES ||--o| FILE_SOURCE_DETAILS : "file_type"
    SOURCES ||--o| TEXT_SOURCE_DETAILS : "text_type"
    SOURCES ||--o| WEBSITE_SOURCE_DETAILS : "website_type"
    SOURCES ||--o| QA_SOURCE_DETAILS : "qa_type"
```

**Custom Action Configuration ER Diagram**

```mermaid
erDiagram
    CUSTOM_ACTIONS {
        uuid id PK
        uuid agent_id FK
        text name
        text when_to_use
        jsonb config
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOM_ACTION_CONFIG {
        array dataInputs
        enum apiMethod
        text apiUrl
        array parameters
        array headers
        array body
        enum dataAccessType
        array allowedFields
        text exampleResponse
    }
    
    DATA_INPUT {
        text name
        enum type
        text description
        boolean array
    }
    
    KEY_VALUE_PAIR {
        text key
        text value
    }
    
    CUSTOM_ACTIONS ||--|| CUSTOM_ACTION_CONFIG : "has_config"
    CUSTOM_ACTION_CONFIG ||--o{ DATA_INPUT : "contains"
    CUSTOM_ACTION_CONFIG ||--o{ KEY_VALUE_PAIR : "parameters"
    CUSTOM_ACTION_CONFIG ||--o{ KEY_VALUE_PAIR : "headers"
    CUSTOM_ACTION_CONFIG ||--o{ KEY_VALUE_PAIR : "body"
```

**Agent Configuration and Chat Interface ER Diagram**

```mermaid
erDiagram
    AGENTS {
        uuid id PK
        text name
        text description
        text secret_key
        uuid user_id FK
        boolean is_public
        jsonb config
        timestamp created_at
        timestamp updated_at
    }
    
    AGENT_CONFIG {
        number temperature
        text model
        text systemPrompt
    }
    
    AGENT_CHAT_INTERFACE_CONFIGS {
        uuid id PK
        uuid agent_id FK UK
        jsonb config
        timestamp created_at
        timestamp updated_at
    }
    
    CHAT_INTERFACE_CONFIG {
        text displayName
        text profilePicture
        text chatBubbleTriggerIcon
        text userMessageColor
        boolean syncUserMessageColorWithAgentHeader
        text chatBubbleButtonColor
        text initialMessages
        array suggestedMessages
        text messagePlaceholder
        text footer
        text dismissibleNotice
    }
    
    AGENTS ||--|| AGENT_CONFIG : "has_config"
    AGENTS ||--|| AGENT_CHAT_INTERFACE_CONFIGS : "has_interface"
    AGENT_CHAT_INTERFACE_CONFIGS ||--|| CHAT_INTERFACE_CONFIG : "contains"
```

**Conversation and Message Flow ER Diagram**

```mermaid
erDiagram
    CONVERSATIONS {
        uuid id PK
        uuid agent_id FK
        uuid user_id FK
        jsonb identity
        text title
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        varchar role
        jsonb parts
        integer order
        timestamp created_at
    }
    
    IDENTITY {
        text user_id
        text user_hash
        jsonb user_metadata
    }
    
    MESSAGE_PART {
        text type
        text content
        jsonb metadata
    }
    
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    CONVERSATIONS ||--|| IDENTITY : "has_identity"
    MESSAGES ||--o{ MESSAGE_PART : "contains_parts"
```

#### Sequence Diagrams

**Agent Creation and Training Sequence**
```
User -> Frontend: Create Agent
Frontend -> tRPC: createAgent(agentData)
tRPC -> Database: Insert Agent
Database -> tRPC: Agent Created
tRPC -> Frontend: Agent Response
Frontend -> User: Agent Created

User -> Frontend: Add Sources
Frontend -> tRPC: addSource(sourceData)
tRPC -> FileProcessor: Process Files
FileProcessor -> TextSplitter: Split Content
TextSplitter -> EmbeddingService: Generate Embeddings
EmbeddingService -> Database: Store Embeddings
tRPC -> Frontend: Sources Added
Frontend -> User: Training Complete
```

**Chat Interaction Sequence**
```
User -> ChatInterface: Send Message
ChatInterface -> tRPC: sendMessage(message)
tRPC -> ConversationService: Add Message
ConversationService -> Database: Store Message
tRPC -> AIProcessor: Process with Context
AIProcessor -> EmbeddingService: Find Relevant Context
EmbeddingService -> Database: Query Embeddings
AIProcessor -> GeminiAPI: Generate Response
GeminiAPI -> AIProcessor: Response
AIProcessor -> tRPC: Formatted Response
tRPC -> ConversationService: Add AI Message
ConversationService -> Database: Store AI Message
tRPC -> ChatInterface: Response
ChatInterface -> User: Display Response
```

#### Activity Diagrams

**Agent Creation Workflow**
```
[Start] -> [User Authentication]
[User Authentication] -> [Agent Configuration]
[Agent Configuration] -> [Source Addition]
[Source Addition] -> [File Processing] (Parallel)
[Source Addition] -> [Text Processing] (Parallel)
[Source Addition] -> [Website Scraping] (Parallel)
[File Processing] -> [Text Extraction]
[Text Extraction] -> [Content Chunking]
[Content Chunking] -> [Embedding Generation]
[Embedding Generation] -> [Database Storage]
[Database Storage] -> [Training Completion]
[Training Completion] -> [Agent Ready]
[Agent Ready] -> [End]
```

**Custom Action Execution Workflow**
```
[Start] -> [Action Trigger]
[Action Trigger] -> [Input Validation]
[Input Validation] -> [API Request Preparation]
[API Request Preparation] -> [External API Call]
[External API Call] -> [Response Processing]
[Response Processing] -> [Data Filtering] (if limited access)
[Data Filtering] -> [Response Formatting]
[Response Formatting] -> [AI Integration]
[AI Integration] -> [End]
```

### 4.1.2 Component Diagrams

**System Architecture Components**

```mermaid
graph TB
    subgraph "Frontend"
        A[Dashboard]
        B[Chat Widget]
    end
    
    subgraph "API Layer"
        C[tRPC Server]
    end
    
    subgraph "Business Logic"
        D[Agent Service]
        E[AI Processor]
    end
    
    subgraph "Data Layer"
        F[PostgreSQL]
        G[Vector DB]
    end
    
    subgraph "External"
        H[Gemini API]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    D --> F
    E --> G
    E --> H
```

**Agent Component Architecture**

```mermaid
graph LR
    subgraph "Agent System"
        A[Agent Manager]
        B[Training Engine]
        C[Chat Engine]
    end
    
    A --> B
    A --> C
    B --> C
```

### 4.1.3 Deployment Diagrams

**Production Deployment Architecture**

```mermaid
graph TB
    subgraph "Internet"
        A[Users]
    end
    
    subgraph "Vercel Platform"
        B[Next.js App]
        C[API Routes]
    end
    
    subgraph "Supabase Cloud"
        D[PostgreSQL]
        E[Vector DB]
        F[File Storage]
    end
    
    subgraph "External Services"
        G[Gemini API]
    end
    
    A --> B
    A --> C
    B --> D
    C --> D
    C --> E
    C --> F
    C --> G
```

**Development Environment**

```mermaid
graph LR
    subgraph "Local Development"
        A[Next.js Dev Server]
        B[Supabase Local]
    end
    
    subgraph "External"
        C[Gemini API]
    end
    
    A --> B
    A --> C
```

## 4.2 Algorithm Details

### 4.2.1 Agent Training and Knowledge Processing Workflow

**Complete Training Pipeline**

```mermaid
flowchart TD
    A[User Uploads Sources] --> B{Source Type?}
    B -->|File| C[File Processing]
    B -->|Text| D[Text Processing]
    B -->|Website| E[Website Scraping]
    B -->|QA| F[QA Processing]
    
    C --> G[Text Extraction]
    D --> G
    E --> G
    F --> G
    
    G --> H[Content Chunking]
    H --> I[Generate Embeddings]
    I --> J[Store in Vector DB]
    J --> K[Update Training Status]
    K --> L[Agent Ready]
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
```

### 4.2.2 Chat Response Generation Workflow

**Intelligent Response Pipeline**

```mermaid
flowchart TD
    A[User Message] --> B[Context Retrieval]
    B --> C[Action Detection]
    C --> D{Action Triggered?}
    
    D -->|Yes| E[Execute Custom Action]
    D -->|No| F[Generate AI Response]
    
    E --> G[Process Action Results]
    G --> H[Integrate with AI Response]
    F --> H
    
    H --> I[Format Response]
    I --> J[Send to User]
    
    subgraph "Context Retrieval"
        B1[Generate Query Embedding]
        B2[Vector Similarity Search]
        B3[Filter Relevant Content]
    end
    
    B --> B1
    B1 --> B2
    B2 --> B3
    
    style A fill:#e1f5fe
    style J fill:#c8e6c9
```

### 4.2.3 Custom Action Execution Workflow

**Dynamic API Integration**

```mermaid
flowchart LR
    A[Action Trigger] --> B[Input Validation]
    B --> C[Build API Request]
    C --> D[Execute External API]
    D --> E[Process Response]
    E --> F[Filter Data]
    F --> G[Return to AI]
    
    subgraph "Request Building"
        C1[URL Interpolation]
        C2[Header Construction]
        C3[Body Preparation]
    end
    
    C --> C1
    C --> C2
    C --> C3
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
```

### 4.2.4 Vector Search and Context Retrieval

**Semantic Search Process**

```mermaid
flowchart TD
    A[Query Input] --> B[Generate Embedding]
    B --> C[Vector Database Search]
    C --> D[Similarity Ranking]
    D --> E[Threshold Filtering]
    E --> F[Context Assembly]
    
    subgraph "Search Strategy"
        G[Hybrid Search]
        H[Keyword + Vector]
    end
    
    C --> G
    G --> H
    
    style A fill:#e1f5fe
    style F fill:#c8e6c9
```

### 4.2.5 Content Processing and Embedding Generation

**Text Processing Pipeline**

```mermaid
flowchart LR
    A[Raw Content] --> B[Text Extraction]
    B --> C[Content Cleaning]
    C --> D[Chunking Strategy]
    D --> E[Overlap Addition]
    E --> F[Embedding Generation]
    F --> G[Vector Storage]
    
    subgraph "Chunking"
        D1[Paragraph Split]
        D2[Sentence Split]
        D3[Size Control]
    end
    
    D --> D1
    D --> D2
    D --> D3
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
```

These workflow diagrams illustrate the core algorithmic processes that power the ChatBuddy AI chatbot system, showing how multiple algorithms work together to enable key features like intelligent training, context-aware responses, and dynamic action execution. 