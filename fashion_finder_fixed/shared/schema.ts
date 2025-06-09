import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  registrationDate: timestamp("registration_date").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

// Quiz responses model
export const quizResponses = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: text("question_id").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).pick({
  userId: true,
  questionId: true,
  response: true,
});

// User interactions model
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: text("product_id").notNull(),
  interactionType: text("interaction_type").notNull(), // "view", "like", "dislike"
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInteractionSchema = createInsertSchema(interactions).pick({
  userId: true,
  productId: true,
  interactionType: true,
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

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  productId: true,
  rating: true,
  reviewText: true,
  title: true
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

export const insertProductRatingSchema = createInsertSchema(productRatings).pick({
  productId: true,
  averageRating: true,
  totalRatings: true,
  fiveStarCount: true,
  fourStarCount: true,
  threeStarCount: true,
  twoStarCount: true,
  oneStarCount: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ProductRating = typeof productRatings.$inferSelect;
export type InsertProductRating = z.infer<typeof insertProductRatingSchema>;
