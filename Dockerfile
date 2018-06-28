FROM node:8

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN adduser node root
RUN chmod -R 775 .
RUN chown -R node:root .

RUN npm install

EXPOSE 3000

CMD node bin/www.js

