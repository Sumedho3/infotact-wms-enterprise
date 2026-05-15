package com.infotact.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infotact.inventory.entity.InventoryItem;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>{

}
