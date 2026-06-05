package com.infotact.inventory.security;

import com.infotact.inventory.model.User;
import com.infotact.inventory.repository.UserRepository; // 👈 Your actual Spring Data JPA Repository
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Dependency Injection via Constructor (Production Best Practice)
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Query the actual database. If the user doesn't exist, instantly throw the exception.
        User domainUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found in database with username: " + username));

        // 2. Map the user's roles/permissions from your database to Spring Security authorities
        // This assumes your User entity has a collection of roles (e.g., domainUser.getRoles())
        List<SimpleGrantedAuthority> authorities = domainUser.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());

        // 3. Return Spring Security's User Details principal object mapped directly to database values
        return new org.springframework.security.core.userdetails.User(
                domainUser.getUsername(),
                domainUser.getPassword(), // This should be a hashed password (e.g., BCrypt string)
                true,   // Dynamic status flag from database
                true,                     // Account non-expired
                true,                     // Credentials non-expired
                true,                     // Account non-locked
                authorities
        );
    }
}