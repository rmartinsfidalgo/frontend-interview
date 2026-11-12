# Decisions

This is a summary about technical decisions that I made during develop this project. you can find some detail in commits. I try to describe some deicisions in the commits but here is a summary of decisions.


## Architecture

### Generated API client from the OpenAPI schema
I generate the endpoints, request DTOs and response types from the backend's `openapi.yml` (`pnpm run generate:api:notifications`).

- **Why:** a single source of truth for the contract. If the backend changes, regenerating surfaces the breaking changes as type errors instead of runtime bugs.
- **Trade-off:** generated code is committed and can look noisy in diffs, and the generator config is another thing to maintain.

### State management: React Context
The notifications list, filters and pagination metadata live in a single `NotificationProvider`, exposed through a `useNotifications` hook.

- **Why:** the state is small and has one consumer tree. Context gives me this with no extra dependencies or setup.
- **Trade-off:** every context consumer re-renders when any value changes, and the update rules (prepend, replace, filter-out, adjust total) are spread across callbacks. In a larger app I would move to **Zustand** or **Redux Toolkit**, or at least a `useReducer`, so the transitions are centralised, pure and easy to unit-test.

### Separation between the SSE stream and the state
`useNotificationsStream` only opens the `EventSource`, parses events and emits `onCreated` / `onUpdated` / `onReconnect`. The provider decides what those events mean (filtering, totals).

- **Why:** the hook stays a thin transport layer with no knowledge of filters or UI state, so it can be reused and tested in isolation. Filtering logic lives in one place.
- **Detail:** the hook keeps the latest callbacks in a ref, so the connection is opened **once** and never torn down when filters change, yet callbacks always see the current filters.

### UI library: MUI
I used MUI directly to save time on layout, theming, tables, chips and modals, and to get reasonable accessibility defaults. In a product with its own design system I would wrap these in project-level components instead of using MUI everywhere.

### Virtualised list: `react-virtuoso`
**[Needs more investigations] It's First time I use it.** 

The list can grow large and updates continuously. I chose `react-virtuoso` over `react-window` because it handles variable row heights, table layout (`TableVirtuoso`), "end reached" pagination and **prepending items without losing scroll position** out of the box.

---

## Real-time behaviour

### The server's live events are the only source of updates
After an operator changes a status, the modal shows the server's response, but the **list** is only updated when the `notification_updated` SSE event arrives. The API documents that this event fires for updates made from the UI too.

- **Why:** a single update path; no risk of the optimistic local copy and the server event disagreeing.
- **Trade-off:** if the SSE connection is down at that moment, the list shows the old status until the connection recovers (see below).

### Refetch on reconnect
`EventSource` reconnects automatically, but events sent while disconnected are lost. On every **re**-connection (not the first open) the provider refetches the list.

### Live total
The `totalElements` from the server is adjusted live: `+1` when a matching notification is added, `-1` when one is filtered out by an update. Handlers read the current list from a ref rather than doing side effects inside state updaters, which React may call twice in StrictMode.

- **Known limitation:** an update for a notification that is not loaded yet (on a later page) cannot adjust the total correctly; the next refetch corrects it.

---

## UX decisions

### Infinite scroll
Since we have a real time service. using pagination with page number is not sensible because we update the list from top and button and using pagination is not acure because if the list update the order of pagination will change.

### CSS or MUI styling
I generally prefer plain CSS with the [BEM methodology](https://bem.info/en/methodology/css/): it keeps styling separate from component logic, and static CSS is parsed and cached by the browser, whereas MUI's `sx`/`styled` generates styles in JavaScript at runtime. For this task I mostly used MUI styling to save time, but I kept a few CSS files (e.g. `header.css`, `theme.css`) to show both approaches.

---

## What's next

- **`[Todo]` comments:** some comments in the codebase start with `[Todo]`. These are improvements I chose not to spend time on for this task, but they would need to be handled in a real project.
- **Reusable components:** extract components such as a `SeverityBadge` and `StatusBadge`.
- **Table improvements:** sorting (e.g. by severity or date), an accessible action button (`IconButton` with `aria-label`) instead of a clickable cell, and empty/loading states.
- **Configuration:** add a `.env` file to configure the backend endpoints instead of hardcoding `http://localhost:8080`.
- **Error handling:** show an error state with retry when the initial fetch fails (it currently throws), and show the operator when the live connection is lost.
- **Test Coverage** Cover more tests in the project.
- **Docker** Dockerize the project.
- **Pre-commit** Add pre-commit hooks to test app before creating PR
- **CI/CD** Setup CI/CD for test and publish the application
- **Minify | Tree Shaking | Dynamic import** Split code using dynamic import and tree shaking to have smaller bundle sizes.




## Suggestions

- **Cursor-based pagination:** I would like to suggest using cursor-based-pagination because with real-time data, page-number pagination is unreliable: every new notification shifts the offsets, so the next page can repeat or skip items. A cursor ("items older than X") is stable no matter what is added at the top. If ids are **UUIDv7**, which are time-ordered, the id alone can be the cursor; otherwise use a composite cursor of `(createdAt, id)`.

- **Client-side filtering vs. server-side filtering.** If the dataset is small, we could fetch the full list once and filter by `severity`/`status` on the client. Filter changes would be instant, the "at a glance" counts could be derived from the same list, and SSE handling would be simpler. The cost is a slower initial load and memory that grows with the data, which is a real risk here because notifications arrive continuously. Two alternatives:
  - **Per-filter cache** (e.g. TanStack Query): keep server-side filtering but cache each filter's results and refresh in the background, so switching back to a filter you've already viewed is instant.
  - **IndexedDB as a local store**: persist notifications in the browser (indexed by `severity`, `status`, `createdAt`), filter locally and keep it fresh with SSE. This avoids the memory cost and renders instantly on reload, but after a reload or reconnect it needs to fetch what changed in the meantime (ideally an `updatedAfter` query, which the current API doesn't offer).
  - **Condition:** both local approaches rely on notifications never being deleted. The API has no delete endpoint or `notification_deleted` event, so a local copy could not learn about deletions and would keep showing removed items.

## AI assistance

I developed most of the project myself. I used Claude (AI assistant) for:

- **Code review and refactoring:** suggestions on structure and best practices, e.g. moving filtering out of the SSE hook into the provider, de-duplicating paginated results, and keeping the live total count in sync.
- **Scroll anchoring and the "new notifications" chip:** implemented with AI.
- **Documentation:** polishing the README and drafting this document, which I then reviewed and edited.
- **Tests:** most of the tests were written with AI to save time.