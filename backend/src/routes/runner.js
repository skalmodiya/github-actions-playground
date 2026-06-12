import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
export const runnerRouter = Router()

const RUNNER_CONTAINER = 'gha-playground-runner'
const RUNNER_IMAGE = 'gha-playground-runner:latest'

runnerRouter.get('/status', async (_req, res) => {
  try {
    const { stdout } = await execAsync(
      `docker inspect ${RUNNER_CONTAINER} --format "{{.State.Status}}" 2>/dev/null || echo "not-found"`,
    )
    const status = stdout.trim()
    res.json({ status: status === 'not-found' ? 'stopped' : status })
  } catch {
    res.json({ status: 'stopped' })
  }
})

runnerRouter.post('/start', async (req, res) => {
  const { repoUrl, token } = req.body
  if (!repoUrl || !token) {
    return res.status(400).json({ error: 'repoUrl and token required' })
  }
  try {
    await execAsync(`docker rm -f ${RUNNER_CONTAINER} 2>/dev/null || true`)
    await execAsync(`docker run -d --name ${RUNNER_CONTAINER} \
      -e REPO_URL="${repoUrl}" \
      -e RUNNER_TOKEN="${token}" \
      -e RUNNER_NAME="local-docker-runner" \
      -e RUNNER_LABELS="self-hosted,local,docker" \
      -v /var/run/docker.sock:/var/run/docker.sock \
      ${RUNNER_IMAGE}`)
    res.json({ started: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

runnerRouter.post('/stop', async (_req, res) => {
  try {
    await execAsync(`docker rm -f ${RUNNER_CONTAINER} 2>/dev/null || true`)
    res.json({ stopped: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

runnerRouter.get('/logs', async (_req, res) => {
  try {
    const { stdout } = await execAsync(`docker logs --tail 100 ${RUNNER_CONTAINER}`)
    res.json({ logs: stdout })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
