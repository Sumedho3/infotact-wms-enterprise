package com.infotact.inventory.controller;

import com.infotact.inventory.dto.AuthResponse;
import com.infotact.inventory.dto.LoginRequest;
import com.infotact.inventory.dto.RegisterRequest;
import com.infotact.inventory.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            String resultMessage = authService.createUser(registerRequest.getUsername(),registerRequest.getPassword(),registerRequest.getRole(), registerRequest.getWarehouseId());
            return ResponseEntity.status(HttpStatus.CREATED).body(resultMessage);
        } catch (IllegalArgumentException e) {
            // Catches our duplicate user rule failure and returns a clean 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // If authenticationManager fails internally, Spring automatically handles throwing a 401 Unauthorized exception
        AuthResponse authResponse = authService.login(loginRequest.getUsername(),loginRequest.getPassword());
        return ResponseEntity.ok(authResponse);
    }
}