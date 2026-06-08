package com.infotact.inventory.service;

import java.util.List;

import com.infotact.inventory.dto.ProductRequestDTO;
import com.infotact.inventory.entity.Product;

public interface ProductService {
	public Product createProduct(ProductRequestDTO dto);
	public List<Product> getAllProducts();
}
