package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.entity.Booking;
import com.larose.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;

    public List<BookingDTO> getUserBookings(String email, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return bookings.stream()
                .map(this::convertToBookingDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getUserBookingsByStatus(String email, String status, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        try {
            Booking.Status bookingStatus = Booking.Status.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<Booking> bookings = bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), bookingStatus, pageable);

            return bookings.stream()
                    .map(this::convertToBookingDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    private BookingDTO convertToBookingDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setBookingCode(booking.getBookingCode());
        dto.setCheckIn(booking.getCheckIn());
        dto.setCheckOut(booking.getCheckOut());
        dto.setNights(booking.getNights());
        dto.setGuests(booking.getGuests());
        dto.setPriceTotal(booking.getPriceTotal());
        dto.setDepositAmount(booking.getDepositAmount());
        dto.setStatus(booking.getStatus().name());
        dto.setCancelReason(booking.getCancelReason());
        dto.setCancelledAt(booking.getCancelledAt());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        // Thông tin phòng
        if (booking.getRoom() != null) {
            dto.setRoomId(booking.getRoom().getId());
            dto.setRoomCode(booking.getRoom().getCode());
            dto.setRoomTitle(booking.getRoom().getTitle());
        }

        // Thông tin loại phòng
        if (booking.getRoomType() != null) {
            dto.setRoomTypeId(booking.getRoomType().getId());
            dto.setRoomTypeName(booking.getRoomType().getName());
        }

        // Thông tin user
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setUserEmail(booking.getUser().getEmail());
            dto.setUserFullName(booking.getUser().getFullName());
        }

        return dto;
    }
}