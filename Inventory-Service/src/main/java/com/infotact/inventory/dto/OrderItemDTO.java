package com.infotact.inventory.dto;

public class OrderItemDTO {

	private Long productId;
    private Integer orderedQuantity;

    public OrderItemDTO() {}

    public OrderItemDTO(Long productId, Integer orderedQuantity) {
        this.productId = productId;
        this.orderedQuantity = orderedQuantity;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getOrderedQuantity() { return orderedQuantity; }
    public void setOrderedQuantity(Integer orderedQuantity) { this.orderedQuantity = orderedQuantity; }
}
