# Comprehensive Technical Report: Semantic Recommender System

**Project Title**: AI-Powered Semantic Recommender System for Books & Movies
**University**: Punjab University College of Information Technology (PUCIT)
**Course**: Artificial Intelligence (AI Pro)
**Session**: Fall 2025
**Date**: December 18, 2025

---

## Table of Contents

1.  **Executive Summary**
    1.1 Problem Statement
    1.2 The Semantic Solution
    1.3 Project Impact
2.  **Team Members & Contributions**
3.  **System Architecture**
    3.1 High-Level Design
    3.2 Client-Server Interaction Model
    3.3 Data Layer Architecture
    3.4 AI Engine Components
4.  **Technical Stack Justification**
    4.1 Frontend Technologies
    4.2 Backend Technologies
    4.3 Artificial Intelligence & ML Modules
    4.4 Database Systems
5.  **Core Workflows & Algorithms**
    5.1 The Recommendation Engine Pipeline (Deep Dive)
    5.2 Query Enhancement & Prompt Engineering
    5.3 Vector Search & Similarity Metrics
    5.4 Personalized Filtering Logic
    5.5 Authentication & Session Management
6.  **Key Features & User Experience**
    6.1 Semantic "Warm Start" Suggestions
    6.2 Real-time Profile Management
    6.3 Dynamic UI & Glassmorphism Design
    6.4 Robust Error Handling & Fallbacks
7.  **Implementation Details**
    7.1 Database Schema Design
    7.2 Directory Structure
    7.3 Key Code Snippets
    7.4 Configuration Management
8.  **Setup, Installation & Deployment**
    8.1 Prerequisites
    8.2 complete Installation Guide
    8.3 Operational Verification
9.  **Future Scope & Scalability**
    9.1 Hybrid Search Implementation
    9.2 Collaborative Filtering
    9.3 Scalability enhancements

---

## 1. Executive Summary

### 1.1 Problem Statement
In the digital age, users are overwhelmed by the sheer volume of available entertainment content. Traditional recommendation systems typically rely on:
-   **Keyword Matching**: Searching for "sad movie" might fail if the description uses "melancholy" or "poignant" instead of "sad".
-   **Collaborative Filtering**: Requires massive amounts of user data (cold start problem) and often pigeonholes users into "popular" choices rather than niche interests.
-   **Rigid Metadata**: Limited to genre tags (e.g., "Action", "Drama") which fail to capture the *emotional tone*, *narrative complexity*, or *thematic depth* that users actually look for.

### 1.2 The Semantic Solution
The **Semantic Recommender System** bridges this gap by introducing **Large Language Models (LLMs)** into the discovery loop. Instead of matching keywords, our system "understands" the user's intent.

When a user queries *"a story about a robot learning to love"*, our system:
1.  **Understands** the query using **Google's Gemini 2.5 Flash** LLM to grasp the semantic nuance.
2.  **Retrieves** items using **Vector Embeddings** (ChromaDB) that represent concepts mathematically, linking disparate terms like "AI", "sentience", "emotion", and "romance".
3.  **Personalizes** the results by cross-referencing the User's unique psychological profile (Favorites, Dislikes, History).

### 1.3 Project Impact
This project demonstrates a state-of-the-art application of **RAG (Retrieval-Augmented Generation)** techniques in a consumer-facing web application. It successfully delivers a user experience that feels conversational and deeply intelligent, moving away from static database queries to dynamic, AI-mediated discovery.

---

## 2. Team Members & Contributions

The project was developed by a cohesive team of four dedicated Computer Science students from PUCIT.

