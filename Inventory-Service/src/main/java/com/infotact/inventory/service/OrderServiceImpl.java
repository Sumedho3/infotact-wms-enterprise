package com.infotact.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.dto.OrderItemDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.exception.InsufficientStockException;
import com.infotact.inventory.repository.InventoryRepository;

@Service
public class OrderServiceImpl implements OrderService{
	
	private final InventoryRepository inventoryRepository;

    public OrderServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    
	@Override
	@Transactional
	public void processOrderFulfillment(Long orderId, OrderStatus status, List<OrderItemDTO> items) {
			
		// Only trigger inventory reductions when the order moves to the "PACKED" state
        if (OrderStatus.PACKED.equals(status)) {
            
            for (OrderItemDTO item : items) {
                
                // 1. Fetch the physical inventory row for the given product
                List<InventoryItem> inventory = inventoryRepository.findByProductId(item.getProductId());
                
                if (inventory.isEmpty()) {
                    throw new InsufficientStockException("Product ID " + item.getProductId() + " has no inventory footprint.");
                }
                
                int totalAvailableStock = inventory.stream().mapToInt(InventoryItem::getQuantity).sum();

                // 2. Enforce Business Constraint: Check if enough stock exists on the shelf
                if (totalAvailableStock < item.getOrderedQuantity()) {
                    throw new InsufficientStockException(
                        String.format("Fulfillment Failure: Insufficient stock for Product ID %d. Requested: %d, Available: %d",
                        item.getProductId(), item.getOrderedQuantity(), totalAvailableStock)
                    );
                }

             // 3. Deduct stock from bins sequentially
                int remainingToDeduct = item.getOrderedQuantity();
                for (InventoryItem inv : inventory) {
                    if (remainingToDeduct <= 0) break;

                    int currentBinQty = inv.getQuantity();
                    if (currentBinQty >= remainingToDeduct) {
                        inv.setQuantity(currentBinQty - remainingToDeduct);
                        remainingToDeduct = 0;
                    } else {
                        remainingToDeduct -= currentBinQty;
                        inv.setQuantity(0);
                    }
                    inventoryRepository.save(inv);
                }
            }
        }
		
	}

}
