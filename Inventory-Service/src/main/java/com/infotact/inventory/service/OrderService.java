package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.dto.OrderCreateRequestDTO;
import com.infotact.inventory.dto.OrderItemDTO;
import com.infotact.inventory.dto.ProductDetailsResponseDTO;
import com.infotact.inventory.entity.Order;
import com.infotact.inventory.entity.OrderItem;

public interface OrderService {

//	public void processOrderFulfillment(Long orderId, OrderStatus status, List<OrderItemDTO> items);
	public void processOrderFulfillment(Long orderId);
	ProductDetailsResponseDTO getProductCatalogDetails(Long productId);
	Order createStagedOrder(List<OrderCreateRequestDTO> request);
    List<Order> getPendingOrders();
    public void cancelPendingOrder(Long orderId);
}
