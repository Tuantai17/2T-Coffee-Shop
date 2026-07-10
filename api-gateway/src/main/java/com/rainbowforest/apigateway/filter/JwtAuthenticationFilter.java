package com.rainbowforest.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        // 1. Check if request is a public/bypass path
        if (isPublicPath(path, method)) {
            return chain.filter(exchange);
        }

        // 2. Otherwise validate JWT token
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            String role = claims.get("role", String.class);
            Long userId = claims.get("userId", Long.class);

            // --- ROLE-BASED ACCESS CONTROL ---
            if (isAdminPath(path) && !"ROLE_ADMIN".equals(role)) {
                return onError(exchange, "Access Denied: Admin role required", HttpStatus.FORBIDDEN);
            }

            // Add headers for downstream microservices to retrieve user details
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Name", username)
                    .header("X-User-Role", role)
                    .header("X-User-Id", userId != null ? String.valueOf(userId) : "")
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            return onError(exchange, "JWT Token Validation Failed", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Paths accessible without authentication.
     * Updated for beverage shop domain.
     */
    private boolean isPublicPath(String path, String method) {
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        // Auth endpoints
        if (path.startsWith("/api/auth/") || path.startsWith("/api/accounts/api/auth/")) {
            return true;
        }
        // User registration
        if (path.equals("/api/users/registration") || path.equals("/api/accounts/registration")) {
            return true;
        }
        // Password reset
        if (path.startsWith("/api/users/password-reset/") || path.startsWith("/api/accounts/api/auth/forgot-password/")) {
            return true;
        }
        // Catalog public GET (browse menu, product details)
        if (path.startsWith("/api/catalog/") && "GET".equals(method)) {
            return true;
        }
        // Public posts/news
        if (path.startsWith("/api/public/")) {
            return true;
        }
        // VNPay payment callbacks (server-to-server)
        if (path.startsWith("/api/payments/vnpay/return") || path.startsWith("/api/payments/vnpay/ipn")) {
            return true;
        }
        // WebSocket notifications
        if (path.startsWith("/ws-notifications")) {
            return true;
        }
        // Swagger / OpenAPI / Actuator
        if (path.contains("/v3/api-docs") || path.contains("/swagger-ui") || path.contains("/actuator")) {
            return true;
        }
        return false;
    }

    /**
     * Paths that require ROLE_ADMIN.
     */
    private boolean isAdminPath(String path) {
        return path.startsWith("/api/admin/");
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json");
        String body = String.format(
                "{\"error\": \"%s\", \"message\": \"%s\", \"status\": %d}",
                httpStatus.getReasonPhrase(), err, httpStatus.value()
        );
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
