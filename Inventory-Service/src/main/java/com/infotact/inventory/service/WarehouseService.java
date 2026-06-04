package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;

public interface WarehouseService {

	public Warehouse createWarehouse(WarehouseRequestDTO dto);
	public List<Warehouse> getAllWarehouses();
}
