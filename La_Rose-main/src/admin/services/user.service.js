// user.service.js
import HttpService from "../../services/http.service";

class UserService extends HttpService {
    constructor() {
        super("http://localhost:8080/api");
    }

    async signup(userData) {
        return await this.post("/auth/signup", userData);
    }

    async login(credentials) {
        return await this.post("/auth/login", credentials);
    }

    async getUsers(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `/admin/users?${queryString}` : "/admin/users";
            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error("Error in getUsers:", error);
            throw error;
        }
    }

    async getActiveUsers() {
        try {
            const response = await this.get("/users/active");
            return response;
        } catch (error) {
            console.error("Error in getActiveUsers:", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const response = await this.get(`/users/${userId}`);
            return response;
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const response = await this.get(`/users/email/${email}`);
            return response;
        } catch (error) {
            console.error("Error in getUserByEmail:", error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const response = await this.post("/users", userData);
            return response;
        } catch (error) {
            console.error("Error in createUser:", error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await this.put(`/admin/users/${userId}`, userData);
            return response;
        } catch (error) {
            console.error("Error in updateUser:", error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const response = await this.delete(`/users/${userId}`);
            return response;
        } catch (error) {
            console.error("Error in deleteUser:", error);
            throw error;
        }
    }

    async softDeleteUser(userId) {
        try {
            const response = await this.patch(`/users/${userId}/soft-delete`);
            return response;
        } catch (error) {
            console.error("Error in softDeleteUser:", error);
            throw error;
        }
    }

    async activateUser(userId) {
        try {
            const response = await this.patch(`/users/${userId}/activate`);
            return response;
        } catch (error) {
            console.error("Error in activateUser:", error);
            throw error;
        }
    }

    async deactivateUser(userId) {
        try {
            const response = await this.patch(`/users/${userId}/deactivate`);
            return response;
        } catch (error) {
            console.error("Error in deactivateUser:", error);
            throw error;
        }
    }

    async getCurrentUserProfile() {
        try {
            const response = await this.get("/users/profile");
            return response;
        } catch (error) {
            console.error("Error in getCurrentUserProfile:", error);
            throw error;
        }
    }

    async updateUserProfile(profileData) {
        try {
            const response = await this.put("/users/profile", profileData);
            return response;
        } catch (error) {
            console.error("Error in updateUserProfile:", error);
            throw error;
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await this.post(
                "/users/change-password",
                passwordData,
            );
            return response;
        } catch (error) {
            console.error("Error in changePassword:", error);
            throw error;
        }
    }

    async verifyEmail(token) {
        try {
            const response = await this.get(
                `/users/verify-email?token=${token}`,
            );
            return response;
        } catch (error) {
            console.error("Error in verifyEmail:", error);
            throw error;
        }
    }

    async getUserBookingsByStatus(status, page = 0, size = 10) {
        try {
            const response = await this.get(
                `/users/bookings/status/${status}`,
                {
                    params: { page, size },
                },
            );
            return response;
        } catch (error) {
            console.error("Error in getUserBookingsByStatus:", error);
            throw error;
        }
    }

    async getUserReviewsByStatus(status, page = 0, size = 10) {
        try {
            const response = await this.get(`/users/reviews/status/${status}`, {
                params: { page, size },
            });
            return response;
        } catch (error) {
            console.error("Error in getUserReviewsByStatus:", error);
            throw error;
        }
    }

    async getUserBookings(userId = null) {
        try {
            console.warn("getUserBookings: API endpoint may not exist yet");
            return [];
        } catch (error) {
            console.error("Error in getUserBookings:", error);
            return [];
        }
    }

    async getUserTransactions(userId = null) {
        try {
            console.warn("getUserTransactions: API endpoint may not exist yet");
            return [];
        } catch (error) {
            console.error("Error in getUserTransactions:", error);
            return [];
        }
    }

    async getUserReviews(userId = null) {
        try {
            console.warn("getUserReviews: API endpoint may not exist yet");
            return [];
        } catch (error) {
            console.error("Error in getUserReviews:", error);
            return [];
        }
    }

    async createTransaction(transactionData) {
        return await this.post("/transaction", transactionData);
    }

    async createReview(reviewData) {
        return await this.post("/reviews", reviewData);
    }

    async respondToReview(responseData) {
        return await this.put("/reviews/response", responseData);
    }

    async submitVNPayOrder(orderData) {
        const formData = new FormData();
        formData.append("amount", orderData.amount);
        formData.append("orderInfo", orderData.orderInfo);
        formData.append("roomId", orderData.roomId);

        return await this.post("/vnpay/submit-order", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    async getRooms() {
        return await this.get("/rooms");
    }

    async getBookedRoomsStats(minDate, maxDate) {
        return await this.get("/statistical/rooms/booked", {
            params: { minDate, maxDate },
        });
    }

    async getRevenueStats(days = 3) {
        return await this.get("/statistical/revenue", {
            params: { days },
        });
    }
}

export default new UserService();
