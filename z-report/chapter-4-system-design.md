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
        uuid agent_id FK
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

#### Sequence Diagrams

**Agent Creation and Configuration Sequence**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant E as Embedding Service

    U->>F: Create new agent
    F->>A: POST /api/agents
    A->>D: Insert agent record
    D-->>A: Agent created
    A-->>F: Agent data
    F-->>U: Agent created successfully

    U->>F: Add source (file/text/website)
    F->>A: POST /api/agents/{id}/sources
    A->>D: Insert source record
    D-->>A: Source created
    
    alt File source
        A->>E: Process file content
        E->>A: Generate embeddings
        A->>D: Store embeddings
    else Text source
        A->>E: Process text content
        E->>A: Generate embeddings
        A->>D: Store embeddings
    else Website source
        A->>E: Scrape website
        E->>A: Generate embeddings
        A->>D: Store embeddings
    end
    
    A-->>F: Source processed
    F-->>U: Source added successfully
```

**Chat Conversation Sequence**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant AI as AI Service
    participant CA as Custom Actions

    U->>F: Send message
    F->>A: POST /api/chat
    A->>D: Create/retrieve conversation
    A->>D: Store user message
    
    A->>D: Retrieve agent config
    A->>D: Retrieve relevant embeddings
    A->>D: Check custom actions
    
    alt Custom action triggered
        A->>CA: Execute custom action
        CA-->>A: Action result
    end
    
    A->>AI: Generate response with context
    AI-->>A: AI response
    A->>D: Store AI message
    A-->>F: Response data
    F-->>U: Display response
```

**Agent Training and Embedding Generation**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant I as Inngest
    participant E as Embedding Service
    participant D as Database

    U->>F: Add source to agent
    F->>A: POST /api/agents/{id}/sources
    A->>D: Store source metadata
    A->>I: Trigger training job
    
    I->>E: Process source content
    E->>E: Split into chunks
    E->>E: Generate embeddings
    E->>D: Store embeddings
    I->>D: Update training status
    I->>A: Training complete
    A-->>F: Training status update
    F-->>U: Training complete notification
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