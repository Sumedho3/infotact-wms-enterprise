package com.infotact.inventory.service;

import com.infotact.inventory.dto.InventoryResponseDTO;
import com.infotact.inventory.dto.ReceivingRequestDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.InventoryRepository;
import com.infotact.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ReceivingServiceImpl implements ReceivingService{

    private final ProductRepository productRepository;
    private final PutawayService putawayService;
    private final InventoryRepository inventoryRepository;

    // Constructor Injection
    public ReceivingServiceImpl(ProductRepository productRepository,
                            PutawayService putawayService,
                            InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.putawayService = putawayService;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Core Transactional Method to handle incoming shipments.
     */
    @Transactional
    public InventoryResponseDTO processIncomingShipment(ReceivingRequestDTO request) {

        // Step 1: Validate and Fetch the Product profile from the master catalog
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Receiving Error: Product ID " + request.getProductId() + " does not exist in master catalog."));

        // Step 2: Execute  algorithm to find a safe, available StorageBin
        StorageBin targetBin = putawayService.findAvailableBin(
                request.getWarehouseId(),
                request.getQuantity(),
                product
        );

        // Step 3: Check if this specific Product is already sitting inside this specific StorageBin
        // We use a custom finder query from our repository
        Optional<InventoryItem> existingInventoryOpt = inventoryRepository
                .findByProductIdAndStorageBinId(product.getId(), targetBin.getId());

        InventoryItem finalInventoryRecord;

        if (existingInventoryOpt.isPresent()) {
            // Scenario A: The product already exists in this bin. Update the existing count.
            InventoryItem existingItem = existingInventoryOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            existingItem.setQuantity(newQuantity);

            finalInventoryRecord = inventoryRepository.save(existingItem);
        } else {
            // Scenario B: This is a brand new product assignment for this bin. Create a new record.
            InventoryItem newItem = new InventoryItem();
            newItem.setProduct(product);
            newItem.setStorageBin(targetBin);
            newItem.setQuantity(request.getQuantity());

            finalInventoryRecord = inventoryRepository.save(newItem);
        }

        // Step 4: Map the saved entity details into a clean Response DTO to prevent infinite loop recursion crashes
        InventoryResponseDTO response = new InventoryResponseDTO();
        response.setId(finalInventoryRecord.getId());
        response.setQuantity(finalInventoryRecord.getQuantity());
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setBinCode(targetBin.getBinCode());

        return response;
    }
}