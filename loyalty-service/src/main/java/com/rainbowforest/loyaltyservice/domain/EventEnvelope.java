package com.rainbowforest.loyaltyservice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventEnvelope {
    private String eventId;
    private String eventType;
    private int eventVersion;
    private String correlationId;
    private String source;
    private Object payload; // Can be casted to Map or specific DTO
}
