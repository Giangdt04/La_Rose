package com.larose.repository;

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


    Optional<Booking> findByRoomId(Long roomId);

}