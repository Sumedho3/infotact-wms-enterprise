package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.dto.ProductRequestDTO;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.repository.ProductRepository;
import com.infotact.inventory.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

	private final ProductRepository repository;
	private final ProductService service;

    public ProductController(ProductRepository repository, ProductService service) {
		super();
		this.repository = repository;
		this.service = service;
	}

	@PostMapping
    public ResponseEntity<Product> create(@RequestBody ProductRequestDTO requestdto) 
	{ 
		Product savedProduct = service.createProduct(requestdto);
	    return ResponseEntity.ok(savedProduct);
	}

    @GetMapping
    public List<Product> getAll() { return service.getAllProducts(); }
}
