import HttpService from "./http.service";

class RoomService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/rooms";
    }

    async getAllRooms(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page !== undefined) {
                queryParams.append("page", params.page);
            }
            if (params.size !== undefined) {
                queryParams.append("size", params.size);
            }

            if (params.status) {
                queryParams.append("status", params.status);
            }
            if (params.type) {
                queryParams.append("type", params.type);
            }
            if (params.search) {
                queryParams.append("search", params.search);
            }

            const queryString = queryParams.toString();
            const url = queryString
                ? `${this.basePath}?${queryString}`
                : this.basePath;

            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(url, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    }

    async getRoomById(roomId) {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(`${this.basePath}/${roomId}`, { skipAuth: true });
        } catch (error) {
            console.error(`Error fetching room ${roomId}:`, error);
            throw error;
        }
    }

    // (Hàm này dùng cho Admin, không cần skipAuth)
    async createRoom(roomData) {
        try {
            return await this.httpService.post(this.basePath, roomData);
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    }

    // (Hàm này dùng cho Admin, không cần skipAuth)
    async updateRoom(roomId, roomData) {
        try {
            return await this.httpService.put(`${this.basePath}/${roomId}`, roomData);
        } catch (error) {
            console.error(`Error updating room ${roomId}:`, error);
            throw error;
        }
    }

    // (Hàm này dùng cho Admin, không cần skipAuth)
    async deleteRoom(roomId) {
        try {
            return await this.httpService.delete(`${this.basePath}/${roomId}`);
        } catch (error) {
            console.error(`Error deleting room ${roomId}:`, error);
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

            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(url, { skipAuth: true });
        } catch (error) {
            console.error("Error searching rooms:", error);
            throw error;
        }
    }

    async getRoomImages(roomId) {
        try {
            // ✅ SỬA: Phải truyền skipAuth cho hàm getRoomById
            const room = await this.getRoomById(roomId); // Hàm này đã được skipAuth
            return room.images || [];
        } catch (error) {
            console.error(`Error fetching images for room ${roomId}:`, error);
            throw error;
        }
    }

    async getPrimaryRoomImage(roomId) {
        try {
            // ✅ SỬA: Phải truyền skipAuth cho hàm getRoomImages
            const images = await this.getRoomImages(roomId); // Hàm này đã được skipAuth
            const primaryImage = images.find((img) => img.isPrimary);
            return primaryImage ? primaryImage.url : images[0]?.url || null;
        } catch (error) {
            console.error(
                `Error fetching primary image for room ${roomId}:`,
                error,
            );
            throw error;
        }
    }
    
    async getAllRoomTypes() {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(`${this.basePath}/types`, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }
}

const roomService = new RoomService();
export default roomService;