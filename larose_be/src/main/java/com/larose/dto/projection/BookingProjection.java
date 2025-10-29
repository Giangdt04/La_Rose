package com.larose.dto.projection;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface BookingProjection {
    Long getId();
    String getBookingCode();
    LocalDate getCheckIn();
    LocalDate getCheckOut();
    Integer getNights();
    Integer getGuests();
    Double getPriceTotal();
    String getStatus();

    LocalDateTime getUpdatedAt();
    LocalDateTime getCreatedAt();

    // User info
    Long getUserId();
    String getUserEmail();
    String getUserFullName();

    // Room info
    Long getRoomId();
    String getRoomTitle();
    String getRoomCode();

    // Room type info
    Long getRoomTypeId();
    String getRoomTypeName();
}
