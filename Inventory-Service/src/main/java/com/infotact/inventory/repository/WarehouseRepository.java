package com.infotact.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infotact.inventory.entity.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long>{

}
