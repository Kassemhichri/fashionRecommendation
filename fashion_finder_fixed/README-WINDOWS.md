# FashionFinder - Windows Guide

This guide explains how to set up and run the FashionFinder project on Windows.

## Prerequisites

- **Node.js** v16 or higher
- **Python** 3.8 or higher
- Git (optional)

Make sure both Node and Python are added to your `PATH`.

## Installation

1. Open a terminal and navigate to the `fashion_finder_fixed` directory.
2. Install JavaScript dependencies:
   ```
   npm install
   ```
3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
4. (Optional) Prepare product images by placing them in `source-images` and running:
   ```
   python process_images.py
   ```

## Running the Application

Start the development server using the Windows-specific script:
```bash
npm run dev:windows
```
Add `SKIP_FLASK=true` before the command if you want to skip starting the Flask service.
If `DATABASE_URL` is unset the app falls back to a temporary in-memory database.

Once the server is running, open `http://localhost:5000` in your browser.

## Troubleshooting

- **Port Already in Use**: Stop the process using port 5000 or choose a different port in the scripts.
- **Flask Dependencies Missing**: Set `SKIP_FLASK=true` to disable the Python service.

Enjoy using FashionFinder on Windows!
