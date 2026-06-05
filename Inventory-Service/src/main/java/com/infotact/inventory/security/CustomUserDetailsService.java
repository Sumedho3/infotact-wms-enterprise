package com.infotact.inventory.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        if ("admin".equals(username)) {

            String dbUsername = "admin";

            String dbPassword = "{noop}admin123";

            return new org.springframework.security.core.userdetails.User(
                    dbUsername,
                    dbPassword,
                    new ArrayList<>()
            );

        } else {

            throw new UsernameNotFoundException(
                    "User not found with username: " + username
            );
        }
    }
}