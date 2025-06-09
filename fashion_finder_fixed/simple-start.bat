@echo off
SETLOCAL

:: This is the simplest way to start the application on Windows
:: It doesn't modify any files, just sets a necessary environment variable
:: to make the server use localhost instead of 0.0.0.0

:: Set the environment variables
SET NODE_ENV=development
SET HOST=localhost

:: Start the server
echo Starting FashionFinder...
echo.
echo This will launch the application at http://localhost:5000
echo.

:: Ensure directories exist
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images 

:: Run the server with the environment variables
:: Check if npx exists
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  npx tsx server/index.ts
) else (
  :: If npx is not available, try node directly
  node --loader tsx server/index.ts
)

ENDLOCAL
pause