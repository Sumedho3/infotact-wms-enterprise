package com.infotact.inventory.controller;

import com.infotact.inventory.service.BarcodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/barcodes")
public class BarcodeController {

    private final BarcodeService barcodeService;

    public BarcodeController(BarcodeService barcodeService) {
        this.barcodeService = barcodeService;
    }

    @GetMapping("/generate")
    public ResponseEntity<Map<String, String>> getProductBarcode(
            @RequestParam("sku") String sku
    ) {

        String base64Image =
                barcodeService.generateProductBarcodeBase64(sku);

        Map<String, String> response = new HashMap<>();

        response.put("sku", sku);

        response.put(
                "barcodeBase64",
                "data:image/png;base64," + base64Image
        );

        return ResponseEntity.ok(response);
    }
}