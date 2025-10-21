package com.larose.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.email.from:noreply@larose.com}")
    private String fromEmail;

    @Value("${app.name:Larose Hotel}")
    private String appName;

    @Async
    public void sendVerificationEmail(String to, String name, String verificationToken) {
        String subject = "Xác thực email - " + appName;
        String verificationUrl = baseUrl + "/api/auth/verify?token=" + verificationToken;

        String body = buildVerificationEmailHtml(name, verificationUrl);

        sendHtmlEmail(to, subject, body);
        log.info("Verification email sent to: {}", to);
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String resetToken) {
        String subject = "Đặt lại mật khẩu - " + appName;
        String resetUrl = baseUrl + "/reset-password?token=" + resetToken;

        String body = buildPasswordResetEmailHtml(name, resetUrl, resetToken);

        sendHtmlEmail(to, subject, body);
        log.info("Password reset email sent to: {}", to);
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Chào mừng đến với " + appName;

        String body = buildWelcomeEmailHtml(name);

        sendHtmlEmail(to, subject, body);
        log.info("Welcome email sent to: {}", to);
    }

    @Async
    public void sendBookingConfirmationEmail(String to, String name, String bookingCode) {
        String subject = "Xác nhận đặt phòng - " + appName;

        String body = buildBookingConfirmationEmailHtml(name, bookingCode);

        sendHtmlEmail(to, subject, body);
        log.info("Booking confirmation email sent to: {}", to);
    }

    public void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML

            mailSender.send(message);
            log.debug("HTML email sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    // Giữ lại phương thức cũ cho tương thích
    public void sendPlainTextEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            try {
                InternetAddress fromAddress = new InternetAddress(fromEmail, appName, "UTF-8");
                helper.setFrom(fromAddress);
            } catch (UnsupportedEncodingException e) {
                // Fallback: chỉ dùng email không có personal name
                log.warn("Unsupported encoding for from address, using email only: {}", e.getMessage());
                helper.setFrom(fromEmail);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false); // false indicates plain text
            mailSender.send(message);
            log.debug("Plain text email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send plain text email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String buildVerificationEmailHtml(String name, String verificationUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chào mừng đến với %s</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại %s. Để hoàn tất đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Xác Thực Email</a>
                        </div>
                        
                        <p>Nếu nút không hoạt động, bạn có thể sao chép và dán đường link sau vào trình duyệt:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">%s</p>
                        
                        <p>Liên kết xác thực sẽ hết hạn sau 24 giờ.</p>
                        <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, name, appName, verificationUrl, verificationUrl, appName);
    }

    private String buildPasswordResetEmailHtml(String name, String resetUrl, String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    .token { font-family: monospace; background: #eee; padding: 10px; border-radius: 5px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Đặt Lại Mật Khẩu</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại %s.</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Đặt Lại Mật Khẩu</a>
                        </div>
                        
                        <p>Nếu bạn không thể nhấp vào nút trên, hãy sử dụng mã token sau:</p>
                        <div class="token">%s</div>
                        
                        <p>Hoặc sao chép và dán đường link sau vào trình duyệt:</p>
                        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">%s</p>
                        
                        <p><strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu sẽ hết hạn sau 1 giờ.</p>
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, appName, resetUrl, resetToken, resetUrl, appName);
    }

    private String buildWelcomeEmailHtml(String name) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4facfe; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chào Mừng Đến Với %s</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Chúc mừng! Tài khoản của bạn đã được xác thực thành công và bạn đã chính thức trở thành thành viên của %s.</p>
                        
                        <h3>Bạn có thể:</h3>
                        <div class="feature">
                            <strong>🎯 Đặt phòng dễ dàng</strong>
                            <p>Tìm và đặt phòng khách sạn phù hợp với nhu cầu của bạn</p>
                        </div>
                        <div class="feature">
                            <strong>📱 Quản lý đặt chỗ</strong>
                            <p>Theo dõi và quản lý các đặt phòng của bạn một cách thuận tiện</p>
                        </div>
                        <div class="feature">
                            <strong>⭐ Đánh giá dịch vụ</strong>
                            <p>Chia sẻ trải nghiệm của bạn sau mỗi lần lưu trú</p>
                        </div>
                        
                        <p>Bắt đầu trải nghiệm ngay bây giờ:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="%s" style="display: inline-block; padding: 12px 30px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px;">Khám Phá Ngay</a>
                        </div>
                        
                        <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, name, appName, baseUrl, appName);
    }

    private String buildBookingConfirmationEmailHtml(String name, String bookingCode) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #5ee7df 0%, #b490ca 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-info { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Đặt Phòng Thành Công</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Cảm ơn bạn đã đặt phòng tại %s. Đơn đặt của bạn đã được xác nhận.</p>
                        
                        <div class="booking-info">
                            <h3>Thông tin đặt phòng:</h3>
                            <p><strong>Mã đặt phòng:</strong> %s</p>
                            <p><strong>Trạng thái:</strong> Đã xác nhận</p>
                        </div>
                        
                        <p>Bạn có thể theo dõi trạng thái đặt phòng trong tài khoản của mình.</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="%s/profile/bookings" style="display: inline-block; padding: 12px 30px; background: #5ee7df; color: white; text-decoration: none; border-radius: 5px;">Xem Đặt Phòng</a>
                        </div>
                        
                        <p>Chúng tôi rất mong được đón tiếp bạn!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, appName, bookingCode, baseUrl, appName);
    }
}