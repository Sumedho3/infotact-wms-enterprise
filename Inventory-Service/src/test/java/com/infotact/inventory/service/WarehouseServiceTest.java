package com.infotact.inventory.service;

import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private WarehouseServiceImpl warehouseService;

    private Warehouse sampleWarehouse;
    private WarehouseRequestDTO sampleDTO;

    @BeforeEach
    void setUp() {

        sampleWarehouse = new Warehouse();
        sampleWarehouse.setId(1L);
        sampleWarehouse.setName("Central Hub Hyderabad");
        sampleWarehouse.setLocation("Hyderabad Road");

        sampleDTO = new WarehouseRequestDTO();
        sampleDTO.setName("Central Hub Hyderabad");
        sampleDTO.setLocation("Hyderabad Road");
    }

    @Test
    @DisplayName("Service Layer: getAllWarehouses() - Should return list of all warehouses")
    void shouldReturnAllWarehouses() {

        when(warehouseRepository.findAll())
                .thenReturn(Arrays.asList(sampleWarehouse));

        List<Warehouse> result = warehouseService.getAllWarehouses();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Central Hub Hyderabad", result.get(0).getName());

        verify(warehouseRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Service Layer: createWarehouse() - Should save warehouse successfully")
    void shouldCreateAndSaveWarehouse() {

        when(warehouseRepository.save(any(Warehouse.class)))
                .thenReturn(sampleWarehouse);

        Warehouse savedResult =
                warehouseService.createWarehouse(sampleDTO);

        assertNotNull(savedResult);
        assertEquals(1L, savedResult.getId());
        assertEquals(sampleDTO.getName(), savedResult.getName());
        assertEquals(sampleDTO.getLocation(), savedResult.getLocation());

        verify(warehouseRepository, times(1))
                .save(any(Warehouse.class));
    }
}