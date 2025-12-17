import sqlite3
import os
import json
from typing import List, Optional, Dict, Any
import hashlib
from datetime import datetime

# Use absolute path relative to this file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "project.db")

class DatabaseManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        # Ensure database directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._ensure_schema()

    def _ensure_schema(self):
        """Ensures the schema is up to date."""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # 1. Create Users Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                full_name TEXT,
                profile_image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 2. Create Interaction Logs Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS interaction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                query_text TEXT,
                tone TEXT,
                media_type TEXT,
                agent_response TEXT,
                recommendations TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        # 3. Create User Profile Table (Preferences)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                preference_type TEXT,
                item_value TEXT,
                category TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        # Check if users table has email and full_name
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'email' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if 'full_name' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
        if 'profile_image' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
            
        # Check interaction_logs for recommendations
        cursor.execute("PRAGMA table_info(interaction_logs)")
        log_columns = [info[1] for info in cursor.fetchall()]
        if 'recommendations' not in log_columns:
            cursor.execute("ALTER TABLE interaction_logs ADD COLUMN recommendations TEXT")

        conn.commit()
        conn.close()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def register_user(self, username, password, email=None, full_name=None):
        """Registers a new user. Returns user_id if successful, None if username exists."""
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, password_hash, email, full_name) VALUES (?, ?, ?, ?)", 
                (username, password_hash, email, full_name)
            )
            conn.commit()
            user_id = cursor.lastrowid
            return user_id
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()

    def authenticate_user(self, username, password):
        """Verifies user credentials. Returns user_id if valid, None otherwise."""
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, full_name, profile_image FROM users WHERE username = ? AND password_hash = ?", (username, password_hash))
        result = cursor.fetchone()
        conn.close()
        return {"id": result[0], "username": result[1], "email": result[2], "full_name": result[3], "profile_image": result[4]} if result else None

    def check_username(self, username):
        """Checks if a username is available. Returns True if available (not taken)."""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
        exists = cursor.fetchone()
        conn.close()
        return not exists

    def log_interaction(self, user_id: int, query_text: str, tone: str, media_type: str, agent_response: str, recommendations: List[Dict] = None):
        """Logs the specific interaction for auditing (Requirement C)."""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        recs_json = json.dumps(recommendations) if recommendations else None
        
        cursor.execute(
            "INSERT INTO interaction_logs (user_id, query_text, tone, media_type, agent_response, recommendations) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, query_text, tone, media_type, agent_response, recs_json)
        )
        conn.commit()
        conn.close()

    def add_preference(self, user_id: int, preference_type: str, item_value: str, category: str):
        """Adds a preference (FAVORITE/DISLIKE) to user profile (Requirement B - Memory)."""
        conn = self._get_conn()
        cursor = conn.cursor()
        # Avoid duplicates
        cursor.execute(
            "SELECT id FROM user_profile WHERE user_id = ? AND preference_type = ? AND item_value = ?",
            (user_id, preference_type, item_value)
        )
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO user_profile (user_id, preference_type, item_value, category) VALUES (?, ?, ?, ?)",
                (user_id, preference_type, item_value, category)
            )
            conn.commit()
        conn.close()

    def remove_preference(self, user_id: int, preference_type: str, item_value: str):
        """Removes a preference from user profile."""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM user_profile WHERE user_id = ? AND preference_type = ? AND item_value = ?",
            (user_id, preference_type, item_value)
        )
        conn.commit()
        conn.commit()
        conn.close()

    def update_user_profile(self, user_id, full_name=None, email=None, profile_image=None):
        """Updates user profile details."""
        conn = self._get_conn()
        cursor = conn.cursor()
        
        fields = []
        values = []
        if full_name:
            fields.append("full_name = ?")
            values.append(full_name)
        if email:
            fields.append("email = ?")
            values.append(email)
        if profile_image:
            fields.append("profile_image = ?")
            values.append(profile_image)
            
        if not fields:
            return False
            
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        
        try:
            cursor.execute(query, tuple(values))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating profile: {e}")
            return False
        finally:
            conn.close()

    def get_user_profile(self, user_id: int):
        """Retrieves raw profile data (favorites/dislikes)."""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT preference_type, item_value, category FROM user_profile WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        profile = {
            "favorite_genres": [],
            "favorite_items": [],
            "disliked_genres": [],
            "disliked_items": [],
            "wishlist": [],
            "watched": []
        }
        
        for p_type, val, cat in rows:
            is_genre = cat == 'genre' or cat is None # Assume genre if unspecified for legacy, or explicitly 'genre'
            # Actually, Home.jsx sets 'movie'/'book'. If we update Signup to set 'genre', we can distinguish.
            
            if p_type == "FAVORITE":
                if cat == 'genre':
                    profile["favorite_genres"].append(val)
                else:
                    profile["favorite_items"].append(val)
            elif p_type == "DISLIKE":
                if cat == 'genre':
                    profile["disliked_genres"].append(val)
                else: 
                    # Assume anything NOT genre is an item (movie/book)
                    profile["disliked_items"].append(val)
            elif p_type == "WISHLIST":
                profile["wishlist"].append(val)
            elif p_type == "WATCHED":
                profile["watched"].append(val)
        return profile

    def get_chat_history(self, user_id: int):
        """Retrieves last 20 chat interactions for Sidebar."""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, query_text, tone, media_type, timestamp FROM interaction_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        history = []
        for r in rows:
            history.append({
                "id": r[0],
                "query": r[1],
                "tone": r[2],
                "mode": r[3],
                "time": r[4]
            })
        return history

    def get_interaction_details(self, interaction_id: int):
        """Retrieves full details for a specific interaction."""
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, query_text, tone, media_type, agent_response, recommendations, timestamp FROM interaction_logs WHERE id = ?",
            (interaction_id,)
        )
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
            
        return {
            "id": row[0],
            "query_text": row[1],
            "tone": row[2],
            "media_type": row[3],
            "agent_message": row[4],
            "recommendations": json.loads(row[5]) if row[5] else [],
            "timestamp": row[6]
        }
