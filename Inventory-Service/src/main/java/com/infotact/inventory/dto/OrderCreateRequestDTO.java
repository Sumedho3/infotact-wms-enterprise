package com.infotact.inventory.dto;

import lombok.Data;

@Data
public class OrderCreateRequestDTO {
	
	private Long productId;
    private int quantity;
}
