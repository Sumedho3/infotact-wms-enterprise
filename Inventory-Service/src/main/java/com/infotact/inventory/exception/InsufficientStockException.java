package com.infotact.inventory.exception;

/**
 * Custom exception thrown when an outbound order's requested volume
 * exceeds the physical quantity remaining in our database inventory storage.
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}