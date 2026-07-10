package com.rainbowforest.orderservice.common.exception;

public class ValidationException extends RuntimeException {
    private String errorCode;

    public ValidationException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }

    public ValidationException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
