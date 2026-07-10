package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "mystery_box_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MysteryBoxItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "box_id")
    private Long boxId;
    private String name;
    private String rewardType;
    private String value;
    private BigDecimal probability;
    private Integer weight;
    private Integer quantityLimit;
    private Integer issuedQuantity;
    private String status;
}
