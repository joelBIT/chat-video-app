FROM node:24-alpine
WORKDIR /usr/chat-app

COPY . .
RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 8181

CMD ["npm", "run", "production"]