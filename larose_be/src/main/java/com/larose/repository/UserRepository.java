package com.larose.repository;

import com.larose.entity.User;
import com.larose.entity.enums.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Các phương thức có sẵn
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);
    List<User> findByIsActiveTrue();
    List<User> findByEmailVerifiedAndIsActiveTrue(boolean emailVerified);

    // Thêm các phương thức cho Admin
    long countByIsActiveTrue();
    long countByIsActiveFalse();
    long countByEmailVerifiedTrue();
    long countByEmailVerifiedFalse();
    long countByDeletedAtIsNotNull();
    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT u FROM User u WHERE u.lastLogin < :date AND u.isActive = true")
    List<User> findInactiveUsersSince(@Param("date") LocalDateTime date);

    @Query("SELECT u FROM User u WHERE u.email LIKE %:email% AND u.isActive = true")
    List<User> findByEmailContainingAndActive(@Param("email") String email);

    boolean existsByEmailAndIsActiveTrue(String email);

    // SỬA: Cho OAuth - sử dụng enum User.OAuthProvider
    Optional<User> findByOauthProviderAndOauthProviderId(OAuthProvider provider, String providerId);

    boolean existsByEmail(String email);

    // THÊM: Các phương thức bổ sung cần thiết
    Optional<User> findByIdAndIsActiveTrue(Long id);

    List<User> findByIsActive(Boolean isActive);

    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.emailVerificationToken IS NOT NULL")
    List<User> findByEmailVerifiedFalseAndEmailVerificationTokenIsNotNull();

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL")
    List<User> findDeletedUsers();

    boolean existsByEmailAndEmailVerifiedTrue(String email);
}