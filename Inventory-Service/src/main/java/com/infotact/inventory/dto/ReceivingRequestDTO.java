package com.infotact.inventory.dto;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ReceivingRequestDTO {
	
	@NotNull(message = "Product ID is mandatory and cannot be empty.")
	private Long productId;
	
	@NotNull(message = "Quantity is mandatory.")
    @Min(value = 1, message = "Incoming quantity must be at least 1 unit.")
    private Integer quantity;
	
	@NotNull(message = "Warehouse ID is mandatory.")
    private Long warehouseId;

	
}
