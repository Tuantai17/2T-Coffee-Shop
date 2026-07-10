package com.rainbowforest.loyaltyservice.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserServiceUser(
        Long id,
        String userName,
        Integer active,
        UserDetails userDetails,
        Role role
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UserDetails(
            Long id,
            String firstName,
            String lastName,
            String email,
            String phoneNumber,
            String avatarUrl
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Role(
            Long id,
            String roleName
    ) {
    }
}
