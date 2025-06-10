var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { users, interactions, reviews, productRatings } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and } from "drizzle-orm";
// Database implementation of the storage interface
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    // User methods
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.id, id))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.username, username))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.email, email))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .insert(users)
                            .values(insertUser)
                            .returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    // Interaction methods
    DatabaseStorage.prototype.createInteraction = function (interaction) {
        return __awaiter(this, void 0, void 0, function () {
            var existingInteraction, newInteraction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInteractionByUserAndProduct(interaction.userId, interaction.productId, interaction.interactionType)];
                    case 1:
                        existingInteraction = _a.sent();
                        // If it already exists, return it
                        if (existingInteraction) {
                            return [2 /*return*/, existingInteraction];
                        }
                        return [4 /*yield*/, db
                                .insert(interactions)
                                .values(interaction)
                                .returning()];
                    case 2:
                        newInteraction = (_a.sent())[0];
                        return [2 /*return*/, newInteraction];
                }
            });
        });
    };
    DatabaseStorage.prototype.getInteractionsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(interactions)
                        .where(eq(interactions.userId, userId))];
            });
        });
    };
    DatabaseStorage.prototype.getInteractionsByUserAndType = function (userId, interactionType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(interactions)
                        .where(and(eq(interactions.userId, userId), eq(interactions.interactionType, interactionType)))];
            });
        });
    };
    DatabaseStorage.prototype.getInteractionByUserAndProduct = function (userId, productId, interactionType) {
        return __awaiter(this, void 0, void 0, function () {
            var interaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(interactions)
                            .where(and(eq(interactions.userId, userId), eq(interactions.productId, productId), eq(interactions.interactionType, interactionType)))];
                    case 1:
                        interaction = (_a.sent())[0];
                        return [2 /*return*/, interaction || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteInteraction = function (userId, productId, interactionType) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .delete(interactions)
                            .where(and(eq(interactions.userId, userId), eq(interactions.productId, productId), eq(interactions.interactionType, interactionType)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, true]; // Return true to indicate successful deletion
                }
            });
        });
    };
    // Review methods
    DatabaseStorage.prototype.createReview = function (review) {
        return __awaiter(this, void 0, void 0, function () {
            var existingReview, newReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getReviewByUserAndProduct(review.userId, review.productId)];
                    case 1:
                        existingReview = _a.sent();
                        // If they have, update the existing review
                        if (existingReview) {
                            return [2 /*return*/, this.updateReview(existingReview.id, review)];
                        }
                        return [4 /*yield*/, db
                                .insert(reviews)
                                .values(review)
                                .returning()];
                    case 2:
                        newReview = (_a.sent())[0];
                        // Update the product rating summary
                        return [4 /*yield*/, this.updateProductRatingAfterReview(review.productId, null, // No old rating
                            review.rating)];
                    case 3:
                        // Update the product rating summary
                        _a.sent();
                        return [2 /*return*/, newReview];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReviewById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var review;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(reviews)
                            .where(eq(reviews.id, id))];
                    case 1:
                        review = (_a.sent())[0];
                        return [2 /*return*/, review || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReviewsByProductId = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(reviews)
                        .where(eq(reviews.productId, productId))];
            });
        });
    };
    DatabaseStorage.prototype.getReviewsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(reviews)
                        .where(eq(reviews.userId, userId))];
            });
        });
    };
    DatabaseStorage.prototype.getReviewByUserAndProduct = function (userId, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var review;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(reviews)
                            .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))];
                    case 1:
                        review = (_a.sent())[0];
                        return [2 /*return*/, review || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateReview = function (id, review) {
        return __awaiter(this, void 0, void 0, function () {
            var existingReview, updatedReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getReviewById(id)];
                    case 1:
                        existingReview = _a.sent();
                        if (!existingReview) {
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, db
                                .update(reviews)
                                .set(__assign(__assign({}, review), { updatedAt: new Date() }))
                                .where(eq(reviews.id, id))
                                .returning()];
                    case 2:
                        updatedReview = (_a.sent())[0];
                        if (!(review.rating && existingReview.rating !== review.rating)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.updateProductRatingAfterReview(existingReview.productId, existingReview.rating, review.rating)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, updatedReview];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteReview = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var existingReview;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getReviewById(id)];
                    case 1:
                        existingReview = _a.sent();
                        if (!existingReview) {
                            return [2 /*return*/, false];
                        }
                        // Delete the review
                        return [4 /*yield*/, db
                                .delete(reviews)
                                .where(eq(reviews.id, id))];
                    case 2:
                        // Delete the review
                        _a.sent();
                        // Update the product rating summary
                        return [4 /*yield*/, this.updateProductRatingAfterReview(existingReview.productId, existingReview.rating, 0 // Remove the rating
                            )];
                    case 3:
                        // Update the product rating summary
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // Product Rating methods
    DatabaseStorage.prototype.getProductRating = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var rating;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(productRatings)
                            .where(eq(productRatings.productId, productId))];
                    case 1:
                        rating = (_a.sent())[0];
                        return [2 /*return*/, rating || undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.createOrUpdateProductRating = function (productRating) {
        return __awaiter(this, void 0, void 0, function () {
            var existingRating, updatedRating, newRating;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProductRating(productRating.productId)];
                    case 1:
                        existingRating = _a.sent();
                        if (!existingRating) return [3 /*break*/, 3];
                        return [4 /*yield*/, db
                                .update(productRatings)
                                .set(__assign(__assign({}, productRating), { updatedAt: new Date() }))
                                .where(eq(productRatings.productId, productRating.productId))
                                .returning()];
                    case 2:
                        updatedRating = (_a.sent())[0];
                        return [2 /*return*/, updatedRating];
                    case 3: return [4 /*yield*/, db
                            .insert(productRatings)
                            .values(productRating)
                            .returning()];
                    case 4:
                        newRating = (_a.sent())[0];
                        return [2 /*return*/, newRating];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateProductRatingAfterReview = function (productId, oldRating, newRating) {
        return __awaiter(this, void 0, void 0, function () {
            var rating, ratingObj, totalScore, avgRating;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProductRating(productId)];
                    case 1:
                        rating = _a.sent();
                        ratingObj = rating || {
                            productId: productId,
                            averageRating: "0", // Use string to match decimal schema
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
                                case 5:
                                    ratingObj.fiveStarCount--;
                                    break;
                                case 4:
                                    ratingObj.fourStarCount--;
                                    break;
                                case 3:
                                    ratingObj.threeStarCount--;
                                    break;
                                case 2:
                                    ratingObj.twoStarCount--;
                                    break;
                                case 1:
                                    ratingObj.oneStarCount--;
                                    break;
                            }
                            // If we're deleting a review (newRating=0), decrement totalRatings
                            if (newRating === 0) {
                                ratingObj.totalRatings--;
                            }
                        }
                        else if (newRating > 0) {
                            // If there's no old rating and the new rating is valid, 
                            // we're adding a new review, so increment totalRatings
                            ratingObj.totalRatings++;
                        }
                        // If we're adding or updating a review with a valid rating,
                        // increment the appropriate counter
                        if (newRating > 0) {
                            switch (newRating) {
                                case 5:
                                    ratingObj.fiveStarCount++;
                                    break;
                                case 4:
                                    ratingObj.fourStarCount++;
                                    break;
                                case 3:
                                    ratingObj.threeStarCount++;
                                    break;
                                case 2:
                                    ratingObj.twoStarCount++;
                                    break;
                                case 1:
                                    ratingObj.oneStarCount++;
                                    break;
                            }
                        }
                        // Calculate the new average rating
                        if (ratingObj.totalRatings > 0) {
                            totalScore = (ratingObj.fiveStarCount * 5) +
                                (ratingObj.fourStarCount * 4) +
                                (ratingObj.threeStarCount * 3) +
                                (ratingObj.twoStarCount * 2) +
                                (ratingObj.oneStarCount * 1);
                            avgRating = (totalScore / ratingObj.totalRatings).toFixed(2);
                            ratingObj.averageRating = avgRating; // Store as string to match decimal schema
                        }
                        else {
                            ratingObj.averageRating = "0"; // Store as string to match decimal schema
                        }
                        // Save the updated rating to the database
                        return [2 /*return*/, this.createOrUpdateProductRating(ratingObj)];
                }
            });
        });
    };
    return DatabaseStorage;
}());
export { DatabaseStorage };
export var storage = new DatabaseStorage();
