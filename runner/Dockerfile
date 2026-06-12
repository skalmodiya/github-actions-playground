FROM ghcr.io/actions/actions-runner:ubuntu-22.04

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
    curl \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Allow runner user to use Docker
RUN usermod -aG docker runner 2>/dev/null || true

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER runner
WORKDIR /home/runner

ENTRYPOINT ["/entrypoint.sh"]
