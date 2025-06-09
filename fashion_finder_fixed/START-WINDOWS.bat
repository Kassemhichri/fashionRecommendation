@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo FashionFinder - Windows Application Launcher
echo =======================================================
echo.

rem Set environment variable for development
set NODE_ENV=development

rem Check if the temporary server file location exists
set TEMP_SERVER_FILE=server\temp-windows-index.ts

rem Make directory if it doesn't exist
if not exist "server" (
    echo Error: Server directory not found!
    echo Please run INSTALL-WINDOWS.bat first.
    pause
    exit /b 1
)

echo Creating Windows-compatible server configuration...

rem Make a copy of the original server index file
copy server\index.ts %TEMP_SERVER_FILE% > nul

rem Modify the host configuration in the temporary file for Windows compatibility
powershell -Command "(Get-Content %TEMP_SERVER_FILE%) -replace 'host: \"0.0.0.0\"', 'host: \"localhost\"' -replace 'reusePort: true', '' | Set-Content %TEMP_SERVER_FILE%"

if %errorlevel% neq 0 (
    echo Error: Failed to modify server configuration for Windows.
    pause
    exit /b 1
)

echo Starting the FashionFinder application...
echo.
echo The application will be available at: http://localhost:5000
echo.
echo IMPORTANT: 
echo - Press Ctrl+C to stop the application when you're done
echo - Product images should be placed in attached_assets\images folder
echo - Images must be named with the product ID (e.g., 15970.jpg)
echo.

rem Start the application with the modified server file
npx tsx %TEMP_SERVER_FILE%

rem Clean up temporary file when the application stops
del %TEMP_SERVER_FILE%

echo.
echo FashionFinder has been shut down.
pause