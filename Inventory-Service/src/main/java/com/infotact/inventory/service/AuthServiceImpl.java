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
import com.infotact.inventory.model.Role;
import com.infotact.inventory.model.User;
import com.infotact.inventory.repository.UserRepository;
import com.infotact.inventory.security.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{
	
	private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

	@Override
	@Transactional
	public String createUser(String username, String password, String role) {
		
		if (userRepository.findByUsername(username).isPresent()) {
	        throw new IllegalArgumentException("Error: Username is already taken!");
	    }

        User newUser = new User();
        newUser.setUsername(username);
        
        String hashedPassword = passwordEncoder.encode(password);
        newUser.setPassword(hashedPassword);
        Set<Role> rolesSet = new HashSet<>();
        
        try {
        	// 1. Take the raw string input (e.g., "admin") -> trim spacing -> convert to UPPERCASE ("ADMIN")
            String rawRole = role.trim().toUpperCase();
            
            // 2. Programmatically apply the mandatory enterprise prefix "ROLE_" -> "ROLE_ADMIN"
            String completeRoleName = "ROLE_" + rawRole;
            
            // 3. Convert the combined string safely into exact Enum constant type
            Role mappedRole = Role.valueOf(completeRoleName);
            rolesSet.add(mappedRole);
            newUser.setRoles(rolesSet); 
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Error: Invalid role provided. Must be ADMIN or OPERATOR.");
        }

        userRepository.save(newUser);
        
        return "User registered successfully with encoded password credentials!";
		
	}

	@Override
	@Transactional(readOnly = true)
	public AuthResponse login(String username, String password) {
		
		// 1. Authenticate using Spring Security's infrastructure manager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username,password));

        // 2. Set the context thread safely
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // 3. Extract user principal data
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // 4. Generate the signed cryptographic token payload
        String jwt = jwtUtils.generateToken(authentication);

        // 5. Package into your clean response transfer structure
        return new AuthResponse(jwt, userDetails.getUsername());
		
	}

}
