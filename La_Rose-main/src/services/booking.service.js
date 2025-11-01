// /src/services/booking.service.js
import HttpService from "./http.service";
import session from "../utils/SessionManager"; // Giả sử bạn dùng session manager

class BookingService {
    constructor() {
        this.httpService = new HttpService("http://localhost:8080");
        
        // ✅ SỬA 1: SỬA LẠI CHO ĐÚNG
        // Phải là 'booking' (số ít) để khớp với BookingController và SecurityConfig
        this.basePath = "/api/booking"; 
        
        this.roomTypePath = "/api/room-types"; // ✅ Đã public (permitAll)
        this.vnpayPath = "/api/vnpay";
        this.transactionPath = "/api/transaction";
    }

    // --- HÀM 1: LẤY TẤT CẢ LOẠI PHÒNG (Cho Step 1) ---
    async getAllRoomTypes() {
        try {
            return await this.httpService.get(this.roomTypePath, { skipAuth: true });
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }

    // --- HÀM 2: LẤY NGÀY ĐÃ ĐẶT CỦA 1 PHÒNG (Cho Step 1) ---
    async getBookedDates(roomId) {
        try {
            // Dùng this.basePath (đã sửa)
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
            // Dùng this.basePath (đã sửa)
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
    // (Giả sử bạn có endpoint POST /api/booking/create ở BE)
    async createBooking(bookingData) {
         try {
            // Dùng this.basePath (đã sửa)
             return await this.httpService.post(`${this.basePath}/create`, bookingData);
         } catch (error) {
             console.error("Error creating booking:", error);
             throw error;
         }
    }

    // --- HÀM 5: TẠO TRANSACTION (Cho thanh toán "Cash") ---
    async createTransaction(transactionData) {
        try {
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
        // ... (code VNPAY của bạn giữ nguyên, nó không dùng basePath) ...
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
    
    // ---
    // ✅ SỬA 2: BỔ SUNG CÁC HÀM MÀ HistoryBookingPage.jsx CẦN
    // ---

    /**
     * Lấy lịch sử đặt phòng của user hiện tại
     * (Gọi GET /api/booking/my-history)
     */
    async getHistoryBookings(params) {
        try {
            // Yêu cầu xác thực, không skipAuth
            // httpService.get sẽ tự động chuyển {params} thành query string
            return await this.httpService.get(`${this.basePath}/my-history`, { params });
        } catch (error) {
            console.error("Error in getHistoryBookings:", error);
            throw error;
        }
    }

    /**
     * Hủy một booking
     * (Gọi PUT /api/booking/cancel/{bookingId})
     */
    async cancelBooking(bookingId) {
        try {
            // Yêu cầu xác thực, không skipAuth
            return await this.httpService.put(`${this.basePath}/cancel/${bookingId}`);
        } catch (error) {
            console.error("Error in cancelBooking:", error);
            throw error;
        }
    }
}

const bookingService = new BookingService();
export default bookingService;