package com.larose.service;

import com.larose.repository.BookingRepository;
import com.larose.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticalService {
    RoomRepository roomRepository;

    BookingRepository bookingRepository;

    public Long countAllRooms(){
        return roomRepository.countAllRooms();
    }

    public Long countRoomsHasBeenBooked(LocalDate minDate, LocalDate maxDate){
        return bookingRepository.countRoomsHasBeenBooked(minDate, maxDate);
    }

    public BigDecimal sumTotalPrice(Integer days){
        return Optional.ofNullable(bookingRepository.sumTotalPrice(days))
                .orElse(BigDecimal.ZERO);
    }
}
