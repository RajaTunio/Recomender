# Personlized Suggestions Walkthrough

I have enhanced the "Suggested Queries" feature to be smarter and more personalized.

## Features Implemented

### 1. Preference-Based Filtering
- **Logic**: The system now checks the user's profile for `favorite_genres` (e.g., "Fantasy", "Sci-Fi").
- **Matching**: It scans the 100-query pool for items containing those genre keywords.
- **Priority**: Matching queries are displayed *first* in the list.

### 2. Intelligent Mix
- **Balance**: If the user has few or no favorites, or if matches are fewer than the target count, the system fills the remaining spots with random diverse queries.
- **Result**: Users get a mix of "safe bets" (what they like) and "discovery" items (new topics), always totaling between 5 and 11 suggestions.

## User Flow
1. **Logged-In User**: If I love "Fantasy", I might see "Dark **fantasy** with complex magic systems" at the start of my suggestions.
2. **New/Guest User**: I see a completely random, diverse set of interesting queries to get me started.

## Verification
- **Code Check**: `Home.jsx` now leans on `userProfile.favorite_genres` for the initial filter.
- **Fallback**: Verified that empty profiles still receive a full list of random suggestions.
