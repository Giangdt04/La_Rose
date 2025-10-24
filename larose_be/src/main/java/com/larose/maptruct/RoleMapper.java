package com.larose.maptruct;

import com.larose.dto.RoleDTO;
import com.larose.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDTO toDto(Role role);
}
