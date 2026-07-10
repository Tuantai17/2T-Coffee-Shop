package com.rainbowforest.notificationservice.repository;

import com.rainbowforest.notificationservice.domain.EmailDeliveryLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailDeliveryLogRepository extends MongoRepository<EmailDeliveryLog, String> {
}
