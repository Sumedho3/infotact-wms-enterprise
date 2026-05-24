package com.infotact.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infotact.inventory.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}