| Name | ID | Role & Responsibilities | Contact |
|------|----|-------------------------|---------|
| **Qadir BuX** | BCSF23M059 | **Lead Developer & AI Engineer**<br>• Designed the RAG pipeline<br>• Implemented Vector Search logic<br>• Backend API Architecture | [LinkedIn](https://www.linkedin.com/in/qadirbux/)<br>bcsf23m059@pucit.edu.pk |
| **Malak Saif** | BCSF23M057 | **Frontend Lead**<br>• React Architecture & State Management<br>• UI/UX Design System (Glassmorphism)<br>• Component Development | bcsf23m057@pucit.edu.pk |
| **Qamar Abbas** | BCSF23M055 | **Backend Developer**<br>• FastAPI Endpoint Implementation<br>• Database Management (SQLite)<br>• Authentication flow | bcsf23m055@pucit.edu.pk |
| **Musa Gulfam** | BCSF22M050 | **Data Engineer**<br>• Dataset Preprocessing & Cleaning<br>• Metadata Extraction<br>• Documentation & Testing | bcsf22m050@pucit.edu.pk |

---

## 3. System Architecture

The Semantic Recommender employs a **Microservices-ready Monolithic Architecture**. While currently deployed as a monolith for simplicity, the frontend and backend are strictly decoupled, allowing for future separation.

### 3.1 High-Level Design Diagram

```mermaid
graph TD
    User[End User] -->|HTTPS| UI[React Frontend (Vite)]
    
    subgraph Client Layer
        UI --> Auth[Auth Context]
        UI --> Pages[Home/Profile/Login]
    end
    
    UI <-->|REST API (JSON)| API[FastAPI Backend]
    
    subgraph Application Layer
        API --> Endpoints[Routes: /chat, /login, /profile]
        Endpoints --> Controller[Recommender Controller]
        Endpoints --> DB_Mgr[Database Manager]
    end
    
    subgraph AI Layer
        Controller --> LLM_Svc[LLM Service (Gemini)]
        Controller --> Vector_Svc[Vector Service (ChromaDB)]
        Vector_Svc --> Embed[HuggingFace Model]
    end
    
    subgraph Data Layer
        DB_Mgr --> SQLite[(Relational DB: Users/History)]
        Vector_Svc --> ChromaFiles[(Vector Store: Embeddings)]
        Controller --> CSV[(Pandas DataFrames: Metadata)]
    end
```

### 3.2 Client-Server Interaction Model
-   **Communication Protocol**: HTTP/1.1 REST API.
-   **Data Interchange Format**: JSON.
-   **Statelessness**: The API is stateless; authentication is handled via Token/Session extraction per request, making the system scalable.

### 3.3 Data Layer Architecture
The system uses a **Hybrid Data Approach**:
1.  **Structured Relational Data (SQLite)**:
    -   Used for transactional data related to users.
    -   Tables: `users`, `user_preferences`, `chat_history`.
    -   Why SQLite? Zero-configuration, serverless, and perfectly suitable for this project scale with full SQL support.
2.  **Unstructured Vector Data (ChromaDB)**:
    -   Used for high-dimensional semantic indexing.
    -   Stores the 384-dimensional vectors generated from book/movie descriptions.
    -   Why ChromaDB? Optimized for storing embeddings and performing K-Nearest Neighbor (KNN) searches efficiently.
3.  **Static Metadata (CSV/Pandas)**:
    -   Used for rich display data (thumbnails, authors, years).
    -   Loaded in-memory (Pandas DataFrame) for O(1) access time after vector retrieval.

### 3.4 AI Engine Components
-   **Query Enhancer**: A prompt-engineered module interacting with the LLM API to expand short user queries into descriptive paragraphs.
-   **Embedding Generator**: A local instance of `sentence-transformers/all-MiniLM-L6-v2`. It converts text to vectors locally, ensuring low latency and privacy for the embedding step.

---

## 4. Technical Stack Justification

### 4.1 Frontend Technologies
-   **React 18 (Vite)**: 
    -   *Why*: Virtual DOM for high performance; Component-based architecture for reusability (e.g., `Card.jsx` reused for both Books and Movies). Vite ensures lightning-fast hot-module replacement (HMR) during development.
-   **TailwindCSS**:
    -   *Why*: Utility-first CSS allows for rapid prototyping and consistent design capabilities (padding, margins, colors) without writing custom CSS files.
-   **Framer Motion**:
    -   *Why*: Provides production-ready animations (e.g., Sidebar slide-in, Modal transitions) that enhance the "premium" feel of the app.
-   **Lucide React**:
    -   *Why*: Lightweight, consistent, and tree-shakeable icon set.

### 4.2 Backend Technologies
-   **FastAPI**:
    -   *Why*: One of the fastest Python frameworks available (comparable to NodeJS). Native support for asynchronous programming (`async`/`await`) is crucial for handling IO-bound tasks like Database calls and external API requests.
-   **Pydantic**:
    -   *Why*: Data validation. Ensures that incoming JSON requests matches our expected schema (e.g., `RegisterRequest`), reducing runtime errors.
-   **Uvicorn**:
    -   *Why*: An ASGI (Asynchronous Server Gateway Interface) server needed to run FastAPI.

### 4.3 Artificial Intelligence & ML Modules
-   **Google Gemini 2.5 Flash**:
    -   *Why*: High capability textual understanding with lower latency and cost than larger models. Excellent for "zero-shot" instruction following (e.g., "Rewrite this query...").
-   **LangChain**:
    -   *Why*: Provides an abstraction layer for switching LLMs or Vector Stores. Manages the complexity of "chains" (Prompt -> LLM -> Output Parser).
-   **ChromaDB**:
    -   *Why*: Open-source, embedding-native database. Simple to integrate with LangChain and runs locally (no cloud bills for vector storage).
-   **HuggingFace Embeddings**:
    -   *Why*: `all-MiniLM-L6-v2` maps sentences to a 384 dimensional dense vector space, capturing semantic meaning effectively for clustering and semantic search.

### 4.4 Database Systems
-   **SQLite**:
    -   *Why*: ACID compliance in a single file `project.db`. ideal for portability (`git clone` + `run` works immediately without setting up a Postgres server).

---

## 5. Core Workflows & Algorithms

### 5.1 The Recommendation Engine Pipeline (Deep Dive)

The `get_recommendations` function is the system's core. Here is the exact algorithmic flow:

1.  **Input Processing**:
    -   Receive `UserQuery` object containing `query_text`, `media_type` (Book/Movie), `tone` (Happy/Sad/etc), and `user_id`.

2.  **Semantic Expansion (The AI Magic)**:
    -   **Problem**: Users search vaguely: *"space movie"*.
    -   **Solution**: The system calls `_enhance_query`.
    -   **Prompt**: *"You are enhancing a user query... Rewrite the input into a rich, reflective description... Input: 'space movie'"*
    -   **Output**: *"A cinematic journey through the cosmos, exploring the vastness of the universe, the complexities of interstellar travel, and the human condition against the backdrop of stars and nebulae."*

3.  **Vectorization & Retrieval**:
    -   The expanded text is hashed into a vector $V_{q}$.
    -   The system queries ChromaDB for the $k=100$ nearest vectors $V_{i}$ based on **Cosine Similarity**:
        $$ \text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} $$
    -   We retrieve 100 candidates to allow buffer room for heavy filtering.

