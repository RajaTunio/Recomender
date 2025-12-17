# Walkthrough: Personalized AI Recommendation Agent

This guide explains how to run and use your new **AI Agent** with the custom ChatGPT-style interface.

## 1. Prerequisites
Ensure you have the following files in your project folder (`d:\CS_23 S5\Aritificial Inteligence\Project\Ai pro`):
- `run_agent.bat`
- `src/` folder (containing backend and frontend code)
- `.env` file (with `GOOGLE_API_KEY`)
- `project.db` (in `database/` folder)

## 2. Running the Application
1.  **Double-click** the `run_agent.bat` file in your project folder.
2.  A terminal window will open showing the server starting up.
3.  Wait for the message: `Application startup complete`.

## 3. Accessing the Interface
1.  The batch file should tell you the URL (likely `http://127.0.0.1:8000`).
2.  Open your browser (Chrome/Edge) and go to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.
3.  You should see the dark-themed Chat Interface.

## 4. Using the Features (Verification Steps)

### A. Authentication
- You will see a **Login Modal** on first load.
- Click **"Register"** -> Enter a username/password -> Click Register.
- Then **Login** with those credentials.

### B. Chat & Recommendations
- **Type**: "I want a happy movie about space."
- **Select Tone**: Choose "Happy" from the dropdown.
- **Send**: The Agent will reply with recommendations. Observe the **Images** and **Explanations**.

### C. Agent Memory (Profile)
- Click **"My Profile"** in the sidebar.
- Add a **Favorite** (e.g., "Sci-Fi").
- Add a **Dislike** (e.g., "Horror").
- Close the modal and ask for a recommendation. The Agent will use this context (check console logs for "Enhanced Query").

### D. History
- Refresh the page. You should stay logged in.
- Your previous chat history/context is maintained in the database (Backend logic implemented).
