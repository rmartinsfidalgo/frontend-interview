import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/notifications.api'
import { makeNotification, renderWithProviders } from '../test/utils'
import { NotificationDetailPage } from './NotificationDetailPage'

vi.mock('../api/notifications.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/notifications.api')>()),
  getNotification: vi.fn(),
  advanceStatus: vi.fn(),
}))

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/notifications/:id" element={<NotificationDetailPage />} />
    </Routes>,
    { route: '/notifications/n1' },
  )

describe('NotificationDetailPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('acknowledges an open notification by moving it to IN_PROGRESS', async () => {
    vi.mocked(api.getNotification).mockResolvedValue(makeNotification({ status: 'OPEN' }))
    vi.mocked(api.advanceStatus).mockResolvedValue(makeNotification({ status: 'IN_PROGRESS' }))
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Acknowledge' }))

    expect(api.advanceStatus).toHaveBeenCalledWith('n1', 'IN_PROGRESS', undefined)
  })

  it('asks for a resolution note before resolving', async () => {
    vi.mocked(api.getNotification).mockResolvedValue(makeNotification({ status: 'IN_PROGRESS' }))
    vi.mocked(api.advanceStatus).mockResolvedValue(makeNotification({ status: 'RESOLVED' }))
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Resolve' }))
    expect(api.advanceStatus).not.toHaveBeenCalled()

    const dialog = await screen.findByRole('dialog')
    await user.type(screen.getByLabelText(/resolution note/i), 'Freed up space')
    await user.click(within(dialog).getByRole('button', { name: 'Resolve' }))

    expect(api.advanceStatus).toHaveBeenCalledWith('n1', 'RESOLVED', 'Freed up space')
  })

  it('offers no action once resolved', async () => {
    vi.mocked(api.getNotification).mockResolvedValue(makeNotification({ status: 'RESOLVED', resolutionNote: 'Done' }))
    renderPage()

    expect(await screen.findByText('Done')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /acknowledge|resolve/i })).not.toBeInTheDocument()
  })

})
