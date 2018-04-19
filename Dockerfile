FROM node:latest

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

CMD node bin/www.js
