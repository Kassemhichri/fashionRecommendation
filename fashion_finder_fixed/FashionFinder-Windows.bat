@echo off
echo FashionFinder - Complete Windows Setup
echo =====================================
echo.

rem Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

rem Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in your PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

rem Set environment variables for development
set NODE_ENV=development

rem Create necessary directories
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images

rem Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
)

rem Install Python dependencies
echo Installing Python dependencies...
pip install flask flask-cors flask-session pandas scikit-learn

rem Creating a temporary modified copy of the server file
echo Creating temporary server file with Windows compatibility fixes...
set TEMP_SERVER_FILE=server\temp-index.ts

rem Make a copy of the original file
copy server\index.ts %TEMP_SERVER_FILE%

rem Replace the problematic host binding
echo Modifying server configuration for Windows compatibility...
powershell -Command "(Get-Content %TEMP_SERVER_FILE%) -replace 'host: \"0.0.0.0\"', 'host: \"localhost\"' -replace 'reusePort: true', '' | Set-Content %TEMP_SERVER_FILE%"

echo.
echo ========================================================
echo FashionFinder is now starting with Windows compatibility
echo ========================================================
echo.
echo 1. The application will be available at: http://localhost:5000
echo 2. To add product images, place them in the attached_assets\images folder
echo 3. Images should be named with the product ID (e.g., 15970.jpg)
echo.
echo Press Ctrl+C to stop the servers when you're done
echo.

rem Run the temporary server file
npx tsx %TEMP_SERVER_FILE%

rem Clean up temporary file on exit
del %TEMP_SERVER_FILE%

pause