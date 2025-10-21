package com.larose.repository;

import com.larose.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}