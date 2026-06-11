package com.infotact.inventory.service;

import com.infotact.inventory.dto.AuthResponse;

public interface AuthService {
	
	String createUser(String username, String password, String role, Long warehouseId);
	AuthResponse login(String username, String password);
}
