package com.larose.maptruct;

import com.larose.dto.request.TransactionRequest;
import com.larose.dto.response.TransactionResponse;
import com.larose.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction toEntity(TransactionRequest request);

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "bookingDTO", source = "booking")
    TransactionResponse toResponse(Transaction transaction);
}
