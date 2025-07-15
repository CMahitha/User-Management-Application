package com.backend.userlogin.repository;

import com.backend.userlogin.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.userlogin.model.Users;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    List<Users> findByRole(UserRole role);
    boolean existsByEmail(String email);
}
