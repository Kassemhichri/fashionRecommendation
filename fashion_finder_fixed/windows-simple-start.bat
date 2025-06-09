@echo off
echo FashionFinder - Windows Simple Startup
echo =====================================
echo.

rem Set environment variables for development
set NODE_ENV=development

rem Creating a temporary modified copy of the server file
echo Creating temporary server file with Windows compatibility fixes...
set TEMP_SERVER_FILE=server\temp-index.ts

rem Make a copy of the original file
copy server\index.ts %TEMP_SERVER_FILE%

rem Replace the problematic host binding
echo Modifying server configuration for Windows compatibility...
powershell -Command "(Get-Content %TEMP_SERVER_FILE%) -replace 'host: \"0.0.0.0\"', 'host: \"localhost\"' -replace 'reusePort: true', '' | Set-Content %TEMP_SERVER_FILE%"

echo Starting FashionFinder with Windows compatibility fixes...
echo.
echo This will use localhost instead of 0.0.0.0 for binding the server
echo The application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

rem Run the temporary server file
npx tsx %TEMP_SERVER_FILE%

rem Clean up temporary file on exit
del %TEMP_SERVER_FILE%

pause