package com.larose.service;

import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import com.larose.repository.BookingRepository;
import com.larose.repository.TransactionRepository;
import com.larose.util.InvoicePdfUtil;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private final JavaMailSender mailSender;

    public String sendInvoice(Long roomId) {
        Booking booking = bookingRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Can't find booking with room id: " + roomId));
        Transaction transaction = transactionRepository.getByBookingId(booking.getId())
                .orElseThrow(() -> new IllegalArgumentException("Can't find transaction with booking id: " + booking.getId()));
        String email = booking.getUser().getEmail();

        File pdfFile = InvoicePdfUtil.generateInvoicePdf(booking, transaction);

        try {
            sendEmail(email, booking, pdfFile);
            log.info("Invoice sent to {}", email);
        } finally {
            if (pdfFile.exists()) pdfFile.delete();
        }
        return email;
    }

    private void sendEmail(String to, Booking booking, File file) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Hóa đơn La Rose Hotel - #" + booking.getId());
            helper.setText("Xin chào " + booking.getUser().getFullName() + ",\n\nCảm ơn bạn đã thanh toán thành công.\nFile hóa đơn được đính kèm bên dưới.\n\nTrân trọng,\nLa Rose Hotel");
            helper.addAttachment("HoaDon_LaRose_" + booking.getId() + ".pdf", new FileSystemResource(file));

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Error sending invoice email to {}", to, e);
            throw new RuntimeException("Error sending invoice email", e);
        }
    }
}
