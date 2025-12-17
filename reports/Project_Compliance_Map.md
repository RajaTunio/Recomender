# Project Compliance Map: AI Agent Semester Project

This document demonstrates how the **Personalized Recommendation Agent** fulfills every specific requirement outlined in the "AI Agent Semester Project" Guidelines.

---

## 1. Project Overview Compliance
**Requirement**: "Design and implement an AI-based intelligent agent that interacts with data, performs reasoning, and generates meaningful outputs."
*   **Our Solution**: The Agent interacts with a vector database of Books/Movies (Data), uses an LLM to reason about user emotional intent and profile alignment (Reasoning), and generates personalized recommendation lists (Outputs).

---

## 2. Requirements Compliance

### A. Data Source / Dataset
**Requirement**: "Retrieve or load data from at least one source (API, CSV, DB)... Support at least 3 types of queries."
*   **Implementation**:
    1.  **Sources**: `goodbooks3.csv` and `movies_with_emotion.csv` loaded into **ChromaDB** (Vector Database).
    2.  **Query Types**:
        *   **Semantic Search**: "Find me a movie about hope and redemption."
        *   **Categorical Filter**: "Show me only 'Happy' movies."
        *   **Contextual/Profile Query**: "Find books compatible with my hatred for Horror."

### B. Reasoning or Analytics Features (Select 4)
**Requirement**: "Must implement at least four (4). Agent Memory is mandatory."

| # | Selected Feature | Implementation Details |
| :--- | :--- | :--- |
| **1** | **Agent Memory (Mandatory)** | **Long-term**: Storing User Profile (Favorites, Dislikes) in SQLite. <br> **Short-term**: Maintaining conversation context in Gradio Chat Interface. |
| **2** | **Recommendation System** | **Hybrid RAG**: Combining Vector Search (semantic similarity) with Rule-based Filtering (removing User's disliked genres) and LLM Re-ranking. |
| **3** | **LLM-based Explanation** | **Justification**: The Agent won't just list titles; it will explain *why* a book fits the user's specific emotional query (e.g., "I chose this because you asked for 'uplifting' stories..."). |
| **4** | **Gap Identification** | **Profile Analysis**: The Agent analyzes the user's history to identify genres they *haven't* explored and actively suggests them (e.g., "You read a lot of Sci-Fi; have you considered trying a Biography?"). |

### C. Database / Storage Component
**Requirement**: "Use SQLite or PostgreSQL to store Logs, Outputs, User queries, Decisions."
*   **Implementation**: **SQLite** Database (`project_data.db`).
    *   **`users` table**: Authentication data.
    *   **`interaction_logs` table**: Stores every prompt sent by the user and the agent's response for audit/grading.
    *   **`user_profile` table**: Stores persistent "Favorites" and "Blocked Tags".

### D. Validation Layer (Pydantic Models)
**Requirement**: "All major outputs must pass through Pydantic validation... At least two models."
*   **Implementation**:
    1.  **`UserInputSchema`**: Validates that user queries are safe string length and contain valid "Mood" parameters.
    2.  **`RecommendationResponseSchema`**: Enforces that every recommendation output strictly contains a Title, Author, Confidence Score, and Explanation, preventing malformed UI updates.

### E. User Interface
**Requirement**: "Streamlit, Web API, or Chat-style interface."
*   **Implementation**: **Web API (FastAPI)** with a Custom **HTML/CSS/JS** Chat Interface. This fulfills the "Web API" option and allows for the specific "ChatGPT-like" design requested (Sidebar history, Toggle inputs).

---

## 3. Deliverables Compliance

### A. Source Code Folder Structure
We have reorganized the project to match the requirement:
*   `src/backend`: FastAPI logic (`main.py`, `routers/`).
*   `src/frontend`: HTML/CSS/JS files.
*   `data/`: CSV datasets (`goodbooks3.csv`).
*   `database/`: SQLite file (`project.db`).
*   `models/`: Pydantic schemes (`schemas.py`).

### B. Technical Report Support
*   **Architecture**: We provide a clear RAG (Retrieval-Augmented Generation) architecture.
*   **DB Schema**: Documented generic/relational schema for SQLite.
*   **Validation**: Validation failures are logged, providing evidence for the report.

### D. Live Demonstration Capability
*   **Real-time execution**: The script runs locally with fast inference.
*   **Logging**: We can open the SQLite file during the demo to show real-time rows being added as we chat.
*   **Reasoning**: We can explicitly demonstrate the "Gap Identification" feature by asking "What should I try new?"

---

## 4. Evaluation Rubric Target

*   **Functionality (30)**: Complete end-to-end flow (Login -> Chat -> Rec -> Log).
*   **AI Analysis (10)**: Use of Gemini LLM for *generating* explanations, not just retrieving.
*   **DB Logging (10)**: Comprehensive logging strategy implemented in `database/`.
*   **Code Quality (10)**: Modularized structure (`src/`, `models/`) instead of monolithic script.
