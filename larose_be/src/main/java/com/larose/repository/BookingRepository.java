package com.larose.repository;

import com.larose.dto.projection.BookingProjection;
import com.larose.dto.projection.RoomsProjection;
import com.larose.dto.search.BookingSearchDto;
import com.larose.dto.search.RoomSearchDto;
import com.larose.entity.Booking;
import com.larose.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") Long userId,
                                                            @Param("status") Booking.Status status,
                                                            Pageable pageable);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    List<Booking> findByUserIdAndRoomIdOrderByCreatedAtDesc(Long userId, Long roomId);

    @Query(value = """
            select * from bookings order by bookings.id desc limit 1
            """,nativeQuery = true)
    Booking getTop1();

    Optional<Booking> findByBookingCode(String code);

    @Modifying
    @Query(value = """
            UPDATE bookings b
                JOIN transactions t ON b.id = t.booking_id
            SET b.status = 'cancelled',
                t.status = 'refunded'
            WHERE b.id = :bookingId
              AND b.status = 'confirmed'
              AND t.status = 'success'
              AND b.created_at >= NOW() - INTERVAL 2 HOUR
            """,nativeQuery = true)
    int setCancelledBooking(@Param("bookingId") Long id);

    @Query(value = """
                  SELECT COUNT(DISTINCT b.room_id)
                               FROM bookings b
                               WHERE b.status = 'confirmed'
            AND ((:#{#minDate}) IS NULL OR (:#{#minDate}) <= DATE(b.check_out))
            AND ((:#{#maxDate}) IS NULL OR (:#{#maxDate}) >= DATE(b.check_in))
            """, nativeQuery = true)
    Long countRoomsHasBeenBooked(@Param("minDate") LocalDate minDate, @Param("maxDate") LocalDate maxDate);

    @Query(value = """
            SELECT COALESCE(SUM(b.price_total), 0) AS total_revenue
                   FROM bookings b
                   WHERE b.status = 'CONFIRMED'
                   AND (:days IS NULL OR b.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY))
            """, nativeQuery = true)
    BigDecimal sumTotalPrice(@Param("days") Integer days);

    @Query(value = """
                    SELECT * FROM bookings
                    where check_out >= NOW()
                    and room_id = :roomId
                    """, nativeQuery = true)
    List<Booking> getBookingDateWithRoomId(Long roomId);

    @Query(value = """
    SELECT 
        b.id AS id,
        b.booking_code AS bookingCode,
        b.check_in AS checkIn,
        b.check_out AS checkOut,
        b.nights AS nights,
        b.guests AS guests,
        b.price_total AS priceTotal,
        b.status AS status,
        b.updated_at AS updatedAt,
        b.created_at AS createdAt,

        u.id AS userId,
        u.email AS userEmail,
        u.full_name AS userFullName,

        r.id AS roomId,
        r.title AS roomTitle,
        r.code AS roomCode,

        t.id AS roomTypeId,
        t.name AS roomTypeName
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN room_types t ON b.room_type_id = t.id
    WHERE (:#{#request.status} IS NULL OR b.status LIKE CONCAT(:#{#request.status}, '%'))
        AND (:#{#request.code} IS NULL OR b.booking_code LIKE CONCAT(:#{#request.code}, '%'))
    ORDER BY b.created_at DESC
    """, nativeQuery = true)
    Page<BookingProjection> getAll(BookingSearchDto request, Pageable pageable);

    Optional<Booking> findByRoomId(Long roomId);

}