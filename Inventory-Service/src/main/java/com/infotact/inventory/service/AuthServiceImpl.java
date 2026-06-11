package com.infotact.inventory.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infotact.inventory.dto.AuthResponse;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.model.Role;
import com.infotact.inventory.model.User;
import com.infotact.inventory.repository.UserRepository;
import com.infotact.inventory.repository.WarehouseRepository;
import com.infotact.inventory.security.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{
	
	private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WarehouseRepository warehouseRepository;

    @Override
	@Transactional
	public String createUser(String username, String password, String role, Long warehouseId) { // 🎯 STEP B: Added Long warehouseId parameter
		
		if (userRepository.findByUsername(username).isPresent()) {
	        throw new IllegalArgumentException("Error: Username is already taken!");
	    }

        User newUser = new User();
        newUser.setUsername(username);
        
        String hashedPassword = passwordEncoder.encode(password);
        newUser.setPassword(hashedPassword);
        Set<Role> rolesSet = new HashSet<>();
        
        try {
            String rawRole = role.trim().toUpperCase();
            String completeRoleName = "ROLE_" + rawRole;
            Role mappedRole = Role.valueOf(completeRoleName);
            rolesSet.add(mappedRole);
            newUser.setRoles(rolesSet); 
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Error: Invalid role provided. Must be ADMIN or OPERATOR.");
        }

        // 🎯 STEP C: RELATIONSHIP LINKING LOGIC
        // If a warehouse assignment was chosen in the UI select input, find it and join it!
        if (warehouseId != null) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new IllegalArgumentException("Error: Target Warehouse assignment ID not found in database records!"));
            newUser.setWarehouse(warehouse);
        }

        userRepository.save(newUser);
        
        return "User registered successfully with encoded password credentials!";
	}

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(authentication);
        return new AuthResponse(jwt, userDetails.getUsername());
    }
}
