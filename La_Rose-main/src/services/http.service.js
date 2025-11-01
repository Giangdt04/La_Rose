import axios from "axios";

class HttpService {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.instance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // ✅ SỬA DÒNG NÀY: LẤY TOKEN TỪ localStorage
                const token = localStorage.getItem("accessToken");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userInfo");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            },
        );
    }

    async get(url, config = {}) {
        const response = await this.instance.get(url, config);
        return response.data;
    }

    async post(url, data = null, config = {}) {
        const response = await this.instance.post(url, data, config);
        return response.data;
    }

    async put(url, data = null, config = {}) {
        const response = await this.instance.put(url, data, config);
        return response.data;
    }

    async patch(url, data = null, config = {}) {
        const response = await this.instance.patch(url, data, config);
        return response.data;
    }

    async delete(url, config = {}) {
        const response = await this.instance.delete(url, config);
        return response.data;
    }

    async upload(url, formData, config = {}) {
        const response = await this.instance.post(url, formData, {
            ...config,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }

    request(config) {
        return this.instance.request(config);
    }
}

export default HttpService;