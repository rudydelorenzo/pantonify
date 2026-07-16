FROM node:20-bookworm-slim
LABEL authors="rudydelorenzo"

WORKDIR app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Healthcheck
# Use curl to ping the internal health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=2 \
  CMD curl --fail --silent --show-error http://localhost:3000/api/healthz || exit 1

CMD ["npm", "run", "start"]
