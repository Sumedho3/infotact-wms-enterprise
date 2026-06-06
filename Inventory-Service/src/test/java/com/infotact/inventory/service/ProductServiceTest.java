package com.infotact.inventory.service;

import com.infotact.inventory.dto.ProductRequestDTO;
import com.infotact.inventory.entity.Product;
import com.infotact.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product sampleProduct;
    private ProductRequestDTO sampleDTO;

    @BeforeEach
    void setUp() {

        sampleProduct = new Product();
        sampleProduct.setId(101L);
        sampleProduct.setSku("PROD-SKU-2026");
        sampleProduct.setName("Industrial Storage Rack");
        sampleProduct.setDescription("Heavy duty storage rack");
        sampleProduct.setCategory("ELECTRONICS");

        sampleDTO = new ProductRequestDTO();
        sampleDTO.setSku("PROD-SKU-2026");
        sampleDTO.setName("Industrial Storage Rack");
        sampleDTO.setDescription("Heavy duty storage rack");
        sampleDTO.setCategory("electronics");
    }

    @Test
    @DisplayName("Product Service: createProduct() - Should map DTO variables to entity and save")
    void shouldCreateAndSaveProduct() {

        when(productRepository.save(any(Product.class)))
                .thenReturn(sampleProduct);

        Product savedResult = productService.createProduct(sampleDTO);

        assertNotNull(savedResult);
        assertEquals(101L, savedResult.getId());
        assertEquals(sampleDTO.getSku(), savedResult.getSku());
        assertEquals(sampleDTO.getName(), savedResult.getName());

        verify(productRepository, times(1))
                .save(any(Product.class));
    }
}