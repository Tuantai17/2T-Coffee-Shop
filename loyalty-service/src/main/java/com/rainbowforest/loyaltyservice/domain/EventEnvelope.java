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

    public String getEventId() { return eventId; }
    public String getEventType() { return eventType; }
    public Object getPayload() { return payload; }
    public void setPayload(Object payload) { this.payload = payload; }
    public void setSource(String source) { this.source = source; }
    public String getSource() { return source; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public String getCorrelationId() { return correlationId; }
    public void setEventVersion(int eventVersion) { this.eventVersion = eventVersion; }
    public int getEventVersion() { return eventVersion; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public static class EventEnvelopeBuilder {
        private String eventId;
        private String eventType;
        private int eventVersion;
        private String correlationId;
        private String source;
        private Object payload;

        public EventEnvelopeBuilder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

        public EventEnvelopeBuilder eventType(String eventType) {
            this.eventType = eventType;
            return this;
        }

        public EventEnvelopeBuilder eventVersion(int eventVersion) {
            this.eventVersion = eventVersion;
            return this;
        }

        public EventEnvelopeBuilder correlationId(String correlationId) {
            this.correlationId = correlationId;
            return this;
        }

        public EventEnvelopeBuilder source(String source) {
            this.source = source;
            return this;
        }

        public EventEnvelopeBuilder payload(Object payload) {
            this.payload = payload;
            return this;
        }

        public EventEnvelope build() {
            EventEnvelope obj = new EventEnvelope();
            obj.setEventId(this.eventId);
            obj.setEventType(this.eventType);
            obj.setEventVersion(this.eventVersion);
            obj.setCorrelationId(this.correlationId);
            obj.setSource(this.source);
            obj.setPayload(this.payload);
            return obj;
        }
    }
    
    public static EventEnvelopeBuilder builder() { return new EventEnvelopeBuilder(); }
}
