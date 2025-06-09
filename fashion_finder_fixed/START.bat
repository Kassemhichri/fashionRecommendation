@echo off
echo ===================================================
echo FashionFinder - Direct Windows Launcher
echo ===================================================
echo.

rem Set environment variable
set NODE_ENV=development

rem Create folders
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images

echo Creating a temporary server file with Windows compatibility...
set TEMP_SERVER=server\temp-index.ts

rem Make a copy of the original file
copy server\index.ts %TEMP_SERVER%

rem Replace the problematic 0.0.0.0 with localhost
echo Modifying server file for Windows compatibility...
powershell -Command "(Get-Content %TEMP_SERVER%) -replace 'host: \"0.0.0.0\"', 'host: \"localhost\"' -replace 'reusePort: true', '' | Set-Content %TEMP_SERVER%"

echo.
echo Starting FashionFinder...
echo.
echo The application will be available at: http://localhost:5000
echo Press Ctrl+C to stop when done.
echo.

rem Run the temporary server file
call npx tsx %TEMP_SERVER%

rem Clean up
del %TEMP_SERVER%

pause