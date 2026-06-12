FROM node:22-alpine

RUN apk add --no-cache \
    curl \
    bash \
    docker-cli \
    git

# Install gh CLI
RUN curl -fsSL https://github.com/cli/cli/releases/download/v2.92.0/gh_2.92.0_linux_amd64.tar.gz \
    | tar -xz -C /tmp \
    && mv /tmp/gh_2.92.0_linux_amd64/bin/gh /usr/local/bin/gh

# Install act
RUN curl -fsSL https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz \
    | tar -xz -C /usr/local/bin act

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "src/index.js"]
