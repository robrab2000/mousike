import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// NextAuth.js required tables
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// App-specific tables
export const rehearsalSessions = pgTable("rehearsal_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  tempo: integer("tempo").default(120),
});

export const tracks = pgTable("track", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => rehearsalSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  instrument: text("instrument"),
  color: text("color").default("#8b5cf6"),
  order: integer("order").default(0).notNull(),
  volume: integer("volume").default(100).notNull(),
  isMuted: boolean("is_muted").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const takes = pgTable("take", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  trackId: text("track_id")
    .notNull()
    .references(() => tracks.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  duration: integer("duration").notNull(), // in milliseconds
  format: text("format").notNull(), // 'webm' or 'wav'
  fileSize: integer("file_size").notNull(), // in bytes
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  rehearsalSessions: many(rehearsalSessions),
  takes: many(takes),
}));

export const rehearsalSessionsRelations = relations(
  rehearsalSessions,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [rehearsalSessions.createdById],
      references: [users.id],
    }),
    tracks: many(tracks),
  })
);

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  session: one(rehearsalSessions, {
    fields: [tracks.sessionId],
    references: [rehearsalSessions.id],
  }),
  takes: many(takes),
}));

export const takesRelations = relations(takes, ({ one }) => ({
  track: one(tracks, {
    fields: [takes.trackId],
    references: [tracks.id],
  }),
  user: one(users, {
    fields: [takes.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RehearsalSession = typeof rehearsalSessions.$inferSelect;
export type NewRehearsalSession = typeof rehearsalSessions.$inferInsert;
export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
export type Take = typeof takes.$inferSelect;
export type NewTake = typeof takes.$inferInsert;
