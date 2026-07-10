package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class OrderSpecification {

    public static Specification<Order> hasKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likeKeyword = "%" + keyword.toLowerCase() + "%";
            
            Join<Order, User> userJoin = root.join("user", JoinType.LEFT);

            // Try to parse keyword as Long for ID match
            Long idKeyword = null;
            try {
                // Remove prefix if any
                String idStr = keyword.toLowerCase().replace("#mkd-", "").trim();
                idKeyword = Long.parseLong(idStr);
            } catch (NumberFormatException ignored) {}

            var idPredicate = idKeyword != null ? criteriaBuilder.equal(root.get("id"), idKeyword) : criteriaBuilder.disjunction();

            return criteriaBuilder.or(
                    idPredicate,
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("receiverName")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("userName")), likeKeyword)
            );
        };
    }

    public static Specification<Order> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Order> hasPaymentMethod(String paymentMethod) {
        return (root, query, criteriaBuilder) -> {
            if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("paymentMethod"), paymentMethod);
        };
    }

    public static Specification<Order> betweenDates(String fromDate, String toDate) {
        return (root, query, criteriaBuilder) -> {
            if ((fromDate == null || fromDate.isEmpty()) && (toDate == null || toDate.isEmpty())) {
                return criteriaBuilder.conjunction();
            }
            try {
                if (fromDate != null && !fromDate.isEmpty() && toDate != null && !toDate.isEmpty()) {
                    java.time.LocalDateTime start = java.time.LocalDate.parse(fromDate).atStartOfDay();
                    java.time.LocalDateTime end = java.time.LocalDate.parse(toDate).atTime(23, 59, 59);
                    return criteriaBuilder.between(root.get("orderedDate"), start, end);
                } else if (fromDate != null && !fromDate.isEmpty()) {
                    java.time.LocalDateTime start = java.time.LocalDate.parse(fromDate).atStartOfDay();
                    return criteriaBuilder.greaterThanOrEqualTo(root.get("orderedDate"), start);
                } else {
                    java.time.LocalDateTime end = java.time.LocalDate.parse(toDate).atTime(23, 59, 59);
                    return criteriaBuilder.lessThanOrEqualTo(root.get("orderedDate"), end);
                }
            } catch (DateTimeParseException e) {
                return criteriaBuilder.conjunction();
            }
        };
    }
}
