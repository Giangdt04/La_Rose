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

            // Lưu token vào localStorage
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
                },
            );
            return response;
        } catch (error) {
            console.error("AuthService verifyEmail error:", error);
            return null;
        }
    }
}

export default new AuthService();
