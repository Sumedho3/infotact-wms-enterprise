package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.repository.WarehouseRepository;
import com.infotact.inventory.service.WarehouseService;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {
	
	private final WarehouseRepository repository;
	private final WarehouseService service;

    public WarehouseController(WarehouseRepository repository, WarehouseService service) {
		super();
		this.repository = repository;
		this.service = service;
	}

	@PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody WarehouseRequestDTO requestdto) {
		
		Warehouse savedWarehouse = service.createWarehouse(requestdto);
	    return ResponseEntity.ok(savedWarehouse);
    }

    @GetMapping
    public List<Warehouse> getWarehouses() {
        return service.getAllWarehouses();
    }

}
