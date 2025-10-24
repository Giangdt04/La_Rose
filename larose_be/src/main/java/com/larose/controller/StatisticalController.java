package com.larose.controller;

import com.larose.service.StatisticalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistical")
@RequiredArgsConstructor
public class StatisticalController {
    private final StatisticalService statisticalService;

    @GetMapping("/rooms/total")
    public ResponseEntity<Long> countAllRooms() {
        return ResponseEntity.ok(statisticalService.countAllRooms());
    }

    @GetMapping("/rooms/booked")
    public ResponseEntity<Long> countRoomsHasBeenBooked(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate minDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate maxDate
    ) {
        return ResponseEntity.ok(statisticalService.countRoomsHasBeenBooked(minDate, maxDate));
    }

    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> sumTotalPrice(
            @RequestParam(required = false) Integer days
    ) {
        return ResponseEntity.ok(statisticalService.sumTotalPrice(days));
    }
}
