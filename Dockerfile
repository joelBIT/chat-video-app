FROM node:24 as base
WORKDIR /chat-app

COPY package*.json ./
COPY . .

RUN npm install --quiet
RUN npm run build

EXPOSE 8181

CMD ["npm", "run", "production"]