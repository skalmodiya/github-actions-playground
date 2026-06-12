import { Router } from 'express'
import { LESSONS } from '../lessons.js'

export const lessonsRouter = Router()

lessonsRouter.get('/', (_req, res) => {
  res.json(LESSONS.map(({ id, slug, title, subtitle, concepts, description, keyPoints, mermaidGraph }) => ({
    id, slug, title, subtitle, concepts, description, keyPoints, mermaidGraph,
  })))
})

lessonsRouter.get('/:id', (req, res) => {
  const lesson = LESSONS.find((l) => l.id === Number(req.params.id) || l.slug === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
  res.json(lesson)
})
