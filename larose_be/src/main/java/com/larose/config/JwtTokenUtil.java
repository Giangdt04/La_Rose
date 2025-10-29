package com.larose.config;

import com.larose.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * JWT Utility Class — Quản lý việc tạo và xác thực Access/Refresh Token.
 */
@Component
public class JwtTokenUtil {

    private final Key key;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    // Constants mặc định
    private static final long DEFAULT_ACCESS_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 phút
    private static final long DEFAULT_REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

    /**
     * Constructor chính dùng để Spring inject các giá trị cấu hình.
     * Nếu không cấu hình trong application.yml, các giá trị mặc định sẽ được sử dụng.
     */
    public JwtTokenUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-ms:604800000}") long accessTokenExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret key phải dài tối thiểu 32 ký tự!");
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = (accessTokenExpirationMs > 0)
                ? accessTokenExpirationMs
                : DEFAULT_ACCESS_TOKEN_EXPIRATION_MS;
        this.refreshTokenExpirationMs = (refreshTokenExpirationMs > 0)
                ? refreshTokenExpirationMs
                : DEFAULT_REFRESH_TOKEN_EXPIRATION_MS;
    }

    /**
     * Tạo Access Token chứa email (subject).
     */
    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("scope", buildScope(user))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> stringJoiner.add("ROLE_" + role.getName()));
        }
        return stringJoiner.toString();
    }

    /**
     * Giữ lại tên phương thức cũ để tránh lỗi khi gọi legacy code.
     */
    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    /**
     * Tạo Refresh Token.
     */
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMs);

        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .claim("scope", buildScope(user))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Lấy email (subject) từ token.
     */
    public String getEmailFromToken(String token) {
        return getSubjectFromToken(token);
    }

    public String getSubjectFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Kiểm tra token có hợp lệ không.
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println(" Token không hợp lệ: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            System.err.println(" Token đã hết hạn: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println(" Token không được hỗ trợ: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println(" Token rỗng hoặc không đúng định dạng: " + ex.getMessage());
        } catch (JwtException ex) {
            System.err.println(" Lỗi JWT khác: " + ex.getMessage());
        }
        return false;
    }

    /**
     * Lấy thời điểm hết hạn của token.
     */
    public Date getExpirationDateFromToken(String token) {
        return parseToken(token).getExpiration();
    }

    /**
     * Kiểm tra token đã hết hạn chưa.
     */
    public boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    /**
     * Phương thức tiện ích để parse token.
     */
    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
