# Implementation Plan - Frontend Redesign & UI/UX Overhaul

## Goal
Redesign the application with a modern, professional UI/UX using **React** (Vite), **Tailwind CSS**, and **FastAPI**. The new interface will support a 3-step registration flow, user profiles, and an engaging content display for books and movies.

## User Review Required
> [!IMPORTANT]
> **Frontend Stack**: This plan introduces a new `frontend` directory using React + Vite + Tailwind CSS. The existing `src/frontend` (HTML/JS) will be backed up to `src/unused/frontend_old`.
> **Database Changes**: The `users` table will be modified (or recreated) to support `email` and `full_name`. Existing data might be lost if we recreate the table, or we can add columns if data preservation is needed (assuming dev environment, we'll likely recreate/migrate).

## Proposed Changes

### Backend (`src/backend`)

#### [MODIFY] [main.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/backend/main.py)
- Update `register` endpoint to accept `full_name`, `email` and `username`.
- Add endpoint `POST /check_username` for real-time availability check.
- Update `ProfileRequest` and endpoints to handle `WISHLIST`, `READ`, `WATCHED` categories explicitly.
- Add `GET /profile/me` (wrapped `get_profile` using current user ID).

#### [MODIFY] [db_manager.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/database/db_manager.py)
- Update `register_user` to store `email` and `full_name`.
- Update `_get_conn` to ensure new columns exist (or execute a migration script).
- Add methods to update user details (for profile editing).

### Frontend (`src/frontend` -> `src/frontend_new`)

#### [NEW] React Application Structure
- **Tech Stack**: standard `npm create vite@latest` with React, TypeScript (optional but recommended, stick to JS if simpler for user but TS is standard now), Tailwind CSS.
- **Pages**:
    - `Login`: Email/User + Password.
    - `Signup`:
        - Step 1: User Info (Real-time username check).
        - Step 2: Book Prefs (Tags/Chips selection).
        - Step 3: Movie Prefs (Tags/Chips selection).
    - `Home`:
        - 3 Horizontal Tabs (scrollable).
        - Search Bar.
    - `Profile`: Editable fields, avatar placeholder.
    - `DetailModal`: Overlay for book/movie details.

### Database (`src/database`)
- Schema updates to `users` table.

## Verification Plan

### Automated Tests
- Run backend API check: `curl -X POST http://localhost:8000/check_username -d '{"username": "newuser"}'`

### Manual Verification
1.  **Auth Flow**:
    - Register a new user -> Complete Step 1 -> Check DB.
    - Skip/Complete Step 2 & 3.
    - Login with new credentials.
2.  **Profile**:
    - Go to Profile page -> Edit Name -> Save -> Refresh -> Verify persisted.
3.  **UI/UX**:
    - Check Dark/Light mode toggle.
    - verify Horizontal scrolling in tabs.
    - Click a card -> Verify Detail Modal opens.
