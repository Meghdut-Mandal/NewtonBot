FROM node:14-alpine

WORKDIR /

# Install ffmpg
RUN apk add ffmpeg git

COPY package.json /newtonbot/package.json

WORKDIR /newtonbot
RUN mkdir "tmp"
RUN yarn

COPY . /newtonbot
CMD [ "yarn", "start"]