# Chat-like Interface Redesign Plan

## Goal Description
Redesign the application to function like a chatbot (ChatGPT style).
1.  **Initial View**: Only a prompt input and a Mode Toggle (Movie/Book). Use "Gemini" branding for model selection if applicable, or just "Movie/Book" for now as per "option it , both these option should be like slected a ai model on geminei".
2.  **Interaction**: User enters a query -> Results appear.
3.  **Result Layout**: Three horizontal tabs/rows on the same screen (e.g., "Top Picks", "Trending", "Hidden Gems").
4.  **Card Actions**: "Add to Watched", "Add to Wishlist", "Dislike".
5.  **Backend**: Update `db_manager` to support "WATCHED" preference type.

## User Review Required
> [!IMPORTANT]
> - I will add a new `WATCHED` preference type to the backend.
> - The frontend will switch to a "chat-only" initial view.

## Proposed Changes

### Backend
#### [MODIFY] [src/database/db_manager.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/database/db_manager.py)
- Update [get_user_profile](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/database/db_manager.py#101-118) to include `WATCHED` type categorization.

### Frontend
#### [MODIFY] [src/frontend_new/src/pages/Home.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/pages/Home.jsx)
- **State**: Add `hasSearched` state.
- **Layout**:
    - If `!hasSearched`: Show centered Search Box + Mode Toggle (Gemini style).
    - If `hasSearched`: Show Search Box at top (smaller) + 3 Horizontal Sections of results.
- **API Integration**: Connect to `http://localhost:8000/chat`.
- **Card Actions**: Add buttons for Watched, Wishlist, Dislike.

#### [MODIFY] [src/frontend_new/src/components/HorizontalSection.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/components/HorizontalSection.jsx)
- Pass down action handlers to cards (or implement them directly in cards if they are separate).

## Verification Plan

### Automated Tests
- None (Visual/Manual verification).

### Manual Verification
1.  **Initial Load**: Verify empty screen with centered search + toggle.
2.  **Search**: Select "Movie", type "Sci-Fi", press Enter.
3.  **Results**: Verify 3 horizontal sections appear.
4.  **Actions**:
    - Click "Add to Watched" -> Verify API call (Network tab).
    - Click "Add to Wishlist" -> Verify API call.
    - Click "Dislike" -> Verify API call.
