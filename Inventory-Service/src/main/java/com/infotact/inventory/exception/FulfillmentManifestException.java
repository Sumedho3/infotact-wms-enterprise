package com.infotact.inventory.exception;

import java.util.Map;

public class FulfillmentManifestException extends RuntimeException {
    // Key: Product SKU or Name, Value: Explicit Error Message Detail
    private final Map<String, String> errorManifest;

    public FulfillmentManifestException(String message, Map<String, String> errorManifest) {
        super(message);
        this.errorManifest = errorManifest;
    }

    public Map<String, String> getErrorManifest() {
        return errorManifest;
    }
}
