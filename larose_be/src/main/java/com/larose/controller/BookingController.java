package com.larose.controller;

import com.larose.dto.BookingDTO;
import com.larose.dto.search.BookingSearchDto;
import com.larose.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

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
    public ResponseEntity<BookingDTO> update(@PathVariable Long id,@RequestBody BookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.update(id,bookingDTO));
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
