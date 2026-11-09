import express, { Request, Response } from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())
app.use(express.json())

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type Status   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

interface Notification {
  id:             string
  title:          string
  description:    string | null
  severity:       Severity
  status:         Status
  resolutionNote: string | null
  createdAt:      string
  updatedAt:      string
}

interface CreateNotificationBody {
  title?:       string
  description?: string
  severity?:    string
}

interface UpdateStatusBody {
  status?:         string
  resolutionNote?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const NEXT_STATUS: Record<Status, Status | null> = {
  OPEN:        'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  RESOLVED:    null,
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory store
// ─────────────────────────────────────────────────────────────────────────────

let notifications: Notification[] = []
let sseClients: Response[]        = []

// ─────────────────────────────────────────────────────────────────────────────
// SSE helpers
// ─────────────────────────────────────────────────────────────────────────────

function broadcast(eventType: string, data: Notification): void {
  const chunk = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients = sseClients.filter(res => {
    try   { res.write(chunk); return true }
    catch { return false }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Docs
// ─────────────────────────────────────────────────────────────────────────────

const openapiYaml = readFileSync(join(__dirname, '../openapi.yml'), 'utf8')

app.get('/openapi.yml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/yaml')
  res.send(openapiYaml)
})

app.get('/docs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notification Manager API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({
    url: '/openapi.yml',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    layout: 'BaseLayout',
    tryItOutEnabled: true,
  })
</script>
</body>
</html>`)
})

// ─────────────────────────────────────────────────────────────────────────────
// Routes
//
// ⚠️  /api/notifications/stream MUST be registered before /api/notifications/:id
//     otherwise Express matches the literal string "stream" as an id.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/notifications/stream - SSE
app.get('/api/notifications/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type',  'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection',    'keep-alive')
  res.flushHeaders()

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20_000)

  sseClients.push(res)
  console.log(`[SSE] client connected    (${sseClients.length} active)`)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients = sseClients.filter(c => c !== res)
    console.log(`[SSE] client disconnected (${sseClients.length} active)`)
  })
})

// GET /api/notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { status, severity, page = '0', size = '10' } = req.query as Record<string, string>

  let result = [...notifications]
  if (status)   result = result.filter(n => n.status   === status)
  if (severity) result = result.filter(n => n.severity === severity)

  const pageNum       = parseInt(page, 10)
  const pageSize      = parseInt(size, 10)
  const totalElements = result.length
  const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize))

  res.json({
    content: result.slice(pageNum * pageSize, (pageNum + 1) * pageSize),
    page: pageNum,
    size: pageSize,
    totalElements,
    totalPages,
  })
})

// POST /api/notifications
app.post('/api/notifications', (req: Request<object, object, CreateNotificationBody>, res: Response) => {
  const { title, description, severity } = req.body

  if (!title?.trim()) {
    return res.status(400).json(problem('title is required'))
  }
  if (title.trim().length > 100) {
    return res.status(400).json(problem('title must be 100 characters or less'))
  }
  if (!SEVERITIES.includes(severity as Severity)) {
    return res.status(400).json(problem(`severity must be one of: ${SEVERITIES.join(', ')}`))
  }

  const notification = makeNotification({
    title:       title.trim(),
    description: description?.trim() ?? null,
    severity:    severity as Severity,
  })

  notifications.unshift(notification)
  broadcast('notification_created', notification)
  res.status(201).json(notification)
})

// GET /api/notifications/:id
app.get('/api/notifications/:id', (req: Request, res: Response) => {
  const notification = byId(req.params.id)
  if (!notification) {
    return res.status(404).json(problem(`notification '${req.params.id}' not found`))
  }
  res.json(notification)
})

// PATCH /api/notifications/:id/status
app.patch('/api/notifications/:id/status', (req: Request<{ id: string }, object, UpdateStatusBody>, res: Response) => {
  const notification = byId(req.params.id)
  if (!notification) {
    return res.status(404).json(problem(`notification '${req.params.id}' not found`))
  }

  if (notification.status === 'RESOLVED') {
    return res.status(422).json(problem('a resolved notification cannot be modified'))
  }

  const { status, resolutionNote } = req.body
  const expected = NEXT_STATUS[notification.status]

  if (status !== expected) {
    return res.status(422).json(
      problem(`cannot transition from ${notification.status} to ${status} - expected: ${expected}`)
    )
  }

  if (status === 'RESOLVED' && !resolutionNote?.trim()) {
    return res.status(422).json(problem('a resolution note is required when resolving a notification'))
  }

  notification.status         = status as Status
  notification.resolutionNote = resolutionNote?.trim() ?? null
  notification.updatedAt      = new Date().toISOString()

  broadcast('notification_updated', notification)
  res.json(notification)
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function byId(id: string): Notification | undefined {
  return notifications.find(n => n.id === id)
}

function problem(message: string): { message: string } {
  return { message }
}

interface MakeNotificationOptions {
  title:           string
  description?:    string | null
  severity:        Severity
  status?:         Status
  resolutionNote?: string | null
  createdAt?:      string
  updatedAt?:      string
}

function makeNotification({
  title,
  description    = null,
  severity,
  status         = 'OPEN',
  resolutionNote = null,
  createdAt,
  updatedAt,
}: MakeNotificationOptions): Notification {
  const now = new Date().toISOString()
  return {
    id:             randomUUID(),
    title,
    description,
    severity,
    status,
    resolutionNote,
    createdAt:  createdAt  ?? now,
    updatedAt:  updatedAt  ?? createdAt ?? now,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data - gives the candidate a populated list to work with immediately
// ─────────────────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

notifications = [
  makeNotification({ title: 'SSL certificate expiring on prod eu-west-1',        severity: 'HIGH',     status: 'RESOLVED',    resolutionNote: 'Certificate renewed and redeployed',  createdAt: daysAgo(3), updatedAt: daysAgo(2) }),
  makeNotification({ title: 'Memory threshold exceeded on pod cluster-3',         severity: 'CRITICAL', status: 'RESOLVED',    resolutionNote: 'Increased memory limit, pods cycling', createdAt: daysAgo(3), updatedAt: daysAgo(2) }),
  makeNotification({ title: 'Database replication lag exceeding 30s',             severity: 'HIGH',     status: 'IN_PROGRESS',                                                         createdAt: daysAgo(2), updatedAt: daysAgo(1) }),
  makeNotification({ title: 'API response time degraded on vehicle-tracking',     severity: 'MEDIUM',   status: 'IN_PROGRESS',                                                         createdAt: daysAgo(1), updatedAt: daysAgo(1) }),
  makeNotification({ title: 'Failed health check on notificationsmanager-server', severity: 'HIGH',                                                                                    createdAt: daysAgo(1) }),
  makeNotification({ title: 'Unusual login attempts detected',                    severity: 'CRITICAL',                                                                                createdAt: daysAgo(1) }),
  makeNotification({ title: 'Message queue depth crossing notification threshold',severity: 'MEDIUM',                                                                                  createdAt: daysAgo(0) }),
  makeNotification({ title: 'Scheduled job missed its execution window',          severity: 'LOW',                                                                                     createdAt: daysAgo(0) }),
]

// ─────────────────────────────────────────────────────────────────────────────
// Server B simulator
//
// Mimics an external monitoring system that pushes notifications into this service.
// Fires every 10–15 seconds so the candidate can see live updates during the session.
// ─────────────────────────────────────────────────────────────────────────────

const SIMULATED_NOTIFICATIONS: Array<{ title: string; severity: Severity }> = [
  { title: 'High CPU usage spike detected on eu-west-1',           severity: 'HIGH'     },
  { title: 'WebSocket connections dropping on ccsdk-chat-server',  severity: 'CRITICAL' },
  { title: 'S3 bucket access denied - possible misconfiguration',  severity: 'MEDIUM'   },
  { title: 'Deployment rollback triggered on recipientmanager',    severity: 'HIGH'     },
  { title: 'SQS queue depth crossing critical threshold',          severity: 'CRITICAL' },
  { title: 'Disk I/O saturation on MongoDB replica node',          severity: 'HIGH'     },
  { title: 'TLS handshake failures increasing on load balancer',   severity: 'MEDIUM'   },
  { title: 'Stale pod not responding to health checks',            severity: 'LOW'      },
  { title: 'Connection pool exhausted on recipientmanager-server', severity: 'HIGH'     },
  { title: 'Kafka consumer lag growing on notifications topic',    severity: 'MEDIUM'   },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function simulateIncoming(): void {
  const template     = pick(SIMULATED_NOTIFICATIONS)
  const notification = makeNotification({
    ...template,
    description: 'Detected by automated monitoring. Requires operator review.',
  })
  notifications.unshift(notification)
  broadcast('notification_created', notification)
  console.log(`[Server B] → [${notification.severity.padEnd(8)}] ${notification.title}`)
}

;(function scheduleNext(): void {
  setTimeout(() => { simulateIncoming(); scheduleNext() }, 10_000 + Math.random() * 5_000)
})()

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────

const PORT = 8080
app.listen(PORT, () => {
  console.log()
  console.log('  Notification Manager API')
  console.log(`  REST  →  http://localhost:${PORT}/api/notifications`)
  console.log(`  SSE   →  http://localhost:${PORT}/api/notifications/stream`)
  console.log(`  Docs  →  http://localhost:${PORT}/docs`)
  console.log()
  console.log('  Server B active - new notification every 10–15 seconds')
  console.log()
})
