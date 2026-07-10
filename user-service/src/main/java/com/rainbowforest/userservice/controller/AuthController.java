package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtTokenProvider;
import com.rainbowforest.userservice.service.RefreshTokenService;
import com.rainbowforest.userservice.service.UserService;
import com.rainbowforest.userservice.entity.RefreshToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.getUserByName(loginRequest.getUsername());
        if (user == null) {
            user = userService.getUserByEmail(loginRequest.getUsername());
        }
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc email không chính xác");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getUserPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không chính xác");
        }

        String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_MEMBER";
        String token = jwtTokenProvider.generateToken(user.getUserName(), role, user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken.getToken());
        response.put("username", user.getUserName());
        response.put("role", role);
        response.put("userId", user.getId());

        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String requestRefreshToken = request.get("refreshToken");
        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh Token is missing");
        }

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshToken -> {
                    User user = userService.getUserByName(refreshToken.getUsername());
                    if (user == null) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
                    }
                    String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_MEMBER";
                    String token = jwtTokenProvider.generateToken(user.getUserName(), role, user.getId());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("refreshToken", requestRefreshToken);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired Refresh Token"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String requestRefreshToken = request.get("refreshToken");
        if (requestRefreshToken != null && !requestRefreshToken.isBlank()) {
            refreshTokenService.deleteByToken(requestRefreshToken);
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}
