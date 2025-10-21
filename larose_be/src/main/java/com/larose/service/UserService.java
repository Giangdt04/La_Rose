package com.larose.service;

import com.larose.dto.*;
import com.larose.entity.User;
import com.larose.entity.enums.OAuthProvider;
import com.larose.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.backend.base-url}")
    private String baseUrl;

    public User registerNewUser(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        String token = UUID.randomUUID().toString();
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .emailVerificationToken(token)
                .emailVerificationSentAt(LocalDateTime.now())
                .emailVerified(false)
                .isActive(true)
                .oauthProvider(OAuthProvider.none)
                .build();

        User savedUser = userRepository.save(user);

        // Gửi email xác nhận
        sendVerificationEmail(savedUser, token);

        return savedUser;
    }

    public boolean verifyEmailToken(String token) {
        var userOpt = userRepository.findByEmailVerificationToken(token);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailVerificationToken(null);
        userRepository.save(user);
        return true;
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Transactional(readOnly = true)
    public User findByEmailAndActive(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại hoặc tài khoản đã bị vô hiệu hóa"));

        String resetToken = generateSecureToken();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenSentAt(LocalDateTime.now());
        userRepository.save(user);

        // Gửi email reset password
        sendPasswordResetEmail(user, resetToken);
    }

    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ"));

        // Kiểm tra token hết hạn (1 giờ)
        if (user.getPasswordResetTokenSentAt() == null ||
                user.getPasswordResetTokenSentAt().isBefore(LocalDateTime.now().minusHours(1))) {
            throw new IllegalArgumentException("Token đã hết hạn");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenSentAt(null);
        userRepository.save(user);

        return true;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại hoặc tài khoản đã bị vô hiệu hóa"));

        if (user.getEmailVerified()) {
            throw new IllegalArgumentException("Email đã được xác thực");
        }

        String verificationToken = generateSecureToken();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationSentAt(LocalDateTime.now());
        userRepository.save(user);

        sendVerificationEmail(user, verificationToken);
    }

    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public boolean deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));
        user.setIsActive(false);
        userRepository.save(user);
        return true;
    }

    public boolean activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));
        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }

    public void updateProfile(Long userId, String fullName, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }
        if (phone != null) {
            user.setPhone(phone.trim());
        }

        userRepository.save(user);
    }

    // Helper methods
    private void sendVerificationEmail(User user, String token) {
        String link = baseUrl + "/api/auth/verify?token=" + token;
        String subject = "Xác nhận đăng ký tài khoản Larose";
        String body = buildVerificationEmailBody(user.getFullName(), link);
        emailService.sendHtmlEmail(user.getEmail(), subject, body);
    }

    private void sendPasswordResetEmail(User user, String token) {
        String link = baseUrl + "/api/auth/reset-password?token=" + token;
        String subject = "Yêu cầu đặt lại mật khẩu - Khách sạn Larose";
        String body = buildPasswordResetEmailBody(user.getFullName(), link);
        emailService.sendHtmlEmail(user.getEmail(), subject, body);
    }

    private String buildVerificationEmailBody(String fullName, String verificationLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đăng ký - Khách sạn Larose</title>
                <style>
                    body, table, td, a { -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%; margin: 0; padding: 0; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%%; outline: none; text-decoration: none; }
                    a { color: #be185d; text-decoration: none; }
                    body { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif;">
                <center style="width: 100%%; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(244, 114, 182, 0.15); border: 1px solid #f9a8d4;">
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%);">
                            <tr>
                                <td style="padding: 30px 40px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 32px; color: #FFFFFF; line-height: 1.2; font-weight: 700; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);">
                                        Khách sạn Larose
                                    </h1>
                                    <p style="margin: 8px 0 0; font-size: 16px; color: #fdf2f8; font-style: italic;">
                                        Nơi vẻ đẹp và tiện nghi hội tụ
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                            <tr>
                                <td style="padding: 40px; font-size: 16px; line-height: 1.6; color: #333333; text-align: left;">
                                    <p style="margin: 0 0 20px; font-size: 18px;">
                                        <strong style="color: #be185d;">Kính gửi %s,</strong>
                                    </p>
                                    <p style="margin: 0 0 20px;">
                                        Chào mừng bạn đến với Khách sạn Larose! Chúng tôi rất vinh hạnh được chào đón bạn trở thành thành viên của đại gia đình Larose.
                                    </p>
                                    <p style="margin: 0 0 30px;">
                                        Để hoàn tất đăng ký và bắt đầu tận hưởng những đặc quyền dành cho thành viên, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:
                                    </p>
            
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="%s" 
                                           style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%); border: none; color: #FFFFFF; padding: 14px 35px; display: inline-block; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(190, 24, 93, 0.3); transition: all 0.3s ease;">
                                           XÁC NHẬN TÀI KHOẢN
                                        </a>
                                    </div>
            
                                    <div style="background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d97706;">
                                        <p style="margin: 0 0 10px; font-size: 16px; color: #be185d; font-weight: bold;">
                                            ĐẶC QUYỀN THÀNH VIÊN LAROSE:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555555;">
                                            <li>Giá ưu đãi đặc biệt cho thành viên</li>
                                            <li>Ưu tiên nhận phòng sớm và check-out muộn</li>
                                            <li>Tích lũy điểm thưởng cho mỗi lần lưu trú</li>
                                            <li>Nhận thông tin khuyến mãi đầu tiên</li>
                                            <li>Dịch vụ đặt phòng 24/7</li>
                                        </ul>
                                    </div>
            
                                    <p style="margin: 20px 0 10px; font-size: 14px; color: #666666; text-align: center;">
                                        Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết này vào trình duyệt:
                                    </p>
                                    <p style="margin: 0 0 30px; font-size: 12px; word-break: break-all; text-align: center; padding: 10px; background-color: #fdf2f8; border-radius: 4px; border: 1px dashed #ec4899;">
                                        <a href="%s" style="color: #be185d; text-decoration: underline; font-family: monospace;">%s</a>
                                    </p>
            
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f9a8d4;">
                                        <p style="margin: 0 0 10px;">Trân trọng,</p>
                                        <p style="margin: 0; color: #be185d; font-weight: bold; font-size: 18px;">Đội ngũ Khách sạn Larose</p>
                                        <p style="margin: 5px 0 0; font-size: 14px; color: #666666;">
                                            Hotline: 0123 456 789 | Email: info@larosehotel.com
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background-color: #fdf2f8; border-top: 1px solid #f9a8d4;">
                            <tr>
                                <td style="padding: 20px 40px; font-size: 12px; line-height: 1.5; color: #be185d; text-align: center;">
                                    <p style="margin: 0;">
                                        <strong style="color: #be185d;">Lưu ý:</strong> Nếu bạn không đăng ký tài khoản tại Khách sạn Larose, vui lòng bỏ qua email này.
                                    </p>
                                    <p style="margin: 10px 0 0; font-size: 11px; color: #d97706;">
                                        Khách sạn Larose &copy; 2025. Tất cả các quyền được bảo lưu.
                                    </p>
                                    <p style="margin: 5px 0 0; font-size: 11px; color: #d97706;">
                                        123 Đường Hoa Hồng, Quận 1, TP.HCM, Việt Nam
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                    </div>
                </center>
            </body>
            </html>
            """.formatted(fullName != null ? fullName : "Quý khách",
                verificationLink, verificationLink, verificationLink);
    }

    private String buildPasswordResetEmailBody(String fullName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đặt lại mật khẩu - Khách sạn Larose</title>
                <style>
                    body, table, td, a { -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%; margin: 0; padding: 0; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%%; outline: none; text-decoration: none; }
                    a { color: #be185d; text-decoration: none; }
                    body { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif;">
                <center style="width: 100%%; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(244, 114, 182, 0.15); border: 1px solid #f9a8d4;">
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%);">
                            <tr>
                                <td style="padding: 30px 40px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 32px; color: #FFFFFF; line-height: 1.2; font-weight: 700; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);">
                                        Khách sạn Larose
                                    </h1>
                                    <p style="margin: 8px 0 0; font-size: 16px; color: #fdf2f8; font-style: italic;">
                                        Đặt lại mật khẩu
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                            <tr>
                                <td style="padding: 40px; font-size: 16px; line-height: 1.6; color: #333333; text-align: left;">
                                    <p style="margin: 0 0 20px; font-size: 18px;">
                                        <strong style="color: #be185d;">Kính gửi %s,</strong>
                                    </p>
                                    <p style="margin: 0 0 20px;">
                                        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Khách sạn Larose.
                                    </p>
                                    <p style="margin: 0 0 30px;">
                                        Để thiết lập mật khẩu mới, vui lòng nhấn vào nút bên dưới:
                                    </p>
            
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="%s" 
                                           style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%); border: none; color: #FFFFFF; padding: 14px 35px; display: inline-block; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(190, 24, 93, 0.3); transition: all 0.3s ease;">
                                           ĐẶT LẠI MẬT KHẨU
                                        </a>
                                    </div>
            
                                    <div style="background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d97706;">
                                        <p style="margin: 0 0 10px; font-size: 16px; color: #be185d; font-weight: bold;">
                                            LƯU Ý BẢO MẬT:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555555;">
                                            <li>Liên kết này sẽ hết hạn sau 1 giờ</li>
                                            <li>Không chia sẻ liên kết này với bất kỳ ai</li>
                                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                                        </ul>
                                    </div>
            
                                    <p style="margin: 20px 0 10px; font-size: 14px; color: #666666; text-align: center;">
                                        Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết này vào trình duyệt:
                                    </p>
                                    <p style="margin: 0 0 30px; font-size: 12px; word-break: break-all; text-align: center; padding: 10px; background-color: #fdf2f8; border-radius: 4px; border: 1px dashed #ec4899;">
                                        <a href="%s" style="color: #be185d; text-decoration: underline; font-family: monospace;">%s</a>
                                    </p>
            
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f9a8d4;">
                                        <p style="margin: 0 0 10px;">Trân trọng,</p>
                                        <p style="margin: 0; color: #be185d; font-weight: bold; font-size: 18px;">Đội ngũ Khách sạn Larose</p>
                                        <p style="margin: 5px 0 0; font-size: 14px; color: #666666;">
                                            Hotline: 0123 456 789 | Email: info@larosehotel.com
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </center>
            </body>
            </html>
            """.formatted(fullName != null ? fullName : "Quý khách",
                resetLink, resetLink, resetLink);
    }

    private String generateSecureToken() {
        return UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
    }

    // Bổ sung các phương thức sau vào UserService

    public UserDTO createUser(CreateUserRequest request) {
        // Chuyển đổi từ CreateUserRequest sang User và lưu
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .emailVerified(false)
                .oauthProvider(OAuthProvider.none)
                .build();

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<UserDTO> getActiveUsers() {
        return userRepository.findByIsActiveTrue().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Cập nhật các trường cho phép
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getIsActive() != null) {
            user.setIsActive(userDTO.getIsActive());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);
    }

    // THÊM: Phương thức verifyEmail cho UserController
    public boolean verifyEmail(String token) {
        return verifyEmailToken(token);
    }

    // Thêm các phương thức sau vào UserService

    /**
     * Lấy thông tin profile user bằng email
     */
    @Transactional(readOnly = true)
    public UserDTO getUserProfileByEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return convertToDTO(user);
    }

    /**
     * Cập nhật thông tin profile
     */
    public UserDTO updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Đổi mật khẩu
     */
    public boolean changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return false;
        }

        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    // Phương thức chuyển đổi từ User sang UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhone(user.getPhone());
        userDTO.setIsActive(user.getIsActive());
        userDTO.setEmailVerified(user.getEmailVerified());
        userDTO.setLastLogin(user.getLastLogin());
        userDTO.setCreatedAt(user.getCreatedAt());
        // Nếu có các trường khác trong UserDTO, cần set thêm
        return userDTO;
    }
}