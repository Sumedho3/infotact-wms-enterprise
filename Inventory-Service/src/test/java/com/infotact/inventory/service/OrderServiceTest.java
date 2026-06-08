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

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
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

        assertEquals(0, binOne.getQuantity());
        assertEquals(5, binTwo.getQuantity());

        verify(inventoryRepository, times(1)).save(binOne);
        verify(inventoryRepository, times(1)).save(binTwo);

        System.out.println("Verified Day 6: Order processing succeeded. Sequential bins updated cleanly.");
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

        System.out.println("Verified Day 6: Non-PACKED orders cleanly ignored by the security guard statement.");
    }
}