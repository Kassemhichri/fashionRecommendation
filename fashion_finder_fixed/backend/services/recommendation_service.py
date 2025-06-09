# recommendation_service.py

import pandas as pd
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

STYLES_CSV_PATH_ALT = "/home/ubuntu/fashion_finder/FashionFinder-1/attached_assets/data/styles.csv"
USER_PROFILES_PATH = "/home/ubuntu/fashion_finder/FashionFinder-1/backend/data/user_profiles.json"
INTERACTIONS_PATH = "/home/ubuntu/fashion_finder/FashionFinder-1/backend/data/interactions.json"

def load_data():
    """Loads styles, user profiles, and interactions data."""
    styles_df = None
    user_profiles = []
    interactions = []
    try:
        styles_df = pd.read_csv(STYLES_CSV_PATH_ALT)
        for col in ["gender", "masterCategory", "subCategory", "articleType", "baseColour", "season", "usage", "productDisplayName"]:
            if col in styles_df.columns:
                styles_df[col] = styles_df[col].fillna("")
            else:
                print(f"Warning: Column {col} not found in styles.csv")
        styles_df.dropna(subset=["id"], inplace=True)
        styles_df["id"] = styles_df["id"].astype(str)
    except Exception as e:
        print(f"Error loading styles.csv: {e}")
        # Allow to proceed if other files load

    try:
        if os.path.exists(USER_PROFILES_PATH) and os.path.getsize(USER_PROFILES_PATH) > 0:
            with open(USER_PROFILES_PATH, "r") as f:
                user_profiles = json.load(f)
        else:
            print(f"Info: {USER_PROFILES_PATH} not found or empty. Starting with no user profiles.")
            user_profiles = []
    except Exception as e:
        print(f"Error loading user_profiles.json: {e}")
        user_profiles = []

    try:
        if os.path.exists(INTERACTIONS_PATH) and os.path.getsize(INTERACTIONS_PATH) > 0:
            with open(INTERACTIONS_PATH, "r") as f:
                interactions = json.load(f)
        else:
            print(f"Info: {INTERACTIONS_PATH} not found or empty. Starting with no interactions.")
            interactions = []
    except Exception as e:
        print(f"Error loading interactions.json: {e}")
        interactions = []
        
    return styles_df, user_profiles, interactions

def create_item_features(styles_df):
    """Creates TF-IDF features for items based on their attributes."""
    if styles_df is None or styles_df.empty:
        print("Error: styles_df is None or empty in create_item_features.")
        return None, None

    styles_df["combined_features"] = styles_df["gender"] + " " + \
                                   styles_df["masterCategory"] + " " + \
                                   styles_df["subCategory"] + " " + \
                                   styles_df["articleType"] + " " + \
                                   styles_df["baseColour"] + " " + \
                                   styles_df["season"] + " " + \
                                   styles_df["usage"] + " " + \
                                   styles_df["productDisplayName"]
    
    tfidf_vectorizer = TfidfVectorizer(stop_words="english", min_df=2)
    try:
        item_features_matrix = tfidf_vectorizer.fit_transform(styles_df["combined_features"])
    except ValueError as ve:
        print(f"ValueError during TF-IDF fit_transform: {ve}. This might happen if vocabulary is empty after min_df filtering.")
        # Fallback: Try without min_df if it fails, or return None
        tfidf_vectorizer = TfidfVectorizer(stop_words="english")
        try:
            item_features_matrix = tfidf_vectorizer.fit_transform(styles_df["combined_features"])
        except Exception as e_fallback:
            print(f"Fallback TF-IDF also failed: {e_fallback}")
            return None, None
            
    return item_features_matrix, tfidf_vectorizer

def record_interaction(user_id, item_id, interaction_type, interactions_list):
    """Records a new user interaction and saves it."""
    new_interaction = {"user_id": user_id, "item_id": str(item_id), "type": interaction_type}
    
    # Avoid duplicate interactions if desired, or allow multiple (e.g. re-liking)
    # For simplicity, we append. A more robust system might update existing or check timestamps.
    interactions_list.append(new_interaction)
    try:
        with open(INTERACTIONS_PATH, "w") as f:
            json.dump(interactions_list, f, indent=4)
        print(f"Interaction recorded: User {user_id} {interaction_type} item {item_id}")
        return True
    except Exception as e:
        print(f"Error saving interactions.json: {e}")
        # Optionally remove the interaction from list if save fails
        interactions_list.pop()
        return False

