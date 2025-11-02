package com.larose.controller;


import com.larose.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vnpay")
public class VnpayController {

    @Autowired
    private VnpayService vnpayService;

    @PostMapping("/submit-order")
    public ResponseEntity<String> submitOrder(
    		   @RequestParam("amount") BigDecimal amount,
    	        @RequestParam("orderInfo") String orderInfo,
    	        @RequestParam("roomId") String roomId,
    	        @RequestParam("txnRef") String txnRef){

        String paymentUrl = vnpayService.createOrder(amount, orderInfo, roomId, txnRef);
        return ResponseEntity.ok(paymentUrl);
    }

    @GetMapping("/vnpay_return")
    public ResponseEntity<String> vnpayReturn(HttpServletRequest request) {
        String email = vnpayService.orderReturn(request);
        if (email != null) {
            return ResponseEntity.ok("Thanh toán thành công! Hóa đơn đã được gửi tới " + email);
        } else {
            return ResponseEntity.badRequest().body("Thanh toán thất bại hoặc sai chữ ký.");
        }
    }

}
