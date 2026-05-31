package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.dto.OrderItemDTO;

public interface OrderService {

	public void processOrderFulfillment(Long orderId, OrderStatus status, List<OrderItemDTO> items);
}
