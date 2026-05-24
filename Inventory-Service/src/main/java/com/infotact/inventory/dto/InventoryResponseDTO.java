package com.infotact.inventory.dto;

public class InventoryResponseDTO {
    private Long id;
    private Integer quantity;
    private Long productId;
    private String productName;
    private String binCode;

    // Constructors
    public InventoryResponseDTO() {}

    public InventoryResponseDTO(Long id, Integer quantity, Long productId, String productName, String binCode) {
        this.id = id;
        this.quantity = quantity;
        this.productId = productId;
        this.productName = productName;
        this.binCode = binCode;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getBinCode() { return binCode; }
    public void setBinCode(String binCode) { this.binCode = binCode; }
}
