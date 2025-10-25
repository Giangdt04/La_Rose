package com.larose.service;

import com.larose.constant.StatusConstant;
import com.larose.dto.BookingDTO;
import com.larose.dto.request.TransactionRequest;
import com.larose.dto.response.TransactionResponse;
import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import com.larose.maptruct.BookingMapper;
import com.larose.maptruct.TransactionMapper;
import com.larose.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final BookingService bookingService;
    private final TransactionMapper transactionMapper;
    private final BookingMapper bookingMapper;

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        Transaction transaction = transactionMapper.toEntity(request);
        BookingDTO bookingDTO = bookingService.create(request.getBookingDTO());
        Booking getBookingByCode = bookingService.getBookingByCode(bookingDTO.getBookingCode());
        transaction.setUser(getBookingByCode.getUser());
        transaction.setBooking(getBookingByCode);
        if(request.getType().equals(StatusConstant.TransactionType.PAYMENT)){
            transaction.setType(Transaction.Type.PAYMENT);
            transaction.setStatus(Transaction.Status.SUCCESS);
        }

        TransactionResponse response = transactionMapper.toResponse(transactionRepository.save(transaction));
        response.setBookingDTO(bookingDTO);
        return response;
    }

}
