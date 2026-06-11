package com.infotact.inventory.exception;

public class StorageOverflowException extends RuntimeException {
    public StorageOverflowException(String message) {
        super(message);
    }
}