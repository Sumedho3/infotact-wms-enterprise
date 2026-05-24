package com.infotact.inventory.dto;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class ReceivingRequestDTO {
	
	@NotNull(message = "Product ID is mandatory and cannot be empty.")
	private Long productId;
	
	@NotNull(message = "Quantity is mandatory.")
    @Min(value = 1, message = "Incoming quantity must be at least 1 unit.")
    private Integer quantity;
	
	@NotNull(message = "Warehouse ID is mandatory.")
    private Long warehouseId;
	

	public Long getProductId() {
		return productId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Long getWarehouseId() {
		return warehouseId;
	}

	public void setWarehouseId(Long warehouseId) {
		this.warehouseId = warehouseId;
	}
	
	

}
