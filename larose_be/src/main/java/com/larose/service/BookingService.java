package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.entity.Booking;
import com.larose.entity.Room;
import com.larose.entity.User;
import com.larose.maptruct.BookingMapper;
import com.larose.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final RoomService roomService;
    private final BookingMapper bookingMapper;

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

    public BookingDTO create(BookingDTO request) {
        Booking booking = bookingMapper.toBooking(request);

        this.genCode(booking);

        User user = userService.findByEmailAndActive(request.getUserEmail());
        if (user == null) {
            throw new IllegalArgumentException("Not existing user: " + request.getUserEmail());
        }

        booking.setUser(user);

        Room room = roomService.getRoom(request.getRoomCode());
        booking.setRoom(room);
        if (room.getRoomType() == null) {
            throw new IllegalArgumentException("Phòng không có loại phòng được gán.");
        }
        booking.setRoomType(room.getRoomType());

        BigDecimal total = room.getRoomType().getBasePrice()
                .multiply(BigDecimal.valueOf(request.getNights()));
        booking.setPriceTotal(total);

        return this.convertToBookingDTO(bookingRepository.save(booking));
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        int updated = bookingRepository.setCancelledBooking(bookingId);
        if (updated == 0) {
            throw new IllegalArgumentException("Không thể hủy booking (đã quá 2h hoặc chưa thanh toán)");
        }
    }


    private void genCode(Booking entity) {
        if(bookingRepository.getTop1()==null){
            entity.setBookingCode("BK1");
        }else{
            String code = bookingRepository.getTop1().getBookingCode();
            entity.setBookingCode(code.substring(0,2)+((Integer.parseInt(code.substring(2)))+1));
        }
    }

    public Booking getBookingByCode(String code) {
        return bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with code: " + code));
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