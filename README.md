# Notification Board - Frontend Interview Project

## Context

You're building the React frontend for an internal notification management system used by
platform operators. A backend service is provided and already running - your job is
the UI.

The backend has data pre-loaded, and an automated monitoring system will continuously
push new notifications while you work.

---

## Getting started

Start the backend (requires Node.js ≥ 18):

```bash
cd mock-backend
pnpm install
pnpm start
```

The server is running at `http://localhost:8080`. Explore the full API at `http://localhost:8080/docs`.

---

## What to build

Platform operators use this board to monitor and act on service incidents as they come in. Notifications arrive continuously from an automated monitoring system and need operator attention - from acknowledgement through to resolution.

The backend is running and fully documented at `http://localhost:8080/docs`. Read the API first - it defines the data model, the available operations, and the rules the system enforces.

The product team has asked for:

- A dashboard where operators can see what's happening at a glance, with incidents updating in real-time.
- A way to dig into an individual incident and act on it.

Clarity matters - operators need to understand the situation at a glance, so make sure the right signals are visible. Beyond that, the details are yours to figure out.

Build a UI that lets an operator do their job.

---

## Requirements

- React 19 + TypeScript
- State management: your choice
- Styling: your choice

---

## Notes

- CORS is already configured on the backend - no proxy needed
- Data does not persist between backend restarts

---

## Deliverable

Your submission should include:

- Instructions on how to run your app
- Tests - what you test and what type of tests you write is your call. We're looking for intentional choices, not coverage metrics
- A document covering the decisions you made and the reasoning behind them. Format and length are up to you - what matters is that your thinking is visible. We're not looking for a specific answer; we're looking for evidence that you made conscious choices rather than default ones.
