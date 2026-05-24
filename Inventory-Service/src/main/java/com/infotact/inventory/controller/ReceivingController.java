package com.infotact.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.InventoryResponseDTO;
import com.infotact.inventory.dto.ReceivingRequestDTO;
import com.infotact.inventory.service.ReceivingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/receiving")
public class ReceivingController {

    private final ReceivingService receivingService;

    public ReceivingController(ReceivingService receivingService) {
        this.receivingService = receivingService;
    }

    /**
     * Endpoint for the receiving desk to process shipments.
     * '@Valid' triggers the field-level validations automatically.
     */
    @PostMapping("/process")
    public ResponseEntity<InventoryResponseDTO> receiveShipment(@Valid @RequestBody ReceivingRequestDTO requestDTO) {
        InventoryResponseDTO response = receivingService.processIncomingShipment(requestDTO);
        return ResponseEntity.ok(response);
    }
}