def create_user_profile_vector(user_quiz_answers, user_id, interactions, styles_df, tfidf_vectorizer):
    """Creates a TF-IDF vector for a user based on quiz answers and liked items."""
    if not hasattr(tfidf_vectorizer, "transform") or styles_df is None:
        return None

    profile_texts = []
    # 1. From Quiz Answers
    if user_quiz_answers:
        preferred_gender = user_quiz_answers.get("gender_preference", "")
        preferred_master_categories = user_quiz_answers.get("master_category_preference", [])
        # ... (include all quiz fields as before)
        preferred_sub_categories_apparel = user_quiz_answers.get("subCategory_Apparel", [])
        preferred_sub_categories_footwear = user_quiz_answers.get("subCategory_Footwear", [])
        preferred_article_types_topwear = user_quiz_answers.get("articleType_Topwear", [])
        preferred_article_types_shoes = user_quiz_answers.get("articleType_Shoes", [])
        preferred_colours = user_quiz_answers.get("colour_preference", [])
        preferred_seasons = user_quiz_answers.get("season_preference", [])
        preferred_usages = user_quiz_answers.get("usage_preference", [])

        quiz_profile_text = f"{preferred_gender} " \
                            f"{' '.join(preferred_master_categories)} " \
                            f"{' '.join(preferred_sub_categories_apparel)} " \
                            f"{' '.join(preferred_sub_categories_footwear)} " \
                            f"{' '.join(preferred_article_types_topwear)} " \
                            f"{' '.join(preferred_article_types_shoes)} " \
                            f"{' '.join(preferred_colours)} " \
                            f"{' '.join(preferred_seasons)} " \
                            f"{' '.join(preferred_usages)}"
        quiz_profile_text = quiz_profile_text.replace("  ", " ").strip()
        if quiz_profile_text:
            profile_texts.append(quiz_profile_text)

    # 2. From Liked Items
    liked_item_features_text = ""
    if interactions:
        user_liked_items = [inter["item_id"] for inter in interactions if inter["user_id"] == user_id and inter["type"] == "like"]
        if user_liked_items:
            liked_items_df = styles_df[styles_df["id"].isin(user_liked_items)]
            if not liked_items_df.empty:
                # Use a sample or all liked items. Using all for now.
                liked_item_features_text = " ".join(liked_items_df["combined_features"].tolist())
    
    if liked_item_features_text:
        profile_texts.append(liked_item_features_text)

    if not profile_texts:
        # Return a zero vector if no preferences from quiz or likes
        return np.zeros((1, tfidf_vectorizer.idf_.shape[0]))
    
    combined_profile_text = " ".join(profile_texts).strip()
    if not combined_profile_text:
        return np.zeros((1, tfidf_vectorizer.idf_.shape[0]))
        
    user_vector = tfidf_vectorizer.transform([combined_profile_text])
    return user_vector

def get_content_based_recommendations(user_id, styles_df, item_features_matrix, user_profiles, interactions, tfidf_vectorizer, top_n=10):
    """Generates content-based recommendations for a user, considering interactions."""
    if styles_df is None or item_features_matrix is None or user_profiles is None or interactions is None or tfidf_vectorizer is None:
        print("Missing data for recommendations")
        return []

    user_profile_data = next((p for p in user_profiles if p.get("user_id") == user_id), None)
    user_quiz_answers = user_profile_data.get("preferences") if user_profile_data else {}

    # If no quiz profile, rely solely on liked items (or popular if no likes either)
    if not user_quiz_answers and not any(inter["user_id"] == user_id and inter["type"] == "like" for inter in interactions):
        print(f"No profile or likes for user {user_id}. Recommending popular/random items.")
        return styles_df.sample(min(top_n, len(styles_df)))["id"].tolist() if not styles_df.empty else []

    user_vector = create_user_profile_vector(user_quiz_answers, user_id, interactions, styles_df, tfidf_vectorizer)

    if user_vector is None or user_vector.sum() == 0:
        print(f"Could not create a valid profile vector for user {user_id}. Recommending popular/random items.")
        return styles_df.sample(min(top_n, len(styles_df)))["id"].tolist() if not styles_df.empty else []

    cosine_similarities = cosine_similarity(user_vector, item_features_matrix)
    similarity_scores = cosine_similarities[0]
    
    # Filter out items already interacted with by the user
    user_interacted_items = {inter["item_id"] for inter in interactions if inter["user_id"] == user_id}
    
    # Create a DataFrame for easy filtering and sorting
    recs_df = pd.DataFrame({
        "item_id": styles_df["id"],
        "score": similarity_scores
    })
    recs_df = recs_df[~recs_df["item_id"].isin(user_interacted_items)] # Exclude interacted items
    recs_df = recs_df.sort_values(by="score", ascending=False)
    
    recommended_item_ids = recs_df.head(top_n)["item_id"].tolist()
    
    return recommended_item_ids


