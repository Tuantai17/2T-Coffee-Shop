package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table (name = "items")
@EqualsAndHashCode
public class Item {
	
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "quantity")
    @NotNull
    private int quantity; // The original quantity, or the current valid quantity for old code

    @Column (name = "subtotal")
    @NotNull
    private BigDecimal subTotal;

    @ManyToOne
    @JoinColumn (name = "product_id")
    private Product product;

    @ManyToMany (mappedBy = "items")
    @JsonIgnore
    private List<Order> orders;

    // --- NEW FIELDS FOR UPGRADE ---

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "original_quantity")
    private Integer originalQuantity;

    @Column(name = "fulfillable_quantity")
    private Integer fulfillableQuantity;

    @Column(name = "final_quantity")
    private Integer finalQuantity;

    @Column(name = "damaged_quantity")
    private Integer damagedQuantity;

    @Column(name = "missing_quantity")
    private Integer missingQuantity;

    @Column(name = "item_status")
    private String itemStatus; // NORMAL, PREPARING, DAMAGED, SHORTAGE, AWAITING_CUSTOMER, QUANTITY_ADJUSTED, REMOVED, WAITING_FOR_RESTOCK, READY, CANCELLED

    @Column(name = "issue_reason", length = 1000)
    private String issueReason;

    @Column(name = "issue_reported_at")
    private LocalDateTime issueReportedAt;

    @Column(name = "issue_reported_by")
    private String issueReportedBy;

    // --- SNAPSHOT FIELDS (PHASE 2) ---
    @Column(name = "product_name_snapshot")
    private String productNameSnapshot;

    @Column(name = "sku_snapshot")
    private String skuSnapshot;

    @Column(name = "image_snapshot")
    private String imageSnapshot;

    @Column(name = "variant_name")
    private String variantName;

    @Column(name = "options_snapshot", length = 1000)
    private String optionsSnapshot;

    @Column(name = "toppings_snapshot", length = 1000)
    private String toppingsSnapshot;

    @Column(name = "note", length = 1000)
    private String note;
    // --- END NEW FIELDS ---

    public Item() {
    	
    }

    public Item(@NotNull int quantity, Product product, BigDecimal subTotal) {
        this.quantity = quantity;
        this.product = product;
        this.subTotal = subTotal;
        this.originalQuantity = quantity;
        this.finalQuantity = quantity;
        this.itemStatus = "NORMAL";
        if (product != null) {
            this.unitPrice = product.getPrice();
        }
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getSubTotal() {
		return subTotal;
	}

	public void setSubTotal(BigDecimal subTotal) {
		this.subTotal = subTotal;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

    // Getters and Setters for new fields

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getOriginalQuantity() {
        return originalQuantity;
    }

    public void setOriginalQuantity(Integer originalQuantity) {
        this.originalQuantity = originalQuantity;
    }

    public Integer getFulfillableQuantity() {
        return fulfillableQuantity;
    }

    public void setFulfillableQuantity(Integer fulfillableQuantity) {
        this.fulfillableQuantity = fulfillableQuantity;
    }

    public Integer getFinalQuantity() {
        return finalQuantity;
    }

    public void setFinalQuantity(Integer finalQuantity) {
        this.finalQuantity = finalQuantity;
    }

    public Integer getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(Integer damagedQuantity) {
        this.damagedQuantity = damagedQuantity;
    }

    public Integer getMissingQuantity() {
        return missingQuantity;
    }

    public void setMissingQuantity(Integer missingQuantity) {
        this.missingQuantity = missingQuantity;
    }

    public String getItemStatus() {
        return itemStatus;
    }

    public void setItemStatus(String itemStatus) {
        this.itemStatus = itemStatus;
    }

    public String getIssueReason() {
        return issueReason;
    }

    public void setIssueReason(String issueReason) {
        this.issueReason = issueReason;
    }

    public LocalDateTime getIssueReportedAt() {
        return issueReportedAt;
    }

    public void setIssueReportedAt(LocalDateTime issueReportedAt) {
        this.issueReportedAt = issueReportedAt;
    }

    public String getIssueReportedBy() {
        return issueReportedBy;
    }

    public void setIssueReportedBy(String issueReportedBy) {
        this.issueReportedBy = issueReportedBy;
    }

    public String getProductNameSnapshot() {
        return productNameSnapshot;
    }

    public void setProductNameSnapshot(String productNameSnapshot) {
        this.productNameSnapshot = productNameSnapshot;
    }

    public String getSkuSnapshot() {
        return skuSnapshot;
    }

    public void setSkuSnapshot(String skuSnapshot) {
        this.skuSnapshot = skuSnapshot;
    }

    public String getImageSnapshot() {
        return imageSnapshot;
    }

    public void setImageSnapshot(String imageSnapshot) {
        this.imageSnapshot = imageSnapshot;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    public String getOptionsSnapshot() {
        return optionsSnapshot;
    }

    public void setOptionsSnapshot(String optionsSnapshot) {
        this.optionsSnapshot = optionsSnapshot;
    }

    public String getToppingsSnapshot() {
        return toppingsSnapshot;
    }

    public void setToppingsSnapshot(String toppingsSnapshot) {
        this.toppingsSnapshot = toppingsSnapshot;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
