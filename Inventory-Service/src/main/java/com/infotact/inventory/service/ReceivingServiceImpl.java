package com.infotact.inventory.service;

import com.infotact.inventory.dto.InventoryResponseDTO;
import com.infotact.inventory.dto.ReceivingRequestDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.exception.StorageOverflowException;
import com.infotact.inventory.repository.InventoryRepository;
import com.infotact.inventory.repository.ProductRepository;
import com.infotact.inventory.repository.StorageBinRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReceivingServiceImpl implements ReceivingService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StorageBinRepository storageBinRepository; 
    
    @Value("${wms.config.global-max-bin-capacity}")
    private int maxBinCapacity;

    public ReceivingServiceImpl(ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                StorageBinRepository storageBinRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.storageBinRepository = storageBinRepository;
    }

    @Override
    public InventoryResponseDTO processIncomingShipment(ReceivingRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Receiving Error: Product ID " + request.getProductId() + " does not exist in master catalog."));

        List<StorageBin> allBins = storageBinRepository.findByWarehouseId(request.getWarehouseId());
        if (allBins.isEmpty()) {
            throw new RuntimeException("Receiving Error: No operational storage bins found mapped to Warehouse ID " + request.getWarehouseId());
        }

        int remainingQuantityToPlace = fillAvailableBinsSequentially(allBins, product, request.getQuantity());

        InventoryItem finalRecordSnapshot = inventoryRepository.findTopByProductIdOrderByIdDesc(product.getId())
                .orElse(null);

        if (remainingQuantityToPlace > 0) {
            int totalStored = request.getQuantity() - remainingQuantityToPlace;
            throw new StorageOverflowException(String.format(
                "Warehouse Storage Overflow: Placed %d units successfully. Remaining quantity {%d} could not be stored because all valid matching storage bins are full.",
                totalStored, remainingQuantityToPlace
            ));
        }

        InventoryResponseDTO response = new InventoryResponseDTO();
        if (finalRecordSnapshot != null) {
            response.setId(finalRecordSnapshot.getId());
            response.setQuantity(finalRecordSnapshot.getQuantity()); 
            response.setProductId(product.getId());
            response.setProductName(product.getName());
            response.setBinCode(finalRecordSnapshot.getStorageBin().getBinCode());
        }
        return response;
    }

    /**
     * 🎯 THE COMPLIANT CATEGORY-LOCKED SEQUENTIAL FILL METHOD
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int fillAvailableBinsSequentially(List<StorageBin> allBins, Product product, int initialQuantity) {
        int remainingToPlace = initialQuantity;

        for (StorageBin bin : allBins) {
            if (remainingToPlace <= 0) break;

            // 🎯 CRITICAL CATEGORY ENFORCEMENT CHECK:
            // Compare product category with the bin's explicitly allowed category layout constraints.
            // If they do not match, skip this bin immediately to prevent item co-mingling contamination!
            if (bin.getAllowedCategory() != null && 
                !bin.getAllowedCategory().trim().toUpperCase().equals(product.getCategory().trim().toUpperCase())) {
                continue; 
            }

            // 1. Look up if an explicit placeholder allocation row already exists for this product in this bin
            Optional<InventoryItem> existingInventoryOpt = inventoryRepository
                    .findByProductIdAndStorageBinId(product.getId(), bin.getId());

            // Fixed Rule Lock: If no pre-assigned row exists, skip this bin entirely.
            if (existingInventoryOpt.isEmpty()) {
                continue;
            }

            InventoryItem existingItem = existingInventoryOpt.get();
            int currentBinQuantity = existingItem.getQuantity();

            int availableSpaceInBin = maxBinCapacity - currentBinQuantity;
            if (availableSpaceInBin <= 0) continue; 

            int quantityToPlaceInThisBin = Math.min(remainingToPlace, availableSpaceInBin);

            // 2. Perform clean data update operation on the matching row
            existingItem.setQuantity(currentBinQuantity + quantityToPlaceInThisBin);
            inventoryRepository.save(existingItem);

            remainingToPlace -= quantityToPlaceInThisBin;
        }
        return remainingToPlace;
    }
}