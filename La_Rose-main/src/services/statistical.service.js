// services/statistical.service.js
import HttpService from "./http.service";

class StatisticalService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/statistical";
    }

    // Lấy danh sách phòng đã đặt (Public)
    async getBookedRooms(minDate, maxDate) {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(
                `${this.basePath}/rooms/booked?minDate=${minDate}&maxDate=${maxDate}`,
                { skipAuth: true }
            );
        } catch (error) {
            console.error("Error fetching booked rooms:", error);
            throw error;
        }
    }

    // Lấy thống kê doanh thu (Public)
    async getRevenueStats(days = 7) {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            return await this.httpService.get(
                `${this.basePath}/revenue?days=${days}`,
                { skipAuth: true }
            );
        } catch (error) {
            console.error("Error fetching revenue stats:", error);
            throw error;
        }
    }
}

const statisticalService = new StatisticalService();
export default statisticalService;