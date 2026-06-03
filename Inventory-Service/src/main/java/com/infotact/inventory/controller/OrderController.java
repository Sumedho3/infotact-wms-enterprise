package com.infotact.inventory.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.OrderStatusUpdateRequestDTO;
import com.infotact.inventory.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
	
	private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable("orderId") Long orderId,
            @RequestBody OrderStatusUpdateRequestDTO request) {

        // Delegate execution to your transactional service layer
        orderService.processOrderFulfillment(orderId, request.getStatus(), request.getItems());

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId.toString());
        response.put("status", request.getStatus());
        response.put("message", "Order state successfully updated and inventory structural allocations decremented.");

        return ResponseEntity.ok(response);
    }

}
