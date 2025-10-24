package com.larose.repository;

import com.larose.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends JpaRepository<Role, Short> {
    Optional<Role> findByName(String name);

    List<Role> findAllByNameIn(Set<String> names);
}
