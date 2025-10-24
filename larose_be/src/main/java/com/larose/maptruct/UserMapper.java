package com.larose.maptruct;

import com.larose.dto.UserDTO;
import com.larose.entity.Role;
import com.larose.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    UserDTO toUserDTO(User user);

    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return null;
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}
