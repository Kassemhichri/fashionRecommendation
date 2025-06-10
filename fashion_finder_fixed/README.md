# Fashion Finder

Fashion Finder is a web application that helps users discover clothing items that match their style preferences through an interactive quiz, AI-powered recommendations, and a simple chatbot assistant.

The source code is written in TypeScript but compiles to JavaScript in the `dist` folder for production use.

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

- **Frontend**: React + Vite
- **Backend**: Express.js server written in TypeScript
- **AI Model**: Custom recommendation system using embeddings
- **Database**: Local storage with JSON files

## Project Structure

```
fashion_finder/
├── client/      # React frontend
├── server/      # Express API
├── shared/      # Code shared between client and server
├── backend/     # Static JSON data
└── dist/        # Compiled JavaScript
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
 - Python 3.10 or 3.11
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
   ```
   > **Note**: All Python dependencies are listed in `requirements.txt`. Python 3.13 is currently not supported; use Python 3.11 or earlier.

### Running the Application

1. Set the `DATABASE_URL` environment variable to point at your PostgreSQL database.
2. Start the development server:
   ```
   npm run dev
   ```
3. Build the server for production:
   ```
   npm run build:server
   ```
4. Run the compiled server:
   ```
   npm start
   ```
   The server listens on [http://localhost:5000](http://localhost:5000).

   On Windows you can use a dedicated entry point:
   ```
   npm run start:windows
   ```

### Windows Notes

The development and production scripts use the `cross-env` utility to set
`NODE_ENV` in a way that works on both Windows and UNIX-based systems. If you are
running Windows, you can use the same commands as above. There are also Windows-specific
entry points:

```bash
npm run dev:windows
npm run start:windows
```

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


