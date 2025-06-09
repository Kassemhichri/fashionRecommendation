# Project Description: FashionFinder (for AI Implementation)

## 1. Project Overview

FashionFinder is a web application designed to provide users with personalized fashion recommendations. Users can take a style quiz, browse products, and receive suggestions tailored to their preferences. The goal is to create an engaging and helpful platform for discovering fashion items.

## 2. Core Technologies

*   **Frontend**: React.js (using standard `.js` files for components, incorporating JSX syntax directly within these `.js` files. No `.jsx` or `.tsx` files should be used).
*   **Backend**: Flask (Python web framework).

## 3. Core Features

### 3.1. User Authentication
*   **Registration**: New users can create an account (e.g., with username, email, password).
*   **Login**: Existing users can log in to access their personalized experience.
*   **Logout**: Users can log out of their accounts.
*   **(Optional)** Session management/JWT for secure API calls.

### 3.2. Style Quiz
*   A series of questions to understand the user's fashion preferences (e.g., preferred colors, styles, categories, price range).
*   Quiz responses should be saved and associated with the user profile.
*   These responses will be a primary input for the recommendation engine.

### 3.3. Product Display and Browsing
*   **Product Listing**: Display fashion items with key information (name, image, price, brand (if available), category) sourced from the provided data files.
*   **Filtering**: Allow users to filter products based on criteria like category, color, price range, etc.
*   **Sorting**: Allow users to sort products (e.g., by price, popularity, newness).
*   **Search**: Allow users to search for products by keywords.
*   **Product Detail Page**: Show detailed information for a single product, including multiple images (if available), description, specifications, and user reviews (if implemented).

### 3.4. Personalized Recommendations
*   **Recommendation Engine**: The backend will house a recommendation engine.
*   **Inputs for Recommendations**:
    *   User's quiz responses.
    *   User's interaction history (e.g., liked items, viewed items).
    *   Product data from `styles.csv` and `images.csv`.
    *   (Optional) Item similarity (content-based filtering).
    *   (Optional) User similarity (collaborative filtering).
*   **Display**: Recommended items should be prominently displayed to the user, for example, on the homepage or a dedicated recommendations page.
*   **(Optional) AI Explanation**: Briefly explain why a particular item is recommended (e.g., "Because you liked items in the 'casual' style and 'blue' color").

### 3.5. User Interactions & Feedback
*   **Liking/Disliking Products**: Users can like or dislike products. This feedback should be stored and used to refine recommendations.
*   **(Optional) Saving Items**: Users can save items to a wishlist or favorites list.
*   **(Optional) Product Reviews**: Users can submit reviews and ratings for products.

## 4. Frontend (React.js)

*   **File Extension**: All React components and JavaScript logic files **must use the `.js` extension exclusively**. JSX syntax will be used directly within these `.js` files. Files with `.jsx` or `.tsx` extensions should not be created or used.
*   **Structure**:
    *   `public/`: Contains `index.html` and static assets.
    *   `src/`:
        *   `components/`: Reusable UI components (e.g., `ProductCard.js`, `Button.js`, `Navbar.js`, `QuizQuestion.js`).
        *   `pages/`: Components representing different application views/pages (e.g., `HomePage.js`, `LoginPage.js`, `RegisterPage.js`, `QuizPage.js`, `ProductListPage.js`, `ProductDetailPage.js`, `RecommendationsPage.js`).
        *   `services/` or `utils/`: Modules for API calls to the Flask backend (e.g., `api.js`).
        *   `context/`: (If using Context API for state management) For managing global state like authentication status or user preferences.
        *   `assets/`: For images, fonts, etc., used by the frontend (not product images, which are served by the backend).
        *   `App.js`: Main application component, handling routing.
        *   `index.js`: Entry point, renders the `App` component.
*   **State Management**: For simple to moderate complexity, React Context API combined with `useState` and `useReducer` hooks. For more complex state, consider a lightweight state management library if necessary, but prioritize built-in React features.
*   **Routing**: Use a library like `react-router-dom` for client-side routing to navigate between pages.
*   **API Interaction**: Use `fetch` API or a library like `axios` to communicate with the Flask backend API endpoints.
*   **Styling**: Use CSS modules, styled-components, or a utility-first CSS framework like Tailwind CSS (ensure setup is compatible with standard `.js` files).

## 5. Backend (Flask)

