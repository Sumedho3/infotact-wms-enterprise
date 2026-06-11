package com.infotact.inventory.helper;

import com.infotact.inventory.dto.InventoryResponsedto2;
import com.infotact.inventory.entity.InventoryItem;

public class InventoryMapper {
	
	public static InventoryResponsedto2 mapToDto(InventoryItem item)
	{
		InventoryResponsedto2 dto = new InventoryResponsedto2();
	    dto.setId(item.getId());
	    dto.setProduct(item.getProduct());
	    dto.setQuantity(item.getQuantity());
	    dto.setStorageBin(StoragebinMapper.mapToDTO(item.getStorageBin()));
	    return dto;
	}

}
