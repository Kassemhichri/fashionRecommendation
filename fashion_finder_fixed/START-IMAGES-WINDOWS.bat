@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo FashionFinder - Windows Image Preparation Tool
echo =======================================================
echo.

rem Create required directories
if not exist "attached_assets" (
    mkdir "attached_assets"
    echo Created: attached_assets
)

if not exist "attached_assets\images" (
    mkdir "attached_assets\images"
    echo Created: attached_assets\images
)

if not exist "source-images" (
    mkdir "source-images"
    echo Created: source-images
    echo.
    echo IMPORTANT: Please place your original product images in the 'source-images' folder.
    echo            Then run this script again.
    pause
    exit /b
)

rem Check if source-images directory has files
dir /b "source-images\*.*" >nul 2>&1
if %errorlevel% neq 0 (
    echo The 'source-images' folder is empty.
    echo.
    echo IMPORTANT: Please place your product images in the 'source-images' folder.
    echo            Then run this script again.
    pause
    exit /b
)

echo.
echo Found images in the source-images folder.
echo.
echo How would you like to process your images?
echo.
echo 1. Automatic Mode - Extract numeric IDs from filenames
echo    (Example: product_15970.jpg → 15970.jpg)
echo.
echo 2. Manual Mode - Enter product ID for each image
echo    (Recommended for files without clear numeric IDs)
echo.
echo 3. Exit without processing
echo.

set /p mode=Enter your choice (1-3): 

if "%mode%"=="1" (
    echo.
    echo Running in Automatic Mode...
    echo.
    
    set processed=0
    set skipped=0
    
    for %%f in (source-images\*.*) do (
        if "%%~xf"==".jpg" (
            set "filename=%%~nf"
            
            rem Extract numeric part from filename using findstr
            for /f "tokens=*" %%i in ('echo !filename! ^| findstr /r "[0-9][0-9]*"') do (
                set "id_part=%%i"
                
                rem Extract just the numbers using PowerShell
                for /f "delims=" %%n in ('powershell -Command "$matches = [regex]::Match('!id_part!', '\d+').Value; if($matches) { Write-Output $matches } else { Write-Output '' }"') do (
                    set "id=%%n"
                )
            )
            
            if defined id (
                if not "!id!"=="" (
                    echo Processing: %%~nxf - ID: !id!
                    copy "%%f" "attached_assets\images\!id!.jpg" >nul
                    set /a processed+=1
                ) else (
                    echo Skipping: %%~nxf - Could not extract ID
                    set /a skipped+=1
                )
            ) else (
                echo Skipping: %%~nxf - Could not extract ID
                set /a skipped+=1
            )
        ) else (
            echo Skipping: %%~nxf - Not a JPG file
            set /a skipped+=1
        )
    )
    
    echo.
    echo Processing complete:
    echo - Processed: !processed! images
    echo - Skipped: !skipped! images
    
) else if "%mode%"=="2" (
    echo.
    echo Running in Manual Mode...
    echo.
    
    set processed=0
    set skipped=0
    
    for %%f in (source-images\*.*) do (
        if "%%~xf"==".jpg" (
            echo.
            echo Image: %%~nxf
            set /p id=Enter product ID for this image (or press Enter to skip): 
            
            if not "!id!"=="" (
                echo Processing: %%~nxf - ID: !id!
                copy "%%f" "attached_assets\images\!id!.jpg" >nul
                set /a processed+=1
            ) else (
                echo Skipping: %%~nxf
                set /a skipped+=1
            )
        ) else (
            echo Skipping: %%~nxf - Not a JPG file
            set /a skipped+=1
        )
    )
    
    echo.
    echo Processing complete:
    echo - Processed: !processed! images
    echo - Skipped: !skipped! images
    
) else (
    echo.
    echo Exiting without processing images.
)

echo.
echo =======================================================
echo Image Processing Complete
echo =======================================================
echo.
echo What would you like to do next?
echo.
echo 1. Start the FashionFinder application
echo 2. Exit
echo.

set /p next=Enter your choice (1-2): 

if "%next%"=="1" (
    call START-WINDOWS.bat
) else (
    echo.
    echo You can start the application at any time by running START-WINDOWS.bat
)

echo.
pause