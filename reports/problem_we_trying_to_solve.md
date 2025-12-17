# Search Functionality Refinement Plan

## Goal Description
Update the [Home.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/pages/Home.jsx) page to support separate search modes for "Movies" and "Books". The search should trigger when the user presses logic (no separate button), and the results should be displayed based on the selected mode.

## User Review Required
> [!IMPORTANT]
> - I will be adding a toggle/tab system for selecting "Movie" or "Book" search mode.
> - The search will trigger on the "Enter" key press.
> - I will assume a mock backend response for now, or prepare the structure to call an actual API (e.g., `POST /api/recommend`). Please confirm if there is a specific backend URL I should target.

## Proposed Changes

### Frontend (`src/frontend_new/src/pages/Home.jsx`)
#### [MODIFY] [Home.jsx](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/frontend_new/src/pages/Home.jsx)
- Import `clsx` or use template literals for conditional styling.
- Add `searchMode` state (`'movie' | 'book'`).
- Add a Toggle/Tab component above or near the search bar to switch modes.
- Implement `handleSearch` function that logs the query and mode (and eventually calls the API).
- Add `onKeyDown` event handler to the input to trigger `handleSearch` on 'Enter'.
- Update the "Thinking You'll Like" section to display results tailored to the search (contextually switching between Book/Movie results).

## Verification Plan

### Manual Verification
1.  **Open the Home Page**:
    - Verify that the "Movie" and "Book" toggle/tabs are visible.
    - Verify the default mode (e.g., Book).
2.  **Test Mode Switching**:
    - Click "Movie" -> Toggle changes.
    - Click "Book" -> Toggle changes.
3.  **Test Search Trigger**:
    - Type "World War 1" in the search bar.
    - Press "Enter".
    - Verify console logs or UI updates showing the search was triggered with the correct mode and query.
4.  **Test Result Display**:
    - Check that the results section updates (or shows a loading state/new mock data) reflecting the search.
