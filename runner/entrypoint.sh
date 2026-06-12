#!/bin/bash
set -e

REPO_URL="${REPO_URL:-https://github.com/skalmodiya/github-actions-playground}"
RUNNER_TOKEN="${RUNNER_TOKEN:-}"
RUNNER_NAME="${RUNNER_NAME:-local-docker-runner}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,local,docker}"

if [ -z "$RUNNER_TOKEN" ]; then
  echo "ERROR: RUNNER_TOKEN is required."
  echo "Get it from: GitHub repo → Settings → Actions → Runners → New self-hosted runner"
  exit 1
fi

echo "Configuring runner for: $REPO_URL"
./config.sh \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --unattended \
  --replace

echo "Runner configured. Starting..."

cleanup() {
  echo "Removing runner registration..."
  ./config.sh remove --token "$RUNNER_TOKEN" 2>/dev/null || true
}
trap cleanup EXIT SIGTERM SIGINT

./run.sh
