@echo off
rem ===============================================================
rem FashionFinder Windows Launcher
rem ===============================================================

echo Starting FashionFinder...
echo.
echo Please select an option:
echo.
echo 1. Install FashionFinder
echo 2. Process product images
echo 3. Start the application
echo 4. Exit
echo.

set /p option=Enter option (1-4): 

if "%option%"=="1" (
    call INSTALL-WINDOWS.bat
) else if "%option%"=="2" (
    call START-IMAGES-WINDOWS.bat
) else if "%option%"=="3" (
    call START-WINDOWS.bat
) else (
    echo Exiting...
    exit /b
)