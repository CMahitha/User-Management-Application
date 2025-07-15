package com.backend.userlogin.dto;

import com.backend.userlogin.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private Boolean approvedStatus;
    private String name;
    private String dob;
    private String mobileNumber;
    private UserRole role;
}