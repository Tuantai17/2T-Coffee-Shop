package com.rainbowforest.deliveryservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.rainbowforest.lab2.deliveryservice")
@EntityScan("com.rainbowforest.lab2.deliveryservice.model")
@EnableJpaRepositories("com.rainbowforest.lab2.deliveryservice.repo")
public class DeliveryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliveryServiceApplication.class, args);
    }
}
