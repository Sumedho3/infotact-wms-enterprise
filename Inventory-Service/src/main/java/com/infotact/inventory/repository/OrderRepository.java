package com.infotact.inventory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.entity.Order;
import com.infotact.inventory.entity.OrderItem;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{
	
	List<Order> findByStatusOrderByIdAsc(OrderStatus status);
}
