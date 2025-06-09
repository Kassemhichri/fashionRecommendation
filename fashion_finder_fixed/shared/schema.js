import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, decimal } from "drizzle-orm/pg-core";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { z } = require("zod");

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  registrationDate: timestamp("registration_date").defaultNow()
});

export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

// Quiz responses model
export const quizResponses = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: text("question_id").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertQuizResponseSchema = z.object({
  userId: z.number(),
  questionId: z.string(),
  response: z.string(),
});

// User interactions model
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: text("product_id").notNull(),
  interactionType: text("interaction_type").notNull(), // "view", "like", "dislike"
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInteractionSchema = z.object({
  userId: z.number(),
  productId: z.string(),
  interactionType: z.string(),
});

// Product reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: text("product_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),     // Optional review text
  title: text("title"),                // Optional review title
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertReviewSchema = z.object({
  userId: z.number(),
  productId: z.string(),
  rating: z.number(),
  reviewText: z.string().optional(),
  title: z.string().optional(),
});

// Product ratings summary model (aggregated data for quick access)
export const productRatings = pgTable("product_ratings", {
  productId: text("product_id").notNull().primaryKey(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).notNull().default("0"),
  totalRatings: integer("total_ratings").notNull().default(0),
  fiveStarCount: integer("five_star_count").notNull().default(0),
  fourStarCount: integer("four_star_count").notNull().default(0),
  threeStarCount: integer("three_star_count").notNull().default(0),
  twoStarCount: integer("two_star_count").notNull().default(0),
  oneStarCount: integer("one_star_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertProductRatingSchema = z.object({
  productId: z.string(),
  averageRating: z.string(),
  totalRatings: z.number(),
  fiveStarCount: z.number(),
  fourStarCount: z.number(),
  threeStarCount: z.number(),
  twoStarCount: z.number(),
  oneStarCount: z.number(),
});
