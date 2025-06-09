@echo off
echo FashionFinder - Starting Application
echo =======================================
echo.

rem Set environment variable for development
set NODE_ENV=development

rem Run the server using tsx
echo Starting server...
npx tsx server/index.ts

pause