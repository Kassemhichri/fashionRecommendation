@echo off
echo FashionFinder - Image Preparation Utility
echo =======================================
echo.
echo This script helps you prepare images for the FashionFinder application.
echo.

REM Check if attached_assets/images directory exists, create if not
if not exist "attached_assets\images" (
    echo Creating attached_assets\images directory...
    mkdir "attached_assets\images"
)

echo.
echo Instructions:
echo 1. Place your product images in the 'source-images' folder (create if it doesn't exist)
echo 2. Make sure your images follow a naming convention that includes the product ID
echo 3. This script will copy and rename your images to match the required format (ID.jpg)
echo.
echo Example: If you have an image named "product_15970_detail.jpg" for product ID 15970,
echo          it will be copied to "attached_assets\images\15970.jpg"
echo.

set /p choice=Do you want to proceed? (Y/N): 

if /i "%choice%"=="Y" (
    REM Create source-images directory if it doesn't exist
    if not exist "source-images" (
        echo Creating source-images directory for your original images...
        mkdir "source-images"
        echo Please place your original product images in the 'source-images' folder.
        echo Then run this script again.
        pause
        exit
    )
    
    REM Check if source-images directory is empty
    dir /b "source-images\*.*" > nul 2>&1
    if errorlevel 1 (
        echo The 'source-images' folder is empty.
        echo Please place your original product images in the 'source-images' folder.
        echo Then run this script again.
        pause
        exit
    )
    
    echo.
    echo Processing images from 'source-images' folder...
    echo.
    
    set /p pattern=Enter the pattern to extract product ID (e.g., product_*_detail.jpg where * is the ID): 
    
    echo.
    echo Processing images...
    
    set count=0
    
    for %%f in (source-images\*.*) do (
        set "filename=%%~nxf"
        
        REM Extract product ID based on pattern (simplified example)
        REM This is a basic implementation - for complex patterns, this would need customization
        echo Processing: %%~nxf
        set /p id=Enter product ID for this image (or skip by pressing Enter): 
        
        if not "!id!"=="" (
            echo Copying to attached_assets\images\!id!.jpg
            copy "%%f" "attached_assets\images\!id!.jpg" > nul
            set /a count+=1
        )
    )
    
    echo.
    echo Processed %count% images.
    echo.
    echo Images have been prepared and saved to the 'attached_assets\images' folder.
    echo.
    echo You can now run the FashionFinder application with your product images.
) else (
    echo Operation cancelled.
)

pause