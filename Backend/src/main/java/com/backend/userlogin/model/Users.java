package com.backend.userlogin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

//    @Column(nullable = false)
    private Boolean approvedStatus = false;

    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String DOB;
    @Column(nullable = false)
    private String MobileNumber;
    private UserRole role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
