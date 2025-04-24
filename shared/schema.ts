import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export type GameMode = "practice" | "quiz" | "learning";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    email: z.string().email(),
    age: z.number().min(3).max(18),
    name: z.string().min(2),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameType = "math" | "objects" | "speech" | "colorshape";
