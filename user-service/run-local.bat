@echo off
chcp 65001 >nul
setlocal

if exist "%~dp0mail.local.env.bat" (
    echo [user-service] Nap cau hinh mail local...
    call "%~dp0mail.local.env.bat"
)

if "%MAIL_HOST%"=="" set "MAIL_HOST=smtp.gmail.com"
if "%MAIL_PORT%"=="" set "MAIL_PORT=587"
if "%MAIL_SMTP_AUTH%"=="" set "MAIL_SMTP_AUTH=true"
if "%MAIL_SMTP_STARTTLS%"=="" set "MAIL_SMTP_STARTTLS=true"

echo [user-service] Kiem tra cong 8811...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8811" ^| findstr "LISTENING"') do (
    echo [user-service] Dung tien trinh dang chiem cong 8811: PID %%p
    taskkill /PID %%p /F >nul 2>&1
)

echo [user-service] Dung cac tien trinh Maven cu cua user-service neu con ton tai...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'java.exe' -and $_.CommandLine -match 'user-service' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

timeout /t 2 /nobreak >nul

echo [user-service] Mail sender: %MAIL_USERNAME%
echo [user-service] Khoi dong lai service...
call .\mvnw spring-boot:run
