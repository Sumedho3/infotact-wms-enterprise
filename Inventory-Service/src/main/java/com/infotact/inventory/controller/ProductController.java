package com.infotact.inventory.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infotact.inventory.entity.Product;
import com.infotact.inventory.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {

	private final ProductRepository repository;

    public ProductController(ProductRepository repository) { this.repository = repository; }

    @PostMapping
    public Product create(@RequestBody Product product) { return repository.save(product); }

    @GetMapping
    public List<Product> getAll() { return repository.findAll(); }
}
