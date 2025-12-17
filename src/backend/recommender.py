import pandas as pd
import numpy as np
import os
import re
import wikipedia
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import shutil

# Internal imports
# Assumes running from project root
from src.models.schemas import UserQuery, RecommendationItem, AgentResponse, MediaType, ToneEnum
from src.database.db_manager import DatabaseManager

load_dotenv()

class RecommenderSystem:
    def __init__(self):
        print("Initializing Recommender System...")
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY not found in env.")

        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=self.api_key)
        
        # Initialize Database Manager
        self.db = DatabaseManager()
        
        # Paths (Relative to project root)
        self.model_path = "sentence-transformers/all-MiniLM-L6-v2"
        
        print("Loading Embedding Model...")
        self.embedding_fn = HuggingFaceEmbeddings(
            model_name=self.model_path,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": False}
        )
        
        print("Loading Vectors and Dataframes...")
        # Movies
        self.movies_df = pd.read_csv("movies_with_emotion.csv")
        self._preprocess_movies()
        self.db_movies = self._get_or_create_vector_db(
            name="movies",
            persist_dir="movies_chroma_db",
            df=self.movies_df,
            text_col="combined_text",
            title_col="Title"
        )
        
        # Books
        self.books_df = pd.read_csv("goodbooks_with_emotion.csv")
        self._preprocess_books()
        self.db_books = self._get_or_create_vector_db(
            name="books",
            persist_dir="books_chroma_db",
            df=self.books_df,
            text_col="tagged_discription",
            title_col="title"
        )
        print("Initialization Complete.")

    def _get_or_create_vector_db(self, name, persist_dir, df, text_col, title_col):
        if os.path.exists(persist_dir):
            try:
                # Attempt to load existing DB
                db = Chroma(persist_directory=persist_dir, embedding_function=self.embedding_fn)
                # Simple check to see if it works (checking internal collection count or similar might be better, but this implies load success)
                # Note: Chroma() lazy loads, so we might need a real call to trigger error if file is bad
                # But for LFS pointers, usually the __init__ or first call fails. 
                # Let's try to get the collection object which usually triggers a DB read
                if db._client.list_collections():
                     print(f"Loaded existing {name} DB.")
                     return db
            except Exception as e:
                print(f"Error loading {name} DB (likely LFS pointer or corruption): {e}")
                print(f"Removing corrupted {persist_dir} and regenerating...")
                shutil.rmtree(persist_dir)
        
        print(f"Regenerating {name} DB from CSV... This may take a minute.")
        texts = df[text_col].fillna("").astype(str).tolist()
        metadatas = [{"title": str(t)} for t in df[title_col].tolist()]
        
        db = Chroma.from_texts(
            texts=texts,
            embedding=self.embedding_fn,
            metadatas=metadatas,
            persist_directory=persist_dir
        )
        print(f"Successfully generated {name} DB.")
        return db

    def _preprocess_movies(self):
        self.movies_df["large_thumbnail"] = self.movies_df["movie_cover"].str.replace("SX300", "SX600")
        self.movies_df["large_thumbnail"] = np.where(
            self.movies_df["large_thumbnail"].isna(),
            "cover_image.jpeg",
            self.movies_df["large_thumbnail"],
        )

    def _preprocess_books(self):
        is_google_link = self.books_df["thumbnail"].astype(str).str.contains("google.com/books")
        self.books_df["large_thumbnail"] = np.where(
            is_google_link,
            self.books_df["thumbnail"] + "&fife=w800",
            self.books_df["thumbnail"]
        )
        self.books_df["large_thumbnail"] = np.where(
            self.books_df["large_thumbnail"].isna(),
            "cover_image.jpeg",
            self.books_df["large_thumbnail"],
        )

    def _enhance_query(self, query: str, media_type: MediaType, model_name: str = "gemini-2.5-flash") -> str:
        context = "movie" if media_type == MediaType.movie else "book"
        prompt = f"""
        You are enhancing a user query for a semantic {context} recommendation system.
        Rewrite the input into a rich, reflective description that emphasizes emotions, themes, and character journeys.
        Do NOT mention specific titles or actors.
        User input: "{query}"
        Enhanced semantic query:
        """
        
        # Initialize specific model
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=self.api_key)
        
        try:
            # Simple fallback if rate limited:
            # If we hit a rate limit, we just use the original query instead of failing
            import time
            from google.api_core.exceptions import ResourceExhausted
            
            try:
                response = llm.invoke(prompt)
                return response.content.strip() if hasattr(response, 'content') else str(response).strip()
            except ResourceExhausted:
                print("Gemini API Quota Exceeded. Using original query fallback.")
                return query
            except Exception:
                # Retry once
                time.sleep(2)
                response = llm.invoke(prompt)
                return response.content.strip() if hasattr(response, 'content') else str(response).strip()
        except Exception as e:
            print(f"LLM Error (Fallback to original query): {e}")
            return query

    def _extract_title(self, text):
        try:
            # Try movie pattern
            match = re.search(r"Title:\s*(.*?)\. Year:", text)
            if match: return match.group(1).strip()
            # Try book pattern
            match = re.search(r'title:\s*(.*?)(;|\s*\\Z)', text, re.IGNORECASE)
            if match: return match.group(1).strip()
        except:
            pass
        return None

    def _get_wiki_desc(self, title):
        try:
            results = wikipedia.search(title)
            if not results: return "No details available."
            page = wikipedia.page(results[0], auto_suggest=False)
            return page.summary.split(".")[0] + "."
        except:
            return "No details available."

    def get_recommendations(self, user_query: UserQuery) -> AgentResponse:
        media_type = user_query.media_type
        # 1. Enhance Query
        enhanced_q = self._enhance_query(user_query.query_text, media_type, user_query.model)
        print(f"Enhanced Query: {enhanced_q}")

        # 2. Vector Search
        db = self.db_movies if media_type == MediaType.movie else self.db_books
        ref_df = self.movies_df if media_type == MediaType.movie else self.books_df
        title_col = "Title" if media_type == MediaType.movie else "title"
        
        recs = db.max_marginal_relevance_search(enhanced_q, k=100, fetch_k=1000)
        
        found_titles = []
        for rec in recs:
            t = rec.metadata.get("title")
            if not t:
                t = self._extract_title(rec.page_content)
            if t: found_titles.append(t)
            
        # 3. Filter DataFrame
        matched_df = ref_df[ref_df[title_col].isin(found_titles)].copy()
        
        # --- Apply User Filtering (Requirement: Remove hated/watched) ---
        if user_query.user_id:
            try:
                profile = self.db.get_user_profile(user_query.user_id)
                disliked_genres = [g.lower() for g in profile.get('disliked_genres', [])]
                disliked_items = [i.lower() for i in profile.get('disliked_items', [])]
                watched_items = [w.lower() for w in profile.get('watched', [])]
                
                # Filter out Disliked/Watched Items
                # Normalize title for comparison
                matched_df['lower_title'] = matched_df[title_col].astype(str).str.lower()
                
                # Exclude items in disliked or watched lists
                matched_df = matched_df[~matched_df['lower_title'].isin(disliked_items + watched_items)]
                
                # Filter out Disliked Genres
                if disliked_genres:
                    genre_col = "genre" if media_type == MediaType.movie else "categories" # Check column name for books
                    # For books it might be 'categories' or 'genre' - checking schemas or data
                    # In goodbooks_with_emotion.csv (viewed earlier), check header: ... categories ...
                    
                    if genre_col in matched_df.columns:
                        # Helper to check if any disliked genre is in the item's genre string
                        def has_disliked_genre(item_genres):
                            if pd.isna(item_genres): return False
                            item_genres_lower = str(item_genres).lower()
                            return any(dg in item_genres_lower for dg in disliked_genres)
                            
                        matched_df = matched_df[~matched_df[genre_col].apply(has_disliked_genre)]
                
                # Cleanup temp column
                if 'lower_title' in matched_df.columns:
                    matched_df.drop(columns=['lower_title'], inplace=True)
                    
            except Exception as e:
                print(f"Error applying user filters: {e}")
        # ----------------------------------------------------------------
        
        # 4. Tone Sort
        if user_query.tone != ToneEnum.all:
            tone_map = {
                ToneEnum.joy: "joy", ToneEnum.surprise: "surprise",
                ToneEnum.anger: "anger", ToneEnum.fear: "fear",
                ToneEnum.sadness: "sadness"
            }
            if col := tone_map.get(user_query.tone):
                if col in matched_df.columns:
                    matched_df.sort_values(by=col, ascending=False, inplace=True)

        # 5. Limit and Format
        final_df = matched_df.head(100) # Return top 100
        
        rec_items = []
        for _, row in final_df.iterrows():
            # Handle descriptions
            desc = row.get("overview") if media_type == MediaType.movie else row.get("description")
            if pd.isna(desc) or not str(desc).strip():
                desc = self._get_wiki_desc(row[title_col])
            
            # Use full description (User request: don't end with ...)
            # If description is too short (e.g. just a blurb), try wiki
            desc = desc if pd.notna(desc) and str(desc).strip() else ""
            if len(desc) < 150: # Threshold for "short" description fallback
                 wiki_desc = self._get_wiki_desc(row[title_col])
                 if wiki_desc and wiki_desc != "No details available.":
                     desc = wiki_desc
            
            # Author/Director/Genre
            genres = []
            if media_type == MediaType.movie:
                creator = str(row.get("genre", "Unknown"))
                # Split genre string if possible
                if creator != "Unknown":
                    genres = [g.strip() for g in creator.replace('|', ',').split(',')]
                
                try:
                    rating = float(row.get("IMDB Rating", 0.0)) if pd.notna(row.get("IMDB Rating")) else 0.0
                except:
                    rating = 0.0
                # Extract year from Title string "Movie (Year)" or use a year column if exists
                # Assuming no explict Year column based on previous code usage
                try:
                    year = int(float(row.get("releaseyear", 0))) if pd.notna(row.get("releaseyear")) else 0
                except:
                    year = 0
            else:
                creator = str(row.get("authors", "Unknown"))
                # Books have 'categories'
                cats = str(row.get("categories", "Unknown"))
                if cats != "Unknown" and pd.notna(cats):
                     # Often formatting like ['Fiction'] or Fiction, Classics
                     clean_cats = cats.replace("[", "").replace("]", "").replace("'", "").replace('"', "")
                     genres = [c.strip() for c in clean_cats.split(',')]
                
                try:
                    rating = float(row.get("average_rating", 0.0)) if pd.notna(row.get("average_rating")) else 0.0
                except:
                    rating = 0.0
                try:
                    year = int(float(row.get("published_year", 0))) if pd.notna(row.get("published_year")) else 0
                except:
                    year = 0
                
            rec_items.append(RecommendationItem(
                title=str(row[title_col]),
                author_or_director=creator,
                description=str(desc),
                thumbnail_url=str(row.get("large_thumbnail", "cover_image.jpeg")) or "cover_image.jpeg",
                explanation=f"Matches your '{user_query.tone.value}' mood request.",
                average_rating=rating,
                year=year,
                genres=genres
            ))

        return AgentResponse(
            recommendations=rec_items,
            agent_message=f"I found these {media_type.value}s based on '{user_query.query_text}' with a {user_query.tone.value} tone."
        )
