package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.InventoryRequestDTO;
import com.infotact.inventory.dto.InventoryResponseDTO;
import com.infotact.inventory.dto.InventoryResponsedto2;
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
	public ResponseEntity<InventoryResponseDTO> createInventory(@RequestBody InventoryRequestDTO dto) {
	    // 1. Save the inventory via service layer as usual
	    InventoryItem savedItem = service.createInventory(dto);
	    
	    // 2. Manually map the entity fields into our clean Response DTO
	    InventoryResponseDTO response = new InventoryResponseDTO();
	    response.setId(savedItem.getId());
	    response.setQuantity(savedItem.getQuantity());
	    response.setProductId(savedItem.getProduct().getId());
	    response.setProductName(savedItem.getProduct().getName());
	    response.setBinCode(savedItem.getStorageBin().getBinCode());
	    
	    // 3. Return the safe DTO instead of the entity!
	    return ResponseEntity.ok(response);
	}

    @GetMapping
    public List<InventoryResponsedto2> getAll() { return service.getItems(); }
}
