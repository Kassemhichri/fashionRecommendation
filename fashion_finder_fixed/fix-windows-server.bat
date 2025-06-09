@echo off
echo FashionFinder - Windows Server Fix
echo =======================================
echo.

rem Set environment variables for development
set NODE_ENV=development

echo Starting FashionFinder application on localhost instead of 0.0.0.0...
echo.
echo This will start both the Express server and Flask server
echo The application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

rem Run the server with modified host
set HOST=localhost
npx tsx server/index.ts

pause