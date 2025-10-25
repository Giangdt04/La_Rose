// services/review.service.js
import HttpService from "./http.service";

class ReviewService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/reviews";
    }

    // Tạo đánh giá
    async createReview(reviewData) {
        try {
            return await this.httpService.post(this.basePath, reviewData);
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    }

    // Phản hồi đánh giá
    async respondToReview(responseData) {
        try {
            return await this.httpService.put(
                `${this.basePath}/response`,
                responseData,
            );
        } catch (error) {
            console.error("Error responding to review:", error);
            throw error;
        }
    }

    // Lấy đánh giá theo phòng
    async getReviewsByRoom(roomId) {
        try {
            return await this.httpService.get(
                `${this.basePath}/room/${roomId}`,
            );
        } catch (error) {
            console.error("Error fetching room reviews:", error);
            throw error;
        }
    }

    // Lấy tất cả đánh giá
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
