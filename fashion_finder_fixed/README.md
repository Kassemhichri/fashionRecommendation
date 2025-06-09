# Fashion Finder

Fashion Finder is a web application that helps users discover clothing items that match their style preferences through an interactive quiz, AI-powered recommendations, and a simple chatbot assistant.

## Features

### Style Quiz
The application includes a simplified and more accurate style quiz that helps users discover their fashion preferences. The quiz:
- Features clear, visually-appealing questions with image options
- Focuses on key style dimensions: style preference, color palette, occasion, and fit
- Provides detailed descriptions to guide users in making selections
- Maps answers directly to product attributes for more accurate recommendations

### Enhanced AI Recommendation System
Fashion Finder uses a sophisticated AI recommendation system that combines multiple approaches:

1. **Visual Embeddings**: Analyzes product images to understand visual style and appearance
2. **Metadata Analysis**: Processes product attributes like category, color, and usage
3. **User Preference Modeling**: Builds a comprehensive model of user preferences based on likes, dislikes, and views
4. **Fashion Knowledge Integration**: Incorporates fashion expertise about complementary items and color compatibility

The system provides personalized recommendations with explanations of why each item was selected for the user.

### Chatbot Assistant
A simple but helpful chatbot provides fashion advice and assistance:
- Answers questions about different fashion styles
- Provides outfit recommendations for various occasions
- Offers seasonal fashion tips
- Gives clothing care guidance
- Helps users navigate the application

### Product Browsing
Users can browse through a catalog of fashion items with:
- Filtering options by category, color, and other attributes
- Detailed product information
- Similar and complementary item suggestions

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript with modern frameworks
- **Backend**: Python Flask server with RESTful API endpoints
- **AI Model**: Custom recommendation system using embeddings and similarity matching
- **Database**: Local storage with JSON files for product and user data

## Project Structure

```
fashion_finder/
├── client/              # Frontend code
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # UI components
│   ├── pages/           # Application pages
│   └── styles/          # CSS styles
├── server/              # Backend code
│   ├── api/             # API endpoints
│   │   ├── chatbot.py   # Chatbot API
│   │   ├── enhanced_recommendations.py # AI recommendation API
│   │   └── quiz.py      # Quiz API
│   ├── models/          # Data models
│   │   └── quiz.py      # Improved quiz model
│   ├── services/        # Business logic services
│   │   ├── chatbot_service.py # Chatbot logic
│   │   ├── enhanced_ai_recommendation_service.py # New AI recommendation system
│   │   └── quiz_service.py # Quiz service
│   ├── static/          # Static files served by the server
│   └── utils/           # Utility functions
└── shared/              # Shared code between client and server
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   pip install -r requirements.txt
> **Note**: All Python dependencies are listed in `requirements.txt`. The obsolete `requirements_python313.txt` file was removed.

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```
2. Start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Technical Details

### Enhanced AI Recommendation System

The recommendation system uses a hybrid approach combining:

1. **Image Embeddings**: 
   - Generates vector representations of product images
   - Captures visual style, patterns, and design elements
   - Enables similarity matching based on visual appearance

2. **Metadata Embeddings**:
   - Encodes categorical features like gender, category, color
   - Uses one-hot encoding for categorical variables
   - Normalizes and combines with image embeddings

3. **User Preference Modeling**:
   - Builds a preference vector from user interactions
   - Weighs liked items more heavily than viewed items
   - Incorporates negative signals from disliked items
   - Tracks category, color, and style preferences

4. **Fashion Knowledge Base**:
   - Defines complementary item categories (e.g., shirts with jeans)
   - Maps color compatibility for coordinated outfits
   - Categorizes items by style (casual, formal, etc.)

The system provides personalized recommendations with explanations of why each item was selected, such as "Matches your preferred color" or "Pairs well with your recent purchase."

### Simplified Quiz System

The quiz system has been improved to:

1. **Focus on Key Dimensions**:
   - Style preference (casual, formal, athletic, minimalist, bohemian)
   - Color palette (neutral, vibrant, pastel, monochrome, earth tones)
   - Occasion (everyday, work, special events, athletic, loungewear)
   - Fit preference (loose, regular, fitted, oversized, mixed)

2. **Direct Mapping to Recommendations**:
   - Each answer maps to specific product attributes
   - Clear connection between user choices and recommended items
   - Weighted scoring system for more accurate results

3. **Visual Clarity**:
   - Image-based options for intuitive selection
   - Clear descriptions for each question
   - Simplified interface for better user experience

### Chatbot Implementation

The chatbot uses a pattern-matching approach with a knowledge base of fashion information:

1. **Knowledge Categories**:
   - Fashion styles (casual, formal, athletic, etc.)
   - Occasion-based outfit recommendations
   - Seasonal fashion advice
   - Clothing care tips

2. **Pattern Recognition**:
   - Identifies user intent through regex patterns
   - Matches questions to appropriate knowledge areas
   - Provides contextually relevant responses

3. **Integration**:
   - Simple REST API endpoint for chat interactions
   - Stateless design for easy scaling
   - Focused on fashion-related queries


