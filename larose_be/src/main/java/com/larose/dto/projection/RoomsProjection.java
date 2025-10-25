package com.larose.dto.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface RoomsProjection {
    Long getRoomId();
    String getRoomCode();
    String getRoomTitle();
    BigDecimal getRoomPrice();
    String getRoomStatus();
    LocalDateTime getRoomCreatedAt();
    LocalDateTime getRoomDeletedAt();
    LocalDateTime getRoomUpdatedAt();
    String getRoomDescription();

    // Type info
    Long getTypeId();
    String getTypeName();
    String getTypeShortDescription();
    BigDecimal getBasePrice();

    // Image info
    Long getImageId();
    Boolean getImageIsPrimary();
    String getImageUrl();
}