*   **Structure**:
    *   `api/` or `routes/`: Blueprints or modules defining API endpoints.
    *   `models/`: Database models (e.g., User, QuizResponse, Interaction). Product data will primarily be loaded from CSVs initially.
    *   `services/`: Business logic for different features (e.g., `recommendation_service.py`, `auth_service.py`, `quiz_service.py`, `product_service.py`).
    *   `utils/`: Utility functions.
    *   `data/`: This directory will store the primary data files: `styles.csv` (containing product metadata) and `images.csv` (mapping product IDs to image information or containing image URLs). It will also contain an `images/` sub-directory which will house the actual product images, named as `[product_id].jpg` (e.g., `12345.jpg`).
    *   `app.py`: Main Flask application file, initializes the app, registers blueprints, and configures extensions (e.g., Flask-CORS).
    *   `requirements.txt`: Lists Python dependencies.
*   **API Endpoints (RESTful)**: Design clear and consistent API endpoints. Examples:
    *   Authentication: `POST /api/auth/register`, `POST /api/auth/login`
    *   Quiz: `GET /api/quiz/questions`, `POST /api/quiz/responses`
    *   Products: `GET /api/products` (loads from CSVs), `GET /api/products/<id>`
    *   Images: An endpoint to serve product images, e.g., `GET /api/images/<product_id>.jpg` or ensure Flask can serve static files from the `backend/data/images/` directory.
    *   Recommendations: `GET /api/recommendations`
    *   Interactions: `POST /api/interactions/like`
*   **Database**: For user data, quiz responses, and interactions, use a relational database (e.g., SQLite for development, PostgreSQL for production). Flask-SQLAlchemy can be used as an ORM. Product data will initially be loaded and processed from the specified CSV files.
*   **Recommendation Logic**: Implement the recommendation algorithms. This could start simple (e.g., based on quiz answers matching product attributes from `styles.csv`) and evolve to more complex methods.
*   **Authentication**: Implement token-based authentication (e.g., JWT) to secure endpoints that require a logged-in user.
*   **CORS**: Configure Cross-Origin Resource Sharing (CORS) to allow requests from the React frontend (e.g., using Flask-CORS).

## 6. Data Management

*   **Product Data Sources**:
    *   `styles.csv`: Located in `backend/data/`. This file is the primary source for product metadata, including details like product ID, name, description, category, sub-category, color, style tags, brand, year, season, usage, etc.
    *   `images.csv`: Located in `backend/data/`. This file maps product IDs to their corresponding image filenames or provides information necessary to construct image paths/URLs.
    *   `images/` folder: Located in `backend/data/images/`. This folder contains the actual product images. Each image file should be named using its `product_id` and have a `.jpg` extension (e.g., `1163.jpg`, `40120.jpg`). The backend must be able to serve these images to the frontend.
*   **User Data**: Store user ID, username, hashed password, email, registration date (in the database).
*   **Quiz Data**: Store quiz questions (can be hardcoded or from a config file) and user responses (linking user ID, question ID, selected option(s)/tag(s)) (in the database).
*   **Interaction Data**: Store user interactions like product views, likes, dislikes (linking user ID, product ID, interaction type, timestamp) (in the database).

## 7. Project Structure (High-Level - Monorepo Style)

```
FashionFinder/
|-- backend/          # Flask application
|   |-- app.py
|   |-- api/
|   |-- models/         # For User, Interaction, QuizResponse DB models
|   |-- services/
|   |-- data/           # Contains styles.csv, images.csv
|   |   `-- images/     # Contains [product_id].jpg files
|   `-- requirements.txt
|-- frontend/         # React.js application (using .js files only)
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- App.js
|   |   `-- index.js
|   `-- package.json
|-- docs/             # Project documentation
`-- README.md         # Main project README
```

## 8. Key Considerations for AI Implementation

*   **Modularity**: Design both frontend and backend components to be modular and reusable.
*   **Clear API Contract**: Define a clear and well-documented API contract between the frontend and backend.
*   **Data Loading and Processing**: The backend will need to efficiently load and parse data from `styles.csv` and `images.csv` to serve product information and support the recommendation engine.
*   **Image Serving**: Ensure the Flask backend can correctly serve static image files from the `backend/data/images/` directory based on product ID.
*   **Iterative Development**: Start with core features and iteratively add more complex functionalities.
*   **Error Handling**: Implement robust error handling on both frontend and backend.

This revised description should provide a solid and specific foundation for an AI to understand the requirements and begin the implementation of the FashionFinder project.
