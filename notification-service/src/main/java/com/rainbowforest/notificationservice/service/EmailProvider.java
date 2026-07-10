package com.rainbowforest.notificationservice.service;

public interface EmailProvider {
    void sendEmail(String to, String subject, String body) throws Exception;
    String getProviderName();
}
