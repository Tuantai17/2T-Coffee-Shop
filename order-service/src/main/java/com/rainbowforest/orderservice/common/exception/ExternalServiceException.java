package com.rainbowforest.orderservice.common.exception;

public class ExternalServiceException extends RuntimeException {
    private String errorCode;

    public ExternalServiceException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }

    public ExternalServiceException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
