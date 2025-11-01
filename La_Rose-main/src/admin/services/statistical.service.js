// /src/services/statistical.service.js
import HttpService from "../../services/http.service";

class StatisticalService extends HttpService {
    constructor() {
        super("http://localhost:8080/api"); // BASE_URL đã bao gồm /api
    }

    async getTotalRooms() {
        try {
            // ✅ SỬA: Thêm { skipAuth: true }
            // API này public, không cần gửi token
            const response = await this.get("/statistical/rooms/total", { skipAuth: true });
            return response;
        } catch (error) {
            console.error("Error fetching total rooms:", error);
            throw error;
        }
    }

    async getBookedRooms(minDate, maxDate) {
        try {
            let url = "/statistical/rooms/booked";
            const params = [];
            if (minDate) params.push(`minDate=${minDate}`);
            if (maxDate) params.push(`maxDate=${maxDate}`);
            if (params.length > 0) url += "?" + params.join("&");

            // ✅ SỬA: Thêm { skipAuth: true }
            const response = await this.get(url, { skipAuth: true });
            return response;
        } catch (error) {
            console.error("Error fetching booked rooms:", error);
            throw error;
        }
    }

    async getRevenue(days) {
        try {
            let url = "/statistical/revenue";
            if (days) url += `?days=${days}`;

            // ✅ SỬA: Thêm { skipAuth: true }
            const response = await this.get(url, { skipAuth: true });
            return response;
        } catch (error) {
            console.error("Error fetching revenue:", error);
            throw error;
        }
    }

    // ✅ SỬA: Thêm hàm mới để lấy dữ liệu biểu đồ
    /**
     * Lấy dữ liệu doanh thu theo từng ngày để vẽ biểu đồ
     * @param {number} days Số ngày cần lấy (ví dụ: 7 ngày cho 1 tuần)
     * @returns {Promise<object>} Dữ liệu chart: { labels: ['Ngày 1', ...], data: [1000, ...] }
     */
    async getRevenueChartData(days = 7) {
        try {
            // Lưu ý: Bạn cần tạo API Backend cho đường dẫn này
            // API nên trả về JSON: { "labels": ["T2", "T3", ...], "data": [1500000, ...] }
            const response = await this.get(
                `/statistical/revenue-chart?days=${days}`,
                // Giả sử API admin mới cần token, nên KHÔNG skipAuth
                // Nếu bạn muốn public API này, hãy thêm { skipAuth: true }
            );
            return response;
        } catch (error) {
            console.error("Error fetching revenue chart data:", error);
            // Cung cấp dữ liệu giả (fake data) nếu API lỗi để không làm hỏng layout
            return this.getFakeChartData(days);
        }
    }

    // (Hàm này chỉ để dự phòng nếu API lỗi)
    getFakeChartData(days) {
        const labels = [];
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            data.push(Math.floor(Math.random() * 3000000) + 500000); // Doanh thu giả
        }
        return { labels, data };
    }
}

export default new StatisticalService();