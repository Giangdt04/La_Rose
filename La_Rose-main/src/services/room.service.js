import HttpService from "./http.service";

class RoomService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/rooms";
    }

    /**
     * ✅ SỬA LỖI LOGIC:
     * Viết lại hoàn toàn hàm này để gửi đúng param (keyword, minPrice, v.v.)
     * mà RoomsPage.jsx cung cấp và RoomController.java mong đợi.
     */
    async getAllRooms(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // 1. Thêm tham số phân trang
            if (params.page !== undefined) {
                queryParams.append("page", params.page);
            }
            if (params.size !== undefined) {
                queryParams.append("size", params.size);
            }

            // 2. Thêm tham số filter (từ RoomsPage.jsx)
            if (params.keyword) {
                queryParams.append("keyword", params.keyword);
            }
            if (params.minPrice) {
                queryParams.append("minPrice", params.minPrice);
            }
            if (params.maxPrice) {
                queryParams.append("maxPrice", params.maxPrice);
            }
            if (params.typeId) {
                queryParams.append("typeId", params.typeId);
            }
            
            const queryString = queryParams.toString();
            const url = queryString
                ? `${this.basePath}?${queryString}`
                : this.basePath;

            // Trang này công khai, nên thêm { skipAuth: true }
            // (Nếu http.service.js của bạn không hỗ trợ, cứ bỏ 'config' đi)
            const config = { skipAuth: true };
            
            return await this.httpService.get(url, config);

        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    }

    async getRoomById(roomId) {
        try {
            // Trang này công khai
            const config = { skipAuth: true };
            return await this.httpService.get(`${this.basePath}/${roomId}`, config);
        } catch (error) {
            console.error(`Error fetching room ${roomId}:`, error);
            throw error;
        }
    }

    /**
     * ✅ THÊM HÀM MỚI:
     * Hàm này để lấy loại phòng cho bộ lọc (Dropdown)
     * (RoomController của bạn đã có /api/rooms/types)
     */
    async getAllRoomTypes() {
        try {
            // Trang này công khai
            const config = { skipAuth: true };
            return await this.httpService.get(`${this.basePath}/types`, config);
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }


    // (Các hàm create/update/delete... ở dưới)
    // ...
    // (Bạn cần đính kèm token cho các hàm này)

    async createRoom(formData) {
        try {
            // Ví dụ: hàm create cần token
            return await this.httpService.post(this.basePath, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    }

    async updateRoom(roomCode, formData) {
        try {
            // Ví dụ: hàm update cần token
            return await this.httpService.put(`${this.basePath}/${roomCode}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } catch (error) {
            console.error(`Error updating room ${roomCode}:`, error);
            throw error;
        }
    }
}

const roomService = new RoomService();
export default roomService;