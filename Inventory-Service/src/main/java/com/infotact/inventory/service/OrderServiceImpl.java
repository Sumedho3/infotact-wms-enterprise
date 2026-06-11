package com.infotact.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.dto.OrderCreateRequestDTO;
import com.infotact.inventory.dto.OrderItemDTO;
import com.infotact.inventory.dto.ProductDetailsResponseDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.entity.OrderItem;
import com.infotact.inventory.entity.Order;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.exception.InsufficientStockException;
import com.infotact.inventory.repository.InventoryRepository;
import com.infotact.inventory.repository.OrderRepository;
import com.infotact.inventory.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{
	
	private final ProductRepository productRepository;
	private final InventoryRepository inventoryRepository;
	private final OrderRepository orderRepository;

    
//	@Override
//	@Transactional
//	public void processOrderFulfillment(Long orderId, OrderStatus status, List<OrderItemDTO> items) {
//			
//		// Only trigger inventory reductions when the order moves to the "PACKED" state
//        if (OrderStatus.PACKED.equals(status)) {
//            
//            for (OrderItemDTO item : items) {
//                
//                // 1. Fetch the physical inventory row for the given product
//                List<InventoryItem> inventory = inventoryRepository.findByProductId(item.getProductId());
//                
//                if (inventory.isEmpty()) {
//                    throw new InsufficientStockException("Product ID " + item.getProductId() + " has no inventory footprint.");
//                }
//                
//                int totalAvailableStock = inventory.stream().mapToInt(InventoryItem::getQuantity).sum();
//
//                // 2. Enforce Business Constraint: Check if enough stock exists on the shelf
//                if (totalAvailableStock < item.getOrderedQuantity()) {
//                    throw new InsufficientStockException(
//                        String.format("Fulfillment Failure: Insufficient stock for Product ID %d. Requested: %d, Available: %d",
//                        item.getProductId(), item.getOrderedQuantity(), totalAvailableStock)
//                    );
//                }
//
//             // 3. Deduct stock from bins sequentially
//                int remainingToDeduct = item.getOrderedQuantity();
//                for (InventoryItem inv : inventory) {
//                    if (remainingToDeduct <= 0) break;
//
//                    int currentBinQty = inv.getQuantity();
//                    if (currentBinQty >= remainingToDeduct) {
//                        inv.setQuantity(currentBinQty - remainingToDeduct);
//                        remainingToDeduct = 0;
//                    } else {
//                        remainingToDeduct -= currentBinQty;
//                        inv.setQuantity(0);
//                    }
//                    inventoryRepository.save(inv);
//                }
//            }
//        }
//		
//	}
	
	
	@Override
	@Transactional
	public void processOrderFulfillment(Long orderId) {
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() -> new IllegalArgumentException("Fulfillment Failure: Order ID #" + orderId + " does not exist."));

	    if (!OrderStatus.PENDING.equals(order.getStatus())) {
	        throw new IllegalStateException("Fulfillment Failure: Order ID #" + orderId + " has already been finalized.");
	    }

	    // This map will track items that failed, but won't stop successful items from packing!
	    java.util.Map<String, String> partialFailureManifest = new java.util.HashMap<>();
	    boolean atLeastOneItemPacked = false;

	    // Single Pass: Validate and deduct item by item dynamically
	    for (OrderItem item : order.getItems()) {
	        Product product = productRepository.findById(item.getProductId()).orElse(null);
	        String skuCode = (product != null) ? product.getSku() : "Product ID #" + item.getProductId();

	        if (product == null) {
	            partialFailureManifest.put(skuCode, "Catalog Error: Skipped. Product missing from master catalog.");
	            continue; 
	        }

	        List<InventoryItem> inventory = inventoryRepository.findByProductId(item.getProductId());
	        if (inventory.isEmpty()) {
	            partialFailureManifest.put(skuCode, "Stock Error: Discarded. Zero inventory footprint rows in DB.");
	            continue;
	        }

	        // Calculate combined available stock volume across all operational storage bins
	        int totalAvailableStock = inventory.stream()
	                .mapToInt(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
	                .sum();

	        // 🚨 PARTIAL CONDITION CHECK: If stock is insufficient, skip it but DON'T kill the transaction!
	        if (totalAvailableStock < item.getQuantity()) {
	            partialFailureManifest.put(skuCode, String.format(
	                "Insufficient Stock: Requested %d, only %d available. This line item was discarded.",
	                item.getQuantity(), totalAvailableStock
	            ));
	            continue; // Skip directly to the next product loop item!
	        }

	        // EXECUTE DEDUCTION: If it passes, deduct stock from valid bins sequentially immediately
	        int remainingToDeduct = item.getQuantity();
	        for (InventoryItem inv : inventory) {
	            if (remainingToDeduct <= 0) break;

	            int currentBinQty = inv.getQuantity() != null ? inv.getQuantity() : 0;
	            if (currentBinQty <= 0) continue;

	            if (currentBinQty >= remainingToDeduct) {
	                inv.setQuantity(currentBinQty - remainingToDeduct);
	                remainingToDeduct = 0;
	            } else {
	                remainingToDeduct -= currentBinQty;
	                inv.setQuantity(0);
	            }
	            inventoryRepository.save(inv);
	        }
	        
	        atLeastOneItemPacked = true; // Flag that something was successfully allocated
	    }

	    // Final Order Status Resolution
	    if (!partialFailureManifest.isEmpty()) {
	        // If some items packed but others failed, mark order status based on your preference.
	        // We can mark it as PACKED (since we shipped what we could) or FAILED if nothing matched.
	        order.setStatus(atLeastOneItemPacked ? OrderStatus.PACKED : OrderStatus.FAILED);
	        orderRepository.save(order);
	        
	        // Throw the exception carrying the map so the UI Alert box pop-up can show the operator exactly what was left out
	        throw new com.infotact.inventory.exception.FulfillmentManifestException(
	            "Partial Fulfillment Complete: Some items were discarded due to stock deficiencies.", partialFailureManifest
	        );
	    }

	    // 3. Perfect clean run: All items packed flawlessly
	    order.setStatus(OrderStatus.PACKED);
	    orderRepository.save(order);
	}

	@Override
	@Transactional(readOnly = true)
	public ProductDetailsResponseDTO getProductCatalogDetails(Long productId) {
		
		Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Catalog Error: Product ID #" + productId + " does not exist."));

        // 2. Fetch or compute live SUM(quantity) across allocations dynamically from the inventory items table
        // (If your repository doesn't have a sum query method, map it over a custom JPQL query or stream calculation)
        int calculatedTotalStock = inventoryRepository.findByProductId(productId)
										              .stream()
										              .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
										              .sum();

        return new ProductDetailsResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                calculatedTotalStock
        );
	}
	

	@Override
	@Transactional
	public Order createStagedOrder(List<OrderCreateRequestDTO> requestList) {
	    if (requestList == null || requestList.isEmpty()) {
	        throw new IllegalArgumentException("Validation Error: Staged order request manifest cannot be empty.");
	    }

	    // 1. Initialize a single universal parent order tracking context container
	    Order parentOrder = new Order();
	    parentOrder.setStatus(OrderStatus.PENDING); // Set initial state flag

	    // 2. Loop through the incoming payload array items to mount children elements
	    for (OrderCreateRequestDTO itemDto : requestList) {
	        if (itemDto.getQuantity() <= 0) {
	            throw new IllegalArgumentException("Validation Error: Ordered quantity must be greater than zero.");
	        }

	        Product product = productRepository.findById(itemDto.getProductId())
	                .orElseThrow(() -> new IllegalArgumentException("Order Error: Product ID #" + itemDto.getProductId() + " does not exist in definitions."));

	        // Instantiate a child database row line tracking point
	        OrderItem childItem = new OrderItem();
	        childItem.setProductId(product.getId());
	        childItem.setProductName(product.getName());
	        childItem.setQuantity(itemDto.getQuantity());

	        // Bidirectional synchronization utility we added to parent Order.java model
	        // This sets childItem.setOrder(parentOrder) internally!
	        parentOrder.addRequiredItem(childItem);
	    }

	    // 3. Save the single Parent record. 
	    // CascadeType.ALL will automatically generate rows inside order_items table in one transaction block!
	    return orderRepository.save(parentOrder);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Order> getPendingOrders() {
	    // Queries the parent orders table for active manifests
	    return orderRepository.findByStatusOrderByIdAsc(OrderStatus.PENDING);
	}
	
	
	@Override
	@Transactional
	public void cancelPendingOrder(Long orderId) {
	    // 1. Fetch the targeted parent order manifest
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() -> new IllegalArgumentException("Cancellation Failure: Order ID #" + orderId + " does not exist."));

	    // 2. State Guard Clause: Only allow cancellation if the order hasn't been packed yet
	    if (OrderStatus.PACKED.equals(order.getStatus())) {
	        throw new IllegalStateException("Cancellation Failure: Cannot cancel an order that has already been packed and deducted.");
	    }

	    // 3. Update the state column to CANCELLED
	    order.setStatus(OrderStatus.CANCELLED);
	    orderRepository.save(order);
	}

}
