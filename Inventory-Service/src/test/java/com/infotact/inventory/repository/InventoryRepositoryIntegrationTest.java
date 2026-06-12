package com.infotact.inventory.repository;

import com.infotact.inventory.entity.InventoryItem;
import com.infotact.inventory.repository.InventoryRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class InventoryRepositoryIntegrationTest {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Test
    public void testFindLowStockInBinPrefix_Success() {

        InventoryItem optimalItem = new InventoryItem();
        optimalItem.setSku("TEST-SKU-HIGH");
        optimalItem.setBin("BIN-A (Row 4)");
        optimalItem.setQty("50 Units");

        InventoryItem lowStockItem = new InventoryItem();
        lowStockItem.setSku("TEST-SKU-LOW");
        lowStockItem.setBin("BIN-A (Row 2)");
        lowStockItem.setQty("3 Units");

        InventoryItem differentBinItem = new InventoryItem();
        differentBinItem.setSku("TEST-SKU-DIFF");
        differentBinItem.setBin("BIN-B (Row 1)");
        differentBinItem.setQty("1 Unit");

        inventoryRepository.save(optimalItem);
        inventoryRepository.save(lowStockItem);
        inventoryRepository.save(differentBinItem);

        List<InventoryItem> alertResults =
                inventoryRepository.findLowStockInBinPrefix("BIN-A", 10);

        assertEquals(1, alertResults.size(),
                "Query result list should return exactly 1 item.");

        assertEquals("TEST-SKU-LOW", alertResults.get(0).getSku(),
                "Should isolate the low stock item specifically.");

        assertTrue(alertResults.get(0).getBin().contains("BIN-A"),
                "Should only catch items residing inside BIN-A layout zones.");
    }
}