package com.larose.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                config.setAllowedHeaders(Arrays.asList("*"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. CÁC ENDPOINT CÔNG KHAI (permitAll)
                .requestMatchers(
                    "/api/auth/**",
                    "/api/statistical/**",
                    "/api/rooms/**",
                    "/api/public/**",
                    "/api/email/**",
                    "/api/health",
                    "/api/config",
                    "/api/room-types/**",
                    "/api/booking/check-availability",       // ✅ Kiểm tra phòng trống (guest)
                    "/api/vnpay/submit-order",              // ✅ Tạo đơn VNPay (guest)
                    "/api/vnpay/vnpay_return",              // ✅ Callback từ VNPay
                    "/vnpay/**",                            // ✅ (Phòng trường hợp callback dùng URL khác)
                    "/api/payments/webhook/**",
                    "/v3/api-docs/**",
                    "/v3/api-docs",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**").permitAll()

                // 2. CÁC ENDPOINT CỦA USER (Yêu cầu xác thực)
                .requestMatchers(HttpMethod.POST, "/api/reviews").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/reviews").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(
                    "/api/users/profile/**",
                    "/api/users/bookings/**",
                    "/api/users/reviews/**",
                    "/api/users/change-password",
                    "/api/bookings/**",
                    "/api/notifications/**",
                    "/api/conversations/**",
                    "/api/payments/create",
                    "/api/payments/transactions",
                    "/api/upload",
                    "/api/users/**",
                    "/api/transaction",
                    "/api/transaction/**"
                ).hasAnyRole("USER", "ADMIN")

                // 3. CÁC ENDPOINT CỦA ADMIN
                .requestMatchers(
                    "/api/reviews/response/**",
                    "/api/staff/**",
                    "/api.admin/**",
                    "/api/manager/**"
                ).hasRole("ADMIN")

                // 4. MỌI REQUEST KHÁC
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}