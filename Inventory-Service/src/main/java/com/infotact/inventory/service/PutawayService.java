package com.infotact.inventory.service;

import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.StorageBinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PutawayService {

    private final StorageBinRepository binRepository;

    @Value("${wms.config.global-max-bin-capacity}")
    private int maxBinCapacity;

    public PutawayService(StorageBinRepository binRepository) {
        this.binRepository = binRepository;
    }

    public StorageBin findAvailableBin(
            Long warehouseId,
            Integer incomingQuantity,
            Product product) {

        List<StorageBin> allBins = binRepository.findAll();

        String productCategory = product.getCategory();

        for (StorageBin bin : allBins) {

            // Rule 1: Match Warehouse Location
            if (bin.getWarehouse() != null &&
                    bin.getWarehouse().getId().equals(warehouseId)) {

                // Rule 2: Match Zone/Category Restrictions
                if (bin.getAllowedCategory() != null &&
                        bin.getAllowedCategory()
                                .equalsIgnoreCase(productCategory)) {

                    // Rule 3: Check Remaining Space Capacity
                    int currentBinStock = 0;

                    if (bin.getInventoryItems() != null) {

                        currentBinStock =
                                bin.getInventoryItems()
                                        .stream()
                                        .mapToInt(item ->
                                                item.getQuantity())
                                        .sum();
                    }

                    if (currentBinStock +
                            incomingQuantity <= maxBinCapacity) {

                        return bin;
                    }
                }
            }
        }

        throw new RuntimeException(
                "Putaway Error: No available bins found for category '"
                        + productCategory
                        + "' with space for "
                        + incomingQuantity
                        + " units in warehouse ID: "
                        + warehouseId);
    }
}