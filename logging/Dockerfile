FROM node:alpine

RUN echo "Logging Service"
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .

CMD ["npm", "start"]