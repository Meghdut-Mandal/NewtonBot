FROM node:14-stretch

WORKDIR /


RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json /newtonbot/package.json

WORKDIR /newtonbot
RUN mkdir "tmp"
RUN yarn

COPY . /newtonbot
CMD [ "yarn", "start"]