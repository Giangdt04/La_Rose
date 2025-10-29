package com.larose.maptruct;

import com.larose.dto.BookingDTO;
import com.larose.dto.projection.BookingProjection;
import com.larose.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    Booking toBooking(BookingDTO bookingDTO);

    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "userEmail", source = "userEmail")
    @Mapping(target = "userFullName", source = "userFullName")
    BookingDTO toBookingDTO(BookingProjection booking);

    BookingDTO toBookingDTO(Booking booking);
}
