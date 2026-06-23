package com.rainbowforest.revenueservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.rainbowforest.lab2.revenueservice")
@EntityScan("com.rainbowforest.lab2.revenueservice.model")
@EnableJpaRepositories("com.rainbowforest.lab2.revenueservice.repo")
public class RevenueServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RevenueServiceApplication.class, args);
    }
}
