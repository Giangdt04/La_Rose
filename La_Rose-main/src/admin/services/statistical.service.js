import HttpService from "../../services/http.service";

class StatisticalService extends HttpService {
    constructor() {
        super("http://localhost:8080/api");
    }

    async getTotalRooms() {
        try {
            const response = await this.get("/statistical/rooms/total");
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

            const response = await this.get(url);
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

            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error("Error fetching revenue:", error);
            throw error;
        }
    }
}

export default new StatisticalService();

