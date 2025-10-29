import HttpService from "./http.service";

class ReviewService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/reviews";
  }

  async createReview(reviewData) {
    try {
      return await this.httpService.post(this.basePath, reviewData);
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async updateReview(reviewData) {
    try {
      return await this.httpService.put(this.basePath, reviewData);
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  async deleteReview(reviewId) {
    try {
      return await this.httpService.delete(`${this.basePath}/${reviewId}`);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }

  async createReviewResponse(responseData) {
    try {
      return await this.httpService.post(
        `${this.basePath}/response`,
        responseData
      );
    } catch (error) {
      console.error("Error creating review response:", error);
      throw error;
    }
  }

  async updateReviewResponse(responseData) {
    try {
      return await this.httpService.put(
        `${this.basePath}/response`,
        responseData
      );
    } catch (error) {
      console.error("Error updating review response:", error);
      throw error;
    }
  }

  async deleteReviewResponse(responseId) {
    try {
      return await this.httpService.delete(
        `${this.basePath}/response/${responseId}`
      );
    } catch (error) {
      console.error("Error deleting review response:", error);
      throw error;
    }
  }

  async respondToReview(responseData) {
    try {
      return await this.httpService.put(
        `${this.basePath}/response`,
        responseData
      );
    } catch (error) {
      console.error("Error responding to review:", error);
      throw error;
    }
  }

  async getReviewsByRoom(roomId) {
    try {
      return await this.httpService.get(`${this.basePath}/room/${roomId}`);
    } catch (error) {
      console.error("Error fetching room reviews:", error);
      throw error;
    }
  }

  async getAllReviews(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.basePath}?${queryString}`
        : this.basePath;

      return await this.httpService.get(url);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
