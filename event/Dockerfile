FROM node:alpine

RUN echo "Event Service"
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .

CMD ["npm", "start"]