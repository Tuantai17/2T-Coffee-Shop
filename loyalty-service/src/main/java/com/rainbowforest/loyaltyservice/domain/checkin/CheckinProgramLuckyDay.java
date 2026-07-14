package com.rainbowforest.loyaltyservice.domain.checkin;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "checkin_program_lucky_days")
@Data
public class CheckinProgramLuckyDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private LocalDate luckyDate;

    private BigDecimal multiplier = BigDecimal.ONE;
    private Integer bonusPoints = 0;
    private String voucherId;
    
    private Integer quantityLimit;
    private Integer quantityUsed = 0;
    
    private String status = "ACTIVE";
    public void setQuantityLimit(Integer quantityLimit) { this.quantityLimit = quantityLimit; }
    public Integer getQuantityLimit() { return quantityLimit; }
    public void setVoucherId(String voucherId) { this.voucherId = voucherId; }
    public String getVoucherId() { return voucherId; }
    public void setLuckyDate(LocalDate luckyDate) { this.luckyDate = luckyDate; }
    public LocalDate getLuckyDate() { return luckyDate; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getProgramId() { return programId; }
    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public static class CheckinProgramLuckyDayBuilder {
        private Long id;
        private Long programId;
        private LocalDate luckyDate;
        private String voucherId;
        private Integer quantityLimit;

        public CheckinProgramLuckyDayBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CheckinProgramLuckyDayBuilder programId(Long programId) {
            this.programId = programId;
            return this;
        }

        public CheckinProgramLuckyDayBuilder luckyDate(LocalDate luckyDate) {
            this.luckyDate = luckyDate;
            return this;
        }

        public CheckinProgramLuckyDayBuilder voucherId(String voucherId) {
            this.voucherId = voucherId;
            return this;
        }

        public CheckinProgramLuckyDayBuilder quantityLimit(Integer quantityLimit) {
            this.quantityLimit = quantityLimit;
            return this;
        }

        public CheckinProgramLuckyDay build() {
            CheckinProgramLuckyDay obj = new CheckinProgramLuckyDay();
            obj.setId(this.id);
            obj.setProgramId(this.programId);
            obj.setLuckyDate(this.luckyDate);
            obj.setVoucherId(this.voucherId);
            obj.setQuantityLimit(this.quantityLimit);
            return obj;
        }
    }
    
    public static CheckinProgramLuckyDayBuilder builder() { return new CheckinProgramLuckyDayBuilder(); }
    public BigDecimal getMultiplier() { return this.multiplier; }
    public void setMultiplier(BigDecimal multiplier) { this.multiplier = multiplier; }
    public Integer getBonusPoints() { return this.bonusPoints; }
    public void setBonusPoints(Integer bonusPoints) { this.bonusPoints = bonusPoints; }
    public Integer getQuantityUsed() { return this.quantityUsed; }
    public void setQuantityUsed(Integer quantityUsed) { this.quantityUsed = quantityUsed; }
    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }
}
