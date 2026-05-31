package com.infotact.inventory.dto;

import java.util.List;

import com.infotact.inventory.constants.OrderStatus;

public class OrderStatusUpdateRequestDTO {
	private OrderStatus status; // Changed from String to OrderStatus enum
    private List<OrderItemDTO> items;

    public OrderStatusUpdateRequestDTO() {}

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
}
