@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo FashionFinder - Windows Installation and Setup
echo =======================================================
echo.

rem Check administrative privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrative privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b
)

echo Checking system requirements...
echo.

rem Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo NODE.JS NOT FOUND
    echo.
    echo FashionFinder requires Node.js v16 or higher.
    echo Please download and install from: https://nodejs.org/
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo Node.js found: %NODE_VERSION%
)

rem Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo NPM NOT FOUND
    echo.
    echo FashionFinder requires npm (Node Package Manager).
    echo Please reinstall Node.js to include npm.
    pause
    exit /b
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo npm found: %NPM_VERSION%
)

rem Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo PYTHON NOT FOUND
    echo.
    echo FashionFinder requires Python 3.8 or higher.
    echo Please download and install from: https://www.python.org/
    echo.
    echo Ensure you check "Add Python to PATH" during installation.
    echo After installing Python, run this script again.
    pause
    exit /b
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo Python found: %PYTHON_VERSION%
)

rem Check if pip is installed
where pip >nul 2>&1
if %errorlevel% neq 0 (
    echo PIP NOT FOUND
    echo.
    echo FashionFinder requires pip (Python Package Installer).
    echo Please reinstall Python and ensure pip is included.
    pause
    exit /b
) else (
    for /f "tokens=*" %%i in ('pip --version') do set PIP_VERSION=%%i
    echo pip found: %PIP_VERSION%
)

echo.
echo All required software is installed.
echo.
echo =======================================================
echo Step 1: Creating Directory Structure
echo =======================================================
echo.

rem Create required directories
if not exist "attached_assets" (
    mkdir "attached_assets"
    echo Created: attached_assets
) else (
    echo Exists: attached_assets
)

if not exist "attached_assets\images" (
    mkdir "attached_assets\images"
    echo Created: attached_assets\images
) else (
    echo Exists: attached_assets\images
)

if not exist "source-images" (
    mkdir "source-images"
    echo Created: source-images
) else (
    echo Exists: source-images
)

echo.
echo =======================================================
echo Step 2: Installing Node.js Dependencies
echo =======================================================
echo.

echo Installing Node.js packages (this may take several minutes)...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies.
    echo Please check your internet connection and try again.
    pause
    exit /b
)
echo Node.js dependencies installed successfully.

echo.
echo =======================================================
echo Step 3: Installing Python Dependencies
echo =======================================================
echo.

echo Installing Python packages...
pip install flask flask-cors flask-session pandas scikit-learn
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    echo Please check your internet connection and try again.
    pause
    exit /b
)
echo Python dependencies installed successfully.

echo.
echo =======================================================
echo Step 4: Creating Windows Compatibility Files
echo =======================================================
echo.

rem Create a custom server file for Windows
echo Creating Windows-compatible server configuration...

rem Create the file for Windows server configuration settings
echo // Windows Configuration Settings > server\windows-config.js
echo module.exports = { > server\windows-config.js
echo   useLocalhost: true, >> server\windows-config.js
echo   skipReusePort: true >> server\windows-config.js
echo }; >> server\windows-config.js

echo Configuration files created successfully.

echo.
echo =======================================================
echo Installation Complete!
echo =======================================================
echo.
echo FashionFinder has been successfully set up on your Windows system.
echo.
echo What would you like to do next?
echo.
echo 1. Setup product images
echo 2. Start the application
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    call START-IMAGES-WINDOWS.bat
) else if "%choice%"=="2" (
    call START-WINDOWS.bat
) else (
    echo.
    echo Setup is complete. To run FashionFinder:
    echo - Use START-IMAGES-WINDOWS.bat to prepare your product images
    echo - Use START-WINDOWS.bat to launch the application
    echo.
    echo Thank you for installing FashionFinder!
)

pause