package com.infotact.inventory.dto;

import lombok.Data;

@Data
public class StorageBinResponseDTO {
	
	private Long id;
    private String binCode;
    private String allowedCategory;
    private Long warehouseId;
}
