package com.rainbowforest.inventoryservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.rainbowforest.lab2.inventoryservice")
@EntityScan("com.rainbowforest.lab2.inventoryservice.model")
@EnableJpaRepositories("com.rainbowforest.lab2.inventoryservice.repo")
public class InventoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}
