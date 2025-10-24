package com.larose.dto.request;

import com.larose.dto.BookingDTO;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {
    private Long bookingId;
    private Long userId;
    private String provider;
    private String providerTransactionId;
    private BigDecimal amount;
    private String currency;
    private String metadata;

    // Enum dưới này dùng khi tạo hoặc cập nhật
    private String status;  // INITIATED, SUCCESS, FAILED, REFUNDED
    private String type;    // PA

    private BookingDTO bookingDTO;
}
