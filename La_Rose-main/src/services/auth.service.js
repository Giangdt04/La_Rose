import axios from "axios";
const API_BASE_URL = "http://localhost:8080/api";

class AuthService {
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại");
      }

      return await response.json();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  }

  getCurrentUser() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  async verifyEmail(token) {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/auth/verify?token=${token}`,
        {
          timeout: 10000,
        }
      );
      return response;
    } catch (error) {
      console.error("AuthService verifyEmail error:", error);
      return null;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Làm mới token thất bại");
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
      }

      return data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Yêu cầu đặt lại mật khẩu thất bại"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đặt lại mật khẩu thất bại");
      }

      return await response.json();
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  async resendVerification(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gửi lại email xác thực thất bại");
      }

      return await response.json();
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  }

  async logoutServer() {
    try {
      const token = this.getAccessToken();
      if (!token) return;

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout server error:", error);
    } finally {
      this.logout();
    }
  }
}

export default new AuthService();
