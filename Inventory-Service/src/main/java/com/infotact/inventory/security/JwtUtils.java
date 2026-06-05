package com.infotact.inventory.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

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