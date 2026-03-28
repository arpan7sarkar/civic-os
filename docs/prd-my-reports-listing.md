# PRD: My Reports Listing (Complete Personal Report History)

## 1) Objective
Ensure the **My Grievance History** experience shows a citizen every report they have created, with reliable pagination, filtering, and consistent data between Appwrite and local cache.

## 2) Background (Current State)
From codebase review:
- `src/app/dashboard/page.tsx` renders **My Grievance History** using `complaints` state populated by `loadData()`.
- `src/app/actions/grievance.ts` `getGrievancesAction()` fetches rows with `Query.orderDesc('createdAt')` and `Query.limit(100)`, then filters by logged-in user.
- `src/lib/store.ts` keeps local fallback data (`localStorage`) and merges cloud + local entries via `syncGrievances`.
- `src/app/report/page.tsx` creates new grievances in Appwrite and also writes local fallback data.

### Current Gaps
1. Users with more than 100 reports cannot see full history (server limit hard-capped at 100).
2. Search triggers full reload from cloud on every search term change.
3. No explicit pagination/infinite scroll in My Reports table/card list.
4. “No reports submitted yet” may appear during sync timing windows.

## 3) Problem Statement
As a citizen, I need “My Reeport” to list **all reports I have created**, not only recent or partially synced ones, so I can trust the platform history for tracking and verification.

## 4) Goals
- Show complete per-user report history (not capped to first 100).
- Preserve ordering by newest report first.
- Keep UX fast on mobile and desktop.
- Maintain data integrity during cloud/local synchronization.

## 5) Non-Goals
- No redesign of authority/global map report listing.
- No change to grievance categorization, AI enrichment, or SLA assignment logic.
- No migration away from Appwrite in this phase.

## 6) Users & User Stories
- **Citizen**
  - I can view all my created reports across time.
  - I can search/filter my reports without losing records.
  - I can paginate/load more when history is long.
  - I can still see recently created reports if network is unstable.

## 7) Functional Requirements
1. **Complete Fetch**
   - System must return all reports for authenticated user using paginated backend fetch (cursor-based preferred).
   - Default page size: 25 (configurable).
2. **Deterministic Ordering**
   - Reports sorted by `createdAt DESC`.
3. **Pagination UX**
   - Dashboard shows first page and supports “Load more” (or infinite scroll).
4. **Search/Filter Behavior**
   - Search applies to already-loaded data client-side first.
   - Optional server-side search enhancement in later phase.
5. **Sync Reliability**
   - Unsynced local reports are marked and merged without duplicates.
   - Once synced, cloud source becomes canonical.
6. **Empty State Accuracy**
   - Show empty state only when loading is complete and total count is zero.

## 8) Data & API Requirements
### 8.1 Server Action Changes
- Add/extend action in `src/app/actions/grievance.ts`:
  - `getMyGrievancesPaginatedAction({ cursor?, limit?, search? })`
  - Returns `{ success, grievances, nextCursor, totalApprox? }`
- Continue enforcing user ownership via session-bound `user.$id`.

### 8.2 Dashboard Changes
- Update `src/app/dashboard/page.tsx` to:
  - Keep paging state: `items`, `cursor`, `hasMore`, `isLoadingMore`.
  - Stop re-calling full fetch on every keystroke.
  - Trigger initial fetch once profile/session is resolved.

### 8.3 Local Store Rules
- Update merge strategy in `src/lib/store.ts`:
  - Deduplicate by immutable report id.
  - Keep newest `updatedAt`/`createdAt` record version when conflicts exist.

## 9) UX Requirements
- Section title remains **My Grievance History**.
- Show per-item fields: `id`, `category`, `ward`, `status`, `assignedTo`, `createdAt`.
- Add footer action:
  - `Load more reports` button (hidden when no more pages).
- Loading states:
  - Skeleton rows/cards for initial load.
  - Inline spinner for load-more action.
- Error states:
  - Non-blocking toast/banner with retry option.

## 10) Security & Compliance
- Keep server-side session check with `getServerSession()`.
- Do not expose other users’ reports.
- Keep sanitized, plain-object responses for Next.js serialization compatibility.

## 11) Performance Targets
- Initial dashboard report list fetch p95 < 1.5s for first page (25 items).
- Load-more fetch p95 < 1.2s.
- Search interaction response < 150ms on loaded dataset.

## 12) Acceptance Criteria
1. A user with 250 reports can view all records via pagination.
2. First page loads newest records first by `createdAt`.
3. Searching does not trigger a full cloud refetch per keystroke.
4. No duplicate report appears after sync/reload.
5. Empty state appears only when true report count is zero.
6. Existing PDF download and status display continue to work unchanged.

## 13) Rollout Plan
1. Implement paginated server action.
2. Refactor dashboard list state and load-more UX.
3. Tighten store dedup/sync logic.
4. QA with seeded datasets: 0, 10, 100, 250+ reports.
5. Release behind feature flag `my_reports_v2` (recommended).

## 14) Risks & Mitigations
- **Risk:** Appwrite query constraints on encrypted fields.
  - **Mitigation:** Keep session-scoped filtering pattern and cursor pagination; if needed, fetch batches and filter safely server-side.
- **Risk:** Local/cloud merge conflicts.
  - **Mitigation:** Stable dedup key + conflict resolution policy.
- **Risk:** Higher DB reads with pagination.
  - **Mitigation:** Moderate page size + lazy load.

## 15) Out of Scope (Future)
- Advanced filters (date range, priority, department).
- Export “My Reports” CSV/PDF bulk.
- Saved views and custom sorting.
