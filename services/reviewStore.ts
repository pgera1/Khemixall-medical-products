import { Review } from '../types';

// In-memory store for user reviews (persists for the session)
let userReviewsStore: Review[] = [];

export const reviewStore = {
  addReview: (review: Review) => {
    userReviewsStore.unshift(review); // Add to the top
  },

  getReviewsByProductId: (productId: string): Review[] => {
    return userReviewsStore.filter(r => r.productId === productId);
  },

  getAllReviews: (): Review[] => {
    return userReviewsStore;
  }
};