package com.infotact.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infotact.inventory.dto.WarehouseRequestDTO;
import com.infotact.inventory.entity.Warehouse;
import com.infotact.inventory.repository.WarehouseRepository;
import com.infotact.inventory.service.WarehouseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WarehouseController.class)
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WarehouseService warehouseService;

    @MockBean
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Warehouse sampleWarehouse;
    private WarehouseRequestDTO sampleRequest;

    @BeforeEach
    void setUp() {

        sampleWarehouse = new Warehouse();
        sampleWarehouse.setId(1L);
        sampleWarehouse.setName("Central Hub Hyderabad");
        sampleWarehouse.setLocation("Hyderabad Road");

        sampleRequest = new WarehouseRequestDTO();
        sampleRequest.setName("Central Hub Hyderabad");
        sampleRequest.setLocation("Hyderabad Road");
    }

    @Test
    @DisplayName("GET /api/warehouses - Should return all warehouses")
    void shouldFetchAllWarehouses() throws Exception {

        when(warehouseRepository.findAll())
                .thenReturn(Arrays.asList(sampleWarehouse));

        mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Central Hub Hyderabad"))
                .andExpect(jsonPath("$[0].location").value("Hyderabad Road"));
    }

    @Test
    @DisplayName("POST /api/warehouses - Should create warehouse")
    void shouldCreateWarehouse() throws Exception {

        when(warehouseService.createWarehouse(any(WarehouseRequestDTO.class)))
                .thenReturn(sampleWarehouse);

        mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Central Hub Hyderabad"))
                .andExpect(jsonPath("$.location").value("Hyderabad Road"));
    }
}