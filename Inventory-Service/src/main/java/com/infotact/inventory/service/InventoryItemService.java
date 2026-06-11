package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.dto.InventoryRequestDTO;
import com.infotact.inventory.dto.InventoryResponsedto2;
import com.infotact.inventory.entity.InventoryItem;

public interface InventoryItemService {
	
	public InventoryItem createInventory(InventoryRequestDTO dto);

	public List<InventoryResponsedto2> getItems();
}
