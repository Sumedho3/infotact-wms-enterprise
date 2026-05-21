package com.infotact.inventory.service;

import com.infotact.inventory.dto.InventoryRequestDTO;
import com.infotact.inventory.entity.InventoryItem;

public interface InventoryItemService {
	
	public InventoryItem createInventory(InventoryRequestDTO dto);
}
