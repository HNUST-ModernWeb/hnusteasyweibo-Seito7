@echo off
echo ============================================
echo   ShareHub - Social Sharing Platform
echo ============================================
echo Starting server...
echo.
cd /d "%~dp0social-platform-api"
start /b java -jar target\sharehub-api-0.0.1-SNAPSHOT.jar
echo Waiting for server to start...
timeout /t 5 /nobreak >nul
echo Opening browser...
start http://localhost:8080
echo.
echo Server is running at http://localhost:8080
echo Close this window to stop the server.
pause >nul