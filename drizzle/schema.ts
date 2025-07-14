import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  json,
  pgEnum,
  varchar,
  boolean,
  index,
  vector,
  uuid,
} from "drizzle-orm/pg-core";

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
  instructions?: string;
}

// User profiles table that extends Supabase auth.users
export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // References auth.users.id
  name: text("name"),
  age: integer("age"),
  email: text("email").unique(), // Optional as auth already has email
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sourceTypeEnum = pgEnum("source_type", [
  "file",
  "text",
  "website",
  "qa",
  "notion",
]);

export const agentRoleEnum = pgEnum("agent_role", ["user", "assistant", "system"]);

export const agentsTable = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
  isPublic: boolean("is_public").default(false),
  config: json("config").$type<AgentConfig>().default({}),
}, (table) => [
  index("agentsUserIdIdx").on(table.userId),
]);

export type FileSourceDetails = {
  type: "file";
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  characterCount?: number;
};

export type TextSourceDetails = {
  type: "text";
  content: string;
};

export type WebsiteSourceDetails = {
  type: "website";
  url: string;
  title?: string;
  content: string;
};

export type QASourceDetails = {
  type: "qa";
  pairs: Array<{ question: string; answer: string }>;
};

export type NotionSourceDetails = {
  type: "notion";
  pageId: string;
  title?: string;
  content?: string;
};

export type SourceDetails =
  | FileSourceDetails
  | TextSourceDetails
  | WebsiteSourceDetails
  | QASourceDetails
  | NotionSourceDetails;

export const sourcesTable = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  type: sourceTypeEnum("type").notNull(),
  name: text("name").notNull(),
  details: json("details").$type<SourceDetails>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("sourcesAgentIdIdx").on(table.agentId),
  index("sourcesTypeIdx").on(table.type),
]);

export const embeddingsTable = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourcesTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    chunkIndex: integer("chunk_index"),
    metadata: json("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    index("embeddingsSourceIdIdx").on(table.sourceId),
  ]
);

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("conversationsAgentIdIdx").on(table.agentId),
  index("conversationsUserIdIdx").on(table.userId),
]);

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  role: agentRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("messagesConversationIdIdx").on(table.conversationId),
]);

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;

export type InsertAgent = typeof agentsTable.$inferInsert;
export type SelectAgent = typeof agentsTable.$inferSelect;

export type InsertSource = typeof sourcesTable.$inferInsert;
export type SelectSource = typeof sourcesTable.$inferSelect;

export type InsertEmbedding = typeof embeddingsTable.$inferInsert;
export type SelectEmbedding = typeof embeddingsTable.$inferSelect;

export type InsertConversation = typeof conversationsTable.$inferInsert;
export type SelectConversation = typeof conversationsTable.$inferSelect;

export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;
