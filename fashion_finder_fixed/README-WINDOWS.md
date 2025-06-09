# FashionFinder - Windows Installation Guide

This guide will help you set up and run the FashionFinder application on a Windows system.

## Prerequisites

Before you begin, ensure you have the following software installed:

- **Node.js** (v16.0 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
  - Ensure you check "Add Python to PATH" during installation
- **Git** (optional) - [Download](https://git-scm.com/download/win)

## Installation

### Option 1: Simple Installation (Recommended)

1. **Run the Windows Installation Script**
   - Double-click on `INSTALL-WINDOWS.bat`
   - This script will:
     - Check for required dependencies
     - Install Node.js packages
     - Install Python packages
     - Set up necessary directories
     - Create Windows compatibility files

2. **Follow the On-Screen Instructions**
   - The script will guide you through the rest of the setup process
   - You'll have options to prepare product images and start the application

### Option 2: Manual Installation

If you prefer to install manually, follow these steps:

1. **Install Node.js Dependencies**
   ```
   npm install
   ```

2. **Install Python Dependencies**
   ```
   pip install flask flask-cors flask-session pandas scikit-learn
   ```

3. **Create Required Directories**
   ```
   mkdir attached_assets
   mkdir attached_assets\images
   mkdir source-images
   ```

## Adding Product Images

1. **Place your product images in the `source-images` folder**

2. **Process the images**
   - Double-click on `START-IMAGES-WINDOWS.bat`
   - This script will help you rename and move the images to the correct location
   - Follow the on-screen instructions

3. **Image Naming Convention**
   - Each image must be named with its corresponding product ID from styles.csv
   - For example, a product with ID "15970" should have an image named "15970.jpg"

## Running the Application

1. **Start the Application**
   - Double-click on `START-WINDOWS.bat`
   - This script will:
     - Create a Windows-compatible server configuration
     - Start both the Express server and Flask server
     - Launch the application

2. **Access the Application**
   - Open your web browser and go to: `http://localhost:5000`

## Troubleshooting

### Common Issues:

#### Node.js or npm Not Found
- Make sure Node.js is properly installed
- Verify that Node.js and npm are added to your PATH
- Try reinstalling Node.js

#### Python or pip Not Found
- Make sure Python is properly installed
- Verify that Python and pip are added to your PATH
- Try reinstalling Python with the "Add Python to PATH" option checked

#### Socket Binding Error
- If you see `Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000`
- Use the provided Windows scripts which already handle this issue

#### Port Already in Use
- If you see `Error: listen EADDRINUSE: address already in use :::5000`
- Find and stop the process using port 5000 or 8000
- Run as administrator: `netstat -ano | findstr :5000` to find the PID
- Then: `taskkill /PID <PID> /F` to kill the process

## Files Included in the Windows Package

- `INSTALL-WINDOWS.bat` - Main installation script
- `START-WINDOWS.bat` - Script to start the application
- `START-IMAGES-WINDOWS.bat` - Script to process product images
- `README-WINDOWS.md` - This documentation file

## Additional Information

- The application uses React for the frontend and Express.js/Flask for the backend
- Product data is loaded from styles.csv in the attached_assets folder
- MongoDB database is used for user data, interactions, and quiz responses

## Support

If you encounter any issues or have questions, please refer to the original project documentation or contact the support team.

Thank you for using FashionFinder!