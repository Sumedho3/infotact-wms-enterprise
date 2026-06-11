package com.infotact.inventory.dto;

import lombok.Data;

@Data
public class RegisterRequest {
	
	private String username;
    private String password;
    private String role; // e.g., "ADMIN" or "OPERATOR"
    private Long warehouseId;

}
