package com.rainbowforest.loyaltyservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/users")
    List<UserServiceUser> getAllUsers();

    @GetMapping("/users/{id}")
    UserServiceUser getUserById(@PathVariable("id") Long id);
}
