FROM node:alpine

RUN echo "Websocket-notification Service"
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .

CMD ["npm", "start"]