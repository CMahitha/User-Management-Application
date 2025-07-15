package com.backend.userlogin.controller;

import com.backend.userlogin.dto.UserRequest;
import com.backend.userlogin.dto.UserResponse;
import com.backend.userlogin.model.Users;
import com.backend.userlogin.repository.UserRepository;
import com.backend.userlogin.security.JwtUtil;
import com.backend.userlogin.service.CustomUserDetails;
import com.backend.userlogin.service.UserServiceImplementation;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/auth")
@Slf4j
public class PublicController {

    @Autowired
    private UserServiceImplementation userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetails customUserDetails;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    // ✅ Register normal user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody @Valid UserRequest userRequest) {
        if(userRequest.getRoles().name()=="ADMIN"){
            userService.AdminRegister(userRequest);
            return ResponseEntity.ok(Map.of("message", "registered successfully!"));
        }
        userService.UserRegister(userRequest);
        return ResponseEntity.ok(Map.of("message", "registered successfully!"));

    }

    // ✅ Register admin user
    @PostMapping("/adminRegister")
    public ResponseEntity<?> registerAdmin(@RequestBody @Valid UserRequest adminRequest) {
        return ResponseEntity.ok(Map.of("message", "Admin registered successfully!"));
    }

    // ✅ Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserRequest user) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Load UserDetails and generate JWT
            UserDetails userDetails = customUserDetails.loadUserByUsername(user.getEmail());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            // Fetch full user
            Users loggedInUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // 3. Ensure the user is approved
            if (Boolean.FALSE.equals(loggedInUser.getApprovedStatus())) {
                // return 403 Forbidden if not approved
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "User is not approved"));
            }

            // 4. Generate JWT
             jwt = jwtUtil.generateToken(userDetails.getUsername());


            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", jwt);
            response.put("role", loggedInUser.getRole().name());
            response.put("user", loggedInUser); // Optional — sanitize if needed

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed", e);
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Invalid email or password"));
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getUserDetailsByAdmin() {
        List<UserResponse> userDetailsByAdmin = userService.getUserDetailsByAdmin();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User data retrieved successfully");
        response.put("data", userDetailsByAdmin);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<?> onlyUser(Principal principal) {
        String email = principal.getName(); // From authenticated JWT
        UserResponse userResponse = userService.getCurrentUser(email);
        return ResponseEntity.ok(userResponse);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/approved")
    public ResponseEntity<?> updateUserApproval(
            @PathVariable Long id

    ) {
        Users updated = userService.changeUserApprovalStatus(id);
        return ResponseEntity.ok(Map.of(
                "message", "User approval status updated",
                "user", Map.of(
                        "id", updated.getId(),
                        "email", updated.getEmail(),
                        "approved", updated.getApprovedStatus()
                )
        ));
    }
}
