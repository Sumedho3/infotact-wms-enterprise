package com.infotact.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReceivingRequestDTO {
	
	private Long productId;
    private Integer quantity;
    private Long warehouseId;

}
