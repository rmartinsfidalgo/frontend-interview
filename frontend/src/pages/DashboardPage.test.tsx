import { waitFor } from '@testing-library/react'
import { Outlet, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/notifications.api'
import type { LayoutContext } from '../components/AppLayout'
import { renderWithProviders } from '../test/utils'
import { DashboardPage } from './DashboardPage'

vi.mock('../api/notifications.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/notifications.api')>()),
  listNotifications: vi.fn().mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
}))

const renderAt = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<Outlet context={{ newIds: new Set() } satisfies LayoutContext} />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>
    </Routes>,
    { route },
  )

describe('DashboardPage', () => {
  it('requests the list using filters and page from the URL', async () => {
    renderAt('/?status=OPEN&severity=CRITICAL&page=2&size=25')

    await waitFor(() =>
      expect(api.listNotifications).toHaveBeenCalledWith({ status: 'OPEN', severity: 'CRITICAL', page: 2, size: 25 }),
    )
  })

  it('ignores invalid URL params instead of sending them to the API', async () => {
    renderAt('/?status=BOGUS&severity=nope&page=-3&size=999')

    await waitFor(() => expect(api.listNotifications).toHaveBeenCalledWith({ page: 0, size: 10 }))
  })
})
