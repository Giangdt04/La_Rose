package com.larose.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private String fromStatus;
    private String toStatus;

    @ManyToOne @JoinColumn(name = "changed_by_user_id")
    private User changedBy;

    @Column(columnDefinition = "text")
    private String reason;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
