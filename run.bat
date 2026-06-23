@echo off
chcp 65001 >nul
title Khoi dong he thong Lab 2 Saga E-Commerce Microservices
color 0A

echo =====================================================================
echo   [HE THONG TU DONG KHOI DONG LAB 2 SAGA E-COMMERCE]
echo =====================================================================
echo.

echo [1/6] Don dep cac tien trinh cu (Java, Node)...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo Da don dep xong tat ca cac tien trinh dang chay ngam!
echo.

echo [2/6] Khoi dong Docker Containers (Postgres, Redis, MongoDB, Kafka, Zookeeper)...
docker-compose up -d postgres redis mongodb zookeeper kafka
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker-compose up that bai! Vui long bat Docker Desktop va chay lai.
    pause
    exit /b %ERRORLEVEL%
)
echo Docker Containers dang hoat dong tot!
echo.

echo [3/6] Khoi dong Eureka Discovery Server (Port 8761)...
start "Eureka Server [8761]" cmd /c "cd eureka-server && mvnw spring-boot:run"
echo Vui long cho Eureka khoi dong hoan toan trong 15 giay...
timeout /t 15 /nobreak
echo.

echo [4/6] Khoi dong API Gateway (Port 8900)...
start "API Gateway [8900]" cmd /c "cd api-gateway && mvnw spring-boot:run"
echo Cho API Gateway dang ky thong tin vao Discovery trong 8 giay...
timeout /t 8 /nobreak
echo.

echo [5/6] Khoi dong 9 Microservices nghiep vu...
echo Khoi dong Product Catalog Service (Cong 8810)...
start "Product Catalog Service [8810]" cmd /c "cd product-catalog-service && mvnw spring-boot:run"

echo Khoi dong User Service (Cong 8811)...
start "User Service [8811]" cmd /c "cd user-service && mvnw spring-boot:run"

echo Khoi dong Product Recommendation Service (Cong 8812)...
start "Product Recommendation Service [8812]" cmd /c "cd product-recommendation-service && mvnw spring-boot:run"

echo Khoi dong Order Service (Cong 8813)...
start "Order Service [8813]" cmd /c "cd order-service && mvnw spring-boot:run"

echo Khoi dong Payment Service (Cong 8814)...
start "Payment Service [8814]" cmd /c "cd payment-service && mvnw spring-boot:run"

echo Khoi dong Notification Service (Cong 8815)...
start "Notification Service [8815]" cmd /c "cd notification-service && mvnw spring-boot:run"

echo Khoi dong Inventory Service (Cong 8816)...
start "Inventory Service [8816]" cmd /c "cd inventory-service && mvnw spring-boot:run"

echo Khoi dong Delivery Service (Cong 8817)...
start "Delivery Service [8817]" cmd /c "cd delivery-service && mvnw spring-boot:run"

echo Khoi dong Revenue Service (Cong 8818)...
start "Revenue Service [8818]" cmd /c "cd revenue-service && mvnw spring-boot:run"

echo.
echo [6/6] Khoi dong Frontend (React)...
start "Frontend React" cmd /c "cd frontend && npm run dev"

echo.
echo =====================================================================
echo   [KHOI DONG THANH CONG!]
echo   - Eureka Dashboard: http://localhost:8761
echo   - API Gateway: http://localhost:8900
echo   - Frontend: http://localhost:5173
echo =====================================================================
echo.
pause
