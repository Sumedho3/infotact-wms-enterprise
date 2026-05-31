package com.infotact.inventory.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infotact.inventory.entity.InventoryItem;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>{
	Optional<InventoryItem> findByProductId(Long productId);
}
