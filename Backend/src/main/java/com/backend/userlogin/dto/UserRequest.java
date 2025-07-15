package com.backend.userlogin.dto;

import com.backend.userlogin.model.UserRole;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;
    private Boolean approvedStatus;
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    private UserRole roles;
    @NotBlank(message = "name is required")
    private String name;
    @NotBlank(message = "DOB is required")
    private String dob;
    @NotBlank(message = "MobileNumber is required")
    private String mobileNumber;

}
