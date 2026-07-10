@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo Building all Microservices...
echo ==================================================

set "services=eureka-server api-gateway user-service product-catalog-service order-service inventory-service payment-service delivery-service loyalty-service mini-game-service notification-service revenue-service product-recommendation-service"

for %%s in (%services%) do (
    echo.
    echo --------------------------------------------------
    echo Building %%s...
    echo --------------------------------------------------
    cd %%s
    call mvnw clean package -DskipTests
    if errorlevel 1 (
        echo [ERROR] Failed to build %%s
        exit /b 1
    )
    cd ..
)

echo.
echo ==================================================
echo All Microservices built successfully!
echo ==================================================
