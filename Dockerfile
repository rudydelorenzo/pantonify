FROM node:24-bookworm-slim
LABEL authors="rudydelorenzo"

# Install build dependencies required by node-gyp
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential

WORKDIR app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
