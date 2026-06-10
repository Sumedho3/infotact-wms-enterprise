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
        
        // 1. Get the authenticated username string straight out of the secure context session
        String username = authentication.getName(); 
        
        // 2. Query PostgreSQL to find the full User record along with its lazy-loaded relations
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Principal security mismatch: User record not found"));

        profile.put("username", user.getUsername());
        
        // Extract the role authority name string dynamically
        String activeRole = authentication.getAuthorities().iterator().next().getAuthority();
        profile.put("role", activeRole.replace("ROLE_", "").trim());
        
        // 🎯 THE DYNAMIC, NON-HARDCODED RELATIONSHIP SOLUTION:
        // Follow the relational object graph mapping straight to the warehouse configuration table
        if (user.getWarehouse() != null) {
            // Pulls the real, live location text (e.g. your Amravati city database field strings) dynamically!
            profile.put("warehouseLocation", user.getWarehouse().getLocation()); 
        } else {
            profile.put("warehouseLocation", "Floating Assignment / Field Operator");
        }

        return ResponseEntity.ok(profile);
    }
}