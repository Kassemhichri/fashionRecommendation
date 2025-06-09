# Fashion Finder

This repository contains the Fashion Finder project located in the `fashion_finder_fixed` folder.

## Running on Windows

1. Install **Node.js** (v16 or higher) and **Python** (3.8 or higher). Ensure both are available on your PATH.
2. Open a terminal in the `fashion_finder_fixed` directory and install dependencies:
   ```
   npm install
   pip install -r requirements.txt
   ```
3. Start the development server with the Windows-specific script:
   ```
   npm run dev:windows
   ```
   - Add `SKIP_FLASK=true` in front of the command if you do not have Python dependencies for the Flask service.
   - If `DATABASE_URL` is not set, the server uses in-memory storage and no data is persisted.
4. Visit `http://localhost:5000` in your browser.

Linux or macOS users can run `npm run dev` instead.
