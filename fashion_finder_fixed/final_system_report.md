# AI-Powered Fashion Recommendation System: Enhancement Report

## 1. Introduction

This report details the enhancements made to your AI-powered fashion recommendation system. The primary goal was to build an accurate and engaging quiz generator, use both quiz answers and interaction data for personalized product recommendations, and provide a scalable backend with a Flask API for a React frontend.

Key achievements include:
- A dynamic quiz generator based on product attributes from `styles.csv`.
- A content-based recommendation engine using TF-IDF and cosine similarity, incorporating both quiz-based user profiles and real-time interaction feedback (likes/dislikes).
- Flask API endpoints for user authentication (mocked), quiz management, product browsing, interaction recording, and personalized recommendations.
- Robust image serving capabilities.
- Placeholder data generation for `users.json`, `interactions.json`, and `user_profiles.json` to facilitate development in the absence of original files.

## 2. System Architecture

The system is organized into a backend Flask application with the following key components:

-   **Data Layer**:
    -   `styles.csv`: Contains product metadata (ID, gender, category, color, season, usage, etc.). Located in `attached_assets/data/`.
    -   `images/`: Folder containing product images, named `[product_id].jpg`. Primarily sourced from `attached_assets/images/`.
    -   `user_profiles.json`: Stores user preferences derived from quiz answers. Located in `backend/data/`.
    -   `interactions.json`: Records user likes and dislikes for items. Located in `backend/data/`.
    -   `users.json`: Placeholder for user account data. Located in `backend/data/`.
-   **Services Layer** (`backend/services/`):
    -   `quiz_generator.py`: Loads product attributes from `styles.csv`, generates quiz questions, and saves user quiz answers to `user_profiles.json`.
    -   `recommendation_service.py`: 
        -   Creates TF-IDF feature vectors for products from `styles.csv`.
        -   Generates user profile vectors based on quiz answers and liked items (from `interactions.json`).
        -   Calculates cosine similarity between user vectors and item vectors to provide personalized recommendations.
        -   Records user interactions (likes/dislikes).
-   **API Layer** (`server/app.py`):
    -   Exposes functionalities through RESTful API endpoints for the frontend.

## 3. Quiz Generator

The quiz generator (`quiz_generator.py`) dynamically creates questions based on unique values found in `styles.csv` for attributes like gender, master category, sub-category (dynamically suggested based on master category), article type, base color, season, and usage.

-   **Process**:
    1.  Loads `styles.csv`.
    2.  Extracts unique options for each relevant attribute.
    3.  Constructs a list of questions with these options.
-   **User Profile Creation**:
    -   When a user submits quiz answers via the `/api/quiz/submit` endpoint, their responses are saved in `user_profiles.json`.
    -   Each profile includes the `user_id` and a `preferences` object containing their answers.
    -   This `preferences` object is then used by the `recommendation_service.py` to build the user's preference vector.

## 4. Recommendation Engine

The recommendation engine (`recommendation_service.py`) employs a content-based filtering approach:

1.  **Item Feature Vectors**: Product attributes from `styles.csv` (gender, categories, color, usage, display name, etc.) are combined into a single text string for each item. A TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer then converts these text strings into numerical feature vectors. This matrix represents the entire product catalog.
2.  **User Profile Vectors**: A user's profile vector is constructed by:
    -   Taking their quiz answers (from `user_profiles.json`).
    -   Incorporating features of items they have explicitly "liked" (from `interactions.json`).
    -   These combined preferences are transformed into a TF-IDF vector using the same vectorizer that processed the items.
3.  **Similarity Calculation**: Cosine similarity is computed between the user's profile vector and all item feature vectors.
4.  **Recommendation Generation**: Items with the highest cosine similarity scores (and not already interacted with by the user) are recommended.
5.  **Dynamic Updates**: When a user likes or dislikes an item (recorded via `/api/interactions`), the `interactions.json` file is updated. The next time recommendations are requested for that user, their profile vector is re-calculated, including the new interaction data, leading to dynamically adjusted recommendations.

## 5. Flask API Endpoints

The following key API endpoints are provided in `server/app.py`:

-   **Authentication (Mocked)**:
    -   `POST /api/auth/register`: Mock user registration.
    -   `POST /api/auth/login`: Mock user login (logs in as `user123` for testing).
    -   `POST /api/auth/logout`: Logs out the user.
    -   `GET /api/auth/user`: Retrieves current mock user details.
-   **Quiz**:
    -   `GET /api/quiz/questions`: Provides a list of quiz questions and options.
    -   `POST /api/quiz/submit`: Submits user's quiz answers, saves them to their profile.
-   **Products & Recommendations**:
    -   `GET /api/products`: Lists all products, with optional filtering (gender, categories, colors, usage).
    -   `GET /api/products/featured`: Returns a subset of products as featured items.
    -   `GET /api/recommendations`: Returns personalized recommendations for the logged-in user. Falls back to featured products if the user is not logged in or has no profile/interactions.
-   **Interactions**:
    -   `POST /api/interactions`: Records a user's like/dislike for an item.
-   **Images**:
    -   `GET /images/<filename>`: Serves product images (e.g., `/images/1163.jpg`).

## 6. Frontend Integration Guidance

-   **API Base URL**: The Flask app runs on `http://localhost:5000` by default.
-   **Fetching Data**: Use standard HTTP GET requests for `/api/products`, `/api/recommendations`, `/api/quiz/questions`.
-   **Submitting Data**: Use HTTP POST requests with JSON payloads for `/api/auth/login`, `/api/auth/register`, `/api/quiz/submit`, `/api/interactions`.
-   **User Session**: The backend uses Flask-Session with filesystem storage. Ensure the frontend sends credentials (cookies) with requests if CORS and session management require it (CORS is set up to support credentials).
-   **Image URLs**: Product objects returned by the API include an `imageUrl` field (e.g., `"/images/1541.jpg"`). The React frontend should prepend the API base URL to this path to fetch images (e.g., `http://localhost:5000/images/1541.jpg`).
-   **Dynamic Recommendations**: After a user submits the quiz or likes/dislikes an item, the frontend should re-fetch recommendations from `/api/recommendations` to display updated results.

## 7. Running the System

1.  **Prerequisites**: Python 3.11+, pip.
2.  **Install Dependencies**:
    ```bash
    pip3 install Flask Flask-CORS Flask-Session pandas scikit-learn
    ```
3.  **Directory Structure**: Ensure the project is extracted with the structure provided (e.g., `FashionFinder-1/` containing `server/`, `backend/`, `attached_assets/`, etc.).
4.  **Start the Flask Server**:
    Navigate to the `FashionFinder-1/server/` directory (or wherever `app.py` is located if moved) and run:
    ```bash
    python3.11 app.py
    ```
    The API will be available at `http://localhost:5000`.

## 8. Scalability and Future Enhancements

For detailed scalability considerations and potential improvements, please refer to the `system_validation_report.md` document.

Key future enhancements could include:
-   Implementing a more advanced recommendation model (e.g., LightGBM, shallow neural network, or collaborative filtering if sufficient interaction data becomes available).
-   Replacing placeholder JSON files with a robust database system (e.g., PostgreSQL, MongoDB) for users, interactions, and profiles.
-   Implementing proper user authentication and authorization.
-   Developing an A/B testing framework to evaluate different recommendation strategies.
-   Adding more sophisticated feature engineering for items and users.

This enhanced system provides a solid foundation for a personalized fashion recommendation experience.
