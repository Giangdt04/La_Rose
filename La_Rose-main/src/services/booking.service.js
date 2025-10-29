import HttpService from "./http.service";

class BookingService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api";
  }

  async createTransaction(transactionData) {
    try {
      return await this.httpService.post(
        `${this.basePath}/transaction`,
        transactionData
      );
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async submitVNPayOrder(orderData) {
    try {
      const params = new URLSearchParams();
      params.append("amount", orderData.amount.toString());

      const safeOrderInfo = `Booking${orderData.roomId}${Date.now()
        .toString()
        .slice(-6)}`;
      params.append("orderInfo", safeOrderInfo);

      params.append("roomId", orderData.roomId.toString());

      console.log(
        "Sending VNPay request with params:",
        Object.fromEntries(params)
      );

      const response = await fetch(
        `${this.httpService.baseURL}${this.basePath}/vnpay/submit-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("VNPay API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Response Content-Type:", contentType);

      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.log("Raw response text:", text);

        if (text.startsWith("http")) {
          result = { paymentUrl: text };
        } else {
          try {
            result = JSON.parse(text);
          } catch {
            result = { paymentUrl: text };
          }
        }
      }

      console.log("Processed VNPay response:", result);
      return result;
    } catch (error) {
      console.error("Error submitting VNPay order:", error);
      throw new Error(
        "Không thể kết nối đến cổng thanh toán VNPay: " + error.message
      );
    }
  }

  async checkRoomAvailability(roomId, checkin, checkout) {
    try {
      const response = await this.httpService.get(
        `${this.basePath}/statistical/rooms/booked?minDate=${checkin}&maxDate=${checkout}`
      );

      let bookedRooms = [];

      if (Array.isArray(response)) {
        bookedRooms = response;
      } else if (response && Array.isArray(response.data)) {
        bookedRooms = response.data;
      } else if (response && response.bookedRooms) {
        bookedRooms = response.bookedRooms;
      } else if (typeof response === "object") {
        bookedRooms = Object.values(response);
      }

      console.log("Booked rooms data:", bookedRooms);

      const isBooked =
        Array.isArray(bookedRooms) &&
        bookedRooms.some((booking) => {
          if (!booking || typeof booking !== "object") return false;

          const bookingRoomId =
            booking.roomId || booking.id || booking.room?.id;
          const bookingCheckIn =
            booking.checkIn || booking.checkin || booking.startDate;
          const bookingCheckOut =
            booking.checkOut || booking.checkout || booking.endDate;

          if (!bookingRoomId || !bookingCheckIn || !bookingCheckOut) {
            return false;
          }

          return (
            bookingRoomId === roomId &&
            this.isDateOverlap(
              checkin,
              checkout,
              bookingCheckIn,
              bookingCheckOut
            )
          );
        });

      return !isBooked;
    } catch (error) {
      console.error("Error checking room availability:", error);
      return true;
    }
  }

  isDateOverlap(checkin1, checkout1, checkin2, checkout2) {
    try {
      const start1 = new Date(checkin1);
      const end1 = new Date(checkout1);
      const start2 = new Date(checkin2);
      const end2 = new Date(checkout2);

      return start1 < end2 && start2 < end1;
    } catch (error) {
      console.error("Error in date overlap check:", error);
      return false;
    }
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  async cancelBooking(bookingId) {
    try {
      return await this.httpService.put(
        `${this.basePath}/booking/cancel/${bookingId}`,
        {}
      );
    } catch (error) {
      console.error("Error canceling booking:", error);
      throw error;
    }
  }
}

const bookingService = new BookingService();
export default bookingService;
