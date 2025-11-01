// /src/services/review.service.js

import HttpService from "./http.service";

class ReviewService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/reviews";
    }

    // Tạo đánh giá (Dùng cho HomePage.jsx - Đã OK)
    async createReview(reviewData) {
        try {
            return await this.httpService.post(this.basePath, reviewData);
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    }

    // --- PHẦN MỚI ĐƯỢC THÊM ---
    /**
     * Cập nhật đánh giá (Update).
     * Đây là hàm gọi PUT /api/reviews và gây ra lỗi nếu reviewData không có 'id'.
     */
    async updateReview(reviewData) {
        try {
            // reviewData BẮT BUỘC phải chứa "id"
            if (!reviewData.id) {
                throw new Error("ID của đánh giá là bắt buộc khi cập nhật.");
            }
            return await this.httpService.put(this.basePath, reviewData);
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }
    // --- KẾT THÚC PHẦN MỚI ---

    // Phản hồi đánh giá (Dành cho Admin - PUT /api/reviews/response)
    async respondToReview(responseData) {
        try {
            // responseData cũng BẮT BUỘC phải chứa "id" (của response)
            // nếu không cũng sẽ gây lỗi "IllegalArgumentException"
            // từ ReviewResponseService
            if (!responseData.id) {
                 // Hoặc nếu bạn dùng để tạo mới thì phải có reviewId
                 if (!responseData.reviewId) {
                    throw new Error("ID của đánh giá (reviewId) là bắt buộc khi phản hồi.");
                 }
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

    // Lấy tất cả đánh giá (Dùng cho HomePage.jsx - Đã OK)
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