package com.infotact.inventory.service;

import com.infotact.inventory.dto.InventoryResponseDTO;
import com.infotact.inventory.dto.ReceivingRequestDTO;

public interface ReceivingService {

    InventoryResponseDTO processIncomingShipment(ReceivingRequestDTO request);

}