package com.infotact.inventory.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class BarcodeServiceTest {

    private BarcodeService barcodeService;

    @BeforeEach
    void setUp() {
        barcodeService = new BarcodeServiceImpl();
    }

    @Test
    @DisplayName("Barcode Service: generateProductBarcodeBase64() - Should return valid Base64 encoded PNG string")
    void shouldGenerateValidBase64BarcodeString() {

        String sampleSku = "PROD-SKU-2026";

        String base64Result = barcodeService.generateProductBarcodeBase64(sampleSku);

        assertNotNull(base64Result, "The returned barcode string must not be null");
        assertFalse(base64Result.trim().isEmpty(), "The returned barcode string must not be empty");

        assertDoesNotThrow(() -> {
            byte[] decodedBytes = Base64.getDecoder().decode(base64Result);
            assertTrue(decodedBytes.length > 0,
                    "Decoded binary image array must contain valid byte values");
        });
    }

    @Test
    @DisplayName("Barcode Service: generateProductBarcodeBase64() - Should throw RuntimeException when input parameters are invalid")
    void shouldThrowRuntimeExceptionOnNullInput() {

        String invalidSku = null;

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            barcodeService.generateProductBarcodeBase64(invalidSku);
        });

        assertTrue(exception.getMessage()
                .contains("System Error: Failed to generate barcode for SKU:"));
    }
}