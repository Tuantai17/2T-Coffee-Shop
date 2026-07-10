package com.rainbowforest.revenueservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "interaction_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionStat {
    @Id
    private LocalDate date;
    private Long checkinCount;
    private Long minigameCount;
}
