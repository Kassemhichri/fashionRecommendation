@echo off
echo FashionFinder - Windows Compatible Startup
echo ==========================================
echo.

rem Set environment variables for development
set NODE_ENV=development

echo Starting FashionFinder with Windows compatibility fixes...
echo.
echo This will use localhost instead of 0.0.0.0 for binding the server
echo The application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

rem Run the Windows-compatible server file
npx tsx server/windows-index.ts

pause