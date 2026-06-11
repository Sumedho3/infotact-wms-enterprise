package com.infotact.inventory.controller;

import com.infotact.inventory.model.User;
import com.infotact.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository; // 🎯 Injecting repository to talk to PostgreSQL live

    /**
     * 🎯 DAY 9 INITIALIZATION HANDSHAKE
     * Pulls the user entity data context dynamically from the database using Hibernate joins.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(Authentication authentication) {
        Map<String, Object> profile = new HashMap<>();
        
        String username = authentication.getName(); 
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Principal security mismatch: User record not found"));

        profile.put("username", user.getUsername());
        
        String activeRole = authentication.getAuthorities().iterator().next().getAuthority();
        profile.put("role", activeRole.replace("ROLE_", "").trim());
        
        if (user.getWarehouse() != null) {
            profile.put("warehouseLocation", user.getWarehouse().getLocation()); 
            
            // 🎯 THE MISSING LINE FIX: 
            // Explicitly pass the warehouse ID down to your frontend state engine!
            profile.put("warehouseId", user.getWarehouse().getId()); 
            profile.put("warehouseName", user.getWarehouse().getName());
        } else {
            profile.put("warehouseLocation", "Floating Assignment / Field Operator");
            profile.put("warehouseId", null);
        }

        return ResponseEntity.ok(profile);
    }
}