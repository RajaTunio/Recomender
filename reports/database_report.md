# Database Report: `project.db`

**File Location:** `database/project.db`
**Status:** ✅ **Active & Healthy**

## Summary
- **Type:** SQLite 3
- **Tables Found:** 4
- **Users Registered:** 1

## Schema & Data Inspection

### 1. Table: `users`
Stores user credentials.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
**Row Count:** 1
**Sample Data:**
| id | username | created_at |
| :--- | :--- | :--- |
| 1 | qadirbux | 2025-12-16 13:16:48 |

---

### 2. Table: `interaction_logs`
Stores history of user queries and agent responses.

```sql
CREATE TABLE interaction_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    query_text TEXT,
    media_type TEXT,
    tone TEXT,
    agent_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
```
**Row Count:** 1
**Sample Data:**
- **User ID:** 1
- **Query:** "Story of robbery"
- **Response:** "I found these movies based on 'Story of robbery' with a All tone."

---

### 3. Table: `user_profile`
Stores user preferences (e.g., favorite genres, disliked items).

```sql
CREATE TABLE user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    preference_type TEXT,  -- 'FAVORITE', 'DISLIKE', 'WISHLIST'
    item_value TEXT,       -- e.g., 'Horror' or 'The Matrix'
    category TEXT,         -- 'GENRE' or 'TITLE'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
```
**Row Count:** 0 *(No preferences set yet)*

---

## Recommendations for Viewing
To view this database with a Graphical User Interface (GUI), you can:

1.  **VS Code Extension:** Install **"SQLite Viewer"** in VS Code.
2.  **Standalone App:** Install **[DB Browser for SQLite](https://sqlitebrowser.org/)** (Open Source, Free).
