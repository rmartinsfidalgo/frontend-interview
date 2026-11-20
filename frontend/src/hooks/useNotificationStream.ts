import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToNotifications } from '../api/notifications.api'
import type { Notification } from '../types/notification.types'
import { keys } from './useNotifications'

export type ConnectionState = 'connecting' | 'live' | 'reconnecting'

/**
 * Subscribes to the server's live notification stream and keeps the React Query cache in sync.
 *
 * - Created/updated events: write the notification into the detail cache and refetch visible lists/counts
 * - After a dropped connection reconnects: refetches everything to catch up on missed events
 * - Returns the connection state ('connecting' | 'live' | 'reconnecting') for the UI indicator
 *
 * @param onCreated Called for each newly created notification. Must be stable (wrap in useCallback),
 *   otherwise the stream reconnects on every render.
 */
export function useNotificationStream(onCreated?: (n: Notification) => void) {
  const qc = useQueryClient()
  const [state, setState] = useState<ConnectionState>('connecting')

  useEffect(() => {
    let hadError = false

    const sync = (n: Notification) => {
      qc.setQueryData(keys.detail(n.id), n)
      qc.invalidateQueries({ queryKey: keys.all, refetchType: 'active' })
    }

    return subscribeToNotifications({
      onCreated: (n) => {
        sync(n)
        onCreated?.(n)
      },
      onUpdated: sync,
      onOpen: () => {
        setState('live')
        if (hadError) qc.invalidateQueries({ queryKey: keys.all }) // catch up on events missed while disconnected
      },
      onError: () => {
        hadError = true
        setState('reconnecting')
      },
    })
  }, [qc, onCreated])

  return state
}
