import HttpService from "./http.service";

class UserService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/users";
  }

  async createUser(userData) {
    try {
      return await this.httpService.post(this.basePath, userData);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await this.httpService.get(`${this.basePath}/${userId}`);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.httpService.get(`${this.basePath}/email/${email}`);
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await this.httpService.get(this.basePath);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      return await this.httpService.get(`${this.basePath}/active`);
    } catch (error) {
      console.error("Error fetching active users:", error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      return await this.httpService.put(`${this.basePath}/${userId}`, userData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      return await this.httpService.delete(`${this.basePath}/${userId}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async softDeleteUser(userId) {
    try {
      return await this.httpService.patch(
        `${this.basePath}/${userId}/soft-delete`,
        {}
      );
    } catch (error) {
      console.error("Error soft deleting user:", error);
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      return await this.httpService.patch(
        `${this.basePath}/${userId}/activate`,
        {}
      );
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      return await this.httpService.patch(
        `${this.basePath}/${userId}/deactivate`,
        {}
      );
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      return await this.httpService.get(
        `${this.basePath}/verify-email?token=${token}`
      );
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  }

  async getCurrentUserProfile() {
    try {
      return await this.httpService.get(`${this.basePath}/profile`);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  async updateCurrentUserProfile(profileData) {
    try {
      return await this.httpService.put(
        `${this.basePath}/profile`,
        profileData
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      return await this.httpService.post(
        `${this.basePath}/change-password`,
        passwordData
      );
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  async getUserBookingsByStatus(status, page = 0, size = 10) {
    try {
      return await this.httpService.get(
        `${this.basePath}/bookings/status/${status}?page=${page}&size=${size}`
      );
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  }

  async getUserReviewsByStatus(status, page = 0, size = 10) {
    try {
      return await this.httpService.get(
        `${this.basePath}/reviews/status/${status}?page=${page}&size=${size}`
      );
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
