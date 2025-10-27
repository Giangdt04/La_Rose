package com.larose.controller;

import com.larose.config.JwtTokenUtil;
import com.larose.dto.*;
import com.larose.entity.User;
import com.larose.maptruct.RoleMapper;
import com.larose.service.EmailService;
import com.larose.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;


    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        try {
            User user = userService.registerNewUser(req);
            logger.info("User registered successfully: {}", req.getEmail());

            SignupResponse response = new SignupResponse(
                    "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhone(),
                    user.getCreatedAt()
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            logger.warn("Signup failed for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "BAD_REQUEST", ex.getMessage(), LocalDateTime.now())
            );
        } catch (Exception ex) {
            logger.error("Unexpected error during signup for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse(500, "INTERNAL_SERVER_ERROR", "Đã xảy ra lỗi trong quá trình đăng ký", LocalDateTime.now())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            User user = userService.findByEmail(req.getEmail());
            if (user == null) {
                return ResponseEntity.status(404).body(
                        new ErrorResponse(404, "USER_NOT_FOUND", "Người dùng không tồn tại", LocalDateTime.now())
                );
            }

            // Generate tokens
            String accessToken = jwtTokenUtil.generateAccessToken(user);
            String refreshToken = jwtTokenUtil.generateRefreshToken(user);

            // Update last login
            userService.updateLastLogin(user.getId());

            logger.info("User logged in successfully: {}", req.getEmail());

            UserInfoResponse userInfo = new UserInfoResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhone(),
                    user.getIsActive(),
                    user.getEmailVerified(),
                    user.getLastLogin(),
                    user.getCreatedAt(),
                    userService.mapRolesToDTO(user.getRoles())
            );

            return ResponseEntity.ok(new AuthDetailResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    user.getId(),
                    userInfo,
                    "Đăng nhập thành công"
            ));

        } catch (BadCredentialsException ex) {
            logger.warn("Login failed for {}: Bad credentials", req.getEmail(), ex);
            return ResponseEntity.status(401).body(
                    new ErrorResponse(401, "UNAUTHORIZED", "Email hoặc mật khẩu không chính xác", LocalDateTime.now())
            );
        } catch (DisabledException ex) {
            logger.warn("Login failed for {}: Account disabled", req.getEmail(), ex);
            return ResponseEntity.status(403).body(
                    new ErrorResponse(403, "FORBIDDEN", "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực.", LocalDateTime.now())
            );
        } catch (LockedException ex) {
            logger.warn("Login failed for {}: Account locked", req.getEmail(), ex);
            return ResponseEntity.status(423).body(
                    new ErrorResponse(423, "LOCKED", "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.", LocalDateTime.now())
            );
        } catch (AuthenticationException ex) {
            logger.warn("Login failed for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.status(401).body(
                    new ErrorResponse(401, "UNAUTHORIZED", "Xác thực thất bại", LocalDateTime.now())
            );
        } catch (Exception ex) {
            logger.error("Unexpected error during login for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse(500, "INTERNAL_SERVER_ERROR", "Đã xảy ra lỗi trong quá trình đăng nhập", LocalDateTime.now())
            );
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest req) {
        try {
            String refreshToken = req.getRefreshToken();

            if (!jwtTokenUtil.validateToken(refreshToken)) {
                return ResponseEntity.status(401).body(
                        new ErrorResponse(401, "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã hết hạn", LocalDateTime.now())
                );
            }

            String email = jwtTokenUtil.getEmailFromToken(refreshToken);
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(
                        new ErrorResponse(404, "USER_NOT_FOUND", "Người dùng không tồn tại", LocalDateTime.now())
                );
            }

            if (!user.getIsActive()) {
                return ResponseEntity.status(403).body(
                        new ErrorResponse(403, "ACCOUNT_INACTIVE", "Tài khoản đã bị vô hiệu hóa", LocalDateTime.now())
                );
            }

            String newAccessToken = jwtTokenUtil.generateAccessToken(user);
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);

            UserInfoResponse userInfo = new UserInfoResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhone(),
                    user.getIsActive(),
                    user.getEmailVerified(),
                    user.getLastLogin(),
                    user.getCreatedAt(),
                    userService.mapRolesToDTO(user.getRoles())
            );

            logger.info("Token refreshed successfully for user: {}", email);
            return ResponseEntity.ok(new AuthDetailResponse(
                    newAccessToken,
                    newRefreshToken,
                    "Bearer",
                    user.getId(),
                    userInfo,
                    "Làm mới token thành công"
            ));

        } catch (Exception ex) {
            logger.error("Error refreshing token: {}", ex.getMessage(), ex);
            return ResponseEntity.status(401).body(
                    new ErrorResponse(401, "REFRESH_TOKEN_FAILED", "Làm mới token thất bại", LocalDateTime.now())
            );
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            userService.initiatePasswordReset(req.getEmail());
            logger.info("Password reset initiated for: {}", req.getEmail());

            // Always return success to prevent email enumeration
            return ResponseEntity.ok(new MessageResponse(
                    "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
            ));

        } catch (Exception ex) {
            logger.error("Error in forgot password for {}: {}", req.getEmail(), ex.getMessage(), ex);
            // Still return success for security
            return ResponseEntity.ok(new MessageResponse(
                    "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            boolean success = userService.resetPassword(req.getToken(), req.getNewPassword());

            if (success) {
                logger.info("Password reset successfully for token: {}", req.getToken());
                return ResponseEntity.ok(new MessageResponse(
                        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."
                ));
            } else {
                logger.warn("Password reset failed: invalid or expired token {}", req.getToken());
                return ResponseEntity.badRequest().body(
                        new ErrorResponse(400, "INVALID_TOKEN", "Token không hợp lệ hoặc đã hết hạn", LocalDateTime.now())
                );
            }

        } catch (Exception ex) {
            logger.error("Error resetting password: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse(500, "RESET_PASSWORD_FAILED", "Đặt lại mật khẩu thất bại", LocalDateTime.now())
            );
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest req) {
        try {
            userService.resendVerificationEmail(req.getEmail());
            logger.info("Verification email resent for: {}", req.getEmail());

            return ResponseEntity.ok(new MessageResponse(
                    "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn."
            ));

        } catch (IllegalArgumentException ex) {
            logger.warn("Resend verification failed for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "BAD_REQUEST", ex.getMessage(), LocalDateTime.now())
            );
        } catch (Exception ex) {
            logger.error("Error resending verification for {}: {}", req.getEmail(), ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse(500, "INTERNAL_SERVER_ERROR", "Gửi lại email xác thực thất bại", LocalDateTime.now())
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                logger.info("User logged out successfully");
            }

            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));

        } catch (Exception ex) {
            logger.error("Error during logout: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        try {
            boolean ok = userService.verifyEmailToken(token);
            if (ok) {
                logger.info("Email verification success for token {}", token);
                return ResponseEntity.ok(new MessageResponse(
                        "Xác thực email thành công. Bạn có thể đăng nhập."
                ));
            } else {
                logger.warn("Email verification failed: invalid or expired token {}", token);
                return ResponseEntity.badRequest().body(
                        new ErrorResponse(400, "BAD_REQUEST", "Token không hợp lệ hoặc đã hết hạn.", LocalDateTime.now())
                );
            }
        } catch (Exception ex) {
            logger.error("Unexpected error during email verification for token {}: {}", token, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(
                    new ErrorResponse(500, "INTERNAL_SERVER_ERROR", ex.getMessage(), LocalDateTime.now())
            );
        }
    }
}