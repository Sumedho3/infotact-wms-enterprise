package com.infotact.inventory.dto;

public class AuthResponse {

    private String jwtToken;

    private String username;

    public AuthResponse(
            String jwtToken,
            String username
    ) {

        this.jwtToken = jwtToken;
        this.username = username;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public String getUsername() {
        return username;
    }
}