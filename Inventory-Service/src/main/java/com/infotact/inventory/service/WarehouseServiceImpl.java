package com.infotact.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.repository.WarehouseRepository;

@Service
public class WarehouseServiceImpl implements WarehouseService{

	private final WarehouseRepository repository;
	
	public WarehouseServiceImpl(WarehouseRepository repository) {
		super();
		this.repository = repository;
	}

	@Override
	public Warehouse createWarehouse(WarehouseRequestDTO dto) {
		
		Warehouse warehouse = new Warehouse();
	    warehouse.setName(dto.getName());
	    warehouse.setLocation(dto.getLocation());
	    return repository.save(warehouse);
	}

	@Override
	public List<Warehouse> getAllWarehouses() {
		return repository.findAll();
	}

}
