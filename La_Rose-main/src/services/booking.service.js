// /src/services/booking.service.js
import HttpService from "./http.service";
import session from "../utils/SessionManager"; // Giả sử bạn dùng session manager

class BookingService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        // ✅ SỬA 1: Đổi basePath thành "/api/bookings" để khớp SecurityConfig
        this.basePath = "/api/bookings"; 
        this.roomTypePath = "/api/room-types"; // ✅ Đã public (permitAll)
        this.vnpayPath = "/api/vnpay";
        this.transactionPath = "/api/transaction";
    }

    // --- HÀM 1: LẤY TẤT CẢ LOẠI PHÒNG (Cho Step 1) ---
    async getAllRoomTypes() {
        try {
            // ✅ SỬA: Thêm { skipAuth: true } → Không gửi token (public endpoint)
            return await this.httpService.get(this.roomTypePath, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }

    // --- HÀM 2: LẤY NGÀY ĐÃ ĐẶT CỦA 1 PHÒNG (Cho Step 1) ---
    async getBookedDates(roomId) {
        try {
            // ✅ SỬA: Thêm { skipAuth: true } → Không gửi token
            // (Lưu ý: Backend cần thêm permitAll cho /api/bookings/booking-date/**)
            return await this.httpService.get(`${this.basePath}/booking-date/${roomId}`, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching booked dates:", error);
            throw error;
        }
    }

    // --- HÀM 3: KIỂM TRA TÍNH KHẢ DỤNG (check-availability) ---
    async checkRoomAvailability(roomId, checkIn, checkOut) {
        try {
            const checkData = { roomId, checkIn, checkOut };
            // ✅ SỬA: Thêm { skipAuth: true } → Không gửi token (permitAll)
            return await this.httpService.post(
                `${this.basePath}/check-availability`, 
                checkData,
                { skipAuth: true }
            );
        } catch (error) {
            console.error("Error checking availability:", error);
            throw error;
        }
    }

    // --- HÀM 4: TẠO BOOKING ---
    async createBooking(bookingData) {
         try {
            // ✅ Không skipAuth → Gửi token (yêu cầu USER)
            return await this.httpService.post(`${this.basePath}/create`, bookingData);
         } catch (error) {
            console.error("Error creating booking:", error);
            throw error;
         }
    }

    // --- HÀM 5: TẠO TRANSACTION (Cho thanh toán "Cash") ---
    async createTransaction(transactionData) {
        try {
            // ✅ Không skipAuth → Gửi token (yêu cầu USER)
            return await this.httpService.post(
                this.transactionPath, 
                transactionData
            );
        } catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        }
    }

    // --- HÀM 6: GỌI VNPAY (Đã public, dùng fetch riêng) ---
    async submitVNPayOrder(orderData) {
        try {
            const params = new URLSearchParams();
            params.append("amount", orderData.amount.toString());
            
            const safeOrderInfo = `Booking${orderData.roomId || Date.now().toString().slice(-6)}`;
            params.append("orderInfo", safeOrderInfo);
            
            if(orderData.roomId) {
                params.append("roomId", orderData.roomId.toString());
            }

            const response = await fetch(
                `${this.httpService.baseURL}${this.vnpayPath}/submit-order`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // ✅ Không gửi Authorization → permitAll OK
                    },
                    body: params,
                },
            );
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }

            const contentType = response.headers.get("content-type");
            let result;

            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                try {
                     result = JSON.parse(text);
                } catch(e) {
                     result = { paymentUrl: text.startsWith("http") ? text : null };
                }
            }
            return result;

        } catch (error) {
            console.error("Error submitting VNPay order:", error);
            throw new Error("Không thể kết nối đến cổng thanh toán VNPay: " + error.message);
        }
    }

    // --- HÀM 7: LẤY TOKEN (Helper) ---
    getAccessToken() {
        return session.getToken ? session.getToken() : localStorage.getItem("accessToken");
    }
}

const bookingService = new BookingService();
export default bookingService;