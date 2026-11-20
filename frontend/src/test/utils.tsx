import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Notification } from '../types/notification.types'

export function renderWithProviders(ui: ReactElement, { route = '/' } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

export const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  title: 'Disk full on db-01',
  description: null,
  severity: 'HIGH',
  status: 'OPEN',
  resolutionNote: null,
  createdAt: '2026-06-15T10:00:00Z',
  updatedAt: '2026-06-15T10:00:00Z',
  ...overrides,
})
