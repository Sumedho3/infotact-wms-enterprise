package com.infotact.inventory.service;

import com.infotact.inventory.dto.ProductRequestDTO;
import com.infotact.inventory.entity.Product;

public interface ProductService {
	public Product createProduct(ProductRequestDTO dto);
}
