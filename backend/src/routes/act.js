import { Router } from 'express'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
export const actRouter = Router()

const REPO_ROOT = process.env.REPO_ROOT || '/app'

actRouter.get('/available', async (_req, res) => {
  try {
    const { stdout } = await execAsync('act --version')
    res.json({ available: true, version: stdout.trim() })
  } catch {
    res.json({ available: false })
  }
})

actRouter.post('/:file/run', (req, res) => {
  const workflowFile = req.params.file
  const event = req.body.event || 'workflow_dispatch'

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const proc = spawn('act', [event, '-W', `.github/workflows/${workflowFile}`, '--no-cache-server'], {
    cwd: REPO_ROOT,
    env: { ...process.env, FORCE_COLOR: '0' },
  })

  const send = (type, data) => res.write(`data: ${JSON.stringify({ type, data })}\n\n`)

  proc.stdout.on('data', (chunk) => send('log', chunk.toString()))
  proc.stderr.on('data', (chunk) => send('log', chunk.toString()))
  proc.on('close', (code) => {
    send('done', { exitCode: code })
    res.end()
  })
  proc.on('error', (err) => {
    send('error', err.message)
    res.end()
  })

  req.on('close', () => proc.kill())
})
