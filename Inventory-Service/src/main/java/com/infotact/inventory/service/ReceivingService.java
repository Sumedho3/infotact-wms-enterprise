package com.infotact.wms.inventory.service;

import com.infotact.wms.inventory.dto.InventoryResponseDTO;
import com.infotact.wms.inventory.dto.ReceivingRequestDTO;

public interface ReceivingService {

    InventoryResponseDTO processIncomingShipment(ReceivingRequestDTO request);

}