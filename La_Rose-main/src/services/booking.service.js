// services/booking.service.js
import HttpService from "./http.service";

class BookingService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        this.basePath = "/api";
    }

    // Tạo transaction booking
    async createTransaction(transactionData) {
        try {
            return await this.httpService.post(
                `${this.basePath}/transaction`,
                transactionData,
            );
        } catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        }
    }

    // Gửi yêu cầu thanh toán VNPay - FIXED VERSION
    async submitVNPayOrder(orderData) {
        try {
            // Sử dụng URLSearchParams
            const params = new URLSearchParams();
            params.append("amount", orderData.amount.toString());

            // Tạo orderInfo đơn giản, an toàn
            const safeOrderInfo = `Booking${orderData.roomId}${Date.now()
                .toString()
                .slice(-6)}`;
            params.append("orderInfo", safeOrderInfo);

            params.append("roomId", orderData.roomId.toString());

            console.log(
                "Sending VNPay request with params:",
                Object.fromEntries(params),
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
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("VNPay API error response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Kiểm tra Content-Type của response
            const contentType = response.headers.get("content-type");
            console.log("Response Content-Type:", contentType);

            let result;

            if (contentType && contentType.includes("application/json")) {
                // Nếu là JSON, parse như bình thường
                result = await response.json();
            } else {
                // Nếu không phải JSON, có thể là URL trực tiếp
                const text = await response.text();
                console.log("Raw response text:", text);

                // Kiểm tra xem có phải là URL không
                if (text.startsWith("http")) {
                    result = { paymentUrl: text };
                } else {
                    // Thử parse như JSON nếu có thể
                    try {
                        result = JSON.parse(text);
                    } catch {
                        // Nếu không parse được, trả về text
                        result = { paymentUrl: text };
                    }
                }
            }

            console.log("Processed VNPay response:", result);
            return result;
        } catch (error) {
            console.error("Error submitting VNPay order:", error);
            throw new Error(
                "Không thể kết nối đến cổng thanh toán VNPay: " + error.message,
            );
        }
    }

    // Kiểm tra tính khả dụng phòng
    async checkRoomAvailability(roomId, checkin, checkout) {
        try {
            const response = await this.httpService.get(
                `${this.basePath}/statistical/rooms/booked?minDate=${checkin}&maxDate=${checkout}`,
            );

            // Xử lý response dựa trên cấu trúc thực tế
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

            // Kiểm tra xem phòng có bị booked không
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
                            bookingCheckOut,
                        )
                    );
                });

            return !isBooked;
        } catch (error) {
            console.error("Error checking room availability:", error);
            return true; // Mặc định cho phép booking nếu có lỗi
        }
    }

    // Helper function kiểm tra trùng ngày
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

    // Lấy token từ auth service
    getAccessToken() {
        return localStorage.getItem("accessToken");
    }
}

const bookingService = new BookingService();
export default bookingService;
