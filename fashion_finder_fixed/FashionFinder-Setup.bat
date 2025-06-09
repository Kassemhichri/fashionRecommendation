@echo off
setlocal enabledelayedexpansion

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

rem Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%

rem Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in your PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

rem Check Python version
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo %PYTHON_VERSION%

echo.
echo Setting up FashionFinder environment...
echo.

rem Create necessary directories
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images
if not exist "source-images" mkdir source-images

echo Directories created:
echo - attached_assets
echo - attached_assets\images
echo - source-images
echo.

rem Install Node.js dependencies
echo Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Node.js dependencies
    pause
    exit /b
)
echo Node.js dependencies installed successfully
echo.

rem Install Python dependencies
echo Installing Python dependencies...
pip install flask flask-cors flask-session pandas scikit-learn
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies
    pause
    exit /b
)
echo Python dependencies installed successfully
echo.

echo =============================================
echo FashionFinder has been set up successfully!
echo =============================================
echo.
echo What would you like to do next?
echo.
echo 1. Process images (prepare product images)
echo 2. Start FashionFinder application
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    echo.
    echo Starting image processor...
    call process-images-windows.bat
) else if "%choice%"=="2" (
    echo.
    echo Starting FashionFinder application...
    call FashionFinder-Windows.bat
) else (
    echo.
    echo Setup complete. You can now:
    echo - Run 'process-images-windows.bat' to prepare your product images
    echo - Run 'FashionFinder-Windows.bat' to start the application
)

echo.
echo Thank you for using FashionFinder!
pause