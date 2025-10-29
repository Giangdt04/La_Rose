import HttpService from "../../services/http.service";

class BookingService extends HttpService {
    constructor() {
        super("http://localhost:8080/api");
    }

    async getAllBookings(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await this.get(`/admin/bookings?${queryString}`);
            return response;
        } catch (error) {
            console.error("Error in getAllBookings:", error);
            throw error;
        }
    }

    async getHistoryBookings(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await this.get(`/users/bookings/status?${queryString}`);
            return response;
        } catch (error) {
            console.error("Error in getAllBookings:", error);
            throw error;
        }
    }


    async getBookingById(bookingId) {
        try {
            const response = await this.get(`/admin/bookings/${bookingId}`);
            return response;
        } catch (error) {
            console.error("Error in getBookingById:", error);
            throw error;
        }
    }

    async updateBookingStatus(bookingId, status) {
        try {
            const response = await this.put(
                `/admin/bookings/${bookingId}/status?status=${status}`,
            );
            return response;
        } catch (error) {
            console.error("Error in updateBookingStatus:", error);
            throw error;
        }
    }

    async cancelBooking(bookingId, reason = "") {
        try {
            const response = await this.put(
                `/admin/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`,
            );
            return response;
        } catch (error) {
            console.error("Error in cancelBooking:", error);
            throw error;
        }
    }

    async cancelUserBooking(bookingId) {
        try {
            const response = await this.put(`/booking/cancel/${bookingId}`);
            return response;
        } catch (error) {
            console.error("Error in cancelUserBooking:", error);
            throw error;
        }
    }
}

export default new BookingService();

