package com.infotact.inventory.service;

import com.infotact.inventory.constants.OrderStatus;
import com.infotact.inventory.dto.OrderItemDTO;
import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.exception.InsufficientStockException;
import com.infotact.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private InventoryItem binOne;
    private InventoryItem binTwo;

    @BeforeEach
    void setUp() {
        binOne = new InventoryItem();
        binOne.setId(101L);
        binOne.setQuantity(15);

        binTwo = new InventoryItem();
        binTwo.setId(102L);
        binTwo.setQuantity(10);
    }

    @Test
    @DisplayName("Order Service: processOrderFulfillment() - Success Sequential Deduction Blueprint")
    void shouldDeductStockSequentiallyAcrossBinsWhenOrderIsPacked() {

        Long testOrderId = 55L;

        OrderItemDTO itemRequest = new OrderItemDTO(1001L, 20);
        List<OrderItemDTO> orderItemsList = Arrays.asList(itemRequest);

        when(inventoryRepository.findByProductId(1001L))
                .thenReturn(Arrays.asList(binOne, binTwo));

        assertDoesNotThrow(() -> {
            orderService.processOrderFulfillment(
                    testOrderId,
                    OrderStatus.PACKED,
                    orderItemsList
            );
        });

        verify(inventoryRepository, times(1)).save(binOne);
        verify(inventoryRepository, times(1)).save(binTwo);

        System.out.println("Verified Day 6: Order processing succeeded.");
    }

    @Test
    @DisplayName("Order Service: processOrderFulfillment() - Ignored Execution Blueprint when Status is not PACKED")
    void shouldIgnoreStockDeductionWhenStatusIsNotPacked() {

        Long testOrderId = 55L;

        OrderItemDTO itemRequest = new OrderItemDTO(1001L, 5);
        List<OrderItemDTO> orderItemsList = Arrays.asList(itemRequest);

        orderService.processOrderFulfillment(
                testOrderId,
                OrderStatus.PROCESSING,
                orderItemsList
        );

        verify(inventoryRepository, never()).findByProductId(anyLong());
        verify(inventoryRepository, never()).save(any(InventoryItem.class));

        System.out.println("Verified Day 6: Non-PACKED orders ignored.");
    }

    @Test
    @DisplayName("Order Service: processOrderFulfillment() - Throws InsufficientStockException on Quantity Shortage")
    void shouldThrowInsufficientStockExceptionWhenRequestedQuantityExceedsTotalStock() {

        Long testOrderId = 99L;

        OrderItemDTO excessiveRequest = new OrderItemDTO(1001L, 30);
        List<OrderItemDTO> orderItemsList = Arrays.asList(excessiveRequest);

        when(inventoryRepository.findByProductId(1001L))
                .thenReturn(Arrays.asList(binOne, binTwo));

        assertThrows(InsufficientStockException.class, () -> {
            orderService.processOrderFulfillment(
                    testOrderId,
                    OrderStatus.PACKED,
                    orderItemsList
            );
        });

        verify(inventoryRepository, never()).save(any(InventoryItem.class));

        System.out.println("Verified Day 7 Case A: Exception thrown correctly.");
    }

    @Test
    @DisplayName("Order Service: processOrderFulfillment() - Throws InsufficientStockException on Missing Product Footprint")
    void shouldThrowInsufficientStockExceptionWhenProductHasNoInventoryFootprint() {

        Long testOrderId = 100L;

        OrderItemDTO missingProductRequest = new OrderItemDTO(9999L, 5);
        List<OrderItemDTO> orderItemsList = Arrays.asList(missingProductRequest);

        when(inventoryRepository.findByProductId(9999L))
                .thenReturn(new ArrayList<>());

        assertThrows(InsufficientStockException.class, () -> {
            orderService.processOrderFulfillment(
                    testOrderId,
                    OrderStatus.PACKED,
                    orderItemsList
            );
        });

        verify(inventoryRepository, never()).save(any(InventoryItem.class));

        System.out.println("Verified Day 7 Case B: Empty inventory footprint exception caught successfully.");
    }
}