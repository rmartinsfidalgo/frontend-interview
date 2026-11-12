# Notification Service

This project implements a notification board that integrates with a backend service to retrieve notification history and receive real-time updates.

The app uses REST API endpoints to:
- Retrieve the list of notifications.
- Fetch an individual notification's details.
- Update a notification's status.
- Create a new notification (out of scope for this task).

For details about the available API endpoints and their usage, refer to the backend service documentation at `http://localhost:8080/docs`.

Additionally, the app uses **Server-Sent Events (SSE)** to receive real-time events, including `notification_created` and `notification_updated`. These events automatically update the notification list and individual notification statuses, keeping the displayed information in sync with the backend without manual refreshes.

## Developer guide
### Run the project in dev mode
The backend service must be running first. You can check that it's up at `http://localhost:8080/docs`.

```bash
# 1. Start the backend (from the repository root)
cd ./mock-backend
pnpm install
pnpm start      # http://localhost:8080

# 2. Start the frontend (in a second terminal, from the repository root)
cd ./frontend
pnpm install    # Make sure packages are installed
pnpm run dev    # Default: http://localhost:5173/
```

### Other scripts
| Command | Description |
|---|---|
| `pnpm run build` | Type-check and build for production |
| `pnpm run preview` | Serve the production build locally |
| `pnpm run lint` | Run ESLint |
| `pnpm run test:ts` | Type-check the project |
| `pnpm run generate:api:notifications` | Regenerate the API client and types from the backend OpenAPI schema |

