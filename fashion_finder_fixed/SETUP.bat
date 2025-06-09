@echo off
echo ===================================================
echo FashionFinder - Simple Windows Setup
echo ===================================================
echo.

rem Set environment variable for development mode
set NODE_ENV=development

echo Step 1: Creating necessary directories...
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images
if not exist "source-images" mkdir source-images

echo.
echo Step 2: Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b
)

echo.
echo Step 3: Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in your PATH.
    echo Please install Python from https://www.python.org/
    echo Then run this script again.
    pause
    exit /b
)

echo.
echo Step 4: Installing dependencies...
call npm install
pip install flask flask-cors flask-session pandas scikit-learn

echo.
echo Step 5: Creating Windows-compatible server file...
set TEMP_FILE=server_windows.ts

rem Create a simple temporary file that will launch the server with localhost
echo // Temporary Windows launcher > %TEMP_FILE%
echo const { spawn } = require('child_process'); >> %TEMP_FILE%
echo console.log('Starting FashionFinder for Windows...'); >> %TEMP_FILE%
echo console.log(''); >> %TEMP_FILE%
echo console.log('The application will be available at: http://localhost:5000'); >> %TEMP_FILE%
echo console.log('Press Ctrl+C to stop the application'); >> %TEMP_FILE%
echo console.log(''); >> %TEMP_FILE%
echo // Set environment variables >> %TEMP_FILE%
echo process.env.NODE_ENV = 'development'; >> %TEMP_FILE%
echo process.env.HOST = 'localhost'; >> %TEMP_FILE%
echo // Start the server >> %TEMP_FILE%
echo const server = spawn('node', ['--loader=tsx', 'server/index.ts'], { >> %TEMP_FILE%
echo   stdio: 'inherit', >> %TEMP_FILE%
echo   env: { ...process.env, NODE_ENV: 'development', HOST: 'localhost' } >> %TEMP_FILE%
echo }); >> %TEMP_FILE%
echo server.on('close', code =^> { >> %TEMP_FILE%
echo   console.log(`Server process exited with code ${code}`); >> %TEMP_FILE%
echo }); >> %TEMP_FILE%

echo.
echo ===================================================
echo Setup complete!
echo ===================================================
echo.
echo What would you like to do next?
echo.
echo 1. Start FashionFinder application
echo 2. Exit
echo.

set /p choice=Enter your choice (1-2): 

if "%choice%"=="1" (
    echo.
    echo Starting FashionFinder...
    echo.
    node %TEMP_FILE%
) else (
    echo.
    echo To start FashionFinder later, run:
    echo   node %TEMP_FILE%
    echo.
)

pause