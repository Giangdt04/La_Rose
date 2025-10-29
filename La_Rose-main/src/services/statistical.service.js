import HttpService from "./http.service";

class StatisticalService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/statistical";
  }

  async getBookedRooms(minDate, maxDate) {
    try {
      return await this.httpService.get(
        `${this.basePath}/rooms/booked?minDate=${minDate}&maxDate=${maxDate}`
      );
    } catch (error) {
      console.error("Error fetching booked rooms:", error);
      throw error;
    }
  }

  async getRevenueStats(days = 7) {
    try {
      return await this.httpService.get(
        `${this.basePath}/revenue?days=${days}`
      );
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      throw error;
    }
  }

  async getTotalRooms() {
    try {
      return await this.httpService.get(`${this.basePath}/rooms/total`);
    } catch (error) {
      console.error("Error fetching total rooms:", error);
      throw error;
    }
  }
}

const statisticalService = new StatisticalService();
export default statisticalService;
