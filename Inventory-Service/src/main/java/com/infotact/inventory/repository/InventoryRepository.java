package com.infotact.inventory.repository;

import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByProductIdAndStorageBinId(Long productId, Long storageBinId);
    List<InventoryItem> findByProductId(Long productId);
    Optional<InventoryItem> findTopByProductIdOrderByIdDesc(long id);

}