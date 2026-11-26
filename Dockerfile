FROM node:24-alpine
WORKDIR /usr/chat-app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

CMD ["npm", "run", "production"]