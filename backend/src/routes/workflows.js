import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
export const workflowsRouter = Router()

const REPO = process.env.GITHUB_REPO || 'skalmodiya/github-actions-playground'
const WORKFLOWS_DIR = process.env.WORKFLOWS_DIR || join(dirname(fileURLToPath(import.meta.url)), '../../../.github/workflows')

workflowsRouter.get('/:file/runs', async (req, res) => {
  try {
    const { stdout } = await execAsync(
      `gh run list --workflow "${req.params.file}" --repo "${REPO}" --limit 10 --json databaseId,status,conclusion,startedAt,updatedAt,displayTitle,workflowName`,
    )
    res.json(JSON.parse(stdout))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

workflowsRouter.post('/:file/dispatch', async (req, res) => {
  try {
    const inputs = req.body.inputs || {}
    const inputsFlag = Object.entries(inputs)
      .map(([k, v]) => `-f ${k}="${v}"`)
      .join(' ')
    await execAsync(`gh workflow run "${req.params.file}" --repo "${REPO}" ${inputsFlag}`)
    res.json({ triggered: true, workflow: req.params.file })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

workflowsRouter.get('/runs/:runId/logs', async (req, res) => {
  try {
    const { stdout } = await execAsync(
      `gh run view "${req.params.runId}" --log --repo "${REPO}"`,
    )
    res.json({ logs: stdout })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

workflowsRouter.get('/runs/:runId', async (req, res) => {
  try {
    const { stdout } = await execAsync(
      `gh run view "${req.params.runId}" --repo "${REPO}" --json databaseId,status,conclusion,jobs,startedAt,updatedAt`,
    )
    res.json(JSON.parse(stdout))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

workflowsRouter.get('/:file/yaml', (req, res) => {
  try {
    const content = readFileSync(join(WORKFLOWS_DIR, req.params.file), 'utf8')
    res.json({ content })
  } catch (err) {
    res.status(404).json({ error: 'Workflow file not found' })
  }
})
