package com.larose.config;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                      HttpServletResponse response,
                                      FilterChain filterChain)
            throws ServletException, IOException, java.io.IOException {

        String authHeader = request.getHeader("Authorization");
        String email = null;
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            
            // SỬA LỖI: Bọc toàn bộ logic xác thực vào try-catch
            try {
                email = jwtTokenUtil.getEmailFromToken(token);

                // Chỉ thực hiện nếu có email VÀ chưa được xác thực
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    // Nếu token hợp lệ (validateToken sẽ kiểm tra cả chữ ký và hạn)
                    if (jwtTokenUtil.validateToken(token)) { 
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                // Nếu token có vấn đề (hết hạn, sai chữ ký, etc.)
                // logger.warn("Cannot parse or validate JWT token: {}", e.getMessage());
                // Không làm gì cả, chỉ log. 
                // Request sẽ đi tiếp mà không được xác thực (unauthenticated)
                // và sẽ được SecurityConfig xử lý (permitAll)
            }
        }

        // Luôn luôn gọi filter chain để đi tiếp
        filterChain.doFilter(request, response);
    }
}
