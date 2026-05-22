package com.infotact.inventory.dto;

public class InventoryRequestDTO {

	private Integer quantity;
    private Long productId;
    private Long storageBinId;
	public InventoryRequestDTO() {
	}
	
	
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	public Long getProductId() {
		return productId;
	}
	public void setProductId(Long productId) {
		this.productId = productId;
	}
	public Long getStorageBinId() {
		return storageBinId;
	}
	public void setStorageBinId(Long storageBinId) {
		this.storageBinId = storageBinId;
	}
    
	
    
}
