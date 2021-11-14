FROM node:alpine

RUN echo "Slack-notification Service"
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .

CMD ["npm", "start"]