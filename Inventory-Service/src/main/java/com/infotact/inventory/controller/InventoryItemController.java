package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.InventoryRequestDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.repository.InventoryItemRepository;
import com.infotact.inventory.service.InventoryItemService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {
	
	private final InventoryItemRepository repository;
	private final InventoryItemService service;

    public InventoryItemController(InventoryItemRepository repository, InventoryItemService service) {
		super();
		this.repository = repository;
		this.service = service;
	}

	@PostMapping
    public ResponseEntity<InventoryItem> create(@RequestBody InventoryRequestDTO requestdto)
	{ 
		InventoryItem savedItem = service.createInventory(requestdto);
	    return ResponseEntity.ok(savedItem);
	}

    @GetMapping
    public List<InventoryItem> getAll() { return repository.findAll(); }
}
