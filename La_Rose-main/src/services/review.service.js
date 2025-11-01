// /src/services/review.service.js

import HttpService from "./http.service";

class ReviewService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/reviews";
    }

    // Tạo đánh giá (Yêu cầu đăng nhập, không skipAuth)
    async createReview(reviewData) {
        try {
            return await this.httpService.post(this.basePath, reviewData);
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    }

    // Cập nhật đánh giá (Yêu cầu đăng nhập, không skipAuth)
    async updateReview(reviewData) {
        try {
            if (!reviewData.id) {
                throw new Error("ID của đánh giá là bắt buộc khi cập nhật.");
            }
            return await this.httpService.put(this.basePath, reviewData);
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }

    // Phản hồi đánh giá (Admin, không skipAuth)
    async responseReview(responseData) {
        try {
             if (!responseData.reviewId) {
                 throw new Error("ID của đánh giá là bắt buộc khi phản hồi.");
             }
            return await this.httpService.put(
                `${this.basePath}/response`,
                responseData,
            );
        } catch (error) {
            console.error("Error responding to review:", error);
            throw error;
        }
    }

    // Lấy đánh giá theo phòng (Public)
    async getReviewsByRoom(roomId) {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(
                `${this.basePath}/room/${roomId}`,
                { skipAuth: true } // Thêm vào đây
            );
        } catch (error) {
            console.error("Error fetching room reviews:", error);
            throw error;
        }
    }

    // Lấy tất cả đánh giá (Public, dùng cho HomePage)
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

            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(url, { skipAuth: true }); // Thêm vào đây
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    }
}

const reviewService = new ReviewService();
export default reviewService;