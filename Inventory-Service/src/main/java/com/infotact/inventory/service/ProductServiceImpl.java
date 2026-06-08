package com.infotact.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infotact.inventory.dto.ProductRequestDTO;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService{

	private final ProductRepository repository;
	
	public ProductServiceImpl(ProductRepository repository) {
		super();
		this.repository = repository;
	}

	@Override
	public Product createProduct(ProductRequestDTO dto) {
		
		Product product = new Product();
	    product.setSku(dto.getSku());
	    product.setName(dto.getName());
	    product.setDescription(dto.getDescription());
	    product.setCategory(dto.getCategory().toUpperCase());
	    return repository.save(product);
	    
	}

	@Override
	public List<Product> getAllProducts() {
		
		return repository.findAll();
	}

}
