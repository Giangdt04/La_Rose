// src/services/room.service.js
import HttpService from "./http.service";

class RoomService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/rooms";
    }

    async getAllRooms(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page !== undefined) queryParams.append("page", params.page);
            if (params.size !== undefined) queryParams.append("size", params.size);
            if (params.keyword) queryParams.append("keyword", params.keyword);
            if (params.minPrice) queryParams.append("minPrice", params.minPrice);
            if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
            if (params.typeId) queryParams.append("typeId", params.typeId);
            if (params.capacity) queryParams.append("capacity", params.capacity);
            const queryString = queryParams.toString();
            const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

            return await this.httpService.get(url, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    }

    async getRoomById(roomId) {
        try {
            return await this.httpService.get(`${this.basePath}/${roomId}`, { skipAuth: true });
        } catch (error) {
            console.error(`Error fetching room ${roomId}:`, error);
            throw error;
        }
    }

    async createRoom(roomData) {
        try {
            return await this.httpService.post(this.basePath, roomData);
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    }

    async updateRoom(roomCode, roomData) {
        try {
            return await this.httpService.put(`${this.basePath}/${roomCode}`, roomData);
        } catch (error) {
            console.error(`Error updating room ${roomCode}:`, error);
            throw error;
        }
    }

    async delete(roomCode) {
        try {
            return await this.httpService.delete(`${this.basePath}/${roomCode}`);
        } catch (error) {
            console.error(`Error deleting room ${roomCode}:`, error);
            throw error;
        }
    }

    async searchRooms(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });

            const queryString = queryParams.toString();
            const url = queryString
                ? `${this.basePath}/search?${queryString}`
                : `${this.basePath}/search`;

            return await this.httpService.get(url, { skipAuth: true });
        } catch (error) {
            console.error("Error searching rooms:", error);
            throw error;
        }
    }

    async getRoomImages(roomId) {
        try {
            const room = await this.getRoomById(roomId);
            return room.images || [];
        } catch (error) {
            console.error(`Error fetching images for room ${roomId}:`, error);
            throw error;
        }
    }

    async getPrimaryRoomImage(roomId) {
        try {
            const images = await this.getRoomImages(roomId);
            const primaryImage = images.find((img) => img.isPrimary);
            return primaryImage ? primaryImage.url : images[0]?.url || null;
        } catch (error) {
            console.error(`Error fetching primary image for room ${roomId}:`, error);
            throw error;
        }
    }
    
    async getAllRoomTypes() {
        try {
            return await this.httpService.get(`${this.basePath}/types`, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }
}

// ✅ KHỞI TẠO Ở CUỐI FILE — KHÔNG DÙNG roomService TRƯỚC DÒNG NÀY
const roomService = new RoomService();
export default roomService;