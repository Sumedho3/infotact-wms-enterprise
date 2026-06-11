package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.StorageBinRequestDTO;
import com.infotact.inventory.dto.StorageBinResponseDTO;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.StorageBinRepository;
import com.infotact.inventory.service.StorageBinService;

@RestController
@RequestMapping("/api/bins")
public class StorageBinController {

	private final StorageBinRepository repository;
	private final StorageBinService service;

    public StorageBinController(StorageBinRepository repository, StorageBinService service) {
		super();
		this.repository = repository;
		this.service = service;
	}

	@PostMapping
    public ResponseEntity<StorageBin> create(@RequestBody StorageBinRequestDTO requestDTO)
	{ 
		StorageBin savedBin = service.createStorageBin(requestDTO);
		return ResponseEntity.ok(savedBin);
	}

    @GetMapping
    public List<StorageBinResponseDTO> getAll() { return service.getItems(); }
}
