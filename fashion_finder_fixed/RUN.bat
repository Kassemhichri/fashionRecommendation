@echo off
echo ===================================================
echo FashionFinder - Simple Windows Launcher
echo ===================================================
echo.

rem Set environment variables directly
set NODE_ENV=development

echo Starting FashionFinder application...
echo.
echo The server will start on http://localhost:5000
echo Press Ctrl+C to stop the server when done
echo.

rem Create necessary directories if they don't exist
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images

rem Use npx to start the server with localhost instead of 0.0.0.0
npx cross-env NODE_ENV=development HOST=localhost tsx server/index.ts

pause