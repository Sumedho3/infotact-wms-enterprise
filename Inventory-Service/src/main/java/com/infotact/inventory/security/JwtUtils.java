package com.infotact.inventory.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private Key getSigningKey() {

        byte[] keyBytes = jwtSecret.getBytes();

        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Overloaded generation method that accepts the full Authentication object.
     * Extracts username and roles to inject them directly into the cryptographic claims.
     */
    public String generateToken(Authentication authentication) {
        // 1. Extract the core user principal from Spring Security
        org.springframework.security.core.userdetails.User userPrincipal = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        // 2. Map the GrantedAuthority collection into a clean string (e.g., "ROLE_ADMIN")
        String rolesClaim = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // 3. Put roles inside the extra claims map
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", rolesClaim); 

        // 4. Build the token with the claims attached
        return Jwts.builder()
                .setClaims(claims) // Sets our custom roles map
                .setSubject(userPrincipal.getUsername()) // Sets username as 'sub'
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpirationMs
                        )
                )
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    public String getUsernameFromToken(String token) {

        return getClaimFromToken(
                token,
                Claims::getSubject
        );
    }

    public Date getExpirationDateFromToken(String token) {

        return getClaimFromToken(
                token,
                Claims::getExpiration
        );
    }

    public <T> T getClaimFromToken(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        final Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(getSigningKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claimsResolver.apply(claims);
    }

    private Boolean isTokenExpired(String token) {

        final Date expiration =
                getExpirationDateFromToken(token);

        return expiration.before(new Date());
    }

    public Boolean validateToken(
            String token,
            String username
    ) {

        try {

            final String tokenUsername =
                    getUsernameFromToken(token);

            return (
                    tokenUsername.equals(username)
                            && !isTokenExpired(token)
            );

        } catch (
                JwtException
                | IllegalArgumentException e
        ) {

            return false;
        }
    }
}