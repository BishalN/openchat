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
  // Add any specific configuration properties your agent needs
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

export const agentsTable = pgTable("agents", {
  //TODO: update nano id use here
  id: serial("id").primaryKey(),
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
});

export const sourcesTable = pgTable("sources", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  type: sourceTypeEnum("type").notNull(),
  name: text("name").notNull(),
  content: text("content"),
  url: text("url"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  characterCount: integer("character_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// This is redundant instead keep everything in source table that would make it simpler
export const embeddingsTable = pgTable(
  "embeddings",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sourcesTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

// TODO: maybe remove this and keep everything in source table as json sth
export const qaPairsTable = pgTable("qa_pairs", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sourcesTable.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO: maybe remove this and keep everything in source table
export const websitePagesTable = pgTable("website_pages", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sourcesTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const conversationsTable = pgTable("conversations", {
  //TODO: update nano id use here; make it a nano id instead of serial
  id: serial("id").primaryKey(),
  // id: varchar("id", { length: 21 }).primaryKey(),
  agentId: integer("agent_id")
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
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 10 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;

export type InsertAgent = typeof agentsTable.$inferInsert;
export type SelectAgent = typeof agentsTable.$inferSelect;

export type InsertSource = typeof sourcesTable.$inferInsert;
export type SelectSource = typeof sourcesTable.$inferSelect;

export type InsertEmbedding = typeof embeddingsTable.$inferInsert;
export type SelectEmbedding = typeof embeddingsTable.$inferSelect;

export type InsertQAPair = typeof qaPairsTable.$inferInsert;
export type SelectQAPair = typeof qaPairsTable.$inferSelect;

export type InsertWebsitePage = typeof websitePagesTable.$inferInsert;
export type SelectWebsitePage = typeof websitePagesTable.$inferSelect;

export type InsertConversation = typeof conversationsTable.$inferInsert;
export type SelectConversation = typeof conversationsTable.$inferSelect;

export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;
