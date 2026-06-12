import express from 'express'
import cors from 'cors'
import { lessonsRouter } from './routes/lessons.js'
import { workflowsRouter } from './routes/workflows.js'
import { runnerRouter } from './routes/runner.js'
import { actRouter } from './routes/act.js'
import { settingsRouter } from './routes/settings.js'
import { aiRouter } from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/lessons', lessonsRouter)
app.use('/api/workflows', workflowsRouter)
app.use('/api/runner', runnerRouter)
app.use('/api/act', actRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' })
})

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`)
})
