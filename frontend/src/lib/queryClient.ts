import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/notifications.api';

/**
 * Shared React Query client with app-wide defaults for all queries.
 *
 * - staleTime 30s: live updates (useNotificationStream) keep the cache fresh; refetching is only a fallback
 * - 4xx errors: never retried, they won't succeed (e.g. 404 shows "not found" immediately)
 * - Network/5xx errors: retried up to 2 times
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && failureCount < 2,
    },
  },
});