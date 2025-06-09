@echo off
echo FashionFinder - Starting Application
echo =======================================
echo.

rem Set environment variables for development
set NODE_ENV=development

rem Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

rem Check if required directories exist
if not exist "attached_assets" (
    echo Creating attached_assets directory...
    mkdir "attached_assets"
)

if not exist "attached_assets\images" (
    echo Creating attached_assets\images directory...
    mkdir "attached_assets\images"
)

rem Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
)

rem Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in your PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

rem Install Python dependencies
echo Installing Python dependencies...
pip install flask flask-cors flask-session pandas scikit-learn

echo.
echo Starting FashionFinder application...
echo.
echo This will start both the Express server and Flask server
echo The application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

rem Run the server using npx tsx
npx tsx server/index.ts

pause