package com.larose.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

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
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configure(http))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/vnpay/**",
                                                                "/api/statistical/**",
                                                                "/api/rooms/**",
                                                                "/api/transaction/**",
                                                                "/api/public/**",
                                                                "/api/email/**",
                                                                "/api/health",
                                                                "/api/config",
                                                                "/api/rooms/**",
                                                                "/api/room-types/**",
                                                                "/api/bookings/check-availability",
                                                                "/api/payments/webhook/**",
                                                                "/v3/api-docs/**",
                                                                "/v3/api-docs",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/index.html")
                                                .permitAll()
                                                .requestMatchers(
                                                                "/api/users/profile/**",
                                                                "/api/users/bookings/**",
                                                                "/api/users/reviews/**",
                                                                "/api/users/change-password",
                                                                "/api/bookings/**",
                                                                "/api/reviews/create",
                                                                "/api/notifications/**",
                                                                "/api/conversations/**",
                                                                "/api/payments/create",
                                                                "/api/payments/transactions",
                                                                "/api/upload")
                                                .authenticated()
                                                .requestMatchers(
                                                                "/api/staff/**",
                                                                "/api/admin/bookings/**",
                                                                "/api/admin/reviews/responses/**",
                                                                "/api/admin/conversations/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                "/api/manager/**",
                                                                "/api/admin/rooms/**",
                                                                "/api/admin/room-types/**",
                                                                "/api/admin/notifications/**",
                                                                "/api/admin/reports/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                "/api/admin/**",
                                                                "/api/admin/users/**",
                                                                "/api/admin/roles/**",
                                                                "/api/admin/audit-logs/**",
                                                                "/api/admin/system/**",
                                                                "/api/admin/config/**")
                                                .hasRole("ADMIN")
                                                .anyRequest().authenticated())
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

        @Bean
        public CorsFilter corsFilter() {
                CorsConfiguration corsConfig = new CorsConfiguration();
                corsConfig.setAllowedOrigins(java.util.List.of(
                                "http://localhost:5173",
                                "http://localhost:3000"));
                corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(java.util.List.of("*"));
                corsConfig.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", corsConfig);
                return new CorsFilter(source);
        }
}
