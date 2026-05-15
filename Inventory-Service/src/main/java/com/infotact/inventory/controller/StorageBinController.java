package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.StorageBinRepository;

@RestController
@RequestMapping("/api/bins")
public class StorageBinController {

	private final StorageBinRepository repository;

    public StorageBinController(StorageBinRepository repository) { this.repository = repository; }

    @PostMapping
    public StorageBin create(@RequestBody StorageBin bin) { return repository.save(bin); }

    @GetMapping
    public List<StorageBin> getAll() { return repository.findAll(); }
}
