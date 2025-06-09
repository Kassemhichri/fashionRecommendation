import { 
  users, interactions, reviews, productRatings
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and } from "drizzle-orm";

// Database implementation of the storage interface
export class DatabaseStorage {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Interaction methods
  async createInteraction(interaction) {
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

  async getInteractionsByUser(userId) {
    return db
      .select()
      .from(interactions)
      .where(eq(interactions.userId, userId));
  }

  async getInteractionsByUserAndType(userId, interactionType) {
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

  async getInteractionByUserAndProduct(userId, productId, interactionType) {
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

  async deleteInteraction(userId, productId, interactionType) {
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
  async createReview(review) {
    // First check if this user has already reviewed this product
    const existingReview = await this.getReviewByUserAndProduct(
      review.userId,
      review.productId
    );

    // If they have, update the existing review
    if (existingReview) {
      return this.updateReview(existingReview.id, review);
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

  async getReviewById(id) {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    
    return review || undefined;
  }

  async getReviewsByProductId(productId) {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));
  }

  async getReviewsByUserId(userId) {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId));
  }

  async getReviewByUserAndProduct(userId, productId) {
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

  async updateReview(id, review) {
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

  async deleteReview(id) {
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
  async getProductRating(productId) {
    const [rating] = await db
      .select()
      .from(productRatings)
      .where(eq(productRatings.productId, productId));
    
    return rating || undefined;
  }

  async createOrUpdateProductRating(productRating) {
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

  async updateProductRatingAfterReview(productId, oldRating, newRating) {
    // Get the existing product rating
    let rating = await this.getProductRating(productId);
    
    // Prepare a product rating object with proper types
    const ratingObj = rating || {
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

// Simplified in-memory implementation used when no database is configured
export class MemoryStorage {
  constructor() {
    this.users = [];
    this.interactions = [];
    this.nextUserId = 1;
    this.nextInteractionId = 1;
  }

  async getUser(id) {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser) {
    const user = { id: this.nextUserId++, ...insertUser };
    this.users.push(user);
    return user;
  }

  async createInteraction(interaction) {
    const existing = await this.getInteractionByUserAndProduct(
      interaction.userId,
      interaction.productId,
      interaction.interactionType
    );
    if (existing) return existing;
    const newInter = { id: this.nextInteractionId++, ...interaction };
    this.interactions.push(newInter);
    return newInter;
  }

  async getInteractionsByUserAndType(userId, type) {
    return this.interactions.filter(
      i => i.userId === userId && i.interactionType === type
    );
  }

  async getInteractionByUserAndProduct(userId, productId, interactionType) {
    return this.interactions.find(
      i =>
        i.userId === userId &&
        i.productId === productId &&
        i.interactionType === interactionType
    );
  }

  async deleteInteraction(userId, productId, interactionType) {
    this.interactions = this.interactions.filter(
      i =>
        !(
          i.userId === userId &&
          i.productId === productId &&
          i.interactionType === interactionType
        )
    );
    return true;
  }
}

export const storage = db ? new DatabaseStorage() : new MemoryStorage();
