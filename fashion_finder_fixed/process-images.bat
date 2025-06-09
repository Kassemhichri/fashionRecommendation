@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo ===================================================
echo FashionFinder - Simple Image Processor for Windows
echo ===================================================
echo.

:: Create necessary directories
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images
if not exist "source-images" mkdir source-images

echo Please place your product images in the 'source-images' folder.
echo Each product image should be renamed to match its ID in styles.csv.
echo Example: For product ID 15970, name the image 15970.jpg
echo.

:: Check if source-images has files
dir /b "source-images\*.jpg" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo No image files found in the source-images folder.
    echo.
    echo 1. Please add your images to the source-images folder
    echo 2. Then run this script again
    echo.
    pause
    exit /b
)

:: Process images
echo Found images in source-images folder.
echo.
echo Choose how to process images:
echo 1. Copy all images to attached_assets\images (no renaming)
echo 2. Rename images while copying (manual mode)
echo.
set /p choice=Enter your choice (1 or 2): 

if "%choice%"=="1" (
    echo.
    echo Copying all images to attached_assets\images...
    copy "source-images\*.jpg" "attached_assets\images\" >nul
    
    echo Done! All images have been copied.
    echo.
) else (
    echo.
    echo Starting manual rename mode...
    echo.
    
    for %%f in (source-images\*.jpg) do (
        echo Processing: %%~nxf
        set /p id=Enter product ID for this image (or press Enter to skip): 
        
        if not "!id!"=="" (
            copy "%%f" "attached_assets\images\!id!.jpg" >nul
            echo Saved as !id!.jpg
        ) else (
            echo Skipped
        )
        echo.
    )
    
    echo Process complete!
)

echo.
echo What would you like to do next?
echo 1. Start the FashionFinder application
echo 2. Exit
echo.
set /p next=Enter your choice (1 or 2): 

if "%next%"=="1" (
    call simple-start.bat
) else (
    echo You can start the application at any time by running simple-start.bat
)

ENDLOCAL
pause