package com.infotact.inventory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infotact.inventory.entity.StorageBin;

public interface StorageBinRepository extends JpaRepository<StorageBin, Long> {
	
	List<StorageBin> findByWarehouseId(long id);

}