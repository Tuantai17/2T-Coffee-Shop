package com.rainbowforest.orderservice.common.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                String correlationId = MDC.get("correlationId");
                if (correlationId != null) {
                    template.header("X-Correlation-Id", correlationId);
                }
            }
        };
    }
}
