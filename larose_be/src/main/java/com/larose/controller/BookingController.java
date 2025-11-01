package com.larose.controller;

import com.larose.dto.BookingDTO;
import com.larose.dto.search.BookingSearchDto;
import com.larose.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // ✅ SỬA: Thêm import
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ✅ SỬA: Thêm endpoint này để phục vụ trang HistoryBookingPage.jsx
    /**
     * Lấy lịch sử đặt phòng của người dùng đã đăng nhập (FE đang gọi)
     */
    @GetMapping("/my-history")
    public ResponseEntity<Page<BookingDTO>> getMyHistory(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Principal principal
    ) {
        if (principal == null) {
            // Yêu cầu xác thực
            return ResponseEntity.status(401).build(); 
        }
        
        // FE gửi 'all' cho tất cả, service hiểu 'null' cho tất cả
        String statusFilter = (status != null && status.equalsIgnoreCase("all")) ? null : status;

        Page<BookingDTO> bookings = bookingService.getUserBookingsByStatus(principal.getName(), statusFilter, page, size);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok("Booking đã được hủy thành công");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Đã xảy ra lỗi khi hủy booking");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> update(@PathVariable Long id, @RequestBody BookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.update(id, bookingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        bookingService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @GetMapping
    public ResponseEntity<Page<BookingDTO>> getBookings(BookingSearchDto request) {
        return ResponseEntity.ok(bookingService.getAll(request));
    }

    @GetMapping("/booking-date/{roomId}")
    public ResponseEntity<List<BookingDTO>> getBookingDateWithRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getBookingDateWithRoomId(roomId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getDetail(id));
    }

}