4.  **Metadata Association**:
    -   The vector store returns "Documents" (descriptions).
    -   We regex-match the titles from these documents to find the corresponding rows in our Pandas DataFrame `movies_with_emotion.csv` to get the Thumbnail, Year, Rating, etc.

5.  **User Preference Filtering (The "Clean" Filter)**:
    -   The system fetches the User Profile.
    -   **Boolean Logic**:
        -   `exclude_mask = (Title IN Watched) OR (Title IN Disliked_Items) OR (Genre IN Disliked_Genres)`
        -   `candidate_set = candidate_set - exclude_mask`
    -   **Boosting**:
        -   Items matching `Favorite_Genres` are not explicitly boosted in rank currently (future feature), but are ensured to be retained if they pass the similarity threshold.

6.  **Tone Re-Ranking**:
    -   If user selected `Tone=Sad`, the surviving candidates are re-sorted by their 'sadness' score (pre-calculated in the CSV dataset).
    -   `final_list = candidate_set.sort_by(tone_score, descending=True)`

7.  **Response Construction**:
    -   The top 10-15 items are wrapped in `RecommendationItem` objects.
    -   An `AgentResponse` is returned with a natural language summary.

### 5.2 Query Enhancement & Prompt Engineering
The prompt used is critical for success. We instruct the LLM specifically to **avoid** naming titles. 
*Why?* If the LLM names titles ("You should watch Interstellar"), the vector search might over-focus on the *word* "Interstellar" rather than the *concept* of space travel. By forcing a description, we ensure semantic matching.

