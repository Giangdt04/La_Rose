// http.service.js
import axios from "axios";
import session from "../utils/SessionManager";

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
                const token = session.getToken();
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
                    session.clearToken();
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            },
        );
    }

    // GET method
    async get(url, config = {}) {
        const response = await this.instance.get(url, config);
        return response.data;
    }

    // POST method
    async post(url, data = null, config = {}) {
        const response = await this.instance.post(url, data, config);
        return response.data;
    }

    // PUT method
    async put(url, data = null, config = {}) {
        const response = await this.instance.put(url, data, config);
        return response.data;
    }

    // PATCH method
    async patch(url, data = null, config = {}) {
        const response = await this.instance.patch(url, data, config);
        return response.data;
    }

    // DELETE method
    async delete(url, config = {}) {
        const response = await this.instance.delete(url, config);
        return response.data;
    }

    // Upload file method
    async upload(url, formData, config = {}) {
        const response = await this.instance.post(url, formData, {
            ...config,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }

    // Set authentication token
    setAuthToken(token) {
        this.instance.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${token}`;
    }

    // Remove authentication token
    removeAuthToken() {
        delete this.instance.defaults.headers.common["Authorization"];
    }

    // Custom request method
    async request(config) {
        const response = await this.instance.request(config);
        return response.data;
    }
}

export default HttpService;
