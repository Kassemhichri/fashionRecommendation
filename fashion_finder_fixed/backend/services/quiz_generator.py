# quiz_generator.py

import pandas as pd
import json
import os

STYLES_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "styles.csv")
# Corrected path if styles.csv is in attached_assets/data/
STYLES_CSV_PATH_ALT = "/home/ubuntu/fashion_finder/FashionFinder-1/attached_assets/data/styles.csv"
USER_PROFILES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_profiles.json")

def load_styles_data():
    """Loads the styles.csv data into a pandas DataFrame."""
    try:
        if os.path.exists(STYLES_CSV_PATH):
            df = pd.read_csv(STYLES_CSV_PATH)
        elif os.path.exists(STYLES_CSV_PATH_ALT):
            df = pd.read_csv(STYLES_CSV_PATH_ALT)
        else:
            print(f"Error: styles.csv not found at {STYLES_CSV_PATH} or {STYLES_CSV_PATH_ALT}")
            return None
        # Drop rows with missing essential values for quiz generation
        df.dropna(subset=["masterCategory", "subCategory", "articleType", "baseColour", "season", "usage", "gender"], inplace=True)
        return df
    except Exception as e:
        print(f"Error loading styles.csv: {e}")
        return None

def get_quiz_options(df):
    """Extracts unique options for quiz questions from the DataFrame."""
    if df is None:
        return {}
    
    options = {}
    options["gender"] = ["Men", "Women", "Unisex"]
    options["masterCategory"] = df["masterCategory"].unique().tolist()
    options["subCategory"] = {cat: df[df["masterCategory"] == cat]["subCategory"].unique().tolist() for cat in options["masterCategory"]}
    options["articleType"] = {sub_cat: df[df["subCategory"] == sub_cat]["articleType"].unique().tolist() 
                              for cat_val in options["subCategory"].values() for sub_cat in cat_val if df[df["subCategory"] == sub_cat]["articleType"].nunique() > 0}
    options["baseColour"] = df["baseColour"].unique().tolist()
    # Consolidate seasons, e.g. Fall, Summer, Winter, Spring, All Seasons
    unique_seasons = df["season"].unique().tolist()
    standard_seasons = []
    for s in unique_seasons:
        if isinstance(s, str):
            s_lower = s.lower()
            if "fall" in s_lower or "autumn" in s_lower:
                standard_seasons.append("Fall")
            elif "summer" in s_lower:
                standard_seasons.append("Summer")
            elif "winter" in s_lower:
                standard_seasons.append("Winter")
            elif "spring" in s_lower:
                standard_seasons.append("Spring")
    options["season"] = list(set(standard_seasons)) if standard_seasons else unique_seasons # Fallback to original if no standard seasons found
    if not options["season"]: # Ensure there's always a default if processing fails
        options["season"] = ["Spring", "Summer", "Fall", "Winter"]
    options["usage"] = df["usage"].unique().tolist()
    
    return options

def generate_quiz_questions(options):
    """Generates a list of quiz questions based on available options."""
    questions = []
    
    if not options:
        return questions

    questions.append({
        "id": "gender_preference",
        "text": "What is your gender identity?",
        "type": "single_choice",
        "options": options.get("gender", [])
    })
    questions.append({
        "id": "master_category_preference",
        "text": "Which fashion categories are you most interested in? (Select up to 3)",
        "type": "multiple_choice",
        "options": options.get("masterCategory", []),
        "max_selections": 3
    })
    # Dynamic questions for subCategory based on masterCategory selections will be handled by frontend or a more complex logic here
    # For now, we'll assume a simplified approach or that the frontend handles cascading questions.
    # We can provide all subCategory options grouped by masterCategory.
    # Example: A question per selected master category for its subcategories

    questions.append({
        "id": "colour_preference",
        "text": "Which colours do you prefer for your items? (Select all that apply)",
        "type": "multiple_choice",
        "options": options.get("baseColour", [])
    })
    questions.append({
        "id": "season_preference",
        "text": "Which season(s) are you primarily shopping for?",
        "type": "multiple_choice", # Can be single if preferred
        "options": options.get("season", [])
    })
    questions.append({
        "id": "usage_preference",
        "text": "What is the primary occasion or usage for these items? (Select up to 2)",
        "type": "multiple_choice",
        "options": options.get("usage", []),
        "max_selections": 2
    })
    
    # Placeholder for articleType questions, which would ideally be dynamic
    # For example, after selecting 'Apparel' and then 'Topwear', ask about T-shirts, Shirts, etc.
    # This simplified version won't have deeply nested dynamic questions generated here.
    # The API endpoint will provide all options, and the frontend can filter dynamically.

    return questions

def save_user_profile(user_id, quiz_answers):
    """Saves the user's quiz answers as a profile vector in user_profiles.json."""
    profile_vector = {
        "user_id": user_id,
        "preferences": quiz_answers # Directly store the answers for now
    }
    
    profiles = []
    if os.path.exists(USER_PROFILES_PATH) and os.path.getsize(USER_PROFILES_PATH) > 0:
        try:
            with open(USER_PROFILES_PATH, "r") as f:
                profiles = json.load(f)
        except json.JSONDecodeError:
            profiles = [] # Start fresh if file is corrupted
            
    # Remove existing profile for the user, if any, to update it
    profiles = [p for p in profiles if p.get("user_id") != user_id]
    profiles.append(profile_vector)
    
    try:
        with open(USER_PROFILES_PATH, "w") as f:
            json.dump(profiles, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving user profile: {e}")
        return False

if __name__ == "__main__":
    # Example usage:
    styles_df = load_styles_data()
    if styles_df is not None:
        quiz_opts = get_quiz_options(styles_df)
        # print("Quiz Options:", json.dumps(quiz_opts, indent=2))
        
        quiz_questions_generated = generate_quiz_questions(quiz_opts)
        print("\nGenerated Quiz Questions:", json.dumps(quiz_questions_generated, indent=2))
        
        # Simulate quiz answers for a user
        sample_user_id = "user123"
        sample_answers = {
            "gender_preference": "Women",
            "master_category_preference": ["Apparel", "Footwear"],
            # Sub-category and article-type answers would be collected based on these master categories
            "subCategory_Apparel": ["Topwear", "Dresses"],
            "articleType_Topwear": ["Tshirts"],
            "subCategory_Footwear": ["Shoes"],
            "articleType_Shoes": ["Casual Shoes"],
            "colour_preference": ["Black", "Blue", "White"],
            "season_preference": ["Summer", "Fall"],
            "usage_preference": ["Casual", "Workwear"]
        }
        
        if save_user_profile(sample_user_id, sample_answers):
            print(f"\nSuccessfully saved profile for {sample_user_id}")
            # Verify by loading
            if os.path.exists(USER_PROFILES_PATH):
                with open(USER_PROFILES_PATH, "r") as f:
                    print("Current user_profiles.json:", json.dumps(json.load(f), indent=2))
        else:
            print(f"\nFailed to save profile for {sample_user_id}")
    else:
        print("Could not load styles data to generate quiz.")


