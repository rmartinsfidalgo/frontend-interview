import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreateNotificationDialog } from './CreateNotificationDialog'

const setup = () => {
  const onSubmit = vi.fn()
  render(<CreateNotificationDialog pending={false} error={null} onCancel={vi.fn()} onSubmit={onSubmit} />)
  return { onSubmit, user: userEvent.setup(), createButton: () => screen.getByRole('button', { name: 'Create' }) }
}

describe('CreateNotificationDialog', () => {
  it('requires a severity to be chosen (no default)', async () => {
    const { user, createButton } = setup()
    await user.type(screen.getByLabelText(/title/i), 'Disk full')
    expect(createButton()).toBeDisabled()
  })

  it('rejects titles over 100 characters', async () => {
    const { user, createButton } = setup()
    await user.click(screen.getByRole('combobox', { name: /severity/i }))
    await user.click(screen.getByRole('option', { name: 'HIGH' }))
    await user.click(screen.getByLabelText(/title/i))
    await user.paste('x'.repeat(101))
    expect(createButton()).toBeDisabled()
  })

  it('submits trimmed values and omits an empty description', async () => {
    const { onSubmit, user, createButton } = setup()
    await user.type(screen.getByLabelText(/title/i), '  Disk full  ')
    await user.click(screen.getByRole('combobox', { name: /severity/i }))
    await user.click(screen.getByRole('option', { name: 'HIGH' }))
    await user.type(screen.getByLabelText(/description/i), '   ')
    await user.click(createButton())

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Disk full', severity: 'HIGH', description: undefined })
  })
})
