# ⚡ GitHub Actions Playground

> **Learn GitHub Actions hands-on** — 10 progressive lessons with animated workflow diagrams, a live GitHub integration, local `act` runner, and an AI Copilot powered by your own LLM proxy.

![GitHub Actions Playground](https://img.shields.io/badge/GitHub_Actions-Learning_Playground-2ea043?style=for-the-badge&logo=github-actions&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_22-339933?style=flat&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Table of Contents

- [What You'll Learn](#what-youll-learn)
- [App Features](#app-features)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Run with Docker Compose](#run-with-docker-compose)
- [Self-Hosted Runner Setup](#self-hosted-runner-setup)
- [AI Copilot Setup](#ai-copilot-setup)
- [Project Structure](#project-structure)
- [Pushing to GitHub Enterprise (github.tools.sap)](#pushing-to-github-enterprise-githubtoolssap)
- [Lessons Overview](#lessons-overview)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

---

## What You'll Learn

| # | Lesson | Level | Key Concepts |
|---|--------|-------|--------------|
| 01 | Hello World | 🟢 Beginner | Workflow anatomy, jobs, steps, `run` |
| 02 | Triggers | 🟢 Beginner | `push`, `pull_request`, `schedule`, `workflow_dispatch` with inputs |
| 03 | Jobs & Steps | 🟢 Beginner | Parallel jobs, `needs:`, step outputs, `GITHUB_OUTPUT` |
| 04 | Context & Variables | 🟡 Intermediate | `${{ github.* }}`, env scoping, `GITHUB_ENV` expressions |
| 05 | Using Actions | 🟡 Intermediate | `uses:`, version pinning, inputs/outputs, Docker actions |
| 06 | Conditionals | 🟡 Intermediate | `if:`, `success()`, `failure()`, `always()`, `continue-on-error` |
| 07 | Matrix Builds | 🟡 Intermediate | `strategy.matrix`, `fail-fast`, `max-parallel`, include/exclude |
| 08 | Secrets & Security | 🔴 Advanced | `GITHUB_TOKEN`, OIDC, masked output, `permissions:` |
| 09 | Artifacts & Cache | 🔴 Advanced | `upload-artifact`, `download-artifact`, `cache` with `hashFiles` |
| 10 | Reusable Workflows | 🔴 Advanced | `workflow_call`, typed inputs/outputs, `GITHUB_STEP_SUMMARY` |

---

## App Features

- **📚 Animated DAG visualizer** — Mermaid graphs show job dependencies for every lesson
- **📄 Live YAML editor** — read and copy each workflow file directly in the browser
- **🚀 Run on GitHub** — trigger `workflow_dispatch` runs on GitHub.com with one click
- **⚡ Run Locally (act)** — execute workflows in Docker locally without any git push
- **🖥 Self-hosted Runner** — register a Docker container as a GitHub Actions runner
- **🤖 AI Copilot** — context-aware tutor via your Hyperspace LLM Proxy (streaming SSE)
- **⚙ Settings page** — configure provider, API key, and model with auto-discovery
- **⌨ Keyboard navigation** — `←`/`→` lessons, `?` toggles Copilot

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 18+ | https://nodejs.org |
| **Docker Desktop** | 20+ | https://docker.com/products/docker-desktop |
| **Git** | 2.30+ | https://git-scm.com |
| **GitHub CLI (`gh`)** | 2.0+ | https://cli.github.com |

Authenticate the GitHub CLI before starting:

```bash
# github.com
gh auth login

# github.tools.sap (SAP internal GitHub)
gh auth login --hostname github.tools.sap
```

---

## Quick Start (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/skalmodiya/github-actions-playground.git
cd github-actions-playground

# 2. Start the backend API (port 4000)
cd backend
npm install
npm start

# 3. In a new terminal — start the frontend (port 3000)
cd frontend
npm install
npm run dev

# 4. Open the app
open http://localhost:3000   # macOS
start http://localhost:3000  # Windows
```

The frontend proxies all `/api/` requests to the backend automatically via Vite's proxy config.

---

## Run with Docker Compose

The entire app runs in Docker — no local Node.js required.

```bash
# Copy environment file
cp .env.example .env

# Build and start frontend + backend
docker compose up --build

# Open the app
open http://localhost:3000
```

**Stop the app:**
```bash
docker compose down
```

**Rebuild after code changes:**
```bash
docker compose up --build
```

### Environment Variables (`.env`)

```env
# GitHub repo the backend uses for workflow API calls
GITHUB_REPO=skalmodiya/github-actions-playground

# Self-hosted runner registration (only needed if starting the runner service)
RUNNER_REPO_URL=https://github.com/skalmodiya/github-actions-playground
RUNNER_TOKEN=                 # Get from GitHub → Settings → Actions → Runners → New runner
```

---

## Self-Hosted Runner Setup

The runner service starts a Docker container that registers as a self-hosted GitHub Actions runner.

### Step 1 — Get a registration token

Go to your repo on GitHub:
> **Settings → Actions → Runners → New self-hosted runner**

Copy the token shown (starts with `AABB...`). It expires in 1 hour.

### Step 2 — Start the runner

```bash
# Add the token to .env first
echo "RUNNER_TOKEN=AABBCC..." >> .env

# Start with the runner profile
docker compose --profile runner up --build
```

### Step 3 — Verify it's connected

In your GitHub repo go to **Settings → Actions → Runners** — you should see `local-docker-runner` with status **Idle**.

### Step 4 — Use it in a workflow

Target the runner with these labels:

```yaml
jobs:
  my-job:
    runs-on: [self-hosted, local, docker]
    steps:
      - run: echo "Running on my local machine!"
```

> **Note:** The runner auto-deregisters when the container stops (handled by the `entrypoint.sh` cleanup trap).

---

## AI Copilot Setup

The AI Copilot connects to your [Hyperspace LLM Proxy](http://localhost:6655) running locally.

### Step 1 — Open Settings

Click **⚙ Settings** in the app header.

### Step 2 — Configure the connection

Fill in the fields **in this order**:

| Field | Description |
|-------|-------------|
| **Base URL** | Auto-fills when you pick a provider (or enter manually) |
| **API Key** | Your Hyperspace proxy API key |
| **Provider** | Click to select: Anthropic / OpenAI / Gemini / LiteLLM / Perplexity |
| **Load Models** | Auto-triggers when key is entered; or click the button manually |
| **LLM Model** | Pick from the loaded dropdown |

### Step 3 — Save and use

Click **💾 Save Settings**, then click **🤖 AI Copilot** in the header (or press **`?`**).

### Hyperspace LLM Proxy Endpoints

| Provider | Base URL | Chat Endpoint | Models Endpoint |
|----------|----------|---------------|-----------------|
| Anthropic | `http://localhost:6655/anthropic/v1` | `POST /messages` | `GET /models` |
| OpenAI | `http://localhost:6655/openai/v1` | `POST /chat/completions` | `GET /models` |
| Gemini | `http://localhost:6655/gemini` | `POST /v1beta/models/{model}:generateContent` | `GET /v1beta/models` |
| LiteLLM | `http://localhost:6655/litellm/v1` | `POST /chat/completions` | `GET /models` |
| Perplexity | `http://localhost:6655/litellm/v1` | `POST /chat/completions` | `GET /models` |

> **Tip:** LiteLLM gives you access to **all providers through a single OpenAI-compatible endpoint** — great for switching models without reconfiguring.

### AI Copilot Features

- **Context-aware** — every message includes the current lesson title, concepts, key points, and full workflow YAML as system context
- **Streaming** — tokens stream in real-time via Server-Sent Events (SSE)
- **Prompt library** — click quick-start chips to ask common questions instantly:
  - "Explain this lesson step by step"
  - "What are common mistakes here?"
  - "Show a real-world example"
  - "Quiz me on this topic"
  - "How would I debug this workflow?"
  - "What comes after this lesson?"
- **Scoped** — politely redirects off-topic questions back to GitHub Actions
- **Auto-clears** — chat history resets when you switch lessons

---

## Project Structure

```
github-actions-playground/
├── .github/
│   └── workflows/              ← 10 lesson workflow files (01-hello-world.yml … 10-reusable.yml)
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── SettingsContext.tsx   ← Global LLM settings state
│   │   ├── components/
│   │   │   ├── LessonNav.tsx         ← Sidebar with progress + difficulty badges
│   │   │   ├── LessonView.tsx        ← Main lesson content + tabs
│   │   │   ├── WorkflowVisualizer.tsx ← Mermaid DAG renderer
│   │   │   ├── YamlEditor.tsx        ← Workflow YAML viewer/editor
│   │   │   ├── RunStatus.tsx         ← Live GitHub run history + log viewer
│   │   │   ├── ActRunner.tsx         ← Local `act` execution with SSE streaming
│   │   │   ├── RunnerPanel.tsx       ← Self-hosted runner management
│   │   │   ├── SettingsPage.tsx      ← LLM proxy configuration
│   │   │   ├── AICopilot.tsx         ← AI chat drawer with streaming
│   │   │   └── WelcomeScreen.tsx     ← First-visit onboarding modal
│   │   ├── App.tsx                   ← Root component, routing, keyboard shortcuts
│   │   └── index.css                 ← Global CSS design tokens (GitHub dark theme)
│   ├── Dockerfile                    ← Multi-stage: Node build → nginx serve
│   └── nginx.conf                    ← API proxy + SPA fallback + SSE buffering off
├── backend/
│   ├── src/
│   │   ├── lessons.js                ← All 10 lesson definitions (title, mermaid, keyPoints)
│   │   └── routes/
│   │       ├── lessons.js            ← GET /api/lessons
│   │       ├── workflows.js          ← gh CLI bridge (runs, dispatch, logs, YAML)
│   │       ├── act.js                ← Local act execution via SSE stream
│   │       ├── runner.js             ← Docker runner start/stop/status
│   │       ├── settings.js           ← GET/POST /api/settings (JSON file persistence)
│   │       └── ai.js                 ← /api/ai/models + /api/ai/chat (SSE, all providers)
│   └── Dockerfile                    ← node:22-alpine + gh CLI + act binary
├── runner/
│   ├── Dockerfile                    ← ghcr.io/actions/actions-runner base
│   └── entrypoint.sh                 ← Auto-register + cleanup on exit
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Pushing to GitHub Enterprise (github.tools.sap)

To push this repo to your SAP internal GitHub (`github.tools.sap`):

### Step 1 — Create a new repo on github.tools.sap

```bash
GH_HOST=github.tools.sap gh repo create github-actions-playground \
  --public \
  --description "GitHub Actions Learning Playground — hands-on lessons with AI Copilot" \
  --source . \
  --remote sap
```

> This creates the repo under your account (`I560043`) and adds it as the `sap` remote.

### Step 2 — Push to both remotes

```bash
# Push to github.com (already set up as 'origin')
git push origin main

# Push to github.tools.sap
git push sap main
```

### Step 3 — Set up both remotes permanently

```bash
# Verify your remotes
git remote -v
# origin   https://github.com/skalmodiya/github-actions-playground.git (fetch)
# origin   https://github.com/skalmodiya/github-actions-playground.git (push)
# sap      https://github.tools.sap/I560043/github-actions-playground.git (fetch)
# sap      https://github.tools.sap/I560043/github-actions-playground.git (push)
```

### Step 4 — Push to both with one command (optional)

Add a `both` remote that pushes to both URLs simultaneously:

```bash
# Add a 'both' remote pointing to github.com first
git remote add both https://github.com/skalmodiya/github-actions-playground.git

# Add github.tools.sap as a second push URL for 'both'
git remote set-url --add --push both https://github.tools.sap/I560043/github-actions-playground.git
git remote set-url --add --push both https://github.com/skalmodiya/github-actions-playground.git

# Now push to both with one command
git push both main
```

### Notes for github.tools.sap

- The **GitHub Actions workflows** (`.github/workflows/`) will work on `github.tools.sap` too — it runs GitHub Enterprise Server which supports the same workflow syntax
- Self-hosted runners can be registered to either or both repos — just get separate registration tokens from each repo's Settings
- The AI Copilot works identically on both — it calls your local Hyperspace proxy at `localhost:6655`, not GitHub's servers

---

## API Reference

The backend API runs on port 4000 and is proxied via `/api/` in the frontend.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/lessons` | All 10 lessons |
| `GET` | `/api/lessons/:id` | Single lesson by ID or slug |
| `GET` | `/api/workflows/:file/yaml` | Workflow YAML file content |
| `GET` | `/api/workflows/:file/runs` | Recent runs from GitHub |
| `POST` | `/api/workflows/:file/dispatch` | Trigger workflow via `gh` CLI |
| `GET` | `/api/workflows/runs/:runId/logs` | Fetch run logs |
| `GET` | `/api/act/available` | Check if `act` is installed |
| `POST` | `/api/act/:file/run` | Run workflow locally (SSE stream) |
| `GET` | `/api/runner/status` | Docker runner container status |
| `POST` | `/api/runner/start` | Register + start runner |
| `POST` | `/api/runner/stop` | Stop + remove runner |
| `GET` | `/api/settings` | Read LLM proxy settings |
| `POST` | `/api/settings` | Save LLM proxy settings |
| `GET` | `/api/ai/models` | Fetch available models from proxy |
| `POST` | `/api/ai/chat` | Streaming AI chat (SSE) |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous lesson |
| `→` | Next lesson |
| `?` | Toggle AI Copilot |
| `Escape` | Close AI Copilot |
| `Enter` | Send chat message (in Copilot) |
| `Shift+Enter` | New line in chat input |

---

## Troubleshooting

### Backend won't start — port 4000 in use
```bash
# Windows
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess -Force"

# macOS / Linux
lsof -ti:4000 | xargs kill -9
```

### `gh` CLI not authenticated
```bash
gh auth login                              # github.com
gh auth login --hostname github.tools.sap  # SAP GitHub
```

### `act` not available (Act tab shows "not installed")
In dev mode, install `act` locally:
```bash
# Windows (winget)
winget install nektos.act

# macOS
brew install act
```
Or use Docker Compose — the backend container has `act` pre-installed.

### AI Copilot shows "No model configured"
1. Click **⚙ Settings** in the header
2. Enter your API key (8+ characters)
3. Select a provider — models load automatically
4. Pick a model and click **💾 Save Settings**

### Hyperspace proxy not reachable
Ensure your Hyperspace LLM Proxy is running locally on port 6655:
```bash
curl http://localhost:6655/litellm/v1/models -H "Authorization: Bearer YOUR_KEY"
```

### Self-hosted runner token expired
Runner registration tokens expire after **1 hour**. Get a fresh one from:
> GitHub repo → **Settings → Actions → Runners → New self-hosted runner**

### Docker Compose — settings not persisting
Settings are stored in the `settings-data` Docker volume at `/app/data/settings.json`. If you deleted volumes, reconfigure via the Settings page.

---

## License

MIT — learn freely, build confidently.

---

*Built with ⚡ to make GitHub Actions learning fast, hands-on, and AI-assisted.*