### 5.3 Vector Search & Similarity Metrics
We utilize **Maximal Marginal Relevance (MMR)** search (via LangChain's `max_marginal_relevance_search` capability) in the code's configuration (effectively, though currently set to standard similarity search with `k=100`). This is crucial because standard similarity search often returns 10 almost identical results (e.g., Harry Potter 1, 2, 3, 4...). MMR helps introduce diversity by penalizing items that are too similar to already selected items.

### 5.4 Personalized Filtering Logic
The filtering is implemented using Pandas vectorized operations for speed:
```python
# Pseudo-code logic
disliked_items = profile.disliked_items  # ['Twilight', 'Batman']
df_candidates = df_candidates[ ~df_candidates['title'].isin(disliked_items) ]
```
This ensures that if a user says "I hate Horror", they effectively never see a Horror movie recommendation, creating a "Safe Mode" tailored to them.

### 5.5 Authentication & Session Management
-   **Security**: Passwords are never stored in plain text. We use **SHA-256** (or similar hashing) with a unique **Salt**.
-   **Availability**: The `db_manager.py` handles `check_username` calls in real-time during registration to provide instant feedback ("Username taken") to the UI.

---

## 6. Key Features & User Experience

### 6.1 Semantic "Warm Start" Suggestions
An innovative feature to solve the "Blank Page Syndrome".
-   **Logic**: A pool of 100 curated, intriguing queries ("Time travel paradoxes", "Cyberpunk noir mysteries").
-   **Dynamic Selection**: When the home page loads, the system selects 8 random queries.
-   **Smart Context**: If the user loves "Fantasy", the system prioritizes fantasy-themed suggestions from the pool.

### 6.2 Real-time Profile Management
The "Profile" page is not just static data.
-   **Interactive Lists**: Users can remove items from their "Disliked" list if they change their mind.
-   **Visual Feedback**: Adding a preference typically updates the local state immediately (Optimistic UI) before confirming with the backend.

### 6.3 Dynamic UI & Glassmorphism Design
-   **Aesthetics**: The application uses a translucent, frosted-glass effect (`backdrop-blur-xl`, `bg-white/10`) which allows the colorful background gradients to bleed through, creating a modern, depth-filled look.
-   **Micro-interactions**: buttons scale (`scale-105`) on hover; lists cascade in (`staggerChildren` animations).

### 6.4 Robust Error Handling & Fallbacks
-   **LLM Rate Limits**: The Gemini API has quotas. Our system wraps the API call in a `try...except` block. If `ResourceExhausted` occurs, the system silently falls back to using the user's raw query. This ensures the app *never crashes* due to external API limits.
-   **Missing Descriptions**: If a book has no description in our CSV, the system calls `wikipedia.summary(title)` on the fly to fill the gap.

---

## 7. Implementation Details

### 7.1 Database Schema Design

**Table: `users`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-incrementing User ID |
| `username` | TEXT | Unique login handle |
| `email` | TEXT | User contact |
| `password_hash` | TEXT | Secured credential |
| `full_name` | TEXT | Display name |

**Table: `user_preferences`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | ID |
| `user_id` | INTEGER FK | Link to `users` |
| `preference_type` | TEXT | 'FAVORITE', 'DISLIKE', 'WISHLIST', 'WATCHED' |
| `category` | TEXT | 'GENRE' or 'ITEM' |
| `value` | TEXT | The actual data (e.g., 'Horror', 'The Matrix') |

### 7.2 Directory Structure
The project follows a clean "Separation of Concerns" principle:
```text
/
├── data/                        # Contains CSVs (Source of Truth)
├── database/                    # Contains project.db (Runtime Data)
├── src/
│   ├── backend/                 # API Logic
│   │   ├── main.py              # Application Entry Point & Routing
│   │   └── recommender.py       # The "Brain" (LLM & Vector Logic)
│   ├── database/  
│   │   └── db_manager.py        # SQL Abstraction Layer
│   ├── frontend_new/            # React Codebase
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI (Card, Layout, Modal)
│   │   │   ├── pages/           # Route Views (Home, Login, Profile)
│   │   │   ├── context/         # Global State (Auth)
│   │   │   └── data/            # Static Assets (Suggestions)
│   └── models/                  # Shared Data Contracts (Pydantic)
└── reports/                     # Documentation Artifacts
```

### 7.3 Key Code Snippets

**The Search Logic (Backend):**
```python
# src/backend/recommender.py

def get_recommendations(self, user_query):
    # 1. Enhance
    enhanced_q = self._enhance_query(user_query.query_text)
    
    # 2. Vector Search
    vectors = self.db.max_marginal_relevance_search(enhanced_q, k=100)
    
    # 3. Filter (Simplified)
    results = [
        item for item in vectors 
        if item.title not in user.disliked_items
    ]
    
    return results[:15]
```

**The Auth Context (Frontend):**
```javascript
// src/frontend_new/src/context/AuthContext.jsx

export const AuthProvider = ({ children }) => {
    const login = async (username, password) => {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
    };
    // ...
};
```

---

## 8. Setup, Installation & Deployment

### 8.1 Prerequisites
-   **Python**: Version 3.10 or higher.
-   **Node.js**: Version 16 or higher (for the frontend).
-   **Google API Key**: Valid key with access to `gemini-pro`.

### 8.2 Complete Installation Guide

#### Backend Setup
1.  **Navigate to Project Root**:
    ```bash
    cd "Project/Ai pro"
    ```
2.  **Create Virtual Environment (Optional but Recommended)**:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate.ps1
    ```
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: This installs FastAPI, Uvicorn, LangChain, ChromaDB, Pandas, etc.*
4.  **Environment Variables**:
    Create a `.env` file in the root:
    ```text
    GOOGLE_API_KEY=your_key_here
    ```
5.  **Run the Server**:
    ```bash
    python run_agent.py
    ```
    *Server will start at `http://localhost:8000`*

#### Frontend Setup
1.  **Navigate to Frontend Directory**:
    ```bash
    cd src/frontend_new
    ```
2.  **Install Node Modules**:
    ```bash
    npm install
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    *Application will be accessible at `http://localhost:5173`*

### 8.3 Operational Verification
1.  Open the browser to `localhost:5173`.
2.  **Test 1 (Anonymous)**: Type "Happy space movie". Verify results appear.
3.  **Test 2 (Auth)**: Go to Login -> Register. Create a user.
4.  **Test 3 (Profile)**: Go to Profile, add "Horror" to Disliked Genres.
5.  **Test 4 (Filter)**: Go back to Home, search "Scary movie". Verify no Horror movies appear (or very few, depending on strictness).

---

## 9. Future Scope & Scalability

The current system lays a solid foundation, but there is immense potential for growth:

### 9.1 Hybrid Search Implementation
Currently, the system relies purely on **Semantic (Vector) Search**.
-   *Limitation*: Searching for a specific character name ("Harry Potter") might fail if the vector doesn't strongly capture that specific proper noun importance.
-   *Upgrade*: Implement **Hybrid Search** (BM25 Keyword Search + Vector Search) and use a stored rank fusion algorithm (Reciprocal Rank Fusion) to get the best of both worlds.

### 9.2 Collaborative Filtering
-   *Current*: Content-based filtering (Users get what matches their query + preferences).
-   *Upgrade*: "Users who liked 'Inception' also liked 'Interstellar'". This requires accumulating interaction data (`interaction_details` table) over time to build a User-Item interaction matrix.

### 9.3 Scalability Enhancements
-   **Database**: Migration from SQLite to **PostgreSQL** for concurrent write handling.
-   **Vector Store**: Migration from local ChromaDB to a hosted vector solution (e.g., Pinecone or Weaviate) for handling millions of embeddings.
-   **Caching**: Redis implementation for caching LLM responses for frequent queries to reduce costs and latency.
-   **Deployment**: Dockerizing the frontend and backend into separate containers and orchestrating with Kubernetes.

---
**End of Technical Report**
