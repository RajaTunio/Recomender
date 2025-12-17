# Backend Integration Plan

## Goal Description
Connect the [Home.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/pages/Home.jsx) frontend component to the FastAPI backend at `http://localhost:8000`. This enables real search results via the ChromaDB/Agent logic and allows saving user preferences (Watched/Wishlist/Dislike).

## User Review Required
> [!IMPORTANT]
> - I will remove the mock data generation logic from `Home.jsx`.
> - I will assume the backend is running at `http://localhost:8000` (which it is).
> - **Note**: The backend `recommender.py` uses Google Gemini API. If the API key is missing, it might default to fallback or fail. I'll add error handling.

## Proposed Changes

### Frontend
#### [MODIFY] [src/frontend_new/src/pages/Home.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/pages/Home.jsx)
- **API Client**: Create an `axios` instance or fetch wrapper for `http://localhost:8000`.
- **Search Logic**: Update `handleSearch` to POST to `/chat` with `{ query_text, tone: "All", media_type: searchMode }`.
- **Mock Data**: Remove `MOCK_DATA` and `generateItems`. Replace with state `searchResults` populated from API response.
- **Actions**: Update `handleAction` to POST to `/profile/preference`.

#### [MODIFY] [src/frontend_new/src/context/AuthContext.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/context/AuthContext.jsx)
- Ensure `user` object available in context includes `id` for API calls.

## Verification Plan

### Manual Verification
1.  **Search**:
    - Select "Movie", type "Space Adventure", press Enter.
    - Verify request in Network tab: `POST /chat`.
    - Verify results are displayed from backend (check titles/images).
2.  **Actions**:
    - Click "Eye" icon.
    - Verify request in Network tab: `POST /profile/preference`.
