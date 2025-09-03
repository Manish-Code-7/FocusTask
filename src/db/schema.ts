import { nanoid } from "nanoid";
import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// ---------------- USER ----------------
export const user = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- SESSION ----------------
export const session = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- ACCOUNT (OAuth/Password) ----------------
export const account = pgTable("account", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  scope: text("scope"),
  password: text("password"), // if email+password login
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- VERIFICATION ----------------
export const verification = pgTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  identifier: text("identifier").notNull(), // email/phone
  value: text("value").notNull(), // OTP/token
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- CHAT SESSION ----------------
export const chatSession = pgTable("chat_session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"), // optional, user can name conversation
  isFinished: boolean("is_finished").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- MESSAGES ----------------
export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSession.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------- TASKS ----------------
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  clientId: text("client_id").notNull(), // anonymous client identifier stored in localStorage
  sessionId: text("session_id"), // optional link to chatbot sessionId
  title: text("title").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  status: text("status").notNull().default("pending"), // pending | completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
