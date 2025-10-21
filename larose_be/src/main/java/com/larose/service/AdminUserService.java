package com.larose.service;

import com.larose.dto.*;
import com.larose.entity.User;
import com.larose.entity.Role;
import com.larose.repository.UserRepository;
import com.larose.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersWithFilters(String search, Boolean isActive, Boolean emailVerified, String role, Pageable pageable) {
        // Implementation sẽ phức tạp hơn, cần custom query
        // Tạm thời trả về tất cả users
        return userRepository.findAll(pageable).map(this::convertToUserDTO);
    }

    @Transactional(readOnly = true)
    public UserDetailDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        return convertToUserDetailDTO(user);
    }

    public UserDTO updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (request.getEmail() != null) {
            // Kiểm tra email trùng
            if (!user.getEmail().equals(request.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
            if (request.getEmailVerified()) {
                user.setEmailVerifiedAt(LocalDateTime.now());
            } else {
                user.setEmailVerifiedAt(null);
            }
        }

        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);
    }

    public UserDTO assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        user.getRoles().add(role);
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public UserDTO removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        user.getRoles().remove(role);
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public UserDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setIsActive(true);
        user.setDeletedAt(null);
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public UserDTO deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setIsActive(false);
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public UserDTO restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setDeletedAt(null);
        user.setIsActive(true);
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats() {
        UserStatsDTO stats = new UserStatsDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByIsActiveTrue());
        stats.setInactiveUsers(userRepository.countByIsActiveFalse());
        stats.setVerifiedUsers(userRepository.countByEmailVerifiedTrue());
        stats.setUnverifiedUsers(userRepository.countByEmailVerifiedFalse());
        stats.setDeletedUsers(userRepository.countByDeletedAtIsNotNull());

        // Thống kê theo thời gian
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekAgo = today.minusDays(7);
        LocalDateTime monthAgo = today.minusDays(30);

        stats.setTodayRegistrations(userRepository.countByCreatedAtAfter(today));
        stats.setWeekRegistrations(userRepository.countByCreatedAtAfter(weekAgo));
        stats.setMonthRegistrations(userRepository.countByCreatedAtAfter(monthAgo));

        return stats;
    }

    @Transactional(readOnly = true)
    public List<LoginHistoryDTO> getUserLoginHistory(Long userId) {
        // Implementation sẽ query từ audit_logs hoặc bảng login_history riêng
        // Tạm thời trả về danh sách rỗng
        return List.of();
    }

    // Helper methods
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));
        return dto;
    }

    private UserDetailDTO convertToUserDetailDTO(User user) {
        UserDetailDTO dto = new UserDetailDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setEmailVerifiedAt(user.getEmailVerifiedAt());
        dto.setOauthProvider(user.getOauthProvider().name());
        dto.setOauthProviderId(user.getOauthProviderId());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setDeletedAt(user.getDeletedAt());
        dto.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));

        // Có thể thêm thống kê bookings và reviews
        // dto.setTotalBookings(bookingRepository.countByUserId(user.getId()));
        // dto.setTotalReviews(reviewRepository.countByUserId(user.getId()));

        return dto;
    }
}