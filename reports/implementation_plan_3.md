# Sidebar & Auth Implementation Plan

## Goal Description
Implement a proper left-side navigation bar (Sidebar) that displays chat history and enforce authentication by redirecting guests to the login/signup page.

## User Review Required
> [!IMPORTANT]
> - Users who are NOT logged in will now be redirected to `/login` immediately when accessing `/`.
> - A new API endpoint `/history/{user_id}` will be created to fetch past chat interactions.

## Proposed Changes

### Backend
#### [MODIFY] [src/backend/main.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/backend/main.py)
- Add GET endpoint `/history/{user_id}` to retrieve `interaction_logs` for the sidebar.

#### [MODIFY] [src/database/db_manager.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/database/db_manager.py)
- Add `get_chat_history(user_id)` method to select `query_text` and `timestamp` from `interaction_logs`.

### Frontend
#### [MODIFY] [src/frontend_new/src/App.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/App.jsx)
- Implement `ProtectedRoute` component.
- Wrap the main `/` route in `ProtectedRoute`.

#### [MODIFY] [src/frontend_new/src/components/Sidebar.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/components/Sidebar.jsx)
- Fetch chat history from `/history/{user_id}`.
- Display list of previous queries.

## Verification Plan
1.  **Auth**: Try to access `/` without login -> expect redirect to `/login`.
2.  **History**: Login -> Check Sidebar for previous chat queries.
3.  **New Chat**: Perform a search -> Refresh/Check Sidebar -> see new query appear.
