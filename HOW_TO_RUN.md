# Manual Run Guide

This guide explains how to manually run the AI Recommender System (Frontend + Backend).

## Prerequisites
- Node.js installed (for frontend)
- Python installed (for backend)
- Dependencies installed for both.

## Steps

### 1. Start the Backend Server
The backend is a FastAPI application.
1. Open a terminal (Command Prompt or PowerShell).
2. Navigate to the project root directory: `d:\CS_23 S5\Aritificial Inteligence\Project\Ai pro`
3. Run the following command:
   ```bash
   python -m uvicorn src.backend.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *Note: If you have a virtual environment, activate it first.*

### 2. Start the Frontend Server
The frontend is a React/Vite application.
1. Open a **new** terminal window.
2. Navigate to the frontend directory: `d:\CS_23 S5\Aritificial Inteligence\Project\Ai pro\src\frontend_new`
3. Run the startup command:
   ```bash
   npm run dev
   ```
   *Or if you encounter permission issues:*
   ```bash
   cmd /c "npm run dev"
   ```

### 3. Access the Application
1. Open your web browser.
2. Go to: [http://localhost:5173/](http://localhost:5173/)
3. You should see the Recommender interface.

## Troubleshooting
- **Backend fails to start:** Ensure you are in the root directory and all Python dependencies are installed (`pip install -r requirements.txt`).
- **Frontend fails to start:** Ensure you are in `src/frontend_new` and have run `npm install` previously.
