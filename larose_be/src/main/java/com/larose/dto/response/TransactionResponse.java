package com.larose.dto.response;

import com.larose.dto.BookingDTO;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;
    private Long bookingId;
    private Long userId;
    private String provider;
    private String providerTransactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String type;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    BookingDTO bookingDTO;
}
