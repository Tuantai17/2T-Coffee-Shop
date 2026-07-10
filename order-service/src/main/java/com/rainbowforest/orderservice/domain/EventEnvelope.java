package com.rainbowforest.orderservice.domain;

import java.time.LocalDateTime;

public class EventEnvelope {
    private String eventId;
    private String eventType;
    private int eventVersion;
    private String correlationId;
    private String source;
    private LocalDateTime occurredAt;
    private Object payload;

    public EventEnvelope() {}

    public EventEnvelope(String eventId, String eventType, int eventVersion, String correlationId, String source, Object payload) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.eventVersion = eventVersion;
        this.correlationId = correlationId;
        this.source = source;
        this.occurredAt = LocalDateTime.now();
        this.payload = payload;
    }

    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public int getEventVersion() { return eventVersion; }
    public void setEventVersion(int eventVersion) { this.eventVersion = eventVersion; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
    public Object getPayload() { return payload; }
    public void setPayload(Object payload) { this.payload = payload; }
}
