package com.infotact.inventory.controller;

import com.infotact.inventory.dto.AuthResponse;
import com.infotact.inventory.dto.LoginRequest;
import com.infotact.inventory.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final JwtUtils jwtUtils;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils
    ) {

        this.authenticationManager =
                authenticationManager;

        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @RequestBody LoginRequest loginRequest
    ) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getUsername(),
                                loginRequest.getPassword()
                        )
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        String jwt =
                jwtUtils.generateToken(
                        userDetails.getUsername()
                );

        return ResponseEntity.ok(
                new AuthResponse(
                        jwt,
                        userDetails.getUsername()
                )
        );
    }
}