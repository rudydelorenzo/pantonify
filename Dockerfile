FROM node:20-bookworm-slim
LABEL authors="rudydelorenzo"

WORKDIR app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
