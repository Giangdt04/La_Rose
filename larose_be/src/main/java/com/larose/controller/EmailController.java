package com.larose.controller;

import com.larose.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send-test")
    public ResponseEntity<String> sendTestEmail(@RequestBody EmailRequest request) {
        try {
            emailService.sendPlainTextEmail(request.getTo(), request.getSubject(), request.getBody());
            return ResponseEntity.ok("Email sent successfully to " + request.getTo());
        } catch (Exception e) {
            // Log chi tiết nhất: message + stack trace
            log.error("Error sending email to {}:", request.getTo(), e);
            e.printStackTrace(); // in trực tiếp ra console

            // Trả về message chi tiết cho client
            return ResponseEntity.status(500)
                    .body("Failed to send email: " + e.toString());
        }
    }

    @Data
    public static class EmailRequest {
        private String to;
        private String subject;
        private String body;
    }
}
