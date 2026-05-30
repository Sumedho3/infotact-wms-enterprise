package com.infotact.inventory.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
public class BarcodeServiceImpl implements BarcodeService {

    @Override
    public String generateProductBarcodeBase64(String sku) {

        try {

            int width = 300;
            int height = 100;

            Code128Writer barcodeWriter =
                    new Code128Writer();

            BitMatrix bitMatrix =
                    barcodeWriter.encode(
                            sku,
                            BarcodeFormat.CODE_128,
                            width,
                            height
                    );

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            MatrixToImageWriter.writeToStream(
                    bitMatrix,
                    "PNG",
                    outputStream
            );

            byte[] imageBytes =
                    outputStream.toByteArray();

            return Base64.getEncoder()
                    .encodeToString(imageBytes);

        } catch (Exception e) {

            throw new RuntimeException(
                    "System Error: Failed to generate barcode for SKU: "
                            + sku,
                    e
            );
        }
    }
}