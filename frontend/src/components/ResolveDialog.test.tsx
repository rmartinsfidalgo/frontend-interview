import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ResolveDialog } from './ResolveDialog'

const setup = () => {
  const onSubmit = vi.fn()
  render(<ResolveDialog title="Disk full" pending={false} error={null} onCancel={vi.fn()} onSubmit={onSubmit} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('ResolveDialog', () => {
  it('blocks a whitespace-only resolution note', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText(/resolution note/i), '   ')
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeDisabled()
  })

  it('submits the trimmed note', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByLabelText(/resolution note/i), '  Freed up space  ')
    await user.click(screen.getByRole('button', { name: 'Resolve' }))
    expect(onSubmit).toHaveBeenCalledWith('Freed up space')
  })
})
