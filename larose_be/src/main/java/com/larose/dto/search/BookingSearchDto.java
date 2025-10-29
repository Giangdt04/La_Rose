package com.larose.dto.search;

import com.larose.entity.Booking;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSearchDto extends SearchDto {
    private Booking.Status status;
    private String code;
}
