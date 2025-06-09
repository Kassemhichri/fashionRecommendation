@echo off
echo FashionFinder - Windows Image Processor
echo ===================================
echo.

rem Create necessary directories
if not exist "source-images" mkdir source-images
if not exist "attached_assets" mkdir attached_assets
if not exist "attached_assets\images" mkdir attached_assets\images

echo Please place your product images in the 'source-images' folder.
echo.
echo This utility will help you rename your images to match the product IDs from styles.csv
echo Example: If you have a product with ID 15970, the image should be named 15970.jpg
echo.

rem Check if source-images directory has files
dir /b "source-images\*.*" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo The 'source-images' folder is empty.
    echo Please place your product images in the 'source-images' folder.
    pause
    exit /b
)

echo Found images in the source-images folder.
echo.
echo Choose how to process the images:
echo 1. Automatically extract numeric IDs from filenames
echo 2. Manually enter ID for each image
echo.
set /p choice=Enter your choice (1 or 2): 

if "%choice%"=="1" (
    echo.
    echo Processing images automatically...
    echo.
    
    for %%f in (source-images\*.*) do (
        set "filename=%%~nf"
        
        rem Extract numeric part from filename using PowerShell
        for /f "delims=" %%i in ('powershell -Command "$regex = [regex]::Match('%%filename%%', '\d+'); if($regex.Success) { $regex.Value } else { '' }"') do set "id=%%i"
        
        if not "!id!"=="" (
            echo Processing %%~nxf - Found ID: !id!
            copy "%%f" "attached_assets\images\!id!.jpg" >nul
            echo Copied to attached_assets\images\!id!.jpg
        ) else (
            echo Could not extract ID from %%~nxf - skipping
        )
    )
) else (
    echo.
    echo Processing images manually...
    echo.
    
    for %%f in (source-images\*.*) do (
        echo.
        echo Processing: %%~nxf
        set /p id=Enter product ID for this image (or press Enter to skip): 
        
        if not "!id!"=="" (
            echo Copying to attached_assets\images\!id!.jpg
            copy "%%f" "attached_assets\images\!id!.jpg" >nul
        ) else (
            echo Skipping this image
        )
    )
)

echo.
echo Image processing complete!
echo Your images have been copied to the attached_assets\images folder with the correct naming convention.
echo.
echo You can now run FashionFinder-Windows.bat to start the application.

pause