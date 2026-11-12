import type { NotificationSeverity, NotificationStatus } from "@apis";

// The generated API types are type-only unions, so there is no runtime list to iterate.
// `Record<Union, true>` forces these objects to contain exactly the union's members:
// if the backend schema adds/removes a value and the client is regenerated,
// type-checking fails here until the list matches the API again.
const severityMap: Record<NotificationSeverity, true> = {
  LOW: true,
  MEDIUM: true,
  HIGH: true,
  CRITICAL: true,
};

const statusMap: Record<NotificationStatus, true> = {
  OPEN: true,
  IN_PROGRESS: true,
  RESOLVED: true,
};

export const ALL_SEVERITIES = Object.keys(severityMap) as NotificationSeverity[];
export const ALL_STATUSES = Object.keys(statusMap) as NotificationStatus[];
