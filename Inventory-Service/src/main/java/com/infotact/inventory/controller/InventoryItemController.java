package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.repository.InventoryItemRepository;

@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {
	
	private final InventoryItemRepository repository;

    public InventoryItemController(InventoryItemRepository repository) { this.repository = repository; }

    @PostMapping
    public InventoryItem create(@RequestBody InventoryItem item) { return repository.save(item); }

    @GetMapping
    public List<InventoryItem> getAll() { return repository.findAll(); }
}
