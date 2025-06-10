@echo off
echo FashionFinder - Windows Simple Startup
echo =====================================
echo.

rem Set environment variables for development
set NODE_ENV=development

echo Checking for compiled server...
echo.
echo This will use localhost instead of 0.0.0.0 for binding the server
echo The application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.


rem Build TypeScript sources if the compiled server does not exist
if not exist "dist\server\windows-index.js" (
    echo Compiling TypeScript sources...
    npm run build:server || goto :buildError
)

rem Run the compiled server file
node dist\server\windows-index.js

goto :eof

:buildError
echo Failed to compile TypeScript sources.
pause

