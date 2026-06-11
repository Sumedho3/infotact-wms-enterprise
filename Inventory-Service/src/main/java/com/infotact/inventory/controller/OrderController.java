package com.infotact.inventory.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.OrderCreateRequestDTO;
import com.infotact.inventory.dto.OrderStatusUpdateRequestDTO;
import com.infotact.inventory.dto.ProductDetailsResponseDTO;
import com.infotact.inventory.entity.Order;
import com.infotact.inventory.entity.OrderItem;
import com.infotact.inventory.exception.FulfillmentManifestException;
import com.infotact.inventory.service.OrderService;

@RestController
@RequestMapping("/api")
public class OrderController {
	
	private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

//    @PutMapping("/{orderId}/status")
//    public ResponseEntity<Map<String, Object>> updateStatus(
//            @PathVariable Long orderId,
//            @RequestBody OrderStatusUpdateRequestDTO request) {
//
//        // Delegate execution to your transactional service layer
//        orderService.processOrderFulfillment(orderId, request.getStatus(), request.getItems());
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("orderId", orderId.toString());
//        response.put("status", request.getStatus());
//        response.put("message", "Order state successfully updated and inventory structural allocations decremented.");
//
//        return ResponseEntity.ok(response);
//    }
    
    
    
    /**
     * 🎯 4. COMPOSITE MANIFEST ORDER FULFILLMENT GATEWAY (POST /api/orders/{id}/fulfill)
     * Processes sequential stock deductions across all line items under a single order ID.
     * If individual products hit shortages, returns a comprehensive error manifest map.
     */
    @PostMapping("/orders/{id}/fulfill")
    public ResponseEntity<?> executeOrderFulfillment(@PathVariable Long id) {
        try {
            orderService.processOrderFulfillment(id);
            return ResponseEntity.ok(Map.of(
                "message", "Order #" + id + " compiled successfully! Stock items deducted from allocations."
            ));
        } catch (FulfillmentManifestException e) {
            // 🚨 PARTIAL OR ALL-OR-NOTHING BOTTLENECK INTERCEPTOR:
            // Packs the explicit product-by-product breakdown map directly into the HTTP response body
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of(
                        "error", e.getMessage(),
                        "details", e.getErrorManifest() // Pass the full map to the UI alert framework
                    ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected system error occurred during fulfillment processing."));
        }
    }
    
    /**
     * 🎯 1. CATALOG VERIFICATION HOOK (GET /api/products/{id})
     * Invoked automatically as soon as an operator types a Product ID into the UI console.
     * Returns product metadata along with a live dynamic total available stock count.
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<?> verifyAndFetchProductDetails(@PathVariable Long id) {
        try {
            ProductDetailsResponseDTO details = orderService.getProductCatalogDetails(id);
            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            // Returns clean error text if the product doesn't exist in the database catalog
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    

    /**
     * 🎯 2. MULTI-PRODUCT ORDER STAGING GATE (POST /api/orders)
     * Accepts a JSON array payload representing the staged list items from the UI cart.
     * Generates exactly ONE parent order entry cascading all items down safely.
     */
    @PostMapping("/orders")
    public ResponseEntity<?> createStagedOrder(@RequestBody List<OrderCreateRequestDTO> request) {
        try {
            Order finalizedOrder = orderService.createStagedOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(finalizedOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    
   

    /**
     * 🎯 3. ACTIVE LOGISTICS DESK SYNCHRONIZER (GET /api/orders/pending)
     * Fetches all parent orders currently sitting in the queue marked as PENDING.
     * Automatically includes nested child array objects via Jackson mapping.
     */
    @GetMapping("/orders/pending")
    public ResponseEntity<List<Order>> fetchActivePendingQueue() {
        List<Order> pendingList = orderService.getPendingOrders();
        return ResponseEntity.ok(pendingList);
    }
    
    
    
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelStagedOrder(@PathVariable Long id) {
        try {
            orderService.cancelPendingOrder(id);
            return ResponseEntity.ok(Map.of(
                "message", "Order #" + id + " has been successfully cancelled and removed from the active queue."
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected system error occurred during the cancellation routine."));
        }
    }

}
