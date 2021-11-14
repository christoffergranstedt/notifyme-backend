FROM node:alpine

RUN echo "Auth Service"
WORKDIR /app
COPY package.json .
RUN npm install --silent
COPY . .

CMD ["npm", "start"]