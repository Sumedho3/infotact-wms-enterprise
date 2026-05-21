package com.infotact.inventory.service;

import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;

public interface WarehouseService {

	public Warehouse createWarehouse(WarehouseRequestDTO dto);
}
