FROM node:24-alpine
WORKDIR /usr/chat-app

COPY . .
RUN npm ci && npm run build && npm prune --omit=dev

CMD ["npm", "run", "production"]