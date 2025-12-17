# Integrate Emotion Scores

We will enable emotion-based sorting for book recommendations by switching the data source to the newly provided `goodbooks_with_emotion.csv`.

## User Review Required

> [!IMPORTANT]
> I will switch the book data source from `goodbooks3.csv` to `goodbooks_with_emotion.csv`.
> I also noticed a potential mismatch in column names for the release year (`published_year` in CSV vs `original_publication_year` in code). I will standardize this to `published_year` to ensure years are displayed correctly.

## Proposed Changes

### Backend

#### [MODIFY] [recommender.py](file:///d:/CS_23%20S5/Aritificial%20Inteligence/Project/Ai%20pro/src/backend/recommender.py)
- Change book CSV path to `goodbooks_with_emotion.csv`.
- Update year extraction logic for books to use `published_year`.
- Verify emotion columns (`joy`, `anger`, etc.) are used for sorting (logic already exists, just enabling via data).

## Verification Plan

### Automated Tests
- Run the backend.
- Send a query with a specific emotion (e.g., "Sad books about life").
- Verify that the returned books are sorted by the `sadness` column.
