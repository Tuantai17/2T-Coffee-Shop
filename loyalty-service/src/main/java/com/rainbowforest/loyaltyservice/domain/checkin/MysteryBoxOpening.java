package com.rainbowforest.loyaltyservice.domain.checkin;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mystery_box_openings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MysteryBoxOpening {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "box_id")
    private Long boxId;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "item_id")
    private Long itemId;
    private LocalDateTime openedAt;
    @Column(name = "business_date")
    private LocalDate businessDate;
    private String status;
}