if __name__ == "__main__":
    styles_df, user_profiles, interactions_list = load_data()
    
    if styles_df is not None:
        item_features, tfidf_vec = create_item_features(styles_df)
        
        if item_features is not None and tfidf_vec is not None:
            print(f"Item features matrix shape: {item_features.shape}")
            # print(f"TF-IDF vocabulary: {tfidf_vec.get_feature_names_out()[:50]}") # Print some vocab terms

            sample_user_id = "user123" # Assumes this user has a profile from quiz_generator.py
            if not any(p.get("user_id") == sample_user_id for p in user_profiles):
                print(f"Profile for {sample_user_id} not found. Run quiz_generator.py or add manually.")
            else:
                print(f"\n--- Initial Recommendations for {sample_user_id} (before new interaction) ---")
                initial_recs = get_content_based_recommendations(sample_user_id, styles_df, item_features, user_profiles, interactions_list, tfidf_vec, top_n=5)
                print(f"Recommendations: {initial_recs}")
                if initial_recs:
                    print(styles_df[styles_df["id"].isin(initial_recs)][["id", "productDisplayName", "baseColour"]])

                # Simulate a user interaction (e.g., liking an item)
                # Let's pick an item that was NOT in the initial recommendations to see effect
                all_item_ids = styles_df["id"].tolist()
                liked_item_id = None
                for item_id_candidate in all_item_ids:
                    if item_id_candidate not in initial_recs and item_id_candidate not in [inter["item_id"] for inter in interactions_list if inter["user_id"] == sample_user_id]:
                        liked_item_id = item_id_candidate
                        break
                
                if liked_item_id:
                    print(f"\n--- Simulating {sample_user_id} liking item {liked_item_id} ---")
                    liked_item_details = styles_df[styles_df["id"] == liked_item_id][["productDisplayName", "combined_features"]].iloc[0]
                    print(f"Liked item: {liked_item_details['productDisplayName']}")
                    # print(f"Liked item features: {liked_item_details['combined_features']}")
                    
                    record_interaction(sample_user_id, liked_item_id, "like", interactions_list)
                    
                    # Get recommendations again AFTER the interaction
                    print(f"\n--- Recommendations for {sample_user_id} (after liking item {liked_item_id}) ---")
                    updated_recs = get_content_based_recommendations(sample_user_id, styles_df, item_features, user_profiles, interactions_list, tfidf_vec, top_n=5)
                    print(f"Updated Recommendations: {updated_recs}")
                    if updated_recs:
                        print(styles_df[styles_df["id"].isin(updated_recs)][["id", "productDisplayName", "baseColour"]])
                        if liked_item_id in updated_recs:
                            print(f"Note: Liked item {liked_item_id} is in new recommendations (but should be filtered out if already interacted). Let's check filtering.")
                            # The get_content_based_recommendations should filter it. If it appears, there's a bug in filtering.
                else:
                    print("Could not find a suitable item to simulate liking.")

            # Test user with no quiz profile, but with likes
            test_user_likes_only = "user_likes_only"
            # Ensure this user is not in user_profiles.json from quiz
            user_profiles_temp = [p for p in user_profiles if p.get("user_id") != test_user_likes_only]
            # Add some interactions for this user
            if styles_df is not None and not styles_df.empty:
                items_to_like_for_test = styles_df.sample(2)["id"].tolist()
                for item_to_like in items_to_like_for_test:
                     record_interaction(test_user_likes_only, item_to_like, "like", interactions_list)
            
            print(f"\n--- Recommendations for {test_user_likes_only} (likes only, no quiz profile) ---")       
            recs_likes_only = get_content_based_recommendations(test_user_likes_only, styles_df, item_features, user_profiles_temp, interactions_list, tfidf_vec, top_n=3)
            print(f"Recommendations for {test_user_likes_only}: {recs_likes_only}")
            if recs_likes_only:
                print(styles_df[styles_df["id"].isin(recs_likes_only)][["id", "productDisplayName"]])

        else:
            print("Failed to create item features or TF-IDF vectorizer.")
    else:
        print("Failed to load styles data, cannot proceed with recommendation tests.")


