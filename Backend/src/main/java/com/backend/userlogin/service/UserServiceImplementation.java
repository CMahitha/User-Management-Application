package com.backend.userlogin.service;

import com.backend.userlogin.dto.UserRequest;
import com.backend.userlogin.dto.UserResponse;

import com.backend.userlogin.exception.UserAlreadyExistsException;
import com.backend.userlogin.model.UserRole;
import com.backend.userlogin.model.Users;
import com.backend.userlogin.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class UserServiceImplementation{

    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;



    public UserResponse UserRegister(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with this email already exists");
        }
        Users newUser = Users.builder()
                .name(userRequest.getName())
                .email(userRequest.getEmail())
                .role(UserRole.USER)
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .MobileNumber(userRequest.getMobileNumber())
                .DOB(userRequest.getDob())
                .createdAt(LocalDateTime.now())
                .approvedStatus(Boolean.FALSE)
                .updatedAt(LocalDateTime.now())

                .build();
        userRepository.save(newUser);
        return  UserResponse.builder()
                .email(newUser.getEmail())
                .build();
    }

    public UserResponse AdminRegister(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new UserAlreadyExistsException("User with this email already exists");
        }

        Users newUser = Users.builder()
                .email(userRequest.getEmail())
                .name(userRequest.getName())
                .role(UserRole.ADMIN)
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .MobileNumber(userRequest.getMobileNumber())
                .DOB(userRequest.getDob())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .approvedStatus(Boolean.TRUE)
                .build();
        userRepository.save(newUser);
        return UserResponse.builder()
                .email(newUser.getEmail())
                .build();
    }

    public List<UserResponse> getUserDetailsByAdmin() {
        List<Users> users = userRepository.findByRole(UserRole.USER);

        return users.stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .dob(user.getDOB())
                        .mobileNumber(user.getMobileNumber())
                        .role(user.getRole())
                        .approvedStatus(user.getApprovedStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public UserResponse getCurrentUser(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserAlreadyExistsException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .dob(user.getDOB())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole())
                .build();
    }

    public Users changeUserApprovalStatus(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new UserAlreadyExistsException("User not found with id " + userId));

        user.setApprovedStatus(Boolean.TRUE);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
