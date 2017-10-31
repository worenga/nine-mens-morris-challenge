FROM node:8.8-alpine

ARG PORT=8099
ARG INSTALL_DIR=/usr/app/src/nine-mens-morris-challenge/

LABEL maintainer="benedikt.wolters@rwth-aachen.de"

WORKDIR ${INSTALL_DIR}

COPY package.json package-lock.json webpack.config.js .babelrc process.json ./

RUN npm install -g pm2

RUN npm install

ENV NODE_ENV=production

ADD src ./src
ADD assets ./assets

RUN npm run build 

env PM2_SERVE_PORT $PORT
EXPOSE $PORT

CMD pm2 start process.json --no-daemon
