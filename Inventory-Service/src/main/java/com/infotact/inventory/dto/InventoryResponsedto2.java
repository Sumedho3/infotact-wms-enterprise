package com.infotact.inventory.dto;

import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;

import lombok.Data;

@Data
public class InventoryResponsedto2 {
	
	private Long id;
    private Product product;
    private StorageBinResponseDTO storageBin;
    private Integer quantity;

}
