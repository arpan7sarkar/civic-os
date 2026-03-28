# PRD: Location Autocomplete & Geocoding

## 1) Objective
Standardize location data captured during the reporting process by replacing free-text entry with a verified autocomplete suggestion system. This ensures every report points to a valid physical location with precise coordinates.

## 2) Background
Currently, users can manually type any text into the location field in `src/app/report/page.tsx`. While the app attempts to detect location via GPS (Browser Geolocation API) and reverse geocodes it using Geoapify, manual entries often lead to vague or invalid addresses that are difficult for authorities to track and for the map to display accurately.

## 3) Problem Statement
As a reporting citizen, I often find it tedious to type out full addresses, and errors in my typing or vague descriptions (e.g., "near the park") make it difficult for the system to assign my report to the correct department or show it on the map.

## 4) Goals
- Provide real-time location suggestions as the user types.
- Restrict manual input to only allow submission of verified locations.
- Automatically fetch full location details (lat/lng, formatted address, ward) on selection.
- Update the report map preview immediately upon location selection.

## 5) Non-Goals
- Global map redesign.
- Real-time location tracking after submission.
- Integration with non-Geoapify providers (Geoapify remains the current provider).

## 6) User Stories
- **Citizen**
  - "When I start typing a street name, I want to see a list of matching addresses so I can select the correct one quickly."
  - "I want the system to automatically place a marker on the map for the address I selected so I can confirm it's the right spot."
  - "I want to be sure that the address I provide is valid so that my report isn't delayed due to location ambiguity."

## 7) Functional Requirements
1. **Restricted Input**
   - The location input field must prevent free-form submission.
   - Users MUST select a suggestion from the dropdown to proceed.
2. **Autocomplete API Integration**
   - Integrate with Geoapify's Autocomplete API.
   - Trigger API calls after 3 characters are typed (with debounce).
   - Display a dropdown with up to 5 relevant suggestions.
3. **Geocoding on Selection**
   - Upon selecting a suggestion, fetch the full geocoding data (latitude, longitude, formatted address).
   - Cache results locally to avoid redundant API hits for similar queries.
4. **Map Integration**
   - The selected location must update the `coords` state in `src/app/report/page.tsx`.
   - Update any visible map preview or marker to the selected coordinates.
5. **Loading & Feedback**
   - Show a spinner while waitng for autocomplete suggestions.
   - Show a "No results found" state if the API returns no matches.

## 8) Technical Implementation Details
- **API Endpoint:** `https://api.geoapify.com/v1/geocode/autocomplete`
- **Server Action:** Add `getAutocompleteSuggestionsAction(text: string)` to `src/app/actions/geo.ts`.
- **UI Component:** Implement a custom autocomplete input or use a headless UI component (e.g., Reach UI, Headless UI Combobox).
- **Security:** Ensure rate limiting on the new server action to prevent API abuse.

## 9) UX Requirements
- Clean, muted palette following CivicOS design principles.
- Debounced input (300ms) to save battery and API credits.
- High-contrast selected state in the dropdown.
- Accessible keyboard navigation (Arrow keys + Enter).

## 10) Acceptance Criteria
1. Typing "Lajpat" shows a dropdown with "Lajpat Nagar", "Lajpat Nagar Metro", etc.
2. Clicking a suggestion updates the input text and the map center/marker.
3. Submission is blocked if the input contains text that wasn't selected from the suggestions.
4. Empty states are gracefully handled.

## 11) Performance Targets
- Autocomplete response time < 500ms (p95).
- Zero duplicate API calls for identical consecutive queries via debounce/cache.
