
import sys
import os
import pandas as pd
from src.backend.recommender import RecommenderSystem
from src.models.schemas import UserQuery, ToneEnum, MediaType

# Fix encoding
sys.stdout.reconfigure(encoding='utf-8')

# Mock LLM to avoid rate limits
def mock_enhance_query(self, query, media_type, model_name="gemini-2.5-flash"):
    print(f"   [Mock LLM] Returning original query: {query}")
    return query

RecommenderSystem._enhance_query = mock_enhance_query

def verify_emotion_sorting():
    print("Initializing Recommender...")
    # Initialize implementation
    rec_sys = RecommenderSystem()
    
    # Test case: Sad books
    print("\nTesting SAD tone for books...")
    query = UserQuery(
        query_text="stories about life struggles",
        tone=ToneEnum.sadness,
        media_type=MediaType.book,
        model="gemini-2.5-flash"
    )
    
    response = rec_sys.get_recommendations(query)
    
    print(f"\nTop 5 Recommendations for SAD tone:")
    for i, item in enumerate(response.recommendations[:5]):
        print(f"{i+1}. {item.title} (Year: {item.year})")
        
        # Verify against the dataframe
        book_row = rec_sys.books_df[rec_sys.books_df['title'] == item.title]
        if not book_row.empty:
            sad_score = book_row.iloc[0]['sadness']
            print(f"   Sadness Score: {sad_score}")
        else:
            print("   Could not find in DF to verify score")

    # Test case: Happy movies
    print("\nTesting HAPPY tone for movies...")
    query_movie = UserQuery(
        query_text="fun family adventure",
        tone=ToneEnum.joy,
        media_type=MediaType.movie,
        model="gemini-2.5-flash"
    )
    
    response_movie = rec_sys.get_recommendations(query_movie)
    print(f"\nTop 5 Recommendations for HAPPY tone:")
    for i, item in enumerate(response_movie.recommendations[:5]):
        print(f"{i+1}. {item.title} (Year: {item.year})")
        # Verify against movie dataframe
        movie_row = rec_sys.movies_df[rec_sys.movies_df['Title'] == item.title]
        if not movie_row.empty:
            joy_score = movie_row.iloc[0]['joy']
            print(f"   Joy Score: {joy_score}")
        else:
            print("   Could not find in DF to verify score")

if __name__ == "__main__":
    verify_emotion_sorting()
