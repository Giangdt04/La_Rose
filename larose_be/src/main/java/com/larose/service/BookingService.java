package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.dto.projection.BookingProjection;
import com.larose.dto.search.BookingSearchDto;
import com.larose.dto.search.SearchDto;
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
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.util.Collections;
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

    public Page<BookingDTO> getUserBookingsByStatus(String email, String status, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Booking> bookings = bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(),
                    status == null ? null : Booking.Status.valueOf(status), pageable);

            return bookings.map(this::convertToBookingDTO);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    public Page<BookingDTO> getAll(BookingSearchDto request) {
        Pageable pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize());

        Page<BookingProjection> bookings = bookingRepository.getAll(request, pageable);

        return bookings.map(bookingMapper::toBookingDTO);
    }

    public List<BookingDTO> getBookingDateWithRoomId(Long roomId) {
        if (roomId == null) {
            return Collections.emptyList();
        }
        List<Booking> list = bookingRepository.getBookingDateWithRoomId(roomId);
        if (CollectionUtils.isEmpty(list)) {
            return Collections.emptyList();
        }
        return list.stream().map(bookingMapper::toBookingDTO).collect(Collectors.toList());
    }

    public BookingDTO getDetail(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return convertToBookingDTO(booking);
    }

    @Transactional
    public BookingDTO create(BookingDTO request) {
        Booking booking = bookingMapper.toBooking(request);
        booking.setStatus(Booking.Status.confirmed); 
        this.genCode(booking);

        User user = userService.findByEmailAndActive(request.getUserEmail());
        if (user == null) {
            throw new IllegalArgumentException("Not existing user: " + request.getUserEmail());
        }
        booking.setUser(user);

        // ✅ SỬA: DÙNG roomId → GỌI roomService.getRoomById()
        Room room = roomService.getRoomById(request.getRoomId());
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
    public BookingDTO update(Long id, BookingDTO request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Booking with id: " + id));

        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setGuests(request.getGuests());
        booking.setNights(request.getNights());

        Room room = booking.getRoom();

        // ✅ SỬA: SO SÁNH roomId (Long) thay vì roomCode (String)
        if (!booking.getRoom().getId().equals(request.getRoomId())) {
            room = roomService.getRoomById(request.getRoomId());
            booking.setRoom(room);
        }

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
    public void delete(Long id) {
        Booking delete = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Booking with id: " + id));
        delete.setStatus(Booking.Status.no_show);
        bookingRepository.save(delete);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        int updated = bookingRepository.setCancelledBooking(bookingId);
        if (updated == 0) {
            throw new IllegalArgumentException("Không thể hủy booking (đã quá 2h hoặc chưa thanh toán)");
        }
    }

    public Page<BookingDTO> getAllBookingsForAdmin(String status, String search, Pageable pageable) {
        Page<Booking> bookings;

        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            try {
                bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(Booking.Status.valueOf(status), pageable);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return bookings.map(this::convertToBookingDTO);
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
        return convertToBookingDTO(booking);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        try {
            booking.setStatus(Booking.Status.valueOf(status));
            Booking updated = bookingRepository.save(booking);
            return convertToBookingDTO(updated);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    @Transactional
    public void cancelBookingByAdmin(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        booking.setStatus(Booking.Status.cancelled);
        booking.setCancelReason(reason);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
    }

    private void genCode(Booking entity) {
        if (bookingRepository.getTop1() == null) {
            entity.setBookingCode("BK1");
        } else {
            String code = bookingRepository.getTop1().getBookingCode();
            entity.setBookingCode(code.substring(0, 2) + ((Integer.parseInt(code.substring(2))) + 1));
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