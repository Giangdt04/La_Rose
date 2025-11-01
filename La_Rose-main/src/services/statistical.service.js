// /src/services/statistical.service.js
import HttpService from "./http.service";

class StatisticalService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api/statistical";
    }

    async getTotalRooms() {
        return await this.httpService.get(`${this.basePath}/rooms/total`, { skipAuth: true });
    }

    async getBookedRooms(minDate, maxDate) {
        let url = `${this.basePath}/rooms/booked`;
        const params = new URLSearchParams();
        if (minDate) params.append("minDate", minDate);
        if (maxDate) params.append("maxDate", maxDate);
        if (params.toString()) url += `?${params.toString()}`;
        return await this.httpService.get(url, { skipAuth: true });
    }

    async getRevenue(days = 7) {
        return await this.httpService.get(`${this.basePath}/revenue?days=${days}`, { skipAuth: true });
    }
}

const statisticalService = new StatisticalService();
export default statisticalService;