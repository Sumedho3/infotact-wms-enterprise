package com.infotact.inventory.service;

import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;

public interface PutawayService {
    public StorageBin findAvailableBin(Long warehouseId, Integer incomingQuantity, Product product);
}
