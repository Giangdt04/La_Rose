package com.larose.service;

import com.larose.dto.DailyRevenueDto;
import com.larose.dto.OccupancyRateDto;
import com.larose.dto.WeeklyRevenueDto;
import com.larose.repository.BookingRepository;
import com.larose.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date; // ← QUAN TRỌNG: import đúng java.sql.Date
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticalService {
    RoomRepository roomRepository;
    BookingRepository bookingRepository;

    public Long countAllRooms() {
        return roomRepository.countAllRooms();
    }

    public Long countRoomsHasBeenBooked(LocalDate minDate, LocalDate maxDate) {
        return bookingRepository.countRoomsHasBeenBooked(minDate, maxDate);
    }

    public BigDecimal sumTotalPrice(Integer days) {
        return bookingRepository.sumTotalPrice(days);
    }

    public List<DailyRevenueDto> getDailyRevenue(Integer lastDays) {
        int days = lastDays == null ? 30 : lastDays;
        return bookingRepository.findDailyRevenue(days)
                .stream()
                .map(row -> {
                    LocalDate date = ((Date) row[0]).toLocalDate();
                    BigDecimal revenue = ((BigDecimal) row[1]).setScale(2, RoundingMode.HALF_UP);
                    return new DailyRevenueDto(date, revenue);
                })
                .collect(Collectors.toList());
    }

    public List<WeeklyRevenueDto> getWeeklyRevenue(Integer lastWeeks) {
        int weeks = lastWeeks == null ? 12 : lastWeeks;
        return bookingRepository.findWeeklyRevenue(weeks)
                .stream()
                .map(row -> {
                    Integer weekNumber = (Integer) row[0];
                    LocalDate startDate = ((Date) row[1]).toLocalDate();
                    LocalDate endDate = ((Date) row[2]).toLocalDate();
                    BigDecimal revenue = ((BigDecimal) row[3]).setScale(2, RoundingMode.HALF_UP);
                    return new WeeklyRevenueDto(weekNumber, startDate, endDate, revenue);
                })
                .collect(Collectors.toList());
    }

    public OccupancyRateDto getOccupancyRate(LocalDate minDate, LocalDate maxDate) {
        Long total = roomRepository.countAllRooms();
        Long booked = bookingRepository.countRoomsHasBeenBooked(minDate, maxDate);
        double rate = total > 0 ? (booked.doubleValue() / total.doubleValue()) * 100 : 0.0;
        return new OccupancyRateDto(booked, total, BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP));
    }
}