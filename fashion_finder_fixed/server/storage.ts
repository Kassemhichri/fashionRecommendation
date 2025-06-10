import { 
  users, interactions, reviews, productRatings, 
  type User, type InsertUser, 
  type Interaction, type InsertInteraction,
  type Review, type InsertReview,
  type ProductRating, type InsertProductRating 
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interaction methods
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractionsByUser(userId: number): Promise<Interaction[]>;
  getInteractionsByUserAndType(userId: number, interactionType: string): Promise<Interaction[]>;
  getInteractionByUserAndProduct(userId: number, productId: string, interactionType: string): Promise<Interaction | undefined>;
  deleteInteraction(userId: number, productId: string, interactionType: string): Promise<boolean>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewById(id: number): Promise<Review | undefined>;
  getReviewsByProductId(productId: string): Promise<Review[]>;
  getReviewsByUserId(userId: number): Promise<Review[]>;
  getReviewByUserAndProduct(userId: number, productId: string): Promise<Review | undefined>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Product Rating methods
  getProductRating(productId: string): Promise<ProductRating | undefined>;
  createOrUpdateProductRating(productRating: InsertProductRating): Promise<ProductRating>;
  updateProductRatingAfterReview(productId: string, oldRating: number | null, newRating: number): Promise<ProductRating | undefined>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Interaction methods
  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    // First check if an interaction of this type already exists for this user/product
    const existingInteraction = await this.getInteractionByUserAndProduct(
      interaction.userId,
      interaction.productId,
      interaction.interactionType
    );

    // If it already exists, return it
    if (existingInteraction) {
      return existingInteraction;
    }

    // Otherwise create a new one
    const [newInteraction] = await db
      .insert(interactions)
      .values(interaction)
      .returning();
    
    return newInteraction;
  }

  async getInteractionsByUser(userId: number): Promise<Interaction[]> {
    return db
      .select()
      .from(interactions)
      .where(eq(interactions.userId, userId));
  }

  async getInteractionsByUserAndType(userId: number, interactionType: string): Promise<Interaction[]> {
    return db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.userId, userId),
          eq(interactions.interactionType, interactionType)
        )
      );
  }

  async getInteractionByUserAndProduct(
    userId: number, 
    productId: string, 
    interactionType: string
  ): Promise<Interaction | undefined> {
    const [interaction] = await db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.userId, userId),
          eq(interactions.productId, productId),
          eq(interactions.interactionType, interactionType)
        )
      );
    
    return interaction || undefined;
  }

  async deleteInteraction(
    userId: number, 
    productId: string, 
    interactionType: string
  ): Promise<boolean> {
    const result = await db
      .delete(interactions)
      .where(
        and(
          eq(interactions.userId, userId),
          eq(interactions.productId, productId),
          eq(interactions.interactionType, interactionType)
        )
      );
    
    return true; // Return true to indicate successful deletion
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    // First check if this user has already reviewed this product
    const existingReview = await this.getReviewByUserAndProduct(
      review.userId,
      review.productId
    );

    // If they have, update the existing review
    if (existingReview) {
      return this.updateReview(existingReview.id, review) as Promise<Review>;
    }

    // Otherwise create a new review
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update the product rating summary
    await this.updateProductRatingAfterReview(
      review.productId,
      null, // No old rating
      review.rating
    );
    
    return newReview;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    
    return review || undefined;
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));
  }

  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId));
  }

  async getReviewByUserAndProduct(userId: number, productId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.productId, productId)
        )
      );
    
    return review || undefined;
  }

  async updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined> {
    // First get the existing review
    const existingReview = await this.getReviewById(id);
    if (!existingReview) {
      return undefined;
    }

    // Update the review
    const [updatedReview] = await db
      .update(reviews)
      .set({ 
        ...review,
        updatedAt: new Date() 
      })
      .where(eq(reviews.id, id))
      .returning();
    
    // Update the product rating summary if the rating has changed
    if (review.rating && existingReview.rating !== review.rating) {
      await this.updateProductRatingAfterReview(
        existingReview.productId,
        existingReview.rating,
        review.rating
      );
    }
    
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    // First get the existing review to get the productId and rating
    const existingReview = await this.getReviewById(id);
    if (!existingReview) {
      return false;
    }

    // Delete the review
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));
    
    // Update the product rating summary
    await this.updateProductRatingAfterReview(
      existingReview.productId,
      existingReview.rating,
      0 // Remove the rating
    );
    
    return true;
  }

  // Product Rating methods
  async getProductRating(productId: string): Promise<ProductRating | undefined> {
    const [rating] = await db
      .select()
      .from(productRatings)
      .where(eq(productRatings.productId, productId));
    
    return rating || undefined;
  }

  async createOrUpdateProductRating(productRating: InsertProductRating): Promise<ProductRating> {
    // Check if a rating exists for this product
    const existingRating = await this.getProductRating(productRating.productId);
    
    if (existingRating) {
      // Update the existing rating
      const [updatedRating] = await db
        .update(productRatings)
        .set({ 
          ...productRating,
          updatedAt: new Date() 
        })
        .where(eq(productRatings.productId, productRating.productId))
        .returning();
      
      return updatedRating;
    } else {
      // Create a new rating
      const [newRating] = await db
        .insert(productRatings)
        .values(productRating)
        .returning();
      
      return newRating;
    }
  }

  async updateProductRatingAfterReview(
    productId: string,
    oldRating: number | null,
    newRating: number
  ): Promise<ProductRating | undefined> {
    // Get the existing product rating
    let rating = await this.getProductRating(productId);
    
    // Prepare a product rating object with proper types
    const ratingObj: ProductRating = rating || {
      productId,
      averageRating: "0",  // Use string to match decimal schema
      totalRatings: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0,
      updatedAt: new Date()
    };

    // Update the rating counts based on the old and new ratings
    // If oldRating exists, we're updating a review
    if (oldRating) {
      // Decrement the count for the old rating
      switch (oldRating) {
        case 5: ratingObj.fiveStarCount--; break;
        case 4: ratingObj.fourStarCount--; break;
        case 3: ratingObj.threeStarCount--; break;
        case 2: ratingObj.twoStarCount--; break;
        case 1: ratingObj.oneStarCount--; break;
      }
      
      // If we're deleting a review (newRating=0), decrement totalRatings
      if (newRating === 0) {
        ratingObj.totalRatings--;
      }
    } else if (newRating > 0) {
      // If there's no old rating and the new rating is valid, 
      // we're adding a new review, so increment totalRatings
      ratingObj.totalRatings++;
    }

    // If we're adding or updating a review with a valid rating,
    // increment the appropriate counter
    if (newRating > 0) {
      switch (newRating) {
        case 5: ratingObj.fiveStarCount++; break;
        case 4: ratingObj.fourStarCount++; break;
        case 3: ratingObj.threeStarCount++; break;
        case 2: ratingObj.twoStarCount++; break;
        case 1: ratingObj.oneStarCount++; break;
      }
    }

    // Calculate the new average rating
    if (ratingObj.totalRatings > 0) {
      const totalScore = 
        (ratingObj.fiveStarCount * 5) +
        (ratingObj.fourStarCount * 4) +
        (ratingObj.threeStarCount * 3) +
        (ratingObj.twoStarCount * 2) +
        (ratingObj.oneStarCount * 1);
      
      const avgRating = (totalScore / ratingObj.totalRatings).toFixed(2);
      ratingObj.averageRating = avgRating; // Store as string to match decimal schema
    } else {
      ratingObj.averageRating = "0"; // Store as string to match decimal schema
    }

    // Save the updated rating to the database
    return this.createOrUpdateProductRating(ratingObj);
  }
}

export const storage = new DatabaseStorage();
