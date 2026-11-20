```bash
# 1. Backend (terminal 1) — http://localhost:8080
cd mock-backend
pnpm install
pnpm start

# 2. Frontend (terminal 2) — http://localhost:5173
cd frontend
npm install
npm run dev
```

## Commands
`npm run dev` : Dev server with HMR 
`npm run build` : Type-check and production build 
`npm test` : Unit/component tests (watch mode); use `npx vitest run` for a single run 


## Requirements
- React 19 + TypeScript
- State management: TanStack Query (React Query). Most of the app's data comes from the server, so React Query keeps it in one place. When the server sends a live update, the data is refreshed there.
  I intentionally avoided Redux/Context because nearly all state in the application originates from the backend.
- Styling: MUI (Material UI). It comes with ready-made, accessible components (table, dialogs, stepper, toast), so I could spend my time on how the app behaves instead of writing CSS. It also gives a consistent look and works well on small screens.

## Architecture
The application is split into a few simple layers:

- `pages` contain route-level screens (Dashboard, Incident Detail)
- `components` contain reusable UI building blocks
- `hooks` encapsulate data access and real-time update logic
- `api` contains communication with the backend
- `utils` contain formatting and business-support functions
- `types` contain shared TypeScript models

The goal was to keep UI concerns, server communication and business logic separated without adding unnecessary complexity.

## Tests
15 tests focused on business-critical behavior rather than coverage metrics. The goal was to protect workflows that would directly impact operators

- Status workflow: Acknowledge calls the API; Resolve is blocked until a note is entered; no action once resolved
- Forms: Severity has no default; 100-char title limit; whitespace-only note rejected; values are trimmed
- URL state: Filters/page come from the URL; invalid params are sanitized, never sent to the API
- Formatting: Recent times show as "5 minutes ago"; older than 3 days they show as a date like "12 Nov"

The API layer is mocked at module level, so tests are fast and deterministic. Live streaming is not covered by automated tests yet

## Decisions

### 1. Show urgency first
- The top of the dashboard has four count cards. "Open critical" turns red whenever it is above zero.
- Clicking a card filters the table, so there is one path from signal to detail.


### 2. One place for server data (React Query)
- Lists, counts and details all live in the React Query cache. There is no separate store.
- **Why:** almost all the data comes from the server, and React Query already handles caching, retries and refreshing.


### 3. One live connection, and the cache is the source of truth
- The app opens the live stream once, in `AppLayout`.
- When an event arrives, the notification is saved in the cache and the visible lists and counts are refetched.
- **Why:** the list is paged and filtered by the server. A new or changed incident can change which page it is on, the order and the totals. Refetching always shows the correct result.

### 4. Live updates that don't disrupt
- New rows are highlighted for 10 seconds.
- On page 2 or later, a banner says items may have shifted and offers "Go to latest".
- The old page stays visible while the next one loads.
- Only new CRITICAL incidents show a toast, with a link to the incident.
- **Why:** a table that reshuffles silently causes wrong clicks. Highlights and banners show change without grabbing focus. Only critical incidents deserve an interruption.


### 5. The UI follows the API's rules
- The detail page shows only the one valid next step: Acknowledge, then Resolve. Nothing is offered once resolved.
- Resolving opens a dialog that needs a non-blank note.
- **Why:** skipping a step is impossible from the screen, so errors are rare. If another operator acts first, the server's message is shown and the page reloads to show the real state.

### 6. No default severity when creating an incident
- The form makes you pick a severity. The title is limited to 100 characters and text is trimmed, as the API expects.
- **Why:** severity decides priority. A default would quietly give some incidents the wrong one.

### 7. What it does (summary)
- **Dashboard:** summary cards, status and severity filters, and a paged table.
- **Live updates:** new incidents appear without a refresh, with a connection indicator in the header.
- **Incident detail:** shows the status steps and the one allowed next action.
- **Shareable views:** filters and page are kept in the URL.

## Engineering Focus
My goal was to make it easy for operators to understand incidents and take action quickly. This guided the dashboard design, real-time updates, workflow rules, and testing approach.