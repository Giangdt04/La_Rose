package com.larose.maptruct;

import com.larose.dto.BookingDTO;
import com.larose.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    Booking toBooking(BookingDTO bookingDTO);

    BookingDTO toBookingDTO(Booking booking);
}
