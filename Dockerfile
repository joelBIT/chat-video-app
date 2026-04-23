FROM node:24
WORKDIR /home/node/chat-app
COPY package.json .
RUN npm install --quiet

COPY . .

EXPOSE 8181

CMD ["npm", "run", "production"]