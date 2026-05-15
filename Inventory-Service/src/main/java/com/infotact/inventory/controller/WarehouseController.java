package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.repository.WarehouseRepository;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {
	
	private final WarehouseRepository repository;

    public WarehouseController(WarehouseRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Warehouse createWarehouse(@RequestBody Warehouse warehouse) {
        return repository.save(warehouse);
    }

    @GetMapping
    public List<Warehouse> getAllWarehouses() {
        return repository.findAll();
    }

}
