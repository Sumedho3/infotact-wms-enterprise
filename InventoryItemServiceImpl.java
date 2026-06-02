package com.infotact.inventory.service;

import org.springframework.stereotype.Service;

import com.infotact.inventory.dto.InventoryRequestDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.entity.StorageBin;
import com.infotact.inventory.repository.InventoryItemRepository;
import com.infotact.inventory.repository.ProductRepository;
import com.infotact.inventory.repository.StorageBinRepository;

@Service
public class InventoryItemServiceImpl implements InventoryItemService{
	
	private final InventoryItemRepository inventoryItemRepository;
	private final ProductRepository productRepository;
	private final StorageBinRepository storageBinRepository;
	

	public InventoryItemServiceImpl(InventoryItemRepository inventoryItemRepository,
			ProductRepository productRepository, StorageBinRepository storageBinRepository) {
		super();
		this.inventoryItemRepository = inventoryItemRepository;
		this.productRepository = productRepository;
		this.storageBinRepository = storageBinRepository;
	}


	@Override
	public InventoryItem createInventory(InventoryRequestDTO dto) {
		
		InventoryItem item = new InventoryItem();
	    item.setQuantity(dto.getQuantity());
	    
	    Product product = productRepository.findById(dto.getProductId())
	    	.orElseThrow(() -> new RuntimeException("Product not found"));
	    
	    StorageBin bin = storageBinRepository.findById(dto.getStorageBinId())
	        .orElseThrow(() -> new RuntimeException("Storage Bin not found"));
	    
	    item.setProduct(product);
	    item.setStorageBin(bin);
	    
	    return inventoryItemRepository.save(item);
	}

}
