# Ultimate Recommendation System - Project Documentation

## 1. Project Overview
This project is a **Dual-Domain Recommendation System** built with Python. It provides personalized recommendations for both **Movies** and **Books** using a combination of **Semantic Search** (Vector Embeddings) and **Emotional Tone Filtering**.

The system features a web-based user interface powered by **Gradio**, where users can input natural language queries (e.g., "A story about forgiveness") and select a desired emotional tone (e.g., "Happy", "Suspenseful").

## 2. Technical Stack
The project leverages a modern AI/ML stack:
*   **Language**: Python
*   **User Interface**: [Gradio](https://www.gradio.app/) (Web UI with Tabs for Movies and Books)
*   **Vector Database**: [ChromaDB](https://www.trychroma.com/) (Stores embeddings for fast retrieval)
*   **Embeddings**: HuggingFace (`mini-lm-l6-v2-local`) for converting text to vector representations. Sort of a "RAG" (Retrieval-Augmented Generation) architecture sans the "Generation" part for the main search, but includes it for description filling.
*   **LLM Integration**: [Google Gemini](https://deepmind.google/technologies/gemini/) (via `langchain-google-genai`) is used to generate descriptions for items that lack them.
*   **Data Handling**: [Pandas](https://pandas.pydata.org/) for CSV dataset manipulation.

## 3. Directory Structure & Key Files

### Root Directory
*   `final_both_recommendation_systems.py`: **The Core Application**. This script initializes the databases, loads models, defines the recommendation logic, and launches the Gradio UI.
*   `books_chroma_db/`: A directory containing the persistent vector database for **Books**.
*   `movies_chroma_db/`: A directory containing the persistent vector database for **Movies**.
*   `goodbooksdb2.csv`: The dataset containing book metadata (Titles, Authors, Thumbnails, Emotion Scores).
*   `movies_with_emotion.csv`: The dataset containing movie metadata (Titles, Overviews, Thumbnails, Emotion Scores).
*   `cover_image.jpeg`: A fallback placeholder image used when a book or movie cover is missing.

## 4. How It Works (The Logic)

The system operates in two main pipelines (Movies and Books), following this general workflow:

### A. Initialization
1.  **Load Models**: Initializes the Local HuggingFace embedding model (`mini-lm-l6-v2`) to compute semantic similarity on the CPU.
2.  **Connect to DB**: Connects to the existing ChromaDB stores for specific domains.
3.  **Load Metadata**: Reads the CSV files into Pandas DataFrames and preprocesses them (e.g., fixing image URLs, handling missing cover images).

### B. Recommendation Pipeline (When a user clicks "Find recommendations")
1.  **Semantic Search (Retrieval)**:
    *   The user's query (e.g., "Space adventure") is converted into a vector.
    *   The system searches the `ChromaDB` logic to find the most similar items (using Max Marginal Relevance Search to ensure diversity).
    *   It extracts the **Titles** from the retrieved documents.

2.  **Filtering & Sorting**:
    *   The system filters the main Pandas DataFrame to keep only the items found in the vector search.
    *   **Emotional Filtering**: If a user selects a specific tone (e.g., "Sad"), the system sorts the results by the corresponding emotion score column (e.g., `sadness`, `joy`, `fear`, `anger`, `surprise`) in descending order.

3.  **Data Enrichment (LLM)**:
    *   If a recommended item is missing a description (`overview` for movies, `description` for books), the system calls the **Google Gemini API** to generate a short, family-friendly description on the fly.

4.  **Display**:
    *   The results are formatted into a card-style gallery containing the Cover Image, Title, Author/Director, and a truncated Description.

## 5. Key Features
*   **Hybrid Search**: Combines *semantic understanding* (understanding what the user means) with *structured metadata* (filtering by specific emotional attributes).
*   **Robustness**: Handles missing data gracefully (fallback images, LLM-generated descriptions for missing text).
*   **Interactive UI**: Simple, tab-based interface for switching between movies and books without restarting the app.

## 6. How to Run
Ensure you have the required dependencies (`langchain`, `gradio`, `pandas`, `chromadb`, `google-generativeai`) installed, then run the snippet:

```bash
python final_both_recommendation_systems.py
```
This will launch a local server (usually at `http://127.0.0.1:7860`) where you can interact with the app.
