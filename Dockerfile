FROM node:24-alpine
WORKDIR /chat-app

COPY . .
RUN npm install --quiet && npm run build && npm prune --omit=dev

EXPOSE 8181

CMD ["npm", "run", "production"]