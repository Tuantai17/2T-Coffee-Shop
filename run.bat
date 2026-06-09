@echo off
title Khoi dong he thong MyKingdom Toy Store Microservices
color 0A

echo =====================================================================
echo   [HE THONG TU DONG KHOI DONG MYKINGDOM TOY STORE MICROSERVICES]
echo =====================================================================
echo.

echo [1/5] Don dep cac cong cua he thong...

rem Eureka Server 8761
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8761 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8761 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem API Gateway 8900
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8900 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8900 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem Product Catalog Service 8810
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8810 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8810 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem User Service 8811
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8811 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8811 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem Recommendation Service 8812
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8812 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8812 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem Order Service 8813
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8813 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8813 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem Payment Service 8814
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8814 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8814 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

rem Notification Service 8815
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8815 ^| findstr LISTENING') do (
    echo Dang tat tien trinh tren cong 8815 - PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo Hoan tat don dep cong!
echo.

echo [2/5] Khoi dong Docker Containers (Redis, Kafka, Zookeeper)...
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker-compose up that bai! Vui long bat Docker Desktop va chay lai.
    pause
    exit /b %ERRORLEVEL%
)
echo Docker Containers dang hoat dong tot!
echo.

echo [3/5] Khoi dong Eureka Discovery Server (Port 8761)...
start "Eureka Server [8761]" cmd /c "cd eureka-server && mvn spring-boot:run"
echo Vui long cho Eureka khoi dong hoan toan trong 12 giay...
timeout /t 12 /nobreak
echo.

echo [4/5] Khoi dong API Gateway (Port 8900)...
start "API Gateway [8900]" cmd /c "cd api-gateway && mvn spring-boot:run"
echo Cho API Gateway dang ky thong tin vao Discovery trong 6 giay...
timeout /t 6 /nobreak
echo.

echo [5/5] Khoi dong cac Microservices nghiep vu...
echo Khoi dong User Service (Cong 8811)...
start "User Service [8811]" cmd /c "cd user-service && mvn spring-boot:run"

echo Khoi dong Product Catalog Service (Cong 8810)...
start "Product Catalog Service [8810]" cmd /c "cd product-catalog-service && mvn spring-boot:run"

echo Khoi dong Order Service (Cong 8813)...
start "Order Service [8813]" cmd /c "cd order-service && mvn spring-boot:run"

echo Khoi dong Recommendation Service (Cong 8812)...
start "Recommendation Service [8812]" cmd /c "cd product-recommendation-service && mvn spring-boot:run"

echo Khoi dong Payment Service (Cong 8814)...
start "Payment Service [8814]" cmd /c "cd payment-service && mvn spring-boot:run"

echo Khoi dong Notification Service (Cong 8815)...
start "Notification Service [8815]" cmd /c "cd notification-service && mvn spring-boot:run"

echo.
echo =====================================================================
echo   [KHOI DONG THANH CONG!]
echo   - Eureka Dashboard: http://localhost:8761
echo   - MyKingdom Web App: http://localhost:5174
echo =====================================================================
echo.
pause